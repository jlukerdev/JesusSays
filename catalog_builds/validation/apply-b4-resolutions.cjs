'use strict';
/**
 * apply-b4-resolutions.cjs
 * Applies all approved B4 finding resolutions to public/teachings.json.
 * Run: node catalog_builds/validation/apply-b4-resolutions.cjs
 * Then: node catalog_builds/engine/scripts/renumber.js
 *       node catalog_builds/engine/scripts/validate-catalog.js
 */

const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../../public/teachings.json');
const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// ── helpers ──────────────────────────────────────────────────────────────────
function getCat(id) {
  const c = data.categories.find(c => c.id === id);
  if (!c) throw new Error('Category not found: ' + id);
  return c;
}
function getSub(catId, subId) {
  const s = getCat(catId).subcategories.find(s => s.id === subId);
  if (!s) throw new Error('Subcategory not found: ' + subId);
  return s;
}
function getTeaching(id) {
  const parts = id.split('.');
  const catId = parseInt(parts[0]);
  const cat = getCat(catId);
  for (const sub of cat.subcategories) {
    const idx = sub.teachings.findIndex(t => t.id === id);
    if (idx !== -1) return { teaching: sub.teachings[idx], sub, idx };
  }
  throw new Error('Teaching not found: ' + id);
}
function removeTeaching(id) {
  const { sub, idx } = getTeaching(id);
  sub.teachings.splice(idx, 1);
}

let log = [];
function done(msg) { log.push('  ✓ ' + msg); }

// ── F-B4001: Remove Matt 11:5,7-11 and Luke 7:22 from 21.1.1 ────────────────
{
  const { teaching } = getTeaching('21.1.1');
  const before = teaching.references.length;
  teaching.references = teaching.references.filter(r =>
    !(r.bookAbbr === 'Matt' && r.chapter === 11) &&
    !(r.bookAbbr === 'Luke' && r.chapter === 7 && r.ranges[0][0] === 22)
  );
  done(`F-B4001: Removed ${before - teaching.references.length} ref(s) from 21.1.1`);
}

// ── F-B4002: Move 21.3.4 to end of 20.3 ─────────────────────────────────────
{
  const { teaching, sub, idx } = getTeaching('21.3.4');
  sub.teachings.splice(idx, 1);
  getSub(20, '20.3').teachings.push(teaching);
  done('F-B4002: Moved 21.3.4 (Render to Caesar) to Cat 20.3');
}

// ── F-B4003: Delete 22.1.9; merge Luke 4:18-19 into 2.6.23 ──────────────────
{
  // Update 2.6.23 to include Luke 4:18-19 and update text
  const { teaching } = getTeaching('2.6.23');
  // Change primary ref from Luke 4:21 to Luke 4:18-19,21
  const primaryRef = teaching.references.find(r => r.isPrimary);
  primaryRef.label = 'Luke 4:18–19, 21';
  primaryRef.ranges = [[18, 19], [21, 21]];
  // Update text to reflect the full Nazareth event
  teaching.text = 'Reads Isaiah 61 in the Nazareth synagogue and declares the scripture fulfilled — the Spirit of the Lord has anointed him; today this is fulfilled in your ears';
  done('F-B4003a: Updated 2.6.23 to include Luke 4:18–19 in primary ref range');
  // Delete 22.1.9
  removeTeaching('22.1.9');
  done('F-B4003b: Deleted 22.1.9 (Luke 4:18–19 in Cat 22.1)');
}

// ── F-B4004: Add Matt 14:16 as secondary to 2.7.13; delete 22.2.5 ───────────
{
  const { teaching } = getTeaching('2.7.13');
  teaching.references.push({
    label: 'Matt 14:16',
    book: 'Matthew',
    bookAbbr: 'Matt',
    chapter: 14,
    ranges: [[16, 16]],
    isPrimary: false
  });
  done('F-B4004a: Added Matt 14:16 as secondary ref to 2.7.13');
  removeTeaching('22.2.5');
  done('F-B4004b: Deleted 22.2.5 (Matt 14:16 in Cat 22.2)');
}

