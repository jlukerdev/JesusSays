#!/usr/bin/env node
/**
 * generate-stubs.js  (Script 5)
 *
 * Creates stub teaching objects for all Type B gaps that have been filled
 * by the AI editorial pass.
 *
 * Handles groupWithGapId merging: if gap A sets groupWithGapId = "gap-B",
 * gap B's jesusText is merged into gap A's teaching and gap B is marked _merged.
 *
 * Input:  bible_datasets/reports/gaps-annotated.json
 * Output: bible_datasets/reports/stubs.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const gapsPath = path.resolve(__dirname, '../reports/gaps-annotated.json');
const outPath  = path.resolve(__dirname, '../reports/stubs.json');

const gapsData = JSON.parse(fs.readFileSync(gapsPath, 'utf8'));

// Normalize bookAbbr per plan decision 4
function normalizeAbbr(abbr) {
  const map = { '1 Cor': '1Cor', '2 Cor': '2Cor' };
  return map[abbr] ?? abbr;
}

const ABBR_TO_FULL = {
  Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John',
  Acts: 'Acts', '1Cor': '1 Corinthians', '2Cor': '2 Corinthians', Rev: 'Revelation',
};

function makeLabel(abbr, chapter, startVerse, endVerse) {
  if (startVerse === endVerse) return `${abbr} ${chapter}:${startVerse}`;
  return `${abbr} ${chapter}:${startVerse}–${endVerse}`;
}

const typeB = gapsData.gaps.filter(g => g.type === 'B');
const gapIndex = Object.fromEntries(typeB.map(g => [g.id, g]));

// Track merged gap IDs so we skip them
const mergedIds = new Set();

// First pass: resolve all groupWithGapId references to detect merges
for (const gap of typeB) {
  if (!gap.groupWithGapId) continue;
  const target = gapIndex[gap.groupWithGapId];
  if (!target) {
    console.warn(`  ⚠ ${gap.id}.groupWithGapId="${gap.groupWithGapId}" not found — ignoring`);
    gap.groupWithGapId = null;
    continue;
  }
  // Only group if same chapter
  if (gap.chapter !== target.chapter) {
    console.warn(`  ⚠ ${gap.id} → ${gap.groupWithGapId} cross-chapter group rejected`);
    gap.groupWithGapId = null;
    continue;
  }
  mergedIds.add(gap.groupWithGapId);
}

const stubs = [];
let skipped = 0;

for (const gap of typeB) {
  // Skip gaps that were merged into another teaching
  if (mergedIds.has(gap.id)) continue;

  if (!gap.text) {
    console.warn(`  ⚠ Skipping ${gap.id} (${gap.label}): text is null`);
    skipped++;
    continue;
  }

  const abbr = normalizeAbbr(gap.catalogAbbr);

  // Start with this gap's jesusText
  let allJesusText = [...gap.jesusText];
  const ranges = [[gap.startVerse, gap.endVerse]];

  // Merge grouped gap if present
  if (gap.groupWithGapId) {
    const merged = gapIndex[gap.groupWithGapId];
    if (merged && merged.jesusText) {
      allJesusText = [...allJesusText, ...merged.jesusText];
      ranges.push([merged.startVerse, merged.endVerse]);
    }
  }

  const quote = allJesusText.join(' ');

  const stub = {
    _stub: true,
    _gapId: gap.id,
    id: 'PENDING',
    text: gap.text,
    quote,
    tags: gap.tags || [],
    suggestedCategory: gap.suggestedCategory,
    suggestedSubcategory: gap.suggestedSubcategory,
    references: [{
      label: makeLabel(abbr, gap.chapter, gap.startVerse, gap.endVerse),
      book: ABBR_TO_FULL[abbr] ?? abbr,
      bookAbbr: abbr,
      chapter: gap.chapter,
      ranges,
      isPrimary: true,
    }],
  };

  stubs.push(stub);
}

console.log(`Generated ${stubs.length} stubs, skipped ${skipped} (null text), merged ${mergedIds.size} gaps`);

const nullCat = stubs.filter(s => !s.suggestedCategory).length;
if (nullCat > 0) console.warn(`  ⚠ ${nullCat} stubs missing suggestedCategory`);

fs.writeFileSync(outPath, JSON.stringify(stubs, null, 2), 'utf8');
console.log(`Output: ${outPath}`);
