#!/usr/bin/env node
/**
 * add-parallel-refs.js  (Script 4)
 *
 * For each Type A gap in gaps-annotated.json, appends a new secondary reference
 * to the matching existing teaching in the catalog.
 *
 * Input:  bible_datasets/reports/gaps-annotated.json
 *         public/teachings.json
 * Output: bible_datasets/reports/catalog-with-parallels.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const gapsPath   = path.resolve(__dirname, '../reports/gaps-annotated.json');
const catalogPath = path.resolve(__dirname, '../../public/teachings.json');
const outPath    = path.resolve(__dirname, '../reports/catalog-with-parallels.json');

const gapsData   = JSON.parse(fs.readFileSync(gapsPath, 'utf8'));
const catalog    = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Build an index: teachingId → teaching object (mutated in place)
const teachingIndex = {};
for (const cat of catalog.categories) {
  for (const sub of cat.subcategories) {
    for (const t of sub.teachings) {
      teachingIndex[t.id] = t;
    }
  }
}

// Normalize bookAbbr per plan decision 4
function normalizeAbbr(abbr) {
  const map = { '1 Cor': '1Cor', '2 Cor': '2Cor' };
  return map[abbr] ?? abbr;
}

// Map catalogAbbr → full book name
const ABBR_TO_FULL = {
  Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John',
  Acts: 'Acts', '1Cor': '1 Corinthians', '2Cor': '2 Corinthians', Rev: 'Revelation',
};

// Build label string using en-dash for ranges
function makeLabel(abbr, chapter, startVerse, endVerse) {
  if (startVerse === endVerse) return `${abbr} ${chapter}:${startVerse}`;
  return `${abbr} ${chapter}:${startVerse}–${endVerse}`;
}

// Check if a reference already exists for a given book+chapter on a teaching
function refExists(teaching, abbr, chapter) {
  return teaching.references.some(
    r => normalizeAbbr(r.bookAbbr) === abbr && r.chapter === chapter
  );
}

let added = 0;
let skipped = 0;
let notFound = 0;

const typeA = gapsData.gaps.filter(g => g.type === 'A');
console.log(`Processing ${typeA.length} Type A gaps…`);

for (const gap of typeA) {
  const teaching = teachingIndex[gap.existingTeachingId];
  if (!teaching) {
    console.warn(`  ⚠ Teaching ${gap.existingTeachingId} not found for ${gap.id}`);
    notFound++;
    continue;
  }

  const abbr = normalizeAbbr(gap.catalogAbbr);

  // Handle gaps that might span chapter boundaries (rare) — group by chapter
  const chapters = {};
  for (let v = gap.startVerse; v <= gap.endVerse; v++) {
    // All verses in the gap are in the same chapter per export-gaps structure
    const ch = gap.chapter;
    if (!chapters[ch]) chapters[ch] = { start: v, end: v };
    else chapters[ch].end = v;
  }
  // Consolidate: the gap already has chapter/start/end
  const ch = gap.chapter;

  if (refExists(teaching, abbr, ch)) {
    skipped++;
    continue;
  }

  const ref = {
    label: makeLabel(abbr, ch, gap.startVerse, gap.endVerse),
    book: ABBR_TO_FULL[abbr] ?? abbr,
    bookAbbr: abbr,
    chapter: ch,
    ranges: [[gap.startVerse, gap.endVerse]],
    isPrimary: false,
  };

  teaching.references.push(ref);
  added++;
}

console.log(`Done: ${added} refs added, ${skipped} already existed, ${notFound} teaching IDs not found`);

fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Output: ${outPath}`);
