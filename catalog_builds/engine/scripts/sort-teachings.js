#!/usr/bin/env node
/**
 * sort-teachings.js
 *
 * Sorts teachings within each subcategory by their primary reference:
 *   1. NT book order (Matt → Mark → Luke → John → Acts → 1Cor → 2Cor → Rev)
 *   2. Chapter (ascending)
 *   3. First verse of the first range (ascending)
 *
 * Writes the sorted data back to public/teachings.json.
 * Run renumber.js + validate-catalog.js after this script.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = resolve(__dirname, '../../../public/teachings.json');

const BOOK_ORDER = {
  Matt: 1,
  Mark: 2,
  Luke: 3,
  John: 4,
  Acts: 5,
  '1Cor': 6,
  '2Cor': 7,
  Rev: 8,
};

function getPrimaryRef(teaching) {
  return teaching.references?.find(r => r.isPrimary === true) ?? null;
}

function sortKey(teaching) {
  const ref = getPrimaryRef(teaching);
  if (!ref) return [999, 999, 999];
  const bookRank = BOOK_ORDER[ref.bookAbbr] ?? 999;
  const chapter = ref.chapter ?? 999;
  const firstVerse = (ref.ranges?.[0]?.[0]) ?? 999;
  return [bookRank, chapter, firstVerse];
}

function compareSortKeys([a0, a1, a2], [b0, b1, b2]) {
  if (a0 !== b0) return a0 - b0;
  if (a1 !== b1) return a1 - b1;
  return a2 - b2;
}

const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));

let totalReordered = 0;
let subcatCount = 0;

for (const category of catalog.categories) {
  for (const subcat of category.subcategories) {
    subcatCount++;
    const original = subcat.teachings.map(t => t.id);
    subcat.teachings.sort((a, b) => compareSortKeys(sortKey(a), sortKey(b)));
    const sorted = subcat.teachings.map(t => t.id);

    const changed = original.some((id, i) => id !== sorted[i]);
    if (changed) {
      totalReordered++;
      console.log(`Reordered: [cat ${category.id}] "${category.title}" → "${subcat.title}"`);
    }
  }
}

writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');

console.log(`\nDone. Checked ${subcatCount} subcategories; reordered ${totalReordered}.`);
console.log('Next: run renumber.js then validate-catalog.js');
