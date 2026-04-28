#!/usr/bin/env node
/**
 * match-cat27-parallels.mjs
 *
 * Joins the diagnosis worksheet with the harmony table to produce:
 *
 *   reports/cat-27-parallel-plan.json
 *     - For every surviving cat-27 teaching: the final references[] array
 *       in catalog schema (label, book, bookAbbr, chapter, ranges, isPrimary).
 *     - Plus an explicit merge plan: { merges, moves, adds, removes }.
 *
 * Read-only: does NOT mutate the catalog. apply-cat27-changes.mjs consumes
 * this plan to produce the patched catalog.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '../../..');

const diagnosisPath = path.join(__dirname, '..', 'reports', 'cat-27-diagnosis.json');
const harmonyPath   = path.join(__dirname, '..', 'output',  'passion-parallel-table.json');
const datasetsDir   = path.join(repoRoot,    'bible_datasets', 'output');
const catalogPath   = path.join(repoRoot,    'public', 'teachings.json');
const outPath       = path.join(__dirname, '..', 'reports', 'cat-27-parallel-plan.json');

const SOURCE_FILES = {
  Matt: '70_MAT.json', Mark: '71_MRK.json',
  Luke: '72_LUK.json', John: '73_JHN.json',
};

const ABBR_TO_FULL = {
  Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John',
};

// Bible-cat-9 source IDs whose quote we want to reuse for cat-27 institution
// gap-fillers. Each gap-filler primary ref maps to a cat-9 teaching id from
// which we lift the editorial `text` and the canonical `quote`. Picked by
// inspection of public/teachings.json cat-9.1.
const INSTITUTION_GAP_SOURCES = {
  'Matt 26:26–29': '9.1.2', // bread/cup foundation in Matthew
  'Mark 14:22–25': '9.1.2', // bread/cup foundation in Mark
  'Luke 22:17–20': '9.1.1', // Luke includes the cup-before saying which only Luke has
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLabel(abbr, chapter, ranges) {
  const parts = ranges.map(([s, e]) => (s === e ? `${s}` : `${s}–${e}`));
  return `${abbr} ${chapter}:${parts.join(', ')}`;
}

function buildVerseIndex() {
  const idx = {};
  for (const [abbr, fname] of Object.entries(SOURCE_FILES)) {
    const data = JSON.parse(fs.readFileSync(path.join(datasetsDir, fname), 'utf8'));
    idx[abbr] = {};
    for (const v of data.verses) {
      if (!idx[abbr][v.chapter]) idx[abbr][v.chapter] = {};
      idx[abbr][v.chapter][v.verse] = v;
    }
  }
  return idx;
}

function joinedJesusText(verseIndex, abbr, chapter, ranges) {
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

function findCat9Teaching(catalog, id) {
  const c9 = catalog.categories.find(c => c.slug === 'cat-9');
  for (const sub of c9.subcategories) {
    const t = sub.teachings.find(x => x.id === id);
    if (t) return t;
  }
  return null;
}

// Sort references in the same order base.css renders them: primary first,
// then by Gospel rank (Matt, Mark, Luke, John), then by chapter/verse.
const GOSPEL_RANK = { Matt: 1, Mark: 2, Luke: 3, John: 4 };
function sortRefs(refs) {
  return [...refs].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return  1;
    const ra = GOSPEL_RANK[a.bookAbbr] ?? 99;
    const rb = GOSPEL_RANK[b.bookAbbr] ?? 99;
    if (ra !== rb) return ra - rb;
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return (a.ranges[0]?.[0] ?? 0) - (b.ranges[0]?.[0] ?? 0);
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

const diagnosis = JSON.parse(fs.readFileSync(diagnosisPath, 'utf8'));
const harmony   = JSON.parse(fs.readFileSync(harmonyPath, 'utf8'));
const catalog   = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const verseIdx  = buildVerseIndex();

const eventByKey = {};
for (const e of harmony.events) eventByKey[e.eventKey] = e;

// Build merge buckets: { canonicalId: { rows:[], absorbed:[], targetSubcat } }
const buckets = {};
const removeIds = [];
const moves = [];

for (const r of diagnosis.rows) {
  const disp = r.suggestedDisposition;

  if (disp.startsWith('remove-from-cat27')) {
    removeIds.push(r.id);
    continue;
  }

  // Parse out merge target (if any) and move target (if any)
  let mergeTarget = null;
  let moveSubcat = null;
  for (const part of disp.split(' + ')) {
    if (part.startsWith('merge-into:')) mergeTarget = part.slice('merge-into:'.length);
    if (part.startsWith('move-subcat:'))  moveSubcat  = parseInt(part.slice('move-subcat:'.length), 10);
  }

  const canonicalId = mergeTarget || r.id;
  if (!buckets[canonicalId]) {
    buckets[canonicalId] = {
      canonicalId,
      eventKey: r.eventKeyGuess,
      rows: [],
      absorbed: [],
      targetSubcat: null,
    };
  }
  buckets[canonicalId].rows.push(r);
  if (mergeTarget) {
    buckets[canonicalId].absorbed.push(r.id);
  }
  // The canonical row's own move directive sets the target subcat.
  if (!mergeTarget && moveSubcat) {
    buckets[canonicalId].targetSubcat = moveSubcat;
  }
  if (moveSubcat && r.subcat !== moveSubcat) {
    moves.push({ id: r.id, fromSubcat: r.subcat, toSubcat: moveSubcat });
  }
}

// Build final references[] for each surviving teaching
const planTeachings = [];
for (const b of Object.values(buckets)) {
  const event = eventByKey[b.eventKey];
  const canonical = b.rows.find(r => r.id === b.canonicalId);

  // Resolve targetSubcat: prefer canonical row's directive, else event's
  // suggested subcat from diagnosis (the seedExpectedSubcat field).
  let targetSubcat = b.targetSubcat ?? canonical.seedExpectedSubcat ?? canonical.subcat;

  // Build reference list from harmony event
  const refs = [];
  let primaryAdded = false;
  if (event) {
    for (const p of event.passages) {
      const isPrimary = !primaryAdded
        && p.bookAbbr === canonical.bookAbbr
        && // primary chapter and at least one range overlap
        (() => {
          // Match by checking the canonical's primaryRef label substring (chapter)
          // — we rely on the harmony's coverage of the canonical row's verses.
          const pl = makeLabel(p.bookAbbr, p.chapter, p.ranges);
          return pl === canonical.primaryRef
              || pl.startsWith(`${p.bookAbbr} ${p.chapter}:`)
                 && canonical.primaryRef.startsWith(`${p.bookAbbr} ${p.chapter}:`);
        })();
      const ref = {
        label: makeLabel(p.bookAbbr, p.chapter, p.ranges),
        book: p.book,
        bookAbbr: p.bookAbbr,
        chapter: p.chapter,
        ranges: p.ranges,
        isPrimary: false,
      };
      if (isPrimary && !primaryAdded) {
        ref.isPrimary = true;
        primaryAdded = true;
      }
      refs.push(ref);
    }
  } else {
    // Unmapped event — keep the canonical's existing primary ref alone
    refs.push({
      label: canonical.primaryRef,
      book: ABBR_TO_FULL[canonical.bookAbbr],
      bookAbbr: canonical.bookAbbr,
      chapter: parseInt(canonical.primaryRef.match(/\s(\d+):/)?.[1] || '0', 10),
      ranges: [], // will trigger validator if not filled in
      isPrimary: true,
    });
    primaryAdded = true;
  }

  // Fallback: if no primary was selected (canonical's exact label didn't appear
  // in the harmony as a single passage), re-promote the matching book/chapter.
  if (!primaryAdded) {
    const idx = refs.findIndex(r => r.bookAbbr === canonical.bookAbbr
                                 && canonical.primaryRef.startsWith(`${r.bookAbbr} ${r.chapter}:`));
    if (idx >= 0) {
      refs[idx].isPrimary = true;
      primaryAdded = true;
    }
  }

  planTeachings.push({
    canonicalId: b.canonicalId,
    eventKey: b.eventKey,
    targetSubcat,
    text: canonical.currentText,
    quote: canonical.currentQuote,
    bookAbbr: canonical.bookAbbr,
    primaryRef: canonical.primaryRef,
    absorbed: b.absorbed,
    references: sortRefs(refs),
  });
}

// ── Decision 4: institution-words gap-fillers in 27.1 ────────────────────────
const adds = [];
for (const filler of diagnosis.gapFillers) {
  const eventKey = 'institution-bread-and-cup';
  const event = eventByKey[eventKey];
  const primaryLabel = filler.primaryRef;
  // Find the matching passage in the harmony (book/chapter inferred from label)
  const m = primaryLabel.match(/^(\w+)\s+(\d+):/);
  const primaryAbbr = m[1];
  const primaryChapter = parseInt(m[2], 10);

  const refs = event.passages.map(p => ({
    label: makeLabel(p.bookAbbr, p.chapter, p.ranges),
    book: p.book,
    bookAbbr: p.bookAbbr,
    chapter: p.chapter,
    ranges: p.ranges,
    isPrimary: p.bookAbbr === primaryAbbr && p.chapter === primaryChapter,
  }));

  // Ensure exactly one primary
  let pCount = refs.filter(r => r.isPrimary).length;
  if (pCount !== 1) {
    const idx = refs.findIndex(r => r.bookAbbr === primaryAbbr);
    refs.forEach((r, i) => { r.isPrimary = i === idx; });
  }

  // Quote and text reused from cat-9 source (decision 4 — cat-9 stays canonical)
  const cat9Id = INSTITUTION_GAP_SOURCES[primaryLabel];
  const cat9Teaching = cat9Id ? findCat9Teaching(catalog, cat9Id) : null;

  // Replace quote with the joined jesusText for the primary ref so the
  // narrative cat-27 entry tells the same story but is truthful to the
  // primary verse range. Fall back to cat-9's quote if needed.
  const primary = refs.find(r => r.isPrimary);
  const joined = joinedJesusText(verseIdx, primary.bookAbbr, primary.chapter, primary.ranges);
  const quote = joined || cat9Teaching?.quote || '';

  // Editorial text — write a passion-narrative-style summary referencing the Gospel
  const textByBook = {
    Matt: 'At the Last Supper Jesus institutes the bread and the cup — this is my body, this is my blood of the new testament shed for many for the remission of sins; he will not drink of the vine again until the kingdom of his Father.',
    Mark: 'At the Last Supper Jesus institutes the bread and the cup — this is my body, this is my blood of the new testament shed for many; he will not drink of the vine again until that day in the kingdom of God.',
    Luke: 'At the Last Supper Jesus takes the cup, gives thanks, and says he will not drink of the fruit of the vine until the kingdom of God comes; then he gives the bread — this is my body given for you — and the cup, the new testament in his blood shed for them.',
  };

  adds.push({
    targetSubcat: 1,
    eventKey,
    primaryRef: primaryLabel,
    text: textByBook[primaryAbbr] || cat9Teaching?.text || '',
    quote,
    references: sortRefs(refs),
    sourcedFromCat9: cat9Id,
    note: filler.note,
  });
}

// ── Re-verify each plan teaching's quote against jesusText ──────────────────

function verifyQuote(t) {
  const primary = t.references.find(r => r.isPrimary) || t.references[0];
  if (!primary) return { ok: false, note: 'no primary' };
  const joined = joinedJesusText(verseIdx, primary.bookAbbr, primary.chapter, primary.ranges);
  if (!joined) return { ok: false, note: 'primary range has no jesusText' };
  // Soft check — cat-27 quotes were hand-edited. Just record the source-truth
  // joinedJesusText so the validator can warn on drift.
  return { ok: true, sourceJoined: joined };
}

for (const t of planTeachings) {
  t.quoteVerification = verifyQuote(t);
}
for (const a of adds) {
  a.quoteVerification = verifyQuote(a);
}

// ── Build the merge plan ────────────────────────────────────────────────────

const merges = Object.values(buckets)
  .filter(b => b.absorbed.length > 0)
  .map(b => ({ survivor: b.canonicalId, absorbed: b.absorbed }));

const plan = {
  generatedAt: new Date().toISOString(),
  decisions: {
    canonicalRule: 'Matthew > Mark > Luke > John (decision 1)',
    subcat27_2_rename: 'Gethsemane -> Gethsemane and Arrest (decision 3)',
    farewellExclusion: 'John 13–17 fragments removed from cat-27; thematic homes (cat-11/12/13) untouched (decision 5)',
    institutionGapFillers: 'cat-9 stays canonical; 3 narrative copies surfaced in 27.1 (decision 4)',
  },
  merges,
  moves,
  removes: removeIds,
  adds,
  teachings: planTeachings,
};

fs.writeFileSync(outPath, JSON.stringify(plan, null, 2), 'utf8');
console.log(`Plan -> ${path.relative(repoRoot, outPath)}`);
console.log(`  surviving teachings : ${planTeachings.length}`);
console.log(`  merges              : ${merges.length} (absorbing ${merges.reduce((n, m) => n + m.absorbed.length, 0)} ids)`);
console.log(`  moves               : ${moves.length}`);
console.log(`  removes             : ${removeIds.length}`);
console.log(`  adds (gap-fillers)  : ${adds.length}`);
