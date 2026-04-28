#!/usr/bin/env node
/**
 * validate-v2.js  (Script 7)
 *
 * Validates teachings_v2.json against all checks specified in the plan:
 *   - Coverage re-audit (target ≥ 95%)
 *   - All teaching IDs unique and match \d+\.\d+\.\d+
 *   - All bookAbbr values in canonical set
 *   - Each teaching has exactly one isPrimary: true reference
 *   - No _stub / _gapId fields remain
 *   - meta.totalCategories matches actual count
 *   - All ranges are [number, number] with end >= start
 *   - Logs teachings missing quote field
 *
 * Input:  bible_datasets/jesussays_datasets/teachings_v2.json
 *         bible_datasets/output/*.json (source verse files)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const v2Path    = path.resolve(__dirname, '../jesussays_datasets/teachings_v2.json');
const outputDir = path.resolve(__dirname, '../output');

const v2 = JSON.parse(fs.readFileSync(v2Path, 'utf8'));

const VALID_ABBRS = new Set(['Matt', 'Mark', 'Luke', 'John', 'Acts', '1Cor', '2Cor', 'Rev']);
const ID_PATTERN  = /^\d+\.\d+\.\d+$/;

let errors = 0;
let warnings = 0;

function err(msg)  { console.error(`  ✗ ${msg}`); errors++; }
function warn(msg) { console.warn (`  ⚠ ${msg}`); warnings++; }
function ok(msg)   { console.log  (`  ✓ ${msg}`); }

// ── Gather all teachings ─────────────────────────────────────────────────────
const allTeachings = v2.categories.flatMap(c =>
  c.subcategories.flatMap(s => s.teachings)
);

// ── Check 1: meta.totalCategories ────────────────────────────────────────────
const actualCats = v2.categories.length;
if (v2.meta.totalCategories !== actualCats) {
  err(`meta.totalCategories is ${v2.meta.totalCategories} but actual category count is ${actualCats}`);
} else {
  ok(`meta.totalCategories = ${actualCats}`);
}

// ── Check 2: Unique IDs matching pattern ─────────────────────────────────────
const seenIds = new Set();
for (const t of allTeachings) {
  if (!ID_PATTERN.test(t.id)) {
    err(`Teaching id "${t.id}" does not match \\d+.\\d+.\\d+`);
  } else if (seenIds.has(t.id)) {
    err(`Duplicate teaching id: ${t.id}`);
  } else {
    seenIds.add(t.id);
  }
}
ok(`IDs checked: ${seenIds.size} unique IDs`);

// ── Check 3: bookAbbr values ─────────────────────────────────────────────────
let badAbbr = 0;
for (const t of allTeachings) {
  for (const r of t.references) {
    if (!VALID_ABBRS.has(r.bookAbbr)) {
      err(`Teaching ${t.id}: invalid bookAbbr "${r.bookAbbr}" in ref ${r.label}`);
      badAbbr++;
    }
  }
}
if (badAbbr === 0) ok(`All bookAbbr values are canonical`);

// ── Check 4: Exactly one isPrimary per teaching ───────────────────────────────
for (const t of allTeachings) {
  const primaries = t.references.filter(r => r.isPrimary);
  if (primaries.length !== 1) {
    err(`Teaching ${t.id}: ${primaries.length} primary references (expected 1)`);
  }
}
ok(`isPrimary check done`);

// ── Check 5: No _stub / _gapId fields ────────────────────────────────────────
for (const t of allTeachings) {
  if ('_stub' in t) err(`Teaching ${t.id} still has _stub field`);
  if ('_gapId' in t) err(`Teaching ${t.id} still has _gapId field`);
  if ('_merged' in t) err(`Teaching ${t.id} still has _merged field`);
}
ok(`No private fields remain`);

// ── Check 6: ranges are valid [number, number] pairs ─────────────────────────
for (const t of allTeachings) {
  for (const r of t.references) {
    for (const range of r.ranges) {
      if (!Array.isArray(range) || range.length !== 2) {
        err(`Teaching ${t.id}: malformed range ${JSON.stringify(range)} in ${r.label}`);
      } else if (typeof range[0] !== 'number' || typeof range[1] !== 'number') {
        err(`Teaching ${t.id}: non-numeric range ${JSON.stringify(range)} in ${r.label}`);
      } else if (range[1] < range[0]) {
        err(`Teaching ${t.id}: range end < start ${JSON.stringify(range)} in ${r.label}`);
      }
    }
  }
}
ok(`Ranges validated`);

// ── Check 7: Missing quote fields ────────────────────────────────────────────
const missingQuote = allTeachings.filter(t => !t.quote);
if (missingQuote.length > 0) {
  warn(`${missingQuote.length} teachings missing quote field:`);
  missingQuote.forEach(t => warn(`  ${t.id} (${t.references.find(r=>r.isPrimary)?.label ?? '?'})`));
} else {
  ok(`All teachings have quote field`);
}

// ── Check 8: Coverage re-audit ────────────────────────────────────────────────
const sourceAbbrMap = {
  Matt: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN',
  Acts: 'ACT', '1Cor': '1CO', '2Cor': '2CO', Rev: 'REV',
};
const sourceFiles = {
  MAT: '70_MAT.json', MRK: '71_MRK.json', LUK: '72_LUK.json',
  JHN: '73_JHN.json', ACT: '74_ACT.json', '1CO': '76_1CO.json',
  '2CO': '77_2CO.json',
};

// Find REV file
const outputFiles = fs.readdirSync(outputDir);
const revFile = outputFiles.find(f => /REV/i.test(f));
if (revFile) sourceFiles['REV'] = revFile;

// Build set of all Jesus verses in source
const allJesusVerses = new Set(); // "ABBR:ch:v"
for (const [abbr, filename] of Object.entries(sourceFiles)) {
  const filepath = path.join(outputDir, filename);
  if (!fs.existsSync(filepath)) { warn(`Source file not found: ${filename}`); continue; }
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  for (const verse of data.verses) {
    if (verse.jesusIsSpeaking) {
      allJesusVerses.add(`${abbr}:${verse.chapter}:${verse.verse}`);
    }
  }
}

// Build set of all covered Jesus verses from v2
const coveredVerses = new Set();
for (const t of allTeachings) {
  for (const r of t.references) {
    const srcAbbr = sourceAbbrMap[r.bookAbbr];
    if (!srcAbbr) continue;
    for (const [start, end] of r.ranges) {
      for (let v = start; v <= end; v++) {
        coveredVerses.add(`${srcAbbr}:${r.chapter}:${v}`);
      }
    }
  }
}

const totalVerses = allJesusVerses.size;
let covered = 0;
for (const v of allJesusVerses) {
  if (coveredVerses.has(v)) covered++;
}
const coveragePct = totalVerses > 0 ? ((covered / totalVerses) * 100).toFixed(1) : 0;

console.log(`\n── Coverage Audit ──────────────────────────────────────────────`);

// Per-book breakdown
for (const [abbr] of Object.entries(sourceFiles)) {
  const total = [...allJesusVerses].filter(v => v.startsWith(abbr+':')).length;
  const cov   = [...coveredVerses].filter(v => v.startsWith(abbr+':')).length;
  // Need to check intersection
  const covInBook = [...allJesusVerses].filter(v => v.startsWith(abbr+':') && coveredVerses.has(v)).length;
  const pct = total > 0 ? ((covInBook / total) * 100).toFixed(1) : 100;
  console.log(`  ${abbr.padEnd(5)}: ${covInBook}/${total} (${pct}%)`);
}

console.log(`  TOTAL: ${covered}/${totalVerses} (${coveragePct}%)`);
if (parseFloat(coveragePct) >= 95) {
  ok(`Coverage ≥ 95% target met: ${coveragePct}%`);
} else {
  warn(`Coverage ${coveragePct}% is below the 95% target`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n── Validation Summary ──────────────────────────────────────────`);
console.log(`  Teachings checked: ${allTeachings.length}`);
console.log(`  Errors:   ${errors}`);
console.log(`  Warnings: ${warnings}`);
if (errors === 0) {
  console.log(`\n✓ teachings_v2.json is valid!`);
} else {
  console.error(`\n✗ teachings_v2.json has ${errors} validation errors`);
  process.exit(1);
}
