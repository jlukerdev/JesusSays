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

// Find an existing reference for a given book+chapter on a teaching
function findRef(teaching, abbr, chapter) {
  return teaching.references.find(
    r => normalizeAbbr(r.bookAbbr) === abbr && r.chapter === chapter
  );
}

// Merge [start,end] into a sorted, non-overlapping ranges array
function mergeRange(ranges, start, end) {
  const merged = [...ranges, [start, end]].sort((a, b) => a[0] - b[0]);
  const result = [];
  for (const [s, e] of merged) {
    if (result.length && s <= result[result.length - 1][1] + 1) {
      result[result.length - 1][1] = Math.max(result[result.length - 1][1], e);
    } else {
      result.push([s, e]);
    }
  }
  return result;
}

// Build label from a ranges array
function labelFromRanges(abbr, chapter, ranges) {
  const parts = ranges.map(([s, e]) => (s === e ? `${s}` : `${s}–${e}`));
  return `${abbr} ${chapter}:${parts.join(', ')}`;
}

// True if [start,end] is fully contained within ranges
function rangeCovered(ranges, start, end) {
  for (let v = start; v <= end; v++) {
    if (!ranges.some(([s, e]) => v >= s && v <= e)) return false;
  }
  return true;
}

let added = 0;
let extended = 0;
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

  const existing = findRef(teaching, abbr, ch);
  if (existing) {
    if (rangeCovered(existing.ranges, gap.startVerse, gap.endVerse)) {
      skipped++;
      continue;
    }
    existing.ranges = mergeRange(existing.ranges, gap.startVerse, gap.endVerse);
    existing.label = labelFromRanges(abbr, ch, existing.ranges);
    extended++;
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

console.log(`Done: ${added} refs added, ${extended} refs extended, ${skipped} already covered, ${notFound} teaching IDs not found`);

fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Output: ${outPath}`);
