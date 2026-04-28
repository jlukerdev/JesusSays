#!/usr/bin/env node
/**
 * renumber-passion-cat.js
 *
 * One-shot transform: move "The Passion Narrative" from Cat 31 to Cat 27.
 * Old 27 → 28, old 28 → 29, old 29 → 30, old 30 → 31, old 31 → 27.
 *
 * Operates on bible_datasets/jesussays_datasets/teachings_v2.json in place.
 * Only top-level cat ids, subcategory ids, and teaching ids are rewritten.
 * Other artifacts (gaps-annotated.json, chunks, scripts) are explicitly out of scope.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.resolve(__dirname, '../jesussays_datasets/teachings_v2.json');

const OLD_TO_NEW = { 27: 28, 28: 29, 29: 30, 30: 31, 31: 27 };

function remapCatId(oldId) {
  return OLD_TO_NEW[oldId] ?? oldId;
}

function remapDottedId(dotted) {
  const parts = String(dotted).split('.');
  const oldCat = Number(parts[0]);
  if (!OLD_TO_NEW[oldCat]) return dotted;
  parts[0] = String(OLD_TO_NEW[oldCat]);
  return parts.join('.');
}

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Idempotency guard: the cycle map below is NOT a no-op if applied twice.
// If the renumber has already been done, skip the id remap entirely
// and just resync slugs (cheap, always safe).
const catAt27 = data.categories.find(c => c.id === 27);
const alreadyRenumbered = catAt27 && catAt27.title === 'The Passion Narrative';
if (alreadyRenumbered) {
  console.log('Detected post-renumber state (Cat 27 = Passion Narrative). Skipping id remap; syncing slugs only.');
}

let catsTouched = 0;
let subsTouched = 0;
let teachingsTouched = 0;
let slugsTouched = 0;

function slugForCat(id) {
  return `cat-${id}`;
}
function slugForSub(id) {
  return `cat-${String(id).replace(/\./g, '-')}`;
}

for (const cat of data.categories) {
  if (!alreadyRenumbered) {
    const oldCatId = cat.id;
    const newCatId = remapCatId(oldCatId);
    if (newCatId !== oldCatId) {
      cat.id = newCatId;
      catsTouched++;
    }
  }
  const expectedCatSlug = slugForCat(cat.id);
  if (cat.slug !== undefined && cat.slug !== expectedCatSlug) {
    cat.slug = expectedCatSlug;
    slugsTouched++;
  }
  for (const sub of cat.subcategories) {
    if (!alreadyRenumbered) {
      const oldSubId = sub.id;
      const newSubId = remapDottedId(oldSubId);
      if (newSubId !== oldSubId) {
        sub.id = newSubId;
        subsTouched++;
      }
    }
    const expectedSubSlug = slugForSub(sub.id);
    if (sub.slug !== undefined && sub.slug !== expectedSubSlug) {
      sub.slug = expectedSubSlug;
      slugsTouched++;
    }
    if (!alreadyRenumbered) {
      for (const teaching of sub.teachings) {
        const oldTid = teaching.id;
        const newTid = remapDottedId(oldTid);
        if (newTid !== oldTid) {
          teaching.id = newTid;
          teachingsTouched++;
        }
      }
    }
  }
}

data.categories.sort((a, b) => a.id - b.id);

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`Renumbered: ${catsTouched} categories, ${subsTouched} subcategories, ${teachingsTouched} teachings, ${slugsTouched} slugs`);
console.log('New top-level order:', data.categories.map(c => c.id).join(','));
console.log('Cat 27 title:', data.categories.find(c => c.id === 27).title);
console.log('Cat 31 title:', data.categories.find(c => c.id === 31).title);
console.log(`Wrote: ${FILE}`);
