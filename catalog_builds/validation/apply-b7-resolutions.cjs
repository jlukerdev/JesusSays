#!/usr/bin/env node
/**
 * apply-b7-resolutions.cjs
 * Applies approver-approved B6-TAXONOMY findings to teachings.json.
 *
 * Changes applied (in order):
 *   F-B6002  Move Cat 3.3 (3.3.1) → Cat 7.3; delete subcat 3.3
 *   F-B6005  Delete teaching 8.2.1; extend 13.1.1 Luke ref 10:27 → 10:27–28; delete subcat 8.2
 *   F-B6008  Delete teaching 10.5.1 and subcat 10.5
 *   F-B6024  Move teaching 22.4.1 → Cat 29.2 (append); delete subcat 22.4
 *   F-B6027  Delete teaching 25.2.1 (dup of 18.3.2) and subcat 25.2
 *   F-B6033  Consolidate 3.1.4 Acts refs to Acts 1:4–8; delete teaching 28.3.1 and subcat 28.3
 *   F-B6048  Teaching 17.3.3 swap isPrimary → Matt 16:6, 11–12
 *   F-B6049  Teaching 18.2.1 swap isPrimary → Matt 6:14–15; update text + quote
 *   F-B6051  Teaching 21.3.3 swap isPrimary → Matt 23:23
 *   F-B6055  Merge 27.1.10 into 27.1.9; make Matt 26:26–29 primary; update text; delete 27.1.10
 *   F-B6078  Delete teaching 6.2.2
 *   Check F   Remove all non-parable tags from every teaching
 *
 * Run from project root:
 *   node catalog_builds/validation/apply-b7-resolutions.cjs
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const CATALOG_PATH = path.resolve(__dirname, '../../public/teachings.json');

// ── Read catalog ──────────────────────────────────────────────────────────────
const buf = fs.readFileSync(CATALOG_PATH);
let raw;
if (buf[0] === 0xFF && buf[1] === 0xFE) {
  raw = buf.slice(2).toString('utf16le');
} else if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
  raw = buf.slice(3).toString('utf-8');
} else {
  raw = buf.toString('utf-8');
}
raw = raw.replace(/^\uFEFF+/, '');
const catalog = JSON.parse(raw);

const changeLog = [];

// ── Helpers ───────────────────────────────────────────────────────────────────
function findCat(id)   { return catalog.categories.find(c => c.id === id); }
function findSubcat(catId, subcatId) {
  const cat = findCat(catId);
  return cat ? cat.subcategories.find(s => s.id === subcatId) : null;
}
function findTeaching(id) {
  for (const cat of catalog.categories)
    for (const sub of cat.subcategories)
      for (const t of sub.teachings)
        if (t.id === id) return t;
  return null;
}
function requireCat(id)     { const c = findCat(id);     if (!c) throw new Error(`Cat ${id} not found`); return c; }
function requireSubcat(cid, sid) { const s = findSubcat(cid, sid); if (!s) throw new Error(`Subcat ${sid} not found in cat ${cid}`); return s; }
function requireTeaching(id) { const t = findTeaching(id); if (!t) throw new Error(`Teaching ${id} not found`); return t; }

function deleteSubcatById(catId, subcatId) {
  const cat = requireCat(catId);
  const idx = cat.subcategories.findIndex(s => s.id === subcatId);
  if (idx === -1) throw new Error(`Subcat ${subcatId} not found in cat ${catId}`);
  const sub = cat.subcategories[idx];
  if (sub.teachings.length > 0)
    throw new Error(`Subcat ${subcatId} still has ${sub.teachings.length} teachings — cannot delete`);
  cat.subcategories.splice(idx, 1);
  changeLog.push(`DELETED subcat: ${subcatId} "${sub.title}"`);
}

function deleteTeachingById(teachingId) {
  for (const cat of catalog.categories) {
    for (const sub of cat.subcategories) {
      const idx = sub.teachings.findIndex(t => t.id === teachingId);
      if (idx !== -1) {
        const t = sub.teachings[idx];
        sub.teachings.splice(idx, 1);
        changeLog.push(`DELETED teaching: ${teachingId} — "${t.text.substring(0, 60)}"`);
        return t;
      }
    }
  }
  throw new Error(`Teaching ${teachingId} not found for deletion`);
}

// ── F-B6002: Move Cat 3.3 → Cat 7.3 ─────────────────────────────────────────
// Teaching 3.3.1 (Matt 10:19-20 / Spirit speaks in trials) → append to Cat 7.3
{
  const subcat33 = requireSubcat(3, '3.3');
  if (subcat33.teachings.length !== 1)
    throw new Error(`Expected 1 teaching in 3.3, found ${subcat33.teachings.length}`);

  const teaching = subcat33.teachings[0];
  subcat33.teachings.splice(0, 1); // remove from 3.3

  const subcat73 = requireSubcat(7, '7.3');
  subcat73.teachings.push(teaching);
  changeLog.push(`MOVED teaching ${teaching.id} from 3.3 to 7.3 — "${teaching.text.substring(0, 60)}"`);

  deleteSubcatById(3, '3.3');
}

// ── F-B6005: Delete 8.2.1; extend 13.1.1 Luke ref; delete subcat 8.2 ─────────
{
  deleteTeachingById('8.2.1');

  // Extend 13.1.1 Luke 10:27 ref to Luke 10:27–28
  const t1311 = requireTeaching('13.1.1');
  const lukeRef = t1311.references.find(r => r.bookAbbr === 'Luke' && r.chapter === 10);
  if (!lukeRef) throw new Error('13.1.1: Luke 10 ref not found');
  lukeRef.label  = 'Luke 10:27\u201328';
  lukeRef.ranges = [[27, 28]];
  changeLog.push('UPDATED 13.1.1: Luke 10:27 → Luke 10:27–28 (range extended to include v28 from 8.2.1)');

  deleteSubcatById(8, '8.2');
}

// ── F-B6008: Delete teaching 10.5.1 and subcat 10.5 ─────────────────────────
{
  deleteTeachingById('10.5.1');
  deleteSubcatById(10, '10.5');
}

// ── F-B6024: Move 22.4.1 → Cat 29.2; delete subcat 22.4 ─────────────────────
{
  const subcat224 = requireSubcat(22, '22.4');
  if (subcat224.teachings.length !== 1)
    throw new Error(`Expected 1 teaching in 22.4, found ${subcat224.teachings.length}`);

  const teaching = subcat224.teachings[0];
  subcat224.teachings.splice(0, 1);

  const subcat292 = requireSubcat(29, '29.2');
  subcat292.teachings.push(teaching);
  changeLog.push(`MOVED teaching ${teaching.id} from 22.4 to 29.2 — "${teaching.text.substring(0, 60)}"`);

  deleteSubcatById(22, '22.4');
}

// ── F-B6027: Delete teaching 25.2.1 (dup of 18.3.2) and subcat 25.2 ─────────
{
  // Verify it's the Matt 18:15-17 passage before deleting
  const t2521 = requireTeaching('25.2.1');
  if (!t2521.references.some(r => r.bookAbbr === 'Matt' && r.chapter === 18))
    throw new Error('25.2.1 does not reference Matt 18 — verify before deleting');

  deleteTeachingById('25.2.1');
  deleteSubcatById(25, '25.2');
}

// ── F-B6033: Consolidate 3.1.4 Acts refs; delete 28.3.1 and subcat 28.3 ──────
{
  // Consolidate Acts 1:4-5 (primary) + Acts 1:8 (secondary) → Acts 1:4-8 (primary)
  const t314 = requireTeaching('3.1.4');
  const acts45ref = t314.references.find(r => r.bookAbbr === 'Acts' && r.chapter === 1 &&
    r.ranges.some(rng => rng[0] === 4));
  const acts8ref  = t314.references.find(r => r.bookAbbr === 'Acts' && r.chapter === 1 &&
    r.ranges.some(rng => rng[0] === 8));

  if (!acts45ref) throw new Error('3.1.4: Acts 1:4-5 ref not found');
  if (!acts8ref)  throw new Error('3.1.4: Acts 1:8 ref not found');

  acts45ref.label  = 'Acts 1:4\u20138';
  acts45ref.ranges = [[4, 8]];

  // Remove the separate Acts 1:8 entry
  const idx8 = t314.references.indexOf(acts8ref);
  t314.references.splice(idx8, 1);
  changeLog.push('UPDATED 3.1.4: consolidated Acts 1:4–5 + Acts 1:8 → Acts 1:4–8');

  deleteTeachingById('28.3.1');
  deleteSubcatById(28, '28.3');
}

// ── F-B6048: Teaching 17.3.3 — swap isPrimary → Matt 16:6, 11–12 ─────────────
{
  const t1733 = requireTeaching('17.3.3');
  const lukeRef = t1733.references.find(r => r.bookAbbr === 'Luke');
  const mattRef = t1733.references.find(r => r.bookAbbr === 'Matt');
  if (!lukeRef || !mattRef) throw new Error('17.3.3: expected Luke and Matt refs');

  lukeRef.isPrimary = false;
  mattRef.isPrimary = true;

  // Reorder so Matt (primary) comes first
  const mattIdx = t1733.references.indexOf(mattRef);
  if (mattIdx !== 0) {
    t1733.references.splice(mattIdx, 1);
    t1733.references.unshift(mattRef);
  }
  changeLog.push('UPDATED 17.3.3: isPrimary → Matt 16:6, 11–12 (was Luke 12:1)');
}

// ── F-B6049: Teaching 18.2.1 — swap isPrimary → Matt 6:14–15; update text ────
{
  const t1821 = requireTeaching('18.2.1');
  const lukeRef = t1821.references.find(r => r.bookAbbr === 'Luke');
  const mattRef = t1821.references.find(r => r.bookAbbr === 'Matt');
  if (!lukeRef || !mattRef) throw new Error('18.2.1: expected Luke and Matt refs');

  lukeRef.isPrimary = false;
  mattRef.isPrimary = true;

  // Reorder so Matt comes first
  const mattIdx = t1821.references.indexOf(mattRef);
  if (mattIdx !== 0) {
    t1821.references.splice(mattIdx, 1);
    t1821.references.unshift(mattRef);
  }

  t1821.text  = 'If you forgive others their trespasses, your heavenly Father will forgive you — but if you do not forgive, he will not forgive your trespasses either';
  t1821.quote = 'For if ye forgive men their trespasses, your heavenly Father will also forgive you: But if ye forgive not men their trespasses, neither will your Father forgive your trespasses.';
  changeLog.push('UPDATED 18.2.1: isPrimary → Matt 6:14–15; text and quote updated');
}

// ── F-B6051: Teaching 21.3.3 — swap isPrimary → Matt 23:23 ──────────────────
{
  const t2133 = requireTeaching('21.3.3');
  const lukeRef = t2133.references.find(r => r.bookAbbr === 'Luke');
  const mattRef = t2133.references.find(r => r.bookAbbr === 'Matt');
  if (!lukeRef || !mattRef) throw new Error('21.3.3: expected Luke and Matt refs');

  lukeRef.isPrimary = false;
  mattRef.isPrimary = true;

  // Reorder so Matt comes first
  const mattIdx = t2133.references.indexOf(mattRef);
  if (mattIdx !== 0) {
    t2133.references.splice(mattIdx, 1);
    t2133.references.unshift(mattRef);
  }
  changeLog.push('UPDATED 21.3.3: isPrimary → Matt 23:23 (was Luke 11:42)');
}

// ── F-B6055: Merge 27.1.10 into 27.1.9; Matt primary; update text ─────────────
{
  const t2719 = requireTeaching('27.1.9');

  // Make Matt 26:26-29 primary; set others to false
  const mattRef = t2719.references.find(r => r.bookAbbr === 'Matt');
  const markRef = t2719.references.find(r => r.bookAbbr === 'Mark');
  const lukeRef = t2719.references.find(r => r.bookAbbr === 'Luke');
  if (!mattRef || !markRef || !lukeRef)
    throw new Error('27.1.9: expected Matt, Mark, and Luke refs');

  mattRef.isPrimary = true;
  markRef.isPrimary = false;
  lukeRef.isPrimary = false;

  // Reorder: Matt first, then Mark, then Luke
  t2719.references = [mattRef, markRef, lukeRef];

  // Update text to synthesize both teachings
  t2719.text  = 'At the Last Supper Jesus institutes the Lord\u2019s Supper — this is my body, this is my blood of the new testament shed for many for the remission of sins; he will not drink of the fruit of the vine again until the kingdom of God';
  t2719.quote = 'Take, eat; this is my body. Drink ye all of it; For this is my blood of the new testament, which is shed for many for the remission of sins. But I say unto you, I will not drink henceforth of this fruit of the vine, until that day when I drink it new with you in my Father\u2019s kingdom.';
  changeLog.push('UPDATED 27.1.9: Matt 26:26–29 now primary; text updated to merge 27.1.9 + 27.1.10');

  deleteTeachingById('27.1.10');
}

// ── F-B6078: Delete teaching 6.2.2 ──────────────────────────────────────────
{
  deleteTeachingById('6.2.2');
}

// ── Check F: Remove all non-parable tags from every teaching ─────────────────
{
  let tagCleanCount = 0;
  for (const cat of catalog.categories) {
    for (const sub of cat.subcategories) {
      for (const t of sub.teachings) {
        if (!t.tags || t.tags.length === 0) continue;
        const before = t.tags.length;
        t.tags = t.tags.filter(tag => tag === 'parable');
        if (t.tags.length !== before) {
          tagCleanCount++;
        }
      }
    }
  }
  changeLog.push(`CLEANED non-parable tags from ${tagCleanCount} teachings (kept "parable" only)`);
}

// ── Write output ──────────────────────────────────────────────────────────────
const outJson = JSON.stringify(catalog, null, 2);
fs.writeFileSync(CATALOG_PATH, outJson, 'utf-8');

console.log('\n=== apply-b7-resolutions.cjs — Change Log ===');
changeLog.forEach((entry, i) => console.log(`  ${i + 1}. ${entry}`));
console.log(`\nTotal changes: ${changeLog.length}`);
console.log('teachings.json written successfully.\n');
console.log('Next steps:');
console.log('  node catalog_builds/engine/scripts/renumber.js');
console.log('  node catalog_builds/engine/scripts/validate-catalog.js');