// ── F-B4005+B4009: Delete 22.2.7 and 25.3.2; add combined teaching to 25.4 ──
{
  removeTeaching('22.2.7');
  done('F-B4005a: Deleted 22.2.7 (Luke 9:50 in Cat 22.2)');
  removeTeaching('25.3.2');
  done('F-B4005b: Deleted 25.3.2 (Mark 9:39–41 in Cat 25.3)');
  // Add combined teaching to Cat 25.4
  getSub(25, '25.4').teachings.push({
    id: 'TEMP-B4005',
    text: 'Tells the disciples not to stop the unknown exorcist working in his name — whoever is not against us is for us',
    quote: 'Forbid him not: for there is no man which shall do a miracle in my name, that can lightly speak evil of me. For he that is not against us is on our part.',
    tags: [],
    references: [
      { label: 'Mark 9:39–41', book: 'Mark', bookAbbr: 'Mark', chapter: 9, ranges: [[39, 41]], isPrimary: true },
      { label: 'Luke 9:50', book: 'Luke', bookAbbr: 'Luke', chapter: 9, ranges: [[50, 50]], isPrimary: false }
    ]
  });
  done('F-B4005c: Added combined Mark 9:39-41 / Luke 9:50 teaching to Cat 25.4');
}

// ── F-B4006: Add Luke 19:30-31 as secondary to 2.6.12; delete 22.3.4 ─────────
{
  const { teaching } = getTeaching('2.6.12');
  teaching.references.push({
    label: 'Luke 19:30–31',
    book: 'Luke',
    bookAbbr: 'Luke',
    chapter: 19,
    ranges: [[30, 31]],
    isPrimary: false
  });
  done('F-B4006a: Added Luke 19:30–31 as secondary ref to 2.6.12');
  removeTeaching('22.3.4');
  done('F-B4006b: Deleted 22.3.4 (Luke 19:30–31 in Cat 22.3)');
}

// ── F-B4007: Move non-woes from 24.1 to 24.5 ─────────────────────────────────
// Non-woes = 24.1.9–15, 24.1.19–22
{
  const sub24_1 = getSub(24, '24.1');
  const sub24_5 = getSub(24, '24.5');
  const nonWoeIds = new Set(['24.1.9','24.1.10','24.1.11','24.1.12','24.1.13',
                              '24.1.14','24.1.15','24.1.19','24.1.20','24.1.21','24.1.22']);
  const toMove = sub24_1.teachings.filter(t => nonWoeIds.has(t.id));
  sub24_1.teachings = sub24_1.teachings.filter(t => !nonWoeIds.has(t.id));
  sub24_5.teachings.push(...toMove);
  done(`F-B4007: Moved ${toMove.length} non-woe teachings from 24.1 to 24.5`);
}

// ── F-B4008: Split 24.5.2 — remove Matt 23:34-39, create new teaching ────────
{
  const { teaching } = getTeaching('24.5.2');
  // Remove Matt 23:34-39 from primary reference range; fix label
  const primaryRef = teaching.references.find(r => r.isPrimary);
  // Original: Matt 23:5–8, 10, 34–39 — trim to Matt 23:5–8, 10
  primaryRef.label = 'Matt 23:5–8, 10';
  primaryRef.ranges = [[5, 8], [10, 10]];
  done('F-B4008a: Trimmed 24.5.2 primary ref to Matt 23:5–8, 10 (removed vv.34–39)');
  // Create new teaching for Matt 23:34-39 in 24.5
  getSub(24, '24.5').teachings.push({
    id: 'TEMP-B4008',
    text: 'Declares he sends prophets and wise men whom they will kill — pronounces the Jerusalem lament: how often would he have gathered her children, but they were not willing',
    quote: 'Wherefore, behold, I send unto you prophets, and wise men, and scribes: and some of them ye shall kill and crucify... O Jerusalem, Jerusalem, thou that killest the prophets, and stonest them which are sent unto thee, how often would I have gathered thy children together, even as a hen gathereth her chickens under her wings, and ye would not!',
    tags: [],
    references: [
      { label: 'Matt 23:34–39', book: 'Matthew', bookAbbr: 'Matt', chapter: 23, ranges: [[34, 39]], isPrimary: true }
    ]
  });
  done('F-B4008b: Created new teaching for Matt 23:34–39 in 24.5');
}

