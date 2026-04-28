#!/usr/bin/env node
/**
 * fix-bread-cup-merge.mjs
 *
 * v2.1.1 follow-up fix.
 *
 * The v2.1 build accidentally shipped subcat 27.1 ("The Last Supper") with the
 * bread-and-cup institution narrative as three separate teachings:
 *   27.1.6  Matt 26:26-29 (Matthew primary, with Mark + Luke already attached as parallels)
 *   27.1.9  Mark 14:22-25 (Mark primary, with Matt + Luke as parallels) -- duplicate
 *   27.1.10 Luke 22:17-20 (Luke primary, with Matt + Mark as parallels) -- duplicate
 *
 * Spec for the fix:
 *   - Keep 27.1.6 as the survivor (Matt primary stays primary).
 *   - Demote any references from 27.1.9 / 27.1.10 onto 27.1.6 as additional
 *     parallels (isPrimary:false) IF they are not already present on 27.1.6.
 *   - Delete standalone teachings 27.1.9 and 27.1.10.
 *   - Renumber 27.1 contiguously (1..N).
 *   - Other subcats untouched.
 *
 * Outputs (overwrites):
 *   output/teachings.cat27-patched.json
 *   reports/redirects.json   (merged with existing; v2.1 transient ids tracked
 *                             in a separate `transientV21Redirects` block to
 *                             avoid colliding with pre-v2.1 mappings that
 *                             happen to use the same key names)
 *   public/teachings.json    (only after sanity assertions pass)
 *
 * Pure: cat-1..cat-26 and cat-28..cat-31, plus subcats 27.2/27.3, are passed
 * through untouched.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '../../..');

const patchedPath   = path.join(__dirname, '..', 'output',  'teachings.cat27-patched.json');
const redirectsPath = path.join(__dirname, '..', 'reports', 'redirects.json');
const livePath      = path.join(repoRoot,    'public',  'teachings.json');

const TARGET_SUBCAT_ID = '27.1';
const SURVIVOR_ID      = '27.1.6';
const DUPLICATE_IDS    = ['27.1.9', '27.1.10'];

// ── helpers ─────────────────────────────────────────────────────────────────

function refKey(r) {
  // Identity for a reference is bookAbbr + chapter + ranges.
  return `${r.bookAbbr}|${r.chapter}|${(r.ranges || []).map(([a,b]) => `${a}-${b}`).join(',')}`;
}

function cloneRefAsParallel(r) {
  return {
    label:    r.label,
    book:     r.book,
    bookAbbr: r.bookAbbr,
    chapter:  r.chapter,
    ranges:   r.ranges.map(([a,b]) => [a,b]),
    isPrimary: false,
  };
}

// ── load patched catalog ────────────────────────────────────────────────────
const catalog = JSON.parse(fs.readFileSync(patchedPath, 'utf8'));

const cat27 = catalog.categories.find(c => c.slug === 'cat-27');
if (!cat27) {
  console.error('FAIL: cat-27 not found in patched catalog');
  process.exit(1);
}
const sub271 = cat27.subcategories.find(s => s.id === TARGET_SUBCAT_ID);
if (!sub271) {
  console.error(`FAIL: subcat ${TARGET_SUBCAT_ID} not found`);
  process.exit(1);
}

const before271Count = sub271.teachings.length;

// ── locate survivor + duplicates ────────────────────────────────────────────
const survivor = sub271.teachings.find(t => t.id === SURVIVOR_ID);
if (!survivor) {
  console.error(`FAIL: survivor ${SURVIVOR_ID} not found in ${TARGET_SUBCAT_ID}`);
  process.exit(1);
}

// Verify primary is Matthew 26:26-29 before we touch anything.
const survivorPrimary = (survivor.references || []).find(r => r.isPrimary);
if (!survivorPrimary || survivorPrimary.bookAbbr !== 'Matt' || survivorPrimary.chapter !== 26) {
  console.error(`FAIL: survivor ${SURVIVOR_ID} primary is not Matt 26 (got ${survivorPrimary?.label})`);
  process.exit(1);
}

const duplicates = DUPLICATE_IDS.map(id => sub271.teachings.find(t => t.id === id)).filter(Boolean);
if (duplicates.length !== DUPLICATE_IDS.length) {
  console.error(`FAIL: expected duplicates ${DUPLICATE_IDS.join(',')} in ${TARGET_SUBCAT_ID}, found ${duplicates.map(d => d.id).join(',')}`);
  process.exit(1);
}

// ── merge: pull every ref off the duplicates onto survivor as parallels ─────
const seen = new Set(survivor.references.map(refKey));
let mergedCount = 0;
for (const dup of duplicates) {
  for (const r of dup.references || []) {
    const key = refKey(r);
    if (seen.has(key)) continue;
    survivor.references.push(cloneRefAsParallel(r));
    seen.add(key);
    mergedCount++;
  }
}

// Defensive: ensure survivor still has exactly one primary (the original Matt).
const primaries = survivor.references.filter(r => r.isPrimary);
if (primaries.length !== 1 || primaries[0].bookAbbr !== 'Matt') {
  console.error(`FAIL: survivor primary state corrupted (count=${primaries.length})`);
  process.exit(1);
}

// ── delete duplicates from subcat ───────────────────────────────────────────
sub271.teachings = sub271.teachings.filter(t => !DUPLICATE_IDS.includes(t.id));

// ── renumber 27.1 contiguously ──────────────────────────────────────────────
// Track id changes in case any other teaching shifted up (it shouldn't here,
// but record for completeness).
const renumberMap = {};
const subN = parseInt(TARGET_SUBCAT_ID.split('.')[1], 10);
sub271.teachings.forEach((t, i) => {
  const newId = `27.${subN}.${i + 1}`;
  if (t.id !== newId) renumberMap[t.id] = newId;
  t.id = newId;
});

const after271Count = sub271.teachings.length;

// ── sanity assertions before writing anything ───────────────────────────────
function assertOrDie(cond, msg) {
  if (!cond) { console.error(`FAIL: ${msg}`); process.exit(1); }
}
assertOrDie(after271Count === before271Count - DUPLICATE_IDS.length,
  `subcat 27.1 count went ${before271Count} -> ${after271Count}, expected drop of ${DUPLICATE_IDS.length}`);
assertOrDie(after271Count === 8,
  `subcat 27.1 should have 8 teachings after merge, got ${after271Count}`);

const survivorAfter = sub271.teachings.find(t => {
  const p = t.references.find(r => r.isPrimary);
  return p && p.bookAbbr === 'Matt' && p.chapter === 26 && p.ranges?.[0]?.[0] === 26;
});
assertOrDie(!!survivorAfter, `survivor (Matt 26:26-29 primary) missing after renumber`);
assertOrDie(survivorAfter.references.length === 3,
  `survivor should have 3 references after merge, got ${survivorAfter.references.length}`);
const survivorPrimaries = survivorAfter.references.filter(r => r.isPrimary);
assertOrDie(survivorPrimaries.length === 1, `survivor should have exactly 1 primary, got ${survivorPrimaries.length}`);

// Other subcats untouched: spot-check counts.
const sub272After = cat27.subcategories.find(s => s.id === '27.2');
const sub273After = cat27.subcategories.find(s => s.id === '27.3');
assertOrDie(!!sub272After && !!sub273After, `subcats 27.2/27.3 must still exist`);

// ── write patched catalog ───────────────────────────────────────────────────
fs.writeFileSync(patchedPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');

// ── update redirects.json (merge w/ existing) ───────────────────────────────
let redirectsDoc = { generatedAt: '', description: '', redirects: {} };
if (fs.existsSync(redirectsPath)) {
  redirectsDoc = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
}

// Existing `redirects` keyed by pre-v2.1 ids must remain pointed at the
// current surviving id. Walk every value and follow any renumberMap shift.
// (For this fix the renumberMap is empty because 27.1.1..27.1.8 didn't move.
// The walk below keeps the script transitively-correct for any future shift.)
const updatedRedirectTargets = {};
for (const [oldId, newId] of Object.entries(redirectsDoc.redirects || {})) {
  if (newId === null) continue;
  if (renumberMap[newId]) {
    updatedRedirectTargets[oldId] = renumberMap[newId];
  }
}
for (const [oldId, newTarget] of Object.entries(updatedRedirectTargets)) {
  redirectsDoc.redirects[oldId] = newTarget;
}

// Track v2.1 transient ids (the ones that briefly existed in the v2.1 build
// but are gone in v2.1.1). These keys would collide with pre-v2.1 redirect
// keys, so we keep them in a separate block to avoid ambiguity.
const transientId = SURVIVOR_ID; // both duplicates collapse onto the survivor
if (!redirectsDoc.transientV21Redirects) {
  redirectsDoc.transientV21Redirects = {};
}
for (const dupId of DUPLICATE_IDS) {
  redirectsDoc.transientV21Redirects[dupId] = transientId;
}
// And capture any incidental renumbering shifts from this fix.
for (const [oldId, newId] of Object.entries(renumberMap)) {
  redirectsDoc.transientV21Redirects[oldId] = newId;
}

redirectsDoc.generatedAt = new Date().toISOString();
if (!/v2\.1\.1/.test(redirectsDoc.description || '')) {
  redirectsDoc.description = (redirectsDoc.description || '') +
    ' v2.1.1 follow-up: bread-and-cup duplicates 27.1.9/27.1.10 merged into 27.1.6 (see transientV21Redirects).';
  redirectsDoc.description = redirectsDoc.description.trim();
}

fs.writeFileSync(redirectsPath, JSON.stringify(redirectsDoc, null, 2) + '\n', 'utf8');

// ── copy patched -> public/teachings.json ───────────────────────────────────
// Only at this point, after every assertion passed.
fs.copyFileSync(patchedPath, livePath);

// ── stdout summary ──────────────────────────────────────────────────────────
console.log('Bread-and-cup merge fix complete.');
console.log(`  subcat 27.1 teachings: ${before271Count} -> ${after271Count}`);
console.log(`  duplicates removed   : ${DUPLICATE_IDS.join(', ')}`);
console.log(`  refs merged onto ${SURVIVOR_ID}: ${mergedCount} (already-present refs deduped)`);
console.log(`  survivor refs        : ${survivorAfter.references.map(r => r.label + (r.isPrimary ? ' [P]' : '')).join(', ')}`);
console.log(`  renumber shifts      : ${Object.keys(renumberMap).length === 0 ? 'none' : JSON.stringify(renumberMap)}`);
console.log(`  wrote                : ${path.relative(repoRoot, patchedPath)}`);
console.log(`  wrote                : ${path.relative(repoRoot, redirectsPath)}`);
console.log(`  wrote                : ${path.relative(repoRoot, livePath)}`);
