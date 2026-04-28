#!/usr/bin/env node
/**
 * build-passion-table.mjs
 *
 * Hand-curated harmony table for the cat-27 Passion Narrative. Each row is
 * one "event" with per-Gospel verse ranges. The output is consumed by
 * match-cat27-parallels.mjs to expand each surviving cat-27 teaching's
 * `references[]` array.
 *
 * Each candidate range is verified against bible_datasets/output/{70_MAT,
 * 71_MRK, 72_LUK, 73_JHN}.json: ranges that contain *no* verses with
 * jesusIsSpeaking=true are dropped. Ranges that contain a mix of narration
 * and Jesus speech are KEPT (a saying may span both) but flagged in the
 * verification report.
 *
 * Output:
 *   catalog_builds/v2.1/output/passion-parallel-table.json
 *   catalog_builds/v2.1/reports/passion-parallel-verification.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '../../..');

const DATASETS_DIR = path.join(repoRoot, 'bible_datasets', 'output');
const outTablePath = path.join(__dirname, '..', 'output',  'passion-parallel-table.json');
const outVerifyPath = path.join(__dirname, '..', 'reports', 'passion-parallel-verification.json');

const SOURCE_FILES = {
  Matt: '70_MAT.json',
  Mark: '71_MRK.json',
  Luke: '72_LUK.json',
  John: '73_JHN.json',
};

const ABBR_TO_FULL = {
  Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John',
};

// ── Hand-curated harmony ─────────────────────────────────────────────────────
//
// eventKey values match those used in diagnose-cat27.mjs / match-cat27-parallels.mjs.
// Notes:
//  - "farewell-discourse-fragment" is intentionally absent: decision 5 says
//    leave it out of cat-27 entirely.
//  - "anointing-bethany" — Matt 26:10-13 / Mark 14:6-9 only (Luke 7 anointing
//    is a different event; John 12 not in Passion week timing).
//  - "prepare-passover" — Matt/Mark/Luke versions all sayings to disciples.
//  - "sword-saying" merges Matt 26:52-54 (full statement) with John 18:11
//    ("the cup which my Father hath given me").
//  - Seven cross sayings — only one Gospel each except for "My God, my God"
//    (Matt 27:46 / Mark 15:34) and "Father into thy hands" (Luke 23:46 only).

const HARMONY = [
  // ── Last Supper week ──────────────────────────────────────────────────────
  {
    eventKey: 'passion-foretold-passover',
    description: 'Two days before Passover Jesus tells the disciples he will be crucified.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[2, 2]] },
    ],
  },
  {
    eventKey: 'anointing-bethany',
    description: 'Defends the woman who anointed him at Bethany — she has prepared his body for burial.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[10, 13]] },
      { book: 'Mark', chapter: 14, ranges: [[6, 9]]  },
    ],
  },
  {
    eventKey: 'prepare-passover',
    description: 'Sends disciples into the city to prepare the Passover meal in the upper room.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[18, 18]]  },
      { book: 'Mark', chapter: 14, ranges: [[13, 15]] },
      { book: 'Luke', chapter: 22, ranges: [[8, 8], [10, 12]] },
    ],
  },

  // ── Last Supper — institution words (decision 4 cross-categorical surfacing) ──
  {
    eventKey: 'institution-bread-and-cup',
    description: 'Bread and cup — institution of the Lord\'s Supper. Cat-9 stays canonical; cat-27 gets a narrative copy.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[26, 29]] },
      { book: 'Mark', chapter: 14, ranges: [[22, 25]] },
      { book: 'Luke', chapter: 22, ranges: [[17, 20]] },
    ],
  },

  // ── Last Supper — betrayal foretold and identified ──
  {
    eventKey: 'betrayal-foretold',
    description: 'Announces at the Last Supper that one of the Twelve will betray him.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[21, 21]]  },
      { book: 'Mark', chapter: 14, ranges: [[18, 18]]  },
      { book: 'Luke', chapter: 22, ranges: [[21, 22]] },
    ],
  },
  {
    eventKey: 'betrayer-identified',
    description: 'Identifies the betrayer as the one who dips with him — woe to that man.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[23, 25]] },
      { book: 'Mark', chapter: 14, ranges: [[20, 21]] },
    ],
  },

  // ── Peter's denial warning + scattering of disciples ──
  {
    eventKey: 'shepherd-smitten',
    description: 'Foretells the disciples will scatter — citing Zechariah, smite the shepherd — and pledges to go before them into Galilee.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[31, 32]] },
      { book: 'Mark', chapter: 14, ranges: [[27, 28]] },
    ],
  },
  {
    eventKey: 'peter-denial-warning',
    description: 'Foretells Peter will deny him three times before the cock crows.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[34, 34]]  },
      { book: 'Mark', chapter: 14, ranges: [[30, 30]]  },
      { book: 'Mark', chapter: 14, ranges: [[72, 72]]  }, // flashback recital — jesusText present
      { book: 'Luke', chapter: 22, ranges: [[34, 38]] },
    ],
  },

  // ── Gethsemane and Arrest ────────────────────────────────────────────────
  {
    eventKey: 'judas-greeting',
    description: 'Greets Judas at the betrayal — friend, do what you came for.',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[50, 50]] },
    ],
  },
  {
    eventKey: 'judas-kiss',
    description: 'Confronts Judas — betrayest thou the Son of Man with a kiss?',
    passages: [
      { book: 'Luke', chapter: 22, ranges: [[48, 48]] },
    ],
  },
  {
    eventKey: 'whom-seek-ye',
    description: 'At his arrest he steps forward and asks the cohort, Whom seek ye?',
    passages: [
      { book: 'John', chapter: 18, ranges: [[4, 4]] },
    ],
  },
  {
    eventKey: 'sword-saying',
    description: 'Stops the sword at his arrest — those who take the sword die by it; the cup the Father has given me, shall I not drink it?',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[52, 56]] },
      { book: 'John', chapter: 18, ranges: [[11, 11]] },
    ],
  },
  {
    eventKey: 'arrest-confront-mob',
    description: 'Confronts the arresting party — am I a robber? I taught daily in the temple.',
    passages: [
      { book: 'Mark', chapter: 14, ranges: [[48, 49]] },
      { book: 'Luke', chapter: 22, ranges: [[51, 53]] },
    ],
  },

  // ── Trial — high priest ──────────────────────────────────────────────────
  {
    eventKey: 'caiaphas-spoke-openly',
    description: 'Tells the high priest he taught openly — let those who heard testify.',
    passages: [
      { book: 'John', chapter: 18, ranges: [[20, 21]] },
    ],
  },
  {
    eventKey: 'caiaphas-why-smitest',
    description: 'When struck — if I have spoken evil, bear witness; but if well, why smitest thou me?',
    passages: [
      { book: 'John', chapter: 18, ranges: [[23, 23]] },
    ],
  },
  {
    eventKey: 'caiaphas-i-am',
    description: '"I am — and ye shall see the Son of man sitting on the right hand of power." (Matt/Mark/Luke high-priest interrogation.)',
    passages: [
      { book: 'Matt', chapter: 26, ranges: [[64, 64]] },
      { book: 'Mark', chapter: 14, ranges: [[62, 62]] },
      { book: 'Luke', chapter: 22, ranges: [[67, 70]] },
    ],
  },

  // ── Trial — Pilate ───────────────────────────────────────────────────────
  {
    eventKey: 'pilate-king-jews',
    description: 'Affirms before Pilate — thou sayest — that he is the King of the Jews.',
    passages: [
      { book: 'Matt', chapter: 27, ranges: [[11, 11]] },
      { book: 'Mark', chapter: 15, ranges: [[2, 2]]  },
      { book: 'Luke', chapter: 23, ranges: [[3, 3]]  },
    ],
  },
  {
    eventKey: 'pilate-of-thyself',
    description: 'Asks Pilate — sayest thou this thing of thyself, or did others tell it thee of me?',
    passages: [
      { book: 'John', chapter: 18, ranges: [[34, 34]] },
    ],
  },
  {
    eventKey: 'pilate-kingdom-not-of-this-world',
    description: '"My kingdom is not of this world" — declared before Pilate.',
    passages: [
      { book: 'John', chapter: 18, ranges: [[36, 37]] },
    ],
  },
  {
    eventKey: 'pilate-no-power',
    description: '"Thou couldest have no power at all against me, except it were given thee from above."',
    passages: [
      { book: 'John', chapter: 19, ranges: [[11, 11]] },
    ],
  },

  // ── Road to Calvary ──────────────────────────────────────────────────────
  {
    eventKey: 'daughters-jerusalem',
    description: 'On the way to the cross — daughters of Jerusalem, weep not for me but for yourselves.',
    passages: [
      { book: 'Luke', chapter: 23, ranges: [[28, 31]] },
    ],
  },

  // ── Seven sayings from the cross ─────────────────────────────────────────
  {
    eventKey: 'cross-father-forgive',
    description: '"Father, forgive them; for they know not what they do."',
    passages: [
      { book: 'Luke', chapter: 23, ranges: [[34, 34]] },
    ],
  },
  {
    eventKey: 'cross-paradise',
    description: '"Today shalt thou be with me in paradise" — to the penitent thief.',
    passages: [
      { book: 'Luke', chapter: 23, ranges: [[43, 43]] },
    ],
  },
  {
    eventKey: 'cross-behold-thy-mother',
    description: '"Behold thy mother" — entrusts Mary to the beloved disciple.',
    passages: [
      { book: 'John', chapter: 19, ranges: [[26, 27]] },
    ],
  },
  {
    eventKey: 'cross-my-god-my-god',
    description: '"My God, my God, why hast thou forsaken me?" (Psalm 22:1).',
    passages: [
      { book: 'Matt', chapter: 27, ranges: [[46, 46]] },
      { book: 'Mark', chapter: 15, ranges: [[34, 34]] },
    ],
  },
  {
    eventKey: 'cross-i-thirst',
    description: '"I thirst."',
    passages: [
      { book: 'John', chapter: 19, ranges: [[28, 28]] },
    ],
  },
  {
    eventKey: 'cross-it-is-finished',
    description: '"It is finished."',
    passages: [
      { book: 'John', chapter: 19, ranges: [[30, 30]] },
    ],
  },
  {
    eventKey: 'cross-into-thy-hands',
    description: '"Father, into thy hands I commend my spirit."',
    passages: [
      { book: 'Luke', chapter: 23, ranges: [[46, 46]] },
    ],
  },
];

// ── Verify every range against bible_datasets ────────────────────────────────

const verseIndex = {}; // verseIndex[abbr][chapter][verse] = { jesusIsSpeaking, jesusText, text }
for (const [abbr, fname] of Object.entries(SOURCE_FILES)) {
  const fp = path.join(DATASETS_DIR, fname);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  verseIndex[abbr] = {};
  for (const v of data.verses) {
    if (!verseIndex[abbr][v.chapter]) verseIndex[abbr][v.chapter] = {};
    verseIndex[abbr][v.chapter][v.verse] = {
      jesusIsSpeaking: !!v.jesusIsSpeaking,
      jesusText: v.jesusText || [],
      text: v.text || '',
    };
  }
}

function makeLabel(abbr, chapter, ranges) {
  const parts = ranges.map(([s, e]) => (s === e ? `${s}` : `${s}–${e}`));
  return `${abbr} ${chapter}:${parts.join(', ')}`;
}

const verification = [];
const cleanedHarmony = [];

for (const event of HARMONY) {
  const cleanedPassages = [];
  for (const p of event.passages) {
    let totalVerses = 0;
    let jesusVerses = 0;
    let narrationVerses = 0;
    const missing = [];
    for (const [s, e] of p.ranges) {
      for (let v = s; v <= e; v++) {
        totalVerses++;
        const entry = verseIndex[p.book]?.[p.chapter]?.[v];
        if (!entry) { missing.push(v); continue; }
        if (entry.jesusIsSpeaking) jesusVerses++;
        else narrationVerses++;
      }
    }

    const status = jesusVerses === 0 ? 'dropped' : (narrationVerses > 0 ? 'partial' : 'ok');
    verification.push({
      eventKey: event.eventKey,
      passage: makeLabel(p.book, p.chapter, p.ranges),
      totalVerses,
      jesusVerses,
      narrationVerses,
      missing,
      status,
    });

    if (jesusVerses > 0) {
      cleanedPassages.push(p);
    }
  }
  cleanedHarmony.push({
    eventKey: event.eventKey,
    description: event.description,
    passages: cleanedPassages.map(p => ({
      label: makeLabel(p.book, p.chapter, p.ranges),
      book: ABBR_TO_FULL[p.book],
      bookAbbr: p.book,
      chapter: p.chapter,
      ranges: p.ranges,
    })),
  });
}

fs.mkdirSync(path.dirname(outTablePath), { recursive: true });
fs.writeFileSync(outTablePath,  JSON.stringify({ generatedAt: new Date().toISOString(), events: cleanedHarmony }, null, 2), 'utf8');
fs.mkdirSync(path.dirname(outVerifyPath), { recursive: true });
fs.writeFileSync(outVerifyPath, JSON.stringify({ generatedAt: new Date().toISOString(), checks: verification }, null, 2), 'utf8');

const dropped = verification.filter(c => c.status === 'dropped').length;
const partial = verification.filter(c => c.status === 'partial').length;
const ok      = verification.filter(c => c.status === 'ok').length;

console.log(`Passion table -> ${path.relative(repoRoot, outTablePath)}`);
console.log(`Verification  -> ${path.relative(repoRoot, outVerifyPath)}`);
console.log(`  events       : ${cleanedHarmony.length}`);
console.log(`  passages OK  : ${ok}`);
console.log(`  partial      : ${partial}  (Jesus-speech mixed with narration)`);
console.log(`  dropped      : ${dropped}  (no Jesus speech in source)`);
if (partial > 0) {
  console.log('\n  Partial passages:');
  verification.filter(c => c.status === 'partial').forEach(c =>
    console.log(`    ${c.passage}  (${c.jesusVerses}/${c.totalVerses} Jesus, ${c.narrationVerses} narration)`));
}
if (dropped > 0) {
  console.log('\n  Dropped passages:');
  verification.filter(c => c.status === 'dropped').forEach(c =>
    console.log(`    ${c.passage}`));
}
