/**
 * apply-b3-resolutions.cjs
 * Applies all resolved findings from B3 (Categories 11–20) to public/teachings.json.
 *
 * Run from project root:
 *   node catalog_builds/validation/apply-b3-resolutions.cjs
 *
 * After running, execute:
 *   node catalog_builds/engine/scripts/renumber.js
 *   node catalog_builds/engine/scripts/validate-catalog.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '../../public/teachings.json');
const raw = fs.readFileSync(CATALOG_PATH, 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(raw);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Find a category by numeric ID */
function findCat(id) {
  return data.categories.find(c => c.id === id);
}

/** Find a subcategory by string ID (e.g. "13.2") */
function findSub(subId) {
  const catId = parseInt(subId.split('.')[0]);
  const cat = findCat(catId);
  if (!cat) throw new Error(`Cat ${catId} not found`);
  const sub = cat.subcategories.find(s => s.id === subId);
  if (!sub) throw new Error(`Subcat ${subId} not found`);
  return { cat, sub };
}

/** Find a teaching by string ID (e.g. "14.3.6") */
function findTeaching(tId) {
  for (const cat of data.categories) {
    for (const sub of cat.subcategories) {
      const idx = sub.teachings.findIndex(t => t.id === tId);
      if (idx !== -1) return { cat, sub, idx, teaching: sub.teachings[idx] };
    }
  }
  throw new Error(`Teaching ${tId} not found`);
}

/** Remove and return a teaching from its current location */
function removeTeaching(tId) {
  const { sub, idx, teaching } = findTeaching(tId);
  sub.teachings.splice(idx, 1);
  return teaching;
}

/** Append a teaching to the end of a target subcategory */
function appendTeaching(subId, teaching) {
  const { sub } = findSub(subId);
  sub.teachings.push(teaching);
}

const log = [];

// ─── F-B3001: Leave 13.3.1; DELETE 14.3.6 ────────────────────────────────────
// User: "leave 13.3.1, delete 14.3.6 — fits better in LOVE category"
removeTeaching('14.3.6');
log.push('F-B3001: Deleted 14.3.6 (Antitheses enemies block — keep in Cat 13.3 per user)');

// ─── F-B3002: Ignore (14.3.6 was already deleted above) ──────────────────────
log.push('F-B3002: No action (14.3.6 deleted above; 13.3.2 stays)');

// ─── F-B3003: DELETE 13.3.3 (Golden Rule duplicate of 14.6.1) ────────────────
removeTeaching('13.3.3');
log.push('F-B3003: Deleted 13.3.3 (Golden Rule — duplicate of 14.6.1)');

// ─── F-B3004: MOVE 19.4.3 → Cat 25.3 ────────────────────────────────────────
// Mark 9:39–41 (exorcist — not a children's teaching; belongs in Church/corporate identity)
{
  const t = removeTeaching('19.4.3');
  appendTeaching('25.3', t);
  log.push('F-B3004: Moved 19.4.3 (Mark 9:39–41) → Cat 25.3 (The Church > Corporate Prayer and Presence)');
}

// ─── F-B3005: MOVE 14.1.3 → Cat 2.6 ─────────────────────────────────────────
// Matt 3:15 ("fulfill all righteousness") — Messianic Identity, not Salt & Light
{
  const t = removeTeaching('14.1.3');
  appendTeaching('2.6', t);
  log.push('F-B3005: Moved 14.1.3 (Matt 3:15) → Cat 2.6 (His Messianic Identity)');
}

// ─── F-B3006: MOVE 14.3.7 → Cat 17.3 ────────────────────────────────────────
// Matt 12:33–35 (tree/fruit/heart) — not an Antithesis; belongs in Recognizing True from False
{
  const t = removeTeaching('14.3.7');
  appendTeaching('17.3', t);
  log.push('F-B3006: Moved 14.3.7 (Matt 12:33–35) → Cat 17.3 (Recognizing True from False)');
}

// ─── F-B3007: MOVE 18.1.3 → Cat 18.2 ────────────────────────────────────────
// Mark 11:26 (if you do not forgive) — obligation to forgive others, not pronouncement of divine forgiveness
{
  const t = removeTeaching('18.1.3');
  appendTeaching('18.2', t);
  log.push('F-B3007: Moved 18.1.3 (Mark 11:26) → Cat 18.2 (Forgiving Others)');
}

