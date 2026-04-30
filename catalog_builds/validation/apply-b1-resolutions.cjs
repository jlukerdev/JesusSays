/**
 * B1 Resolution — apply all approved finding changes to teachings.json
 * Run from project root: node catalog_builds/validation/apply-b1-resolutions.cjs
 */
const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.resolve(__dirname, '../../public/teachings.json');
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

const log = [];

function findTeaching(id) {
  for (const cat of catalog.categories) {
    for (const sub of cat.subcategories) {
      const idx = sub.teachings.findIndex(t => t.id === id);
      if (idx >= 0) return { cat, sub, idx, teaching: sub.teachings[idx] };
    }
  }
  return null;
}

function findSubcatBySlug(slug) {
  for (const cat of catalog.categories) {
    const sub = cat.subcategories.find(s => s.slug === slug);
    if (sub) return { cat, sub };
  }
  return null;
}

function removeTeaching(id, reason) {
  const loc = findTeaching(id);
  if (!loc) throw new Error('Teaching not found: ' + id);
  loc.sub.teachings.splice(loc.idx, 1);
  log.push(`REMOVED ${id} from ${loc.sub.slug} (${reason})`);
  return loc.teaching;
}

function appendTo(slug, teaching, reason) {
  const loc = findSubcatBySlug(slug);
  if (!loc) throw new Error('Subcategory not found: ' + slug);
  loc.sub.teachings.push(teaching);
  log.push(`APPENDED ${teaching.id || 'NEW'} to ${slug} (${reason})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE MOVES (yes decisions)
// ─────────────────────────────────────────────────────────────────────────────

// F-B1001: 2.4.3 → Cat 12.1 (John 17:5)
appendTo('cat-12-1', removeTeaching('2.4.3', 'F-B1001: G-1 violation'), 'F-B1001');

// F-B1002: 6.3.1 → Cat 12.1 (John 17:3)
appendTo('cat-12-1', removeTeaching('6.3.1', 'F-B1002: G-1 violation'), 'F-B1002');

// F-B1003: 25.4.1 → Cat 12.3 (John 17:21-23)
appendTo('cat-12-3', removeTeaching('25.4.1', 'F-B1003: G-1 violation'), 'F-B1003');

// F-B1004: 2.6.1 → Cat 27.3 (trial before high priest)
appendTo('cat-27-3', removeTeaching('2.6.1', 'F-B1004: G-2 violation'), 'F-B1004');

// F-B1005: 4.1.12 → Cat 27.3 (John 18:36 — Pilate exchange)
appendTo('cat-27-3', removeTeaching('4.1.12', 'F-B1005: G-2 violation'), 'F-B1005');

// F-B1006: 9.1.1 → Cat 27.1 (Lord's Supper opening — Luke 22:15-16)
appendTo('cat-27-1', removeTeaching('9.1.1', 'F-B1006: G-2 violation'), 'F-B1006');

// F-B1010: 10.5.2 → Cat 27.2 (Gethsemane prayer)
appendTo('cat-27-2', removeTeaching('10.5.2', 'F-B1010: G-2 violation'), 'F-B1010');

// F-B1013: 18.2.4 → Cat 27.4 ("Father forgive them")
appendTo('cat-27-4', removeTeaching('18.2.4', 'F-B1013: G-2 violation'), 'F-B1013');

// F-B1016: Delete 2.1.9 — content already in 31.1.2 (DUP-002 resolution)
removeTeaching('2.1.9', 'F-B1016: DUP-002 resolved; 31.1.2 is authoritative G-4 location');

// F-B1017: 2.1.11 → Cat 31.1 (Rev 1:8 — Alpha and Omega)
appendTo('cat-31-1', removeTeaching('2.1.11', 'F-B1017: G-4 violation'), 'F-B1017');

// F-B1019: Delete 5.1.4 — all refs Rev 2-3; content already in Cat 31 letter subcategories
removeTeaching('5.1.4', 'F-B1019: approver decision — delete; content already in Cat 31 letters');

// F-B1023: Delete 22.4.2 — content already in 31.5.2 (Thyatira) and 31.7.2 (Philadelphia)
removeTeaching('22.4.2', 'F-B1023: approver decision — content already in Cat 31');

// F-B1024: Delete 22.4.3 — overcomer promises already distributed across Cat 31 letter subcategories
removeTeaching('22.4.3', 'F-B1024: approver decision — content already in Cat 31');

// ─────────────────────────────────────────────────────────────────────────────
// ACCEPTED (no decisions — keep 9.1.2, 9.1.3, 9.1.4 in Cat 9)
// ─────────────────────────────────────────────────────────────────────────────
log.push('ACCEPTED F-B1007 (9.1.2 stays in Cat 9 per approver)');
log.push('ACCEPTED F-B1008 (9.1.3 stays in Cat 9 per approver)');
log.push('ACCEPTED F-B1009 (9.1.4 stays in Cat 9 per approver)');

// ─────────────────────────────────────────────────────────────────────────────
// FIELD MODIFICATIONS (ref stripping + text updates)
// ─────────────────────────────────────────────────────────────────────────────

// F-B1020: 5.3.2 — remove Rev 3:20 ref; update text to reflect John 6:37 only
{
  const loc = findTeaching('5.3.2');
  loc.teaching.references = loc.teaching.references.filter(
    r => !(r.bookAbbr === 'Rev' && r.chapter === 3)
  );
  loc.teaching.text = 'Promises that all whom the Father gives him will come to him, and whoever comes he will never cast out';
  log.push('MODIFIED 5.3.2 (F-B1020): removed Rev 3:20 ref, updated text');
}

// F-B1022: 22.4.1 — remove Rev 2:10 ref; update text (crown of life removed)
{
  const loc = findTeaching('22.4.1');
  loc.teaching.references = loc.teaching.references.filter(r => r.bookAbbr !== 'Rev');
  loc.teaching.text = 'Promises that those who endure to the end will be saved';
  log.push('MODIFIED 22.4.1 (F-B1022): removed Rev 2:10 ref, updated text');
}

// F-B1018: 2.3.4 — remove Rev 2:23 ref; update text (remove "searches mind and heart" clause)
{
  const loc = findTeaching('2.3.4');
  loc.teaching.references = loc.teaching.references.filter(r => r.bookAbbr !== 'Rev');
  loc.teaching.text = 'He came to cast fire on the earth — not peace but a sword';
  log.push('MODIFIED 2.3.4 (F-B1018): removed Rev 2:23 ref, updated text');
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT OPERATIONS — modify source + create new teaching
// ─────────────────────────────────────────────────────────────────────────────

// F-B1011: 15.1.1 — remove Luke 22:25-26 ref; create new teaching in Cat 27.1
{
  const loc = findTeaching('15.1.1');
  loc.teaching.references = loc.teaching.references.filter(
    r => !(r.bookAbbr === 'Luke' && r.chapter === 22)
  );
  log.push('MODIFIED 15.1.1 (F-B1011): removed Luke 22:25-26 ref');
}
appendTo('cat-27-1', {
  id: 'TEMP-B1011',
  text: 'At the Last Supper dispute over greatness, tells the disciples that gentile rulers lord over their subjects but among them the greatest must be as the youngest and the leader as one who serves',
  quote: 'And he said unto them, The kings of the Gentiles exercise lordship over them; and they that exercise authority upon them are called benefactors. But ye shall not be so: but he that is greatest among you, let him be as the younger; and he that is chief, as he that doth serve.',
  tags: [],
  references: [
    { label: 'Luke 22:25–26', book: 'Luke', bookAbbr: 'Luke', chapter: 22, ranges: [[25, 26]], isPrimary: true }
  ]
}, 'F-B1011: split from 15.1.1');

// F-B1012: 15.2.1 — remove Luke 22:27 ref; update text; create new teaching in Cat 27.1
{
  const loc = findTeaching('15.2.1');
  loc.teaching.references = loc.teaching.references.filter(
    r => !(r.bookAbbr === 'Luke' && r.chapter === 22)
  );
  loc.teaching.text = 'The Son of Man came not to be served but to serve and give his life as a ransom for many';
  log.push('MODIFIED 15.2.1 (F-B1012): removed Luke 22:27 ref, updated text');
}
appendTo('cat-27-1', {
  id: 'TEMP-B1012',
  text: 'At table, asks who is greater — the one who reclines or the one who serves — and declares himself to be among them as one who serves',
  quote: 'For whether is greater, he that sitteth at meat, or he that serveth? is not he that sitteth at meat? but I am among you as he that serveth.',
  tags: [],
  references: [
    { label: 'Luke 22:27', book: 'Luke', bookAbbr: 'Luke', chapter: 22, ranges: [[27, 27]], isPrimary: true }
  ]
}, 'F-B1012: split from 15.2.1');

// F-B1014: 16.3.1 — remove John 18:37 ref; update text; create new teaching in Cat 27.3
{
  const loc = findTeaching('16.3.1');
  loc.teaching.references = loc.teaching.references.filter(
    r => !(r.bookAbbr === 'John' && r.chapter === 18)
  );
  loc.teaching.text = 'Declares himself the way, the truth, and the life — no one comes to the Father except through him';
  log.push('MODIFIED 16.3.1 (F-B1014): removed John 18:37 ref, updated text');
}
appendTo('cat-27-3', {
  id: 'TEMP-B1014',
  text: 'Before Pilate, declares he was born and came into the world to bear witness to the truth — everyone on the side of truth listens to him',
  quote: 'Thou sayest that I am a king. To this end was I born, and for this cause came I into the world, that I should bear witness unto the truth. Every one that is of the truth heareth my voice.',
  tags: [],
  references: [
    { label: 'John 18:37', book: 'John', bookAbbr: 'John', chapter: 18, ranges: [[37, 37]], isPrimary: true }
  ]
}, 'F-B1014: split from 16.3.1');

// F-B1015: 19.3.3 — remove Luke 22:28-32 ref; create new teaching in Cat 27.1
{
  const loc = findTeaching('19.3.3');
  loc.teaching.references = loc.teaching.references.filter(
    r => !(r.bookAbbr === 'Luke' && r.chapter === 22)
  );
  log.push('MODIFIED 19.3.3 (F-B1015): removed Luke 22:28-32 ref');
}
appendTo('cat-27-1', {
  id: 'TEMP-B1015',
  text: 'At the Last Supper, commends the disciples for remaining with him through his trials and promises them thrones to judge the twelve tribes; warns Peter that Satan has asked to sift him but that he has prayed for Peter\'s faith to hold',
  quote: 'Ye are they which have continued with me in my temptations. And I appoint unto you a kingdom, as my Father hath appointed unto me; That ye may eat and drink at my table in my kingdom, and sit on thrones judging the twelve tribes of Israel. And the Lord said, Simon, Simon, behold, Satan hath desired to have you, that he may sift you as wheat: But I have prayed for thee, that thy faith fail not: and when thou art converted, strengthen thy brethren.',
  tags: [],
  references: [
    { label: 'Luke 22:28–32', book: 'Luke', bookAbbr: 'Luke', chapter: 22, ranges: [[28, 32]], isPrimary: true }
  ]
}, 'F-B1015: split from 19.3.3');

// F-B1021: 17.1.1 — remove Rev 2-3 refs; update text; create new teaching in Cat 31.1
{
  const loc = findTeaching('17.1.1');
  loc.teaching.references = loc.teaching.references.filter(r => r.bookAbbr !== 'Rev');
  loc.teaching.text = 'He who has ears to hear, let him hear — a call to spiritual attention repeated throughout his ministry';
  log.push('MODIFIED 17.1.1 (F-B1021): removed Rev 2-3 refs, updated text');
}
appendTo('cat-31-1', {
  id: 'TEMP-B1021',
  text: 'Closes each of the seven letters with the same summons to spiritual attention — he who has an ear, let him hear what the Spirit says to the churches',
  quote: 'He that hath an ear, let him hear what the Spirit saith unto the churches.',
  tags: [],
  references: [
    { label: 'Rev 2:7, 11, 17, 29', book: 'Revelation', bookAbbr: 'Rev', chapter: 2, ranges: [[7,7],[11,11],[17,17],[29,29]], isPrimary: true },
    { label: 'Rev 3:6, 13, 22',     book: 'Revelation', bookAbbr: 'Rev', chapter: 3, ranges: [[6,6],[13,13],[22,22]], isPrimary: false }
  ]
}, 'F-B1021: split from 17.1.1');

// ─────────────────────────────────────────────────────────────────────────────
// WRITE OUTPUT
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
console.log('\n=== B1 Resolution Applied ===');
for (const entry of log) console.log(' - ' + entry);
console.log('\nTotal operations:', log.length);
console.log('Written to:', CATALOG_PATH);
