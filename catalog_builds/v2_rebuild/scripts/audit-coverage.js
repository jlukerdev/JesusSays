#!/usr/bin/env node
/**
 * audit-coverage.js
 *
 * Compares Jesus-speaking verses in the parsed NT source files against
 * reference ranges in the teachings catalog. Reports per-book coverage
 * and outputs a list of uncovered verse runs.
 *
 * Usage:
 *   node bible_datasets/scripts/audit-coverage.js [catalog.json] [source-dir]
 *
 * Defaults:
 *   catalog    → <repo-root>/public/teachings.json
 *   source-dir → <repo-root>/bible_datasets/output
 *
 * Output: bible_datasets/reports/gaps-report.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [,, catalogArg, sourceDirArg] = process.argv;

const catalogPath = catalogArg
  ? path.resolve(catalogArg)
  : path.resolve(__dirname, '../../public/teachings.json');

const sourceDir = sourceDirArg
  ? path.resolve(sourceDirArg)
  : path.resolve(__dirname, '../output');

const reportsDir = path.resolve(__dirname, '../reports');

// Books with Words of Christ in scope, in canonical order
const SCOPE_BOOKS = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', '1CO', '2CO', 'REV'];

const BOOK_FULL_NAME = {
  MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John',
  ACT: 'Acts', '1CO': '1 Corinthians', '2CO': '2 Corinthians', REV: 'Revelation',
};

// Map any bookAbbr variant to canonical catalog form
function normalizeAbbr(abbr) {
  const map = {
    MAT: 'Matt', MRK: 'Mark', LUK: 'Luke', JHN: 'John',
    ACT: 'Acts', '1CO': '1Cor', '2CO': '2Cor', REV: 'Rev',
    '1 Cor': '1Cor', '2 Cor': '2Cor',
  };
  return map[abbr] ?? abbr;
}

// Catalog bookAbbr → source bookAbbr
const CATALOG_TO_SOURCE = {
  Matt: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN',
  Acts: 'ACT', '1Cor': '1CO', '1 Cor': '1CO', '2Cor': '2CO', '2 Cor': '2CO',
  Rev: 'REV',
};

// Load Jesus-speaking verses from source JSON files.
// Returns: { [sourceAbbr]: { [chapter]: { [verse]: { text, jesusText } } } }
function loadSourceBooks(dir) {
  const books = {};
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (!SCOPE_BOOKS.includes(data.bookAbbr)) continue;
    const chapters = {};
    for (const v of data.verses) {
      if (!v.jesusIsSpeaking) continue;
      if (!chapters[v.chapter]) chapters[v.chapter] = {};
      chapters[v.chapter][v.verse] = { text: v.text, jesusText: v.jesusText };
    }
    books[data.bookAbbr] = chapters;
  }
  return books;
}

// Build covered verse sets from catalog references.
// Returns: { [sourceAbbr]: Set<"chapter:verse"> }
function buildCoveredSets(catalog) {
  const covered = {};
  for (const abbr of SCOPE_BOOKS) covered[abbr] = new Set();

  for (const cat of catalog.categories) {
    for (const subcat of cat.subcategories) {
      for (const teaching of subcat.teachings) {
        for (const ref of teaching.references) {
          const srcAbbr = CATALOG_TO_SOURCE[ref.bookAbbr];
          if (!srcAbbr || !covered[srcAbbr]) continue;
          for (const [start, end] of ref.ranges) {
            for (let v = start; v <= end; v++) {
              covered[srcAbbr].add(`${ref.chapter}:${v}`);
            }
          }
        }
      }
    }
  }
  return covered;
}

// Group consecutive uncovered Jesus verses within each chapter into runs.
function buildRuns(chapterMap, coveredSet) {
  const runs = [];
  const chapters = Object.keys(chapterMap).map(Number).sort((a, b) => a - b);

  for (const ch of chapters) {
    const verses = Object.keys(chapterMap[ch]).map(Number).sort((a, b) => a - b);
    let run = null;

    const flush = () => {
      if (run) { runs.push(run); run = null; }
    };

    for (const v of verses) {
      if (!coveredSet.has(`${ch}:${v}`)) {
        if (!run) {
          run = { chapter: ch, startVerse: v, endVerse: v, verseText: [], jesusText: [] };
        } else if (v === run.endVerse + 1) {
          run.endVerse = v;
        } else {
          flush();
          run = { chapter: ch, startVerse: v, endVerse: v, verseText: [], jesusText: [] };
        }
        run.verseText.push(chapterMap[ch][v].text);
        run.jesusText.push(...chapterMap[ch][v].jesusText);
      } else {
        flush();
      }
    }
    flush();
  }
  return runs;
}

// ── Main ────────────────────────────────────────────────────────────────────

if (!fs.existsSync(catalogPath)) {
  console.error(`Catalog not found: ${catalogPath}`); process.exit(1);
}
if (!fs.existsSync(sourceDir)) {
  console.error(`Source dir not found: ${sourceDir}`); process.exit(1);
}
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

console.log(`Catalog : ${catalogPath}`);
console.log(`Sources : ${sourceDir}`);

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const sourceBooks = loadSourceBooks(sourceDir);
const coveredSets = buildCoveredSets(catalog);

let totalJesus = 0, totalCovered = 0;
const bookResults = [];

for (const abbr of SCOPE_BOOKS) {
  const chapterMap = sourceBooks[abbr] ?? {};
  const coveredSet = coveredSets[abbr];

  let jesusCount = 0, coveredCount = 0;
  for (const [ch, verses] of Object.entries(chapterMap)) {
    for (const v of Object.keys(verses)) {
      jesusCount++;
      if (coveredSet.has(`${ch}:${v}`)) coveredCount++;
    }
  }

  const runs = buildRuns(chapterMap, coveredSet);
  totalJesus += jesusCount;
  totalCovered += coveredCount;

  bookResults.push({
    bookAbbr: abbr,
    bookName: BOOK_FULL_NAME[abbr],
    catalogAbbr: normalizeAbbr(abbr),
    totalJesusVerses: jesusCount,
    coveredVerses: coveredCount,
    uncoveredVerses: jesusCount - coveredCount,
    coveragePercent: jesusCount > 0
      ? Math.round((coveredCount / jesusCount) * 1000) / 10
      : 100,
    uncoveredRunCount: runs.length,
    uncoveredRuns: runs,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  catalogFile: catalogPath,
  sourceDir,
  summary: {
    totalJesusVerses: totalJesus,
    coveredVerses: totalCovered,
    uncoveredVerses: totalJesus - totalCovered,
    coveragePercent: Math.round((totalCovered / totalJesus) * 1000) / 10,
    totalUncoveredRuns: bookResults.reduce((s, b) => s + b.uncoveredRunCount, 0),
  },
  books: bookResults,
};

const outPath = path.join(reportsDir, 'gaps-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

console.log(`\n${'─'.repeat(60)}`);
console.log(`Report → ${outPath}`);
console.log(`\nSummary:`);
console.log(`  Total Jesus verses : ${totalJesus.toLocaleString()}`);
console.log(`  Covered            : ${totalCovered} (${report.summary.coveragePercent}%)`);
console.log(`  Uncovered          : ${report.summary.uncoveredVerses}`);
console.log(`  Uncovered runs     : ${report.summary.totalUncoveredRuns}`);
console.log(`\nPer book:`);
for (const b of bookResults) {
  const pct = b.coveragePercent.toFixed(1).padStart(5);
  console.log(`  ${b.bookAbbr.padEnd(4)} ${pct}%  (${b.coveredVerses}/${b.totalJesusVerses} verses, ${b.uncoveredRunCount} runs)`);
}
