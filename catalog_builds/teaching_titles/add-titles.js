import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fs = { readFileSync, writeFileSync };
const path = { resolve, join: (...args) => resolve(...args) };

const root = path.resolve(__dirname, '../..');
const titlesDir = __dirname;

const teachings = JSON.parse(fs.readFileSync(path.join(root, 'public/teachings.json'), 'utf8'));

const parableTitles = JSON.parse(fs.readFileSync(path.join(titlesDir, 'parable_titles.json'), 'utf8'));
const iamTitles    = JSON.parse(fs.readFileSync(path.join(titlesDir, 'iam_titles.json'), 'utf8'));
const woeTitles    = JSON.parse(fs.readFileSync(path.join(titlesDir, 'woe_titles.json'), 'utf8'));
const batch1       = JSON.parse(fs.readFileSync(path.join(titlesDir, 'other_titles_batch1.json'), 'utf8'));
const batch2       = JSON.parse(fs.readFileSync(path.join(titlesDir, 'other_titles_batch2.json'), 'utf8'));
const batch3       = JSON.parse(fs.readFileSync(path.join(titlesDir, 'other_titles_batch3.json'), 'utf8'));

const allTitles = { ...parableTitles, ...iamTitles, ...woeTitles, ...batch1, ...batch2, ...batch3 };

let applied = 0;
let missing = [];

teachings.categories.forEach(cat => {
  cat.subcategories.forEach(sub => {
    sub.teachings.forEach(teaching => {
      const title = allTitles[teaching.id];
      if (!title) {
        missing.push(teaching.id);
        return;
      }

      // Insert title between quote and tags
      const { id, uid, text, quote, tags, references, ...rest } = teaching;
      Object.keys(teaching).forEach(k => delete teaching[k]);
      teaching.id = id;
      teaching.uid = uid;
      teaching.text = text;
      teaching.quote = quote;
      teaching.title = title;
      teaching.tags = tags;
      teaching.references = references;
      Object.assign(teaching, rest);

      applied++;
    });
  });
});

if (missing.length > 0) {
  console.error('MISSING titles for IDs:', missing.join(', '));
}

console.log(`Applied: ${applied} titles`);
console.log(`Missing: ${missing.length}`);

fs.writeFileSync(path.join(root, 'public/teachings.json'), JSON.stringify(teachings, null, 2), 'utf8');
console.log('Written to public/teachings.json');
