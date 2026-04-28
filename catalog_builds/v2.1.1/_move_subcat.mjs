import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..', 'teachings_v2_1.json');
const OUT = resolve(__dirname, 'teachings_v2_1_1.json');

const data = JSON.parse(readFileSync(SRC, 'utf8'));

const cat2 = data.categories.find((c) => c.id === 2);
const cat27 = data.categories.find((c) => c.id === 27);

if (!cat2) throw new Error('Category 2 not found');
if (!cat27) throw new Error('Category 27 not found');

const subIdx = cat2.subcategories.findIndex((s) => s.id === '2.7');
if (subIdx === -1) throw new Error('Subcategory 2.7 not found');
const moved = cat2.subcategories.splice(subIdx, 1)[0];

const newSubId = `27.${cat27.subcategories.length + 1}`;
const newSubSlug = `cat-27-${cat27.subcategories.length + 1}`;

moved.id = newSubId;
moved.slug = newSubSlug;
moved.teachings.forEach((t, i) => {
  t.id = `${newSubId}.${i + 1}`;
});

cat27.subcategories.push(moved);

writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`Moved subcategory → ${newSubId} (${newSubSlug})`);
console.log(`Cat 2 subcategories now: ${cat2.subcategories.length}`);
console.log(`Cat 27 subcategories now: ${cat27.subcategories.length}`);
console.log(`Teachings remapped: ${moved.teachings.length}`);
console.log(`Wrote: ${OUT}`);