// ── F-B4010: Move 25.4.1 to Cat 2.3 ──────────────────────────────────────────
{
  const { teaching, sub, idx } = getTeaching('25.4.1');
  sub.teachings.splice(idx, 1);
  getSub(2, '2.3').teachings.push(teaching);
  done('F-B4010: Moved 25.4.1 (kingdom divided) from 25.4 to 2.3');
}

// ── F-B4011: Remove John 20:21-22 from 26.1.2; update text/quote for Acts 1:8 ─
{
  const { teaching } = getTeaching('26.1.2');
  teaching.references = teaching.references.filter(r =>
    !(r.bookAbbr === 'John' && r.chapter === 20)
  );
  // Make Acts 1:8 primary
  const actsRef = teaching.references.find(r => r.bookAbbr === 'Acts' && r.chapter === 1);
  if (actsRef) actsRef.isPrimary = true;
  teaching.text = 'You will receive power when the Holy Spirit comes upon you — be my witnesses in Jerusalem, Judaea, Samaria, and to the ends of the earth';
  teaching.quote = 'But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth.';
  done('F-B4011: Removed John 20:21–22 from 26.1.2; Acts 1:8 is now sole primary');
}

// ── F-B4012: Delete 28.4.1; add Luke 24:49 as secondary ref to 3.1.4 ─────────
{
  removeTeaching('28.4.1');
  done('F-B4012a: Deleted 28.4.1 (Great Commission duplicate in Cat 28.4)');
  const { teaching } = getTeaching('3.1.4');
  // Check if Luke 24:49 already present
  const alreadyHas = teaching.references.some(r => r.bookAbbr === 'Luke' && r.chapter === 24);
  if (!alreadyHas) {
    teaching.references.push({
      label: 'Luke 24:49',
      book: 'Luke',
      bookAbbr: 'Luke',
      chapter: 24,
      ranges: [[49, 49]],
      isPrimary: false
    });
    done('F-B4012b: Added Luke 24:49 as secondary ref to 3.1.4');
  } else {
    done('F-B4012b: Luke 24:49 already present in 3.1.4 — skipped');
  }
}

// ── F-B4013: Add Mark 5:19 secondary to 26.4.5; delete 26.5.3 and 26.5.4 ─────
{
  const { teaching } = getTeaching('26.4.5');
  teaching.references.push({
    label: 'Mark 5:19',
    book: 'Mark',
    bookAbbr: 'Mark',
    chapter: 5,
    ranges: [[19, 19]],
    isPrimary: false
  });
  done('F-B4013a: Added Mark 5:19 as secondary ref to 26.4.5');
  removeTeaching('26.5.3');
  done('F-B4013b: Deleted 26.5.3 (Mark 5:19 — now merged into 26.4.5)');
  // 26.5.4 (Luke 8:30) is already covered by 2.7.11 as secondary; delete it
  removeTeaching('26.5.4');
  done('F-B4013c: Deleted 26.5.4 (Luke 8:30 — already covered by 2.7.11)');
}

// ── F-B4016: Combine 28.3.1+28.3.2 → 22.1; move 28.3.3-5 → 28.1; delete 28.3 ─
{
  const { teaching: t1, idx: idx1 } = getTeaching('28.3.1');
  const { teaching: t2 } = getTeaching('28.3.2');
  const { teaching: t3 } = getTeaching('28.3.3');
  const { teaching: t4 } = getTeaching('28.3.4');
  const { teaching: t5 } = getTeaching('28.3.5');

  // Combined teaching for 22.1
  const combined = {
    id: 'TEMP-B4016',
    text: 'Three times asks Peter "Do you love me?" — feed my lambs, tend my sheep, feed my sheep; predicts his martyrdom and calls him to follow',
    quote: 'Simon, son of Jonas, lovest thou me more than these? Feed my lambs... Feed my sheep. Verily, verily, I say unto thee, When thou wast young, thou girdedst thyself... but when thou shalt be old... another shall gird thee... Follow me.',
    tags: [],
    references: [
      { label: 'John 21:15–19, 22', book: 'John', bookAbbr: 'John', chapter: 21, ranges: [[15, 19], [22, 22]], isPrimary: true }
    ]
  };
  getSub(22, '22.1').teachings.push(combined);
  done('F-B4016a: Combined 28.3.1+28.3.2, added to Cat 22.1');

  // Move 28.3.3, 28.3.4, 28.3.5 to 28.1
  getSub(28, '28.1').teachings.push(t3, t4, t5);
  done('F-B4016b: Moved 28.3.3-5 to Cat 28.1');

  // Delete subcategory 28.3
  const cat28 = getCat(28);
  cat28.subcategories = cat28.subcategories.filter(s => s.id !== '28.3');
  done('F-B4016c: Deleted subcategory 28.3 (The Restoration of Peter)');
}

