#!/usr/bin/env node
/**
 * synoptic-matcher.js
 *
 * Annotates each gap in the worksheet with its synoptic parallel type:
 *   Type A — a parallel passage is already covered by an existing teaching.
 *            Action (script 4): add a new reference entry to that teaching.
 *   Type B — unique material with no covered parallel.
 *            Action (script 5): create a new teaching stub.
 *
 * Gaps not in the synoptic table are also marked Type B.
 *
 * Usage:
 *   node bible_datasets/scripts/synoptic-matcher.js [worksheet.json] [catalog.json]
 *
 * Defaults:
 *   worksheet → bible_datasets/reports/gaps-worksheet.json
 *   catalog   → public/teachings.json
 *
 * Output: bible_datasets/reports/gaps-annotated.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [,, worksheetArg, catalogArg] = process.argv;

const worksheetPath = worksheetArg
  ? path.resolve(worksheetArg)
  : path.resolve(__dirname, '../reports/gaps-worksheet.json');

const catalogPath = catalogArg
  ? path.resolve(catalogArg)
  : path.resolve(__dirname, '../../public/teachings.json');

const outPath = path.resolve(__dirname, '../reports/gaps-annotated.json');

// Normalize any bookAbbr variant to canonical catalog form
function norm(abbr) {
  const map = {
    MAT: 'Matt', MRK: 'Mark', LUK: 'Luke', JHN: 'John',
    ACT: 'Acts', '1CO': '1Cor', '2CO': '2Cor', REV: 'Rev',
    '1 Cor': '1Cor', '2 Cor': '2Cor',
  };
  return map[abbr] ?? abbr;
}

// ── Synoptic Parallel Table ──────────────────────────────────────────────────
// Each group = one teaching unit that appears in multiple gospels.
// book values use catalog abbr (Matt, Mark, Luke, John, Acts, 1Cor, Rev).
// Verse ranges are inclusive: [vs, ve].

const SYNOPTIC_TABLE = [
  // Temptation responses
  { id: 'temptation', passages: [
    { book: 'Matt', ch: 4, vs: 4, ve: 10 },
    { book: 'Luke', ch: 4, vs: 4, ve: 12 },
  ]},
  // Beatitudes / Sermon on the Plain opening
  { id: 'beatitudes', passages: [
    { book: 'Matt', ch: 5, vs: 3, ve: 12 },
    { book: 'Luke', ch: 6, vs: 20, ve: 26 },
  ]},
  // Love enemies / Sermon on Plain ethics
  { id: 'love-enemies', passages: [
    { book: 'Matt', ch: 5, vs: 38, ve: 48 },
    { book: 'Luke', ch: 6, vs: 27, ve: 36 },
  ]},
  // Salt of the earth
  { id: 'salt', passages: [
    { book: 'Matt', ch: 5, vs: 13, ve: 13 },
    { book: 'Mark', ch: 9, vs: 50, ve: 50 },
    { book: 'Luke', ch: 14, vs: 34, ve: 35 },
  ]},
  // Lamp under a bushel
  { id: 'lamp-bushel', passages: [
    { book: 'Matt', ch: 5, vs: 15, ve: 15 },
    { book: 'Mark', ch: 4, vs: 21, ve: 22 },
    { book: 'Luke', ch: 8, vs: 16, ve: 17 },
    { book: 'Luke', ch: 11, vs: 33, ve: 36 },
  ]},
  // Lord's Prayer
  { id: 'lords-prayer', passages: [
    { book: 'Matt', ch: 6, vs: 9, ve: 13 },
    { book: 'Luke', ch: 11, vs: 2, ve: 4 },
  ]},
  // Eye as lamp
  { id: 'eye-lamp', passages: [
    { book: 'Matt', ch: 6, vs: 22, ve: 23 },
    { book: 'Luke', ch: 11, vs: 34, ve: 36 },
  ]},
  // Two masters
  { id: 'two-masters', passages: [
    { book: 'Matt', ch: 6, vs: 24, ve: 24 },
    { book: 'Luke', ch: 16, vs: 13, ve: 13 },
  ]},
  // Do not worry
  { id: 'do-not-worry', passages: [
    { book: 'Matt', ch: 6, vs: 25, ve: 34 },
    { book: 'Luke', ch: 12, vs: 22, ve: 31 },
  ]},
  // Judge not
  { id: 'judge-not', passages: [
    { book: 'Matt', ch: 7, vs: 1, ve: 5 },
    { book: 'Luke', ch: 6, vs: 37, ve: 42 },
  ]},
  // Ask, seek, knock
  { id: 'ask-seek-knock', passages: [
    { book: 'Matt', ch: 7, vs: 7, ve: 11 },
    { book: 'Luke', ch: 11, vs: 9, ve: 13 },
  ]},
  // Golden rule
  { id: 'golden-rule', passages: [
    { book: 'Matt', ch: 7, vs: 12, ve: 12 },
    { book: 'Luke', ch: 6, vs: 31, ve: 31 },
  ]},
  // Narrow gate
  { id: 'narrow-gate', passages: [
    { book: 'Matt', ch: 7, vs: 13, ve: 14 },
    { book: 'Luke', ch: 13, vs: 24, ve: 24 },
  ]},
  // By their fruits
  { id: 'by-fruits', passages: [
    { book: 'Matt', ch: 7, vs: 16, ve: 20 },
    { book: 'Luke', ch: 6, vs: 43, ve: 44 },
  ]},
  // Wise and foolish builders
  { id: 'wise-builders', passages: [
    { book: 'Matt', ch: 7, vs: 24, ve: 27 },
    { book: 'Luke', ch: 6, vs: 47, ve: 49 },
  ]},
  // Healing of paralytic — pronouncements
  { id: 'paralytic', passages: [
    { book: 'Matt', ch: 9, vs: 2, ve: 6 },
    { book: 'Mark', ch: 2, vs: 5, ve: 11 },
    { book: 'Luke', ch: 5, vs: 20, ve: 24 },
  ]},
  // Call / eating with sinners
  { id: 'sinners-calling', passages: [
    { book: 'Matt', ch: 9, vs: 12, ve: 13 },
    { book: 'Mark', ch: 2, vs: 17, ve: 17 },
    { book: 'Luke', ch: 5, vs: 31, ve: 32 },
  ]},
  // New wine / new wineskins
  { id: 'new-wineskins', passages: [
    { book: 'Matt', ch: 9, vs: 15, ve: 17 },
    { book: 'Mark', ch: 2, vs: 19, ve: 22 },
    { book: 'Luke', ch: 5, vs: 34, ve: 39 },
  ]},
  // Mission instructions (twelve / seventy)
  { id: 'mission-twelve', passages: [
    { book: 'Matt', ch: 10, vs: 5, ve: 42 },
    { book: 'Mark', ch: 6, vs: 8, ve: 11 },
    { book: 'Luke', ch: 9, vs: 3, ve: 5 },
    { book: 'Luke', ch: 10, vs: 3, ve: 16 },
  ]},
  // John the Baptist — who is he?
  { id: 'john-baptist-who', passages: [
    { book: 'Matt', ch: 11, vs: 4, ve: 11 },
    { book: 'Luke', ch: 7, vs: 22, ve: 28 },
  ]},
  // John the Baptist — Elijah
  { id: 'john-elijah', passages: [
    { book: 'Matt', ch: 11, vs: 14, ve: 14 },
    { book: 'Matt', ch: 17, vs: 11, ve: 13 },
    { book: 'Mark', ch: 9, vs: 12, ve: 13 },
  ]},
  // Beelzebub controversy
  { id: 'beelzebub', passages: [
    { book: 'Matt', ch: 12, vs: 25, ve: 32 },
    { book: 'Mark', ch: 3, vs: 23, ve: 29 },
    { book: 'Luke', ch: 11, vs: 17, ve: 23 },
  ]},
  // Sign of Jonah
  { id: 'sign-jonah', passages: [
    { book: 'Matt', ch: 12, vs: 39, ve: 42 },
    { book: 'Luke', ch: 11, vs: 29, ve: 32 },
  ]},
  // Return of unclean spirit
  { id: 'unclean-return', passages: [
    { book: 'Matt', ch: 12, vs: 43, ve: 45 },
    { book: 'Luke', ch: 11, vs: 24, ve: 26 },
  ]},
  // Blessed eyes and ears
  { id: 'blessed-eyes', passages: [
    { book: 'Matt', ch: 13, vs: 16, ve: 17 },
    { book: 'Luke', ch: 10, vs: 23, ve: 24 },
  ]},
  // Parable of the Sower
  { id: 'sower', passages: [
    { book: 'Matt', ch: 13, vs: 3, ve: 9 },
    { book: 'Mark', ch: 4, vs: 3, ve: 9 },
    { book: 'Luke', ch: 8, vs: 5, ve: 8 },
  ]},
  // Sower — explanation
  { id: 'sower-explanation', passages: [
    { book: 'Matt', ch: 13, vs: 18, ve: 23 },
    { book: 'Mark', ch: 4, vs: 14, ve: 20 },
    { book: 'Luke', ch: 8, vs: 11, ve: 15 },
  ]},
  // Mustard seed parable
  { id: 'mustard-seed', passages: [
    { book: 'Matt', ch: 13, vs: 31, ve: 32 },
    { book: 'Mark', ch: 4, vs: 30, ve: 32 },
    { book: 'Luke', ch: 13, vs: 18, ve: 19 },
  ]},
  // Leaven parable
  { id: 'leaven', passages: [
    { book: 'Matt', ch: 13, vs: 33, ve: 33 },
    { book: 'Luke', ch: 13, vs: 20, ve: 21 },
  ]},
  // Peter's confession
  { id: 'peters-confession', passages: [
    { book: 'Matt', ch: 16, vs: 17, ve: 19 },
    { book: 'Mark', ch: 8, vs: 29, ve: 30 },
    { book: 'Luke', ch: 9, vs: 20, ve: 21 },
  ]},
  // Take up cross
  { id: 'take-up-cross', passages: [
    { book: 'Matt', ch: 16, vs: 24, ve: 28 },
    { book: 'Mark', ch: 8, vs: 34, ve: 38 },
    { book: 'Mark', ch: 9, vs: 1, ve: 1 },
    { book: 'Luke', ch: 9, vs: 23, ve: 27 },
  ]},
  // Faith like mustard seed (command, not parable)
  { id: 'faith-mustard', passages: [
    { book: 'Matt', ch: 17, vs: 20, ve: 21 },
    { book: 'Luke', ch: 17, vs: 6, ve: 6 },
  ]},
  // Who is greatest / receive a child
  { id: 'who-greatest', passages: [
    { book: 'Matt', ch: 18, vs: 3, ve: 5 },
    { book: 'Mark', ch: 9, vs: 37, ve: 37 },
    { book: 'Luke', ch: 9, vs: 48, ve: 48 },
  ]},
  // Millstone / causing to stumble
  { id: 'millstone', passages: [
    { book: 'Matt', ch: 18, vs: 6, ve: 7 },
    { book: 'Mark', ch: 9, vs: 42, ve: 42 },
    { book: 'Luke', ch: 17, vs: 1, ve: 2 },
  ]},
  // Pluck out eye (causing yourself to sin)
  { id: 'pluck-eye', passages: [
    { book: 'Matt', ch: 18, vs: 8, ve: 9 },
    { book: 'Mark', ch: 9, vs: 43, ve: 48 },
  ]},
  // Lost sheep parable
  { id: 'lost-sheep', passages: [
    { book: 'Matt', ch: 18, vs: 12, ve: 14 },
    { book: 'Luke', ch: 15, vs: 4, ve: 7 },
  ]},
  // Divorce teaching
  { id: 'divorce', passages: [
    { book: 'Matt', ch: 19, vs: 4, ve: 9 },
    { book: 'Mark', ch: 10, vs: 3, ve: 9 },
    { book: 'Luke', ch: 16, vs: 18, ve: 18 },
  ]},
  // Rich young ruler
  { id: 'rich-young-ruler', passages: [
    { book: 'Matt', ch: 19, vs: 17, ve: 26 },
    { book: 'Mark', ch: 10, vs: 18, ve: 27 },
    { book: 'Luke', ch: 18, vs: 19, ve: 27 },
  ]},
  // Twelve thrones
  { id: 'twelve-thrones', passages: [
    { book: 'Matt', ch: 19, vs: 28, ve: 30 },
    { book: 'Luke', ch: 22, vs: 28, ve: 30 },
  ]},
  // Service and greatness / ransom
  { id: 'ransom-service', passages: [
    { book: 'Matt', ch: 20, vs: 22, ve: 28 },
    { book: 'Mark', ch: 10, vs: 38, ve: 45 },
    { book: 'Luke', ch: 22, vs: 25, ve: 27 },
  ]},
  // Cleansing the temple
  { id: 'temple-cleansing', passages: [
    { book: 'Matt', ch: 21, vs: 13, ve: 13 },
    { book: 'Mark', ch: 11, vs: 17, ve: 17 },
    { book: 'Luke', ch: 19, vs: 46, ve: 46 },
  ]},
  // Fig tree withered — faith and prayer
  { id: 'fig-tree-faith', passages: [
    { book: 'Matt', ch: 21, vs: 21, ve: 22 },
    { book: 'Mark', ch: 11, vs: 22, ve: 25 },
  ]},
  // Authority question
  { id: 'authority-question', passages: [
    { book: 'Matt', ch: 21, vs: 24, ve: 27 },
    { book: 'Mark', ch: 11, vs: 29, ve: 33 },
    { book: 'Luke', ch: 20, vs: 3, ve: 8 },
  ]},
  // Wicked tenants
  { id: 'wicked-tenants', passages: [
    { book: 'Matt', ch: 21, vs: 40, ve: 44 },
    { book: 'Mark', ch: 12, vs: 9, ve: 11 },
    { book: 'Luke', ch: 20, vs: 15, ve: 18 },
  ]},
  // Render to Caesar
  { id: 'render-caesar', passages: [
    { book: 'Matt', ch: 22, vs: 21, ve: 21 },
    { book: 'Mark', ch: 12, vs: 17, ve: 17 },
    { book: 'Luke', ch: 20, vs: 25, ve: 25 },
  ]},
  // Resurrection and marriage
  { id: 'resurrection-marriage', passages: [
    { book: 'Matt', ch: 22, vs: 29, ve: 32 },
    { book: 'Mark', ch: 12, vs: 24, ve: 27 },
    { book: 'Luke', ch: 20, vs: 34, ve: 38 },
  ]},
  // Greatest commandment
  { id: 'greatest-commandment', passages: [
    { book: 'Matt', ch: 22, vs: 37, ve: 40 },
    { book: 'Mark', ch: 12, vs: 29, ve: 31 },
  ]},
  // Son of David question
  { id: 'son-of-david', passages: [
    { book: 'Matt', ch: 22, vs: 43, ve: 45 },
    { book: 'Mark', ch: 12, vs: 35, ve: 37 },
    { book: 'Luke', ch: 20, vs: 41, ve: 44 },
  ]},
  // Woes to scribes / Pharisees
  { id: 'woes-scribes', passages: [
    { book: 'Matt', ch: 23, vs: 2, ve: 36 },
    { book: 'Mark', ch: 12, vs: 38, ve: 40 },
    { book: 'Luke', ch: 20, vs: 46, ve: 47 },
  ]},
  // Widow's mite praise
  { id: 'widows-mite', passages: [
    { book: 'Mark', ch: 12, vs: 43, ve: 44 },
    { book: 'Luke', ch: 21, vs: 3, ve: 4 },
  ]},
  // Olivet — beginning signs
  { id: 'olivet-signs', passages: [
    { book: 'Matt', ch: 24, vs: 4, ve: 14 },
    { book: 'Mark', ch: 13, vs: 5, ve: 13 },
    { book: 'Luke', ch: 21, vs: 8, ve: 19 },
  ]},
  // Olivet — abomination / flee
  { id: 'olivet-abomination', passages: [
    { book: 'Matt', ch: 24, vs: 15, ve: 22 },
    { book: 'Mark', ch: 13, vs: 14, ve: 20 },
    { book: 'Luke', ch: 21, vs: 20, ve: 24 },
  ]},
  // Olivet — false christs
  { id: 'olivet-false-christs', passages: [
    { book: 'Matt', ch: 24, vs: 23, ve: 28 },
    { book: 'Mark', ch: 13, vs: 21, ve: 23 },
  ]},
  // Olivet — coming of Son of Man
  { id: 'olivet-son-of-man', passages: [
    { book: 'Matt', ch: 24, vs: 29, ve: 31 },
    { book: 'Mark', ch: 13, vs: 24, ve: 27 },
    { book: 'Luke', ch: 21, vs: 25, ve: 28 },
  ]},
  // Olivet — fig tree parable / this generation
  { id: 'olivet-fig', passages: [
    { book: 'Matt', ch: 24, vs: 32, ve: 35 },
    { book: 'Mark', ch: 13, vs: 28, ve: 31 },
    { book: 'Luke', ch: 21, vs: 29, ve: 33 },
  ]},
  // Olivet — no one knows the hour / watch
  { id: 'no-one-knows', passages: [
    { book: 'Matt', ch: 24, vs: 36, ve: 44 },
    { book: 'Mark', ch: 13, vs: 32, ve: 37 },
  ]},
  // Days of Noah / Son of Man coming
  { id: 'days-noah', passages: [
    { book: 'Matt', ch: 24, vs: 37, ve: 44 },
    { book: 'Luke', ch: 17, vs: 26, ve: 37 },
  ]},
  // Talents / Minas
  { id: 'talents-minas', passages: [
    { book: 'Matt', ch: 25, vs: 14, ve: 30 },
    { book: 'Luke', ch: 19, vs: 12, ve: 27 },
  ]},
  // Last Supper — bread and cup
  { id: 'last-supper', passages: [
    { book: 'Matt', ch: 26, vs: 26, ve: 29 },
    { book: 'Mark', ch: 14, vs: 22, ve: 25 },
    { book: 'Luke', ch: 22, vs: 17, ve: 20 },
    { book: '1Cor', ch: 11, vs: 24, ve: 25 },
  ]},
  // Prediction of Peter's denial
  { id: 'peters-denial-warning', passages: [
    { book: 'Matt', ch: 26, vs: 31, ve: 34 },
    { book: 'Mark', ch: 14, vs: 27, ve: 30 },
    { book: 'Luke', ch: 22, vs: 34, ve: 34 },
    { book: 'John', ch: 13, vs: 38, ve: 38 },
  ]},
  // Gethsemane — prayer and disciples
  { id: 'gethsemane', passages: [
    { book: 'Matt', ch: 26, vs: 36, ve: 46 },
    { book: 'Mark', ch: 14, vs: 32, ve: 42 },
    { book: 'Luke', ch: 22, vs: 40, ve: 46 },
  ]},
  // Arrest — "Am I a robber?"
  { id: 'arrest', passages: [
    { book: 'Matt', ch: 26, vs: 52, ve: 55 },
    { book: 'Mark', ch: 14, vs: 48, ve: 49 },
    { book: 'Luke', ch: 22, vs: 51, ve: 53 },
  ]},
  // Trial — testimony before high priest
  { id: 'trial-high-priest', passages: [
    { book: 'Matt', ch: 26, vs: 64, ve: 64 },
    { book: 'Mark', ch: 14, vs: 62, ve: 62 },
    { book: 'Luke', ch: 22, vs: 67, ve: 70 },
  ]},
  // Post-resurrection appearances — peace / do not fear
  { id: 'resurrection-peace', passages: [
    { book: 'Matt', ch: 28, vs: 9, ve: 10 },
    { book: 'John', ch: 20, vs: 15, ve: 17 },
    { book: 'John', ch: 20, vs: 19, ve: 23 },
  ]},
  // Great Commission
  { id: 'great-commission', passages: [
    { book: 'Matt', ch: 28, vs: 18, ve: 20 },
    { book: 'Mark', ch: 16, vs: 15, ve: 18 },
    { book: 'Luke', ch: 24, vs: 46, ve: 49 },
    { book: 'John', ch: 20, vs: 21, ve: 23 },
  ]},
];

// ── Build coverage index from catalog ────────────────────────────────────────
// Returns: { [normalizedAbbr]: { [chapter]: { [verse]: teachingId } } }
function buildCoverageIndex(catalog) {
  const idx = {};
  for (const cat of catalog.categories) {
    for (const subcat of cat.subcategories) {
      for (const teaching of subcat.teachings) {
        for (const ref of teaching.references) {
          const abbr = norm(ref.bookAbbr);
          if (!idx[abbr]) idx[abbr] = {};
          if (!idx[abbr][ref.chapter]) idx[abbr][ref.chapter] = {};
          for (const [start, end] of ref.ranges) {
            for (let v = start; v <= end; v++) {
              idx[abbr][ref.chapter][v] = teaching.id;
            }
          }
        }
      }
    }
  }
  return idx;
}

// Return first teaching id covering any verse in [vs, ve] for this book/chapter, or null.
function findCovering(book, ch, vs, ve, idx) {
  const chIdx = idx[book]?.[ch];
  if (!chIdx) return null;
  for (let v = vs; v <= ve; v++) {
    if (chIdx[v]) return chIdx[v];
  }
  return null;
}

// True if the gap overlaps the parallel passage (same book, chapter, overlapping verses).
function overlaps(gap, passage) {
  return norm(gap.sourceBook) === passage.book
    && gap.chapter === passage.ch
    && gap.startVerse <= passage.ve
    && gap.endVerse >= passage.vs;
}

// ── Main ─────────────────────────────────────────────────────────────────────

if (!fs.existsSync(worksheetPath)) {
  console.error(`Worksheet not found: ${worksheetPath}`);
  console.error('Run export-gaps.js first.');
  process.exit(1);
}
if (!fs.existsSync(catalogPath)) {
  console.error(`Catalog not found: ${catalogPath}`); process.exit(1);
}

const worksheet = JSON.parse(fs.readFileSync(worksheetPath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const coverageIdx = buildCoverageIndex(catalog);

let typeACount = 0, typeBCount = 0;

for (const gap of worksheet.gaps) {
  let matchedGroup = null;
  let coveredTeachingId = null;
  let coveredPassage = null;

  for (const group of SYNOPTIC_TABLE) {
    const gapInGroup = group.passages.some(p => overlaps(gap, p));
    if (!gapInGroup) continue;

    // Record group membership even if no covered parallel found
    if (!matchedGroup) matchedGroup = group.id;

    // Check if any other passage in the group is already covered
    for (const p of group.passages) {
      if (overlaps(gap, p)) continue; // skip the gap's own passage
      const teachingId = findCovering(p.book, p.ch, p.vs, p.ve, coverageIdx);
      if (teachingId) {
        matchedGroup = group.id;
        coveredTeachingId = teachingId;
        const ve = p.vs !== p.ve ? `–${p.ve}` : '';
        coveredPassage = `${p.book} ${p.ch}:${p.vs}${ve}`;
        break;
      }
    }
    if (coveredTeachingId) break;
  }

  if (coveredTeachingId) {
    gap.type = 'A';
    gap.existingTeachingId = coveredTeachingId;
    gap.parallelGroup = matchedGroup;
    gap.parallelPassage = coveredPassage;
    typeACount++;
  } else {
    gap.type = 'B';
    gap.parallelGroup = matchedGroup; // may be set if in a group but no covered parallel
    typeBCount++;
  }
}

const annotated = {
  ...worksheet,
  annotatedAt: new Date().toISOString(),
  typeSummary: { A: typeACount, B: typeBCount },
};

fs.writeFileSync(outPath, JSON.stringify(annotated, null, 2), 'utf8');

console.log(`Annotated worksheet → ${outPath}`);
console.log(`\nType breakdown:`);
console.log(`  Type A (add ref to existing teaching) : ${typeACount}`);
console.log(`  Type B (new teaching needed)          : ${typeBCount}`);
console.log(`  Total gaps                            : ${worksheet.gaps.length}`);
console.log('\nNext step: run add-parallel-refs.js (Type A) and generate-stubs.js (Type B).');
console.log('Before that: do the AI editorial pass on Type B gaps (see catalog-rebuild-plan.md).');
