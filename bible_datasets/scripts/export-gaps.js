#!/usr/bin/env node
/**
 * export-gaps.js
 *
 * Reads the coverage report produced by audit-coverage.js and formats
 * the uncovered runs as an editorial worksheet with fields for AI and
 * human review.
 *
 * Usage:
 *   node bible_datasets/scripts/export-gaps.js [gaps-report.json]
 *
 * Default input: bible_datasets/reports/gaps-report.json
 * Output:        bible_datasets/reports/gaps-worksheet.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [,, reportArg] = process.argv;

const reportPath = reportArg
  ? path.resolve(reportArg)
  : path.resolve(__dirname, '../reports/gaps-report.json');

const outPath = path.resolve(__dirname, '../reports/gaps-worksheet.json');

if (!fs.existsSync(reportPath)) {
  console.error(`Report not found: ${reportPath}`);
  console.error('Run audit-coverage.js first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const SOURCE_TO_CATALOG_ABBR = {
  MAT: 'Matt', MRK: 'Mark', LUK: 'Luke', JHN: 'John',
  ACT: 'Acts', '1CO': '1Cor', '2CO': '2Cor', REV: 'Rev',
};

let gapIndex = 0;
const gaps = [];

for (const book of report.books) {
  for (const run of book.uncoveredRuns) {
    gapIndex++;
    const catalogAbbr = SOURCE_TO_CATALOG_ABBR[book.bookAbbr];
    const label = run.startVerse === run.endVerse
      ? `${catalogAbbr} ${run.chapter}:${run.startVerse}`
      : `${catalogAbbr} ${run.chapter}:${run.startVerse}–${run.endVerse}`;

    gaps.push({
      id: `gap-${String(gapIndex).padStart(3, '0')}`,
      sourceBook: book.bookAbbr,
      bookName: book.bookName,
      catalogAbbr,
      chapter: run.chapter,
      startVerse: run.startVerse,
      endVerse: run.endVerse,
      verseCount: run.endVerse - run.startVerse + 1,
      label,
      verseText: run.verseText,
      jesusText: run.jesusText,
      // ── Editorial fields — filled by synoptic-matcher.js then AI/human review ──
      type: null,               // 'A' = add ref to existing teaching | 'B' = new teaching
      existingTeachingId: null, // Type A only: the teaching to add ref to
      parallelGroup: null,      // synoptic group id if matched
      parallelPassage: null,    // human-readable parallel reference (Type A)
      suggestedCategory: null,  // category id 1–30+
      suggestedSubcategory: null,
      text: null,               // editorial summary (written by AI, reviewed by human)
      tags: [],
      notes: '',
    });
  }
}

const worksheet = {
  generatedAt: new Date().toISOString(),
  sourceReport: reportPath,
  summary: report.summary,
  totalGaps: gaps.length,
  gaps,
};

fs.writeFileSync(outPath, JSON.stringify(worksheet, null, 2), 'utf8');

console.log(`Gaps worksheet → ${outPath}`);
console.log(`Total gaps: ${gaps.length}`);
console.log('\nBreakdown by book:');
for (const book of report.books) {
  if (book.uncoveredRunCount > 0) {
    const pct = (100 - book.coveragePercent).toFixed(1);
    console.log(`  ${book.bookAbbr.padEnd(4)} ${book.uncoveredRunCount} runs  (${book.uncoveredVerses} verses uncovered, ${pct}% gap)`);
  }
}