// ── F-B4017: Move 28.1.4 to Cat 26.3 ─────────────────────────────────────────
{
  const { teaching, sub, idx } = getTeaching('28.1.4');
  sub.teachings.splice(idx, 1);
  getSub(26, '26.3').teachings.push(teaching);
  done('F-B4017: Moved 28.1.4 (Damascus road) to Cat 26.3');
}

// ── F-B4018: Move 29.4.3 to Cat 29.2 ─────────────────────────────────────────
{
  const { teaching, sub, idx } = getTeaching('29.4.3');
  sub.teachings.splice(idx, 1);
  getSub(29, '29.2').teachings.push(teaching);
  done('F-B4018: Moved 29.4.3 (twelve thrones) to Cat 29.2');
}

// ── F-B4019: Split 30.2.1 and 30.2.2 ─────────────────────────────────────────
{
  const sub30_2 = getSub(30, '30.2');

  // --- Split 30.2.1 ---
  const idx1 = sub30_2.teachings.findIndex(t => t.id === '30.2.1');
  sub30_2.teachings.splice(idx1, 1);

  // Teaching A: Fear him who destroys soul and body (missionary courage context)
  sub30_2.teachings.splice(idx1, 0,
    {
      id: 'TEMP-B4019-A',
      text: 'Fear him who has authority to destroy both soul and body in hell — do not fear those who can only kill the body',
      quote: 'And fear not them which kill the body, but are not able to kill the soul: but rather fear him which is able to destroy both soul and body in hell.',
      tags: [],
      references: [
        { label: 'Matt 10:28', book: 'Matthew', bookAbbr: 'Matt', chapter: 10, ranges: [[28, 28]], isPrimary: true },
        { label: 'Luke 12:5', book: 'Luke', bookAbbr: 'Luke', chapter: 12, ranges: [[5, 5]], isPrimary: false }
      ]
    },
    // Teaching B: Better to enter life maimed (Sermon on the Mount context)
    {
      id: 'TEMP-B4019-B',
      text: 'If your right eye causes you to sin, tear it out — better to lose a member than have your whole body cast into Gehenna',
      quote: 'And if thy right eye offend thee, pluck it out, and cast it from thee: for it is profitable for thee that one of thy members should perish, and not that thy whole body should be cast into hell.',
      tags: [],
      references: [
        { label: 'Matt 5:29–30', book: 'Matthew', bookAbbr: 'Matt', chapter: 5, ranges: [[29, 30]], isPrimary: true }
      ]
    },
    // Teaching C: Better enter life maimed — millstone discourse (Matt 18 / Mark 9)
    {
      id: 'TEMP-B4019-C',
      text: 'Better to enter life maimed than be cast into Gehenna with unquenchable fire — where the worm does not die and the fire is not quenched',
      quote: 'Wherefore if thy hand or thy foot offend thee, cut them off, and cast them from thee: it is better for thee to enter into life halt or maimed, rather than having two hands or two feet to be cast into everlasting fire.',
      tags: [],
      references: [
        { label: 'Matt 18:8–9', book: 'Matthew', bookAbbr: 'Matt', chapter: 18, ranges: [[8, 9]], isPrimary: true },
        { label: 'Mark 9:43–48', book: 'Mark', bookAbbr: 'Mark', chapter: 9, ranges: [[43, 48]], isPrimary: false }
      ]
    }
  );
  done('F-B4019a: Split 30.2.1 into 3 teachings (A: Matt 10:28/Luke 12:5; B: Matt 5:29-30; C: Matt 18:8-9/Mark 9:43-48)');

  // --- Split 30.2.2 ---
  // We need to re-find it now since the array changed
  const idx2 = sub30_2.teachings.findIndex(t => t.id === '30.2.2');
  sub30_2.teachings.splice(idx2, 1);

  // Teaching D: Sons of kingdom cast into outer darkness — centurion/faith context
  // Teaching E: Furnace of fire in parable conclusions
  // Teaching F: Outer darkness in judgment parables (wedding feast / talents)
  // Teaching G: Anger leads to Gehenna fire (Sermon on the Mount)
  // Teaching H: How shall you escape damnation of hell (woe to Pharisees)
  sub30_2.teachings.splice(idx2, 0,
    {
      id: 'TEMP-B4019-D',
      text: 'The sons of the kingdom shall be cast into outer darkness — there shall be weeping and gnashing of teeth',
      quote: 'But the children of the kingdom shall be cast out into outer darkness: there shall be weeping and gnashing of teeth.',
      tags: [],
      references: [
        { label: 'Matt 8:12', book: 'Matthew', bookAbbr: 'Matt', chapter: 8, ranges: [[12, 12]], isPrimary: true }
      ]
    },
    {
      id: 'TEMP-B4019-E',
      text: 'At the end of the age the angels will cast the wicked into the furnace of fire — there shall be wailing and gnashing of teeth',
      quote: 'And shall cast them into a furnace of fire: there shall be wailing and gnashing of teeth.',
      tags: [],
      references: [
        { label: 'Matt 13:42', book: 'Matthew', bookAbbr: 'Matt', chapter: 13, ranges: [[42, 42]], isPrimary: true },
        { label: 'Matt 13:50', book: 'Matthew', bookAbbr: 'Matt', chapter: 13, ranges: [[50, 50]], isPrimary: false }
      ]
    },
    {
      id: 'TEMP-B4019-F',
      text: 'Bind him and cast him into outer darkness — parabolic warnings of outer darkness at the judgment',
      quote: 'Bind him hand and foot, and take him away, and cast him into outer darkness; there shall be weeping and gnashing of teeth.',
      tags: [],
      references: [
        { label: 'Matt 22:13', book: 'Matthew', bookAbbr: 'Matt', chapter: 22, ranges: [[13, 13]], isPrimary: true },
        { label: 'Matt 25:30', book: 'Matthew', bookAbbr: 'Matt', chapter: 25, ranges: [[30, 30]], isPrimary: false }
      ]
    },
    {
      id: 'TEMP-B4019-G',
      text: 'Whoever calls his brother a fool is in danger of the fire of Gehenna — anger begins the progression toward judgment',
      quote: 'But I say unto you, That whosoever is angry with his brother without a cause shall be in danger of the judgment... but whosoever shall say, Thou fool, shall be in danger of hell fire.',
      tags: [],
      references: [
        { label: 'Matt 5:22', book: 'Matthew', bookAbbr: 'Matt', chapter: 5, ranges: [[22, 22]], isPrimary: true }
      ]
    },
    {
      id: 'TEMP-B4019-H',
      text: 'How shall you escape the damnation of hell — serpents, brood of vipers',
      quote: 'Ye serpents, ye generation of vipers, how can ye escape the damnation of hell?',
      tags: [],
      references: [
        { label: 'Matt 23:33', book: 'Matthew', bookAbbr: 'Matt', chapter: 23, ranges: [[33, 33]], isPrimary: true }
      ]
    }
  );
  done('F-B4019b: Split 30.2.2 into 5 teachings (D: Matt 8:12; E: Matt 13:42,50; F: Matt 22:13,25:30; G: Matt 5:22; H: Matt 23:33)');
}

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2), 'utf8');

console.log('\nB4 resolutions applied successfully:');
log.forEach(l => console.log(l));
console.log('\nNext steps:');
console.log('  node catalog_builds/engine/scripts/renumber.js');
console.log('  node catalog_builds/engine/scripts/validate-catalog.js');