// ─── F-B3008: MERGE 12.1.2 + 12.1.3 (approved) ──────────────────────────────
// Delete 12.1.3 (subset of 12.1.2). Update 12.1.2 ref to John 17:4–5
// (John 17:3 is retained separately in 12.1.4)
{
  removeTeaching('12.1.3');
  const { teaching: t12_1_2 } = findTeaching('12.1.2');
  // Update reference from John 17:3–5 to John 17:4–5
  const ref = t12_1_2.references.find(r => r.book === 'John' && r.chapter === 17);
  if (ref) {
    ref.label = 'John 17:4–5';
    ref.ranges = [[4, 5]];
  }
  log.push('F-B3008: Deleted 12.1.3; updated 12.1.2 ref → John 17:4–5 (12.1.4 retains John 17:3)');
}

// ─── F-B3009: MERGE 12.3.1 + 12.3.4 (approved) ──────────────────────────────
// Delete 12.3.4. Update 12.3.1 refs to John 17:20–23 (add v.22)
{
  removeTeaching('12.3.4');
  const { teaching: t12_3_1 } = findTeaching('12.3.1');
  const ref = t12_3_1.references.find(r => r.book === 'John' && r.chapter === 17);
  if (ref) {
    ref.label = 'John 17:20–23';
    ref.ranges = [[20, 23]];
  }
  log.push('F-B3009: Deleted 12.3.4; updated 12.3.1 ref → John 17:20–23');
}

// ─── F-B3010: MOVE 13.4.4 → Cat 11.2 ────────────────────────────────────────
// John 14:15 ("If you love me, keep my commandments") — Abiding in Love, not New Commandment
{
  const t = removeTeaching('13.4.4');
  appendTeaching('11.2', t);
  log.push('F-B3010: Moved 13.4.4 (John 14:15) → Cat 11.2 (Abiding in Love)');
}

// ─── F-B3011: DELETE 16.2.1 ──────────────────────────────────────────────────
// Matt 5:33–37 already in 14.3.4 (Antitheses); delete duplicate 16.2.1
removeTeaching('16.2.1');
log.push('F-B3011: Deleted 16.2.1 (Matt 5:33–37 — duplicate; 14.3.4 is primary in Antitheses)');

// ─── F-B3012: MOVE 17.3.4 → Cat 5.1 ─────────────────────────────────────────
// Matt 12:43–45 (unclean spirit returning) — incomplete repentance/spiritual vacancy → 5.1
{
  const t = removeTeaching('17.3.4');
  appendTeaching('5.1', t);
  log.push('F-B3012: Moved 17.3.4 (Matt 12:43–45) → Cat 5.1 (The Call to Repentance — danger of incomplete turning)');
}

// ─── F-B3013: MOVE 18.3.4 → Cat 14.5; MOVE 18.3.5 → Cat 5.1 ────────────────
// Woman in adultery: 18.3.4 (accusers challenge) → Judging; 18.3.5 (neither do I condemn) → Repentance/Call
{
  const t18_3_4 = removeTeaching('18.3.4');
  appendTeaching('14.5', t18_3_4);
  log.push('F-B3013a: Moved 18.3.4 (John 8:7 — cast first stone) → Cat 14.5 (Judging and Discernment)');

  const t18_3_5 = removeTeaching('18.3.5');
  appendTeaching('5.1', t18_3_5);
  log.push('F-B3013b: Moved 18.3.5 (John 8:10–11 — neither do I condemn, go and sin no more) → Cat 5.1 (The Call to Repentance)');
}

// ─── F-B3014: MOVE 19.3.3 → Cat 22.2 ────────────────────────────────────────
// Matt 19:29 (leave family for kingdom → receive hundredfold) — discipleship cost + reward
{
  const t = removeTeaching('19.3.3');
  appendTeaching('22.2', t);
  log.push('F-B3014: Moved 19.3.3 (Matt 19:29) → Cat 22.2 (Counting the Cost)');
}

// ─── F-B3015: DELETE 19.2.1 ──────────────────────────────────────────────────
// Matt 5:27–30 already in 14.3.2 (Antitheses); delete 19.2.1 cross-listing
removeTeaching('19.2.1');
log.push('F-B3015: Deleted 19.2.1 (Matt 5:27–30 — primary in 14.3.2 Antitheses; 19.2 cross-listing removed)');

