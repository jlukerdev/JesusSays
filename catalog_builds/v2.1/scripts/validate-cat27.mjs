#!/usr/bin/env node
/**
 * validate-cat27.mjs
 *
 * Validates output/teachings.cat27-patched.json against the spec from the
 * approved plan. Exits non-zero on FAIL. Warnings do not fail.
 *
 * Checks:
 *  1. Every cat-27 teaching has >= 1 reference and exactly one isPrimary:true.
 *  2. Every reference's bookAbbr in {Matt, Mark, Luke, John} for cat-27.
 *  3. Every primary reference resolves to verses where jesusIsSpeaking === true.
 *     Same for parallels — but warn only if the parallel range mixes narration.
 *  4. Each teaching's `quote` equals the joined jesusText from the primary ref.
 *     Warn (don't fail) on mismatch — surface diff.
 *  5. Teaching ids are unique and contiguous within each subcat (1..N).
 *  6. meta.totalCategories === 31 and cat-27 has 3 subcategories.
 *  7. Coverage delta vs original: counts of teachings, refs, and unique
 *     covered Jesus verses across Matt 26-27, Mark 14-15, Luke 22-23, John 18-19.
 *
 * Output:
 *   reports/cat-27-validation.json
 *   stdout summary
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '../../..');

const patchedPath  = path.join(__dirname, '..', 'output',  'teachings.cat27-patched.json');
const originalPath = path.join(repoRoot,    'public', 'teachings.json');
const datasetsDir  = path.join(repoRoot,    'bible_datasets', 'output');
const outPath      = path.join(__dirname, '..', 'reports', 'cat-27-validation.json');

const SOURCE_FILES = {
  Matt: '70_MAT.json', Mark: '71_MRK.json',
  Luke: '72_LUK.json', John: '73_JHN.json',
};
const VALID_ABBRS = new Set(['Matt', 'Mark', 'Luke', 'John']);

const PASSION_RANGES = {
  Matt: [26, 27],
  Mark: [14, 15],
  Luke: [22, 23],
  John: [18, 19],
};

const checks = [];
const warnings = [];

function pass(check, msg)  { checks.push({ check, status: 'pass', msg }); }
function fail(check, msg)  { checks.push({ check, status: 'fail', msg }); }
function warn(check, msg)  { warnings.push({ check, msg }); }

// ── Load source verse index ─────────────────────────────────────────────────
const verseIndex = {};
for (const [abbr, fname] of Object.entries(SOURCE_FILES)) {
  const data = JSON.parse(fs.readFileSync(path.join(datasetsDir, fname), 'utf8'));
  verseIndex[abbr] = {};
  for (const v of data.verses) {
    if (!verseIndex[abbr][v.chapter]) verseIndex[abbr][v.chapter] = {};
    verseIndex[abbr][v.chapter][v.verse] = v;
  }
}

function joinedJesusText(abbr, chapter, ranges) {
  const parts = [];
  for (const [s, e] of ranges) {
    for (let v = s; v <= e; v++) {
      const entry = verseIndex[abbr]?.[chapter]?.[v];
      if (entry?.jesusIsSpeaking && Array.isArray(entry.jesusText)) {
        parts.push(...entry.jesusText);
      }
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function rangeHasAnyJesus(abbr, chapter, ranges) {
  for (const [s, e] of ranges) {
    for (let v = s; v <= e; v++) {
      if (verseIndex[abbr]?.[chapter]?.[v]?.jesusIsSpeaking) return true;
    }
  }
  return false;
}
function rangeJesusFraction(abbr, chapter, ranges) {
  let total = 0, jesus = 0;
  for (const [s, e] of ranges) {
    for (let v = s; v <= e; v++) {
      total++;
      if (verseIndex[abbr]?.[chapter]?.[v]?.jesusIsSpeaking) jesus++;
    }
  }
  return { total, jesus };
}

// ── Load catalogs ───────────────────────────────────────────────────────────
const original = JSON.parse(fs.readFileSync(originalPath, 'utf8'));
const patched  = JSON.parse(fs.readFileSync(patchedPath,  'utf8'));

const origC27    = original.categories.find(c => c.slug === 'cat-27');
const patchedC27 = patched.categories.find(c  => c.slug === 'cat-27');

const allPatchedTeachings = patchedC27.subcategories.flatMap(s => s.teachings);

// ── Check 6: meta + structure ───────────────────────────────────────────────
if (patched.meta.totalCategories !== 31)              fail('meta', `totalCategories is ${patched.meta.totalCategories}, expected 31`);
else                                                   pass('meta', 'meta.totalCategories === 31');
if (patched.categories.length !== 31)                  fail('meta', `${patched.categories.length} categories, expected 31`);
else                                                   pass('meta', '31 categories present');
if (patchedC27.subcategories.length !== 3)             fail('meta', `cat-27 has ${patchedC27.subcategories.length} subcategories, expected 3`);
else                                                   pass('meta', 'cat-27 has 3 subcategories');

// Subcat 27.2 rename
const sub272 = patchedC27.subcategories.find(s => s.id === '27.2');
if (sub272?.title === 'Gethsemane and Arrest')         pass('meta', 'subcat 27.2 renamed to "Gethsemane and Arrest"');
else                                                   fail('meta', `subcat 27.2 title is "${sub272?.title}", expected "Gethsemane and Arrest"`);

// ── Check 1, 2, 3, 4: per-teaching ──────────────────────────────────────────
let countRefMissing = 0, countPrimaryWrong = 0, countBadAbbr = 0;
let countPrimaryNotJesus = 0, countQuoteMismatch = 0, countParallelPartial = 0;
const quoteMismatches = [];

for (const t of allPatchedTeachings) {
  if (!t.references || t.references.length === 0) {
    fail('refs', `${t.id} has no references`);
    countRefMissing++;
    continue;
  }
  const primaries = t.references.filter(r => r.isPrimary);
  if (primaries.length !== 1) {
    fail('primary', `${t.id} has ${primaries.length} primaries (expected 1)`);
    countPrimaryWrong++;
  }
  for (const r of t.references) {
    if (!VALID_ABBRS.has(r.bookAbbr)) {
      fail('abbr', `${t.id} ref ${r.label} has bookAbbr "${r.bookAbbr}" not in {Matt,Mark,Luke,John}`);
      countBadAbbr++;
    }
  }

  // Check 3: primary range must have at least one jesusIsSpeaking verse.
  const p = primaries[0];
  if (p) {
    if (!rangeHasAnyJesus(p.bookAbbr, p.chapter, p.ranges)) {
      fail('primaryJesus', `${t.id} primary ${p.label} has zero jesusIsSpeaking verses`);
      countPrimaryNotJesus++;
    }
    // Parallels — partial-only triggers warning
    for (const r of t.references) {
      if (r.isPrimary) continue;
      const frac = rangeJesusFraction(r.bookAbbr, r.chapter, r.ranges);
      if (frac.jesus === 0) {
        fail('parallelJesus', `${t.id} parallel ${r.label} has zero jesusIsSpeaking verses`);
      } else if (frac.jesus < frac.total) {
        warn('parallelPartial', `${t.id} parallel ${r.label} has ${frac.jesus}/${frac.total} Jesus verses (mixed narration)`);
        countParallelPartial++;
      }
    }
  }

  // Check 4: quote vs joined jesusText (warning only)
  if (p) {
    const expected = joinedJesusText(p.bookAbbr, p.chapter, p.ranges);
    const actual = (t.quote || '').replace(/\s+/g, ' ').trim();
    const exNorm = expected.replace(/\s+/g, ' ').trim();
    if (actual !== exNorm) {
      countQuoteMismatch++;
      quoteMismatches.push({ id: t.id, primary: p.label, expected: exNorm, actual });
      // limit log noise
      if (countQuoteMismatch <= 5) {
        warn('quote', `${t.id} quote mismatch (${p.label})`);
      }
    }
  }
}
if (countRefMissing === 0)      pass('refs', `every teaching has >= 1 reference`);
if (countPrimaryWrong === 0)    pass('primary', `every teaching has exactly one isPrimary:true`);
if (countBadAbbr === 0)         pass('abbr', `every reference uses {Matt,Mark,Luke,John}`);
if (countPrimaryNotJesus === 0) pass('primaryJesus', `every primary range has Jesus speech`);

// ── Check 5: ids unique and contiguous within each subcat ───────────────────
const seenIds = new Set();
for (const s of patchedC27.subcategories) {
  const subN = parseInt(s.id.split('.')[1], 10);
  s.teachings.forEach((t, i) => {
    const expected = `27.${subN}.${i + 1}`;
    if (t.id !== expected) fail('contiguous', `${s.id} expected id ${expected} at index ${i}, got ${t.id}`);
    if (seenIds.has(t.id))  fail('unique', `Duplicate teaching id: ${t.id}`);
    seenIds.add(t.id);
  });
}
pass('contiguous', 'cat-27 ids contiguous within each subcat');

// ── Check 7: coverage delta ─────────────────────────────────────────────────

function countRefs(cat) {
  let n = 0;
  for (const s of cat.subcategories) for (const t of s.teachings) n += t.references.length;
  return n;
}
function countTeachings(cat) {
  let n = 0;
  for (const s of cat.subcategories) n += s.teachings.length;
  return n;
}

function passionVerseSet(cat) {
  const set = new Set();
  for (const s of cat.subcategories) {
    for (const t of s.teachings) {
      for (const r of t.references) {
        if (!VALID_ABBRS.has(r.bookAbbr)) continue;
        const range = PASSION_RANGES[r.bookAbbr];
        if (!range || r.chapter < range[0] || r.chapter > range[1]) continue;
        for (const [s2, e2] of r.ranges) {
          for (let v = s2; v <= e2; v++) set.add(`${r.bookAbbr}:${r.chapter}:${v}`);
        }
      }
    }
  }
  return set;
}

const before = {
  teachings: countTeachings(origC27),
  references: countRefs(origC27),
  passionVerses: passionVerseSet(origC27).size,
};
const after = {
  teachings: countTeachings(patchedC27),
  references: countRefs(patchedC27),
  passionVerses: passionVerseSet(patchedC27).size,
};

// ── Write report ────────────────────────────────────────────────────────────
const failed = checks.filter(c => c.status === 'fail');

const report = {
  generatedAt: new Date().toISOString(),
  patchedFile: path.relative(repoRoot, patchedPath),
  summary: {
    totalChecks: checks.length,
    failures: failed.length,
    warnings: warnings.length,
    quoteMismatches: countQuoteMismatch,
    parallelPartials: countParallelPartial,
  },
  coverageDelta: {
    cat27Teachings:    { before: before.teachings,    after: after.teachings,    delta: after.teachings - before.teachings },
    cat27References:   { before: before.references,   after: after.references,   delta: after.references - before.references },
    cat27PassionVerses:{ before: before.passionVerses,after: after.passionVerses,delta: after.passionVerses - before.passionVerses },
  },
  checks,
  warnings,
  quoteMismatches,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

// ── Stdout summary ──────────────────────────────────────────────────────────
console.log(`Validation -> ${path.relative(repoRoot, outPath)}\n`);
console.log(`Coverage delta`);
console.log(`  teachings  : ${before.teachings}  ->  ${after.teachings}   (${after.teachings - before.teachings >= 0 ? '+' : ''}${after.teachings - before.teachings})`);
console.log(`  references : ${before.references} ->  ${after.references}  (${after.references - before.references >= 0 ? '+' : ''}${after.references - before.references})`);
console.log(`  unique passion verses covered : ${before.passionVerses} -> ${after.passionVerses}  (${after.passionVerses - before.passionVerses >= 0 ? '+' : ''}${after.passionVerses - before.passionVerses})`);
console.log(`\nChecks  : ${checks.length} run, ${failed.length} failed`);
console.log(`Warnings: ${warnings.length} (${countParallelPartial} parallel-partial, ${countQuoteMismatch} quote drift)`);
if (failed.length === 0) {
  console.log(`\nPASS — teachings.cat27-patched.json validates clean.`);
  process.exit(0);
} else {
  console.error(`\nFAIL — ${failed.length} validation errors:`);
  failed.forEach(f => console.error(`  [${f.check}] ${f.msg}`));
  process.exit(1);
}