// ─── F-B3016 + F-B3017: MERGE 15.1.5 and 15.1.6 into 15.1.1 ────────────────
// 15.1.5 (Mark 9:33 — setup question) and 15.1.6 (Mark 10:36 — setup question) merged into 15.1.1
{
  const { teaching: t15_1_1 } = findTeaching('15.1.1');

  // Consolidate existing Mark 10 refs (10:31 + 10:38–40, 42–44) and add 10:36
  // Remove separate Mark 10:31 ref; merge into a combined Mark 10 entry
  const mark10RefIdx = t15_1_1.references.findIndex(r => r.book === 'Mark' && r.chapter === 10 && r.ranges.some(range => range[0] === 38));
  const mark10Ref31Idx = t15_1_1.references.findIndex(r => r.book === 'Mark' && r.chapter === 10 && r.ranges.some(range => range[0] === 31));

  if (mark10RefIdx !== -1 && mark10Ref31Idx !== -1) {
    // Remove the 10:31-only entry; extend the 10:38 entry to include 10:31 and 10:36
    t15_1_1.references.splice(mark10Ref31Idx, 1);
    const mark10Ref = t15_1_1.references.find(r => r.book === 'Mark' && r.chapter === 10);
    if (mark10Ref) {
      mark10Ref.ranges = [[31, 31], [36, 36], [38, 40], [42, 44]];
      mark10Ref.label = 'Mark 10:31, 36, 38–40, 42–44';
    }
  }

  // Add Mark 9:33 as secondary reference
  t15_1_1.references.push({
    label: 'Mark 9:33',
    book: 'Mark',
    bookAbbr: 'Mark',
    chapter: 9,
    ranges: [[33, 33]],
    isPrimary: false
  });

  // Remove the standalone teachings
  removeTeaching('15.1.5');
  removeTeaching('15.1.6');

  log.push('F-B3016+B3017: Deleted 15.1.5 and 15.1.6; merged Mark 9:33 and Mark 10:36 refs into 15.1.1');
}

// ─── F-B3018: REMOVE i-am tag from 17.2.8 ───────────────────────────────────
{
  const { teaching: t17_2_8 } = findTeaching('17.2.8');
  const tagIdx = t17_2_8.tags.indexOf('i-am');
  if (tagIdx !== -1) t17_2_8.tags.splice(tagIdx, 1);
  log.push('F-B3018: Removed i-am tag from 17.2.8 (John 9:39 is not an I AM declaration)');
}

// ─── F-B3019: MERGE 13.1.1 into 13.2.1; DELETE Cat 13.1; RETITLE Cat 13.2 ──
// 13.2.1 absorbs the full Greatest Commandment content from 13.1.1
// Cat 13.2 retitled to "Love for God and Neighbor"
{
  const { teaching: t13_1_1 } = findTeaching('13.1.1');
  const { teaching: t13_2_1 } = findTeaching('13.2.1');

  // Update 13.2.1 with the full Greatest Commandment content from 13.1.1
  t13_2_1.text = t13_1_1.text;
  t13_2_1.quote = t13_1_1.quote;
  t13_2_1.tags = [...t13_1_1.tags];
  t13_2_1.references = JSON.parse(JSON.stringify(t13_1_1.references));

  // Delete 13.1.1
  removeTeaching('13.1.1');

  // Delete the now-empty Cat 13.1 subcategory
  const cat13 = findCat(13);
  const sub13_1_idx = cat13.subcategories.findIndex(s => s.id === '13.1');
  if (sub13_1_idx !== -1) {
    cat13.subcategories.splice(sub13_1_idx, 1);
    log.push('F-B3019: Deleted Cat 13.1 subcategory (now empty after merge)');
  }

  // Retitle Cat 13.2 to "Love for God and Neighbor"
  const sub13_2 = cat13.subcategories.find(s => s.id === '13.2');
  if (sub13_2) {
    sub13_2.title = 'Love for God and Neighbor';
    sub13_2.slug = 'love-for-god-and-neighbor';
  }

  log.push('F-B3019: Merged 13.1.1 content into 13.2.1 (full Greatest Commandment); retitled Cat 13.2 → "Love for God and Neighbor"');
}

// ─── Write Output ─────────────────────────────────────────────────────────────
fs.writeFileSync(CATALOG_PATH, JSON.stringify(data, null, 2), 'utf8');

console.log('\n=== B3 Resolutions Applied ===\n');
log.forEach(entry => console.log(' ✓ ' + entry));
console.log(`\nTotal operations: ${log.length}`);
console.log('\nNext steps:');
console.log('  node catalog_builds/engine/scripts/renumber.js');
console.log('  node catalog_builds/engine/scripts/validate-catalog.js');
