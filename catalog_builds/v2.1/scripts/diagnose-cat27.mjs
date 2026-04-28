#!/usr/bin/env node
/**
 * diagnose-cat27.mjs
 *
 * Read-only diagnosis of cat-27 (The Passion Narrative).
 *
 * Walks every teaching in cat-27 and emits one row per teaching containing:
 *   - id, subcat, primaryRef, currentQuote
 *   - eventKeyGuess (from a hand-authored seed map of primary-ref -> event key)
 *   - candidateParallelEvents (other event keys that share at least one Gospel verse range)
 *   - suggestedDisposition (keep | merge-into:<id> | move-subcat:<n> | remove-from-cat27 | gap-filler-needed)
 *
 * Output: catalog_builds/v2.1/reports/cat-27-diagnosis.json
 *
 * No mutation. Pure reporting.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '../../..');

const catalogPath = path.join(repoRoot, 'public', 'teachings.json');
const outPath     = path.join(__dirname, '..', 'reports', 'cat-27-diagnosis.json');

// ── Seed map: primary ref string -> event key ────────────────────────────────
//
// Event keys group teachings that describe the same narrative event so that
// later passes can merge duplicates (decision 1) or move them between subcats
// (decision 3). Where ranges differ slightly between teachings on the same
// event, we still group them under one key.
//
// Special tokens used in the disposition column below:
//   - "remove-from-cat27": John 13:18-21, 26-27, 38 fragments belong to the
//     farewell discourse (decision 5). They stay catalogued under cats 11-13;
//     do not duplicate inside cat-27.

const SEED_EVENTS = {
  // Last Supper week — approach to Passover
  'Matt 26:2'        : { key: 'passion-foretold-passover',      subcat: 1 },
  'Matt 26:10–13'    : { key: 'anointing-bethany',              subcat: 1 },
  'Mark 14:6–9'      : { key: 'anointing-bethany',              subcat: 1 },
  'Matt 26:18'       : { key: 'prepare-passover',               subcat: 1 },
  'Mark 14:13–15'    : { key: 'prepare-passover',               subcat: 1 },
  'Luke 22:8'        : { key: 'prepare-passover',               subcat: 1 },
  'Luke 22:10–12'    : { key: 'prepare-passover',               subcat: 1 },

  // At the Last Supper — betrayal foretold and identified
  'Matt 26:21'       : { key: 'betrayal-foretold',              subcat: 1 },
  'Mark 14:18'       : { key: 'betrayal-foretold',              subcat: 1 },
  'Luke 22:21–22'    : { key: 'betrayal-foretold',              subcat: 1 },
  'Matt 26:23–25'    : { key: 'betrayer-identified',            subcat: 1 },
  'Mark 14:20–21'    : { key: 'betrayer-identified',            subcat: 1 },

  // Peter's denial warning
  'Mark 14:27–28'    : { key: 'shepherd-smitten',               subcat: 1 },
  'Matt 26:31–32'    : { key: 'shepherd-smitten',               subcat: 1 }, // mis-filed in 27.2 currently
  'Mark 14:30'       : { key: 'peter-denial-warning',           subcat: 1 },
  'Matt 26:34'       : { key: 'peter-denial-warning',           subcat: 1 }, // mis-filed in 27.2
  'Luke 22:34–38'    : { key: 'peter-denial-warning',           subcat: 1 },

  // John 13 farewell fragments — decision 5: remove from cat-27
  'John 13:18–21'    : { key: 'farewell-discourse-fragment',    subcat: 2 },
  'John 13:26–27'    : { key: 'farewell-discourse-fragment',    subcat: 2 },
  'John 13:38'       : { key: 'farewell-discourse-fragment',    subcat: 2 },

  // Gethsemane and arrest — decision 3: subcat 27.2 expansion
  'Matt 26:50'       : { key: 'judas-greeting',                 subcat: 2 },
  'Matt 26:52–56'    : { key: 'sword-saying',                   subcat: 2 },
  'Mark 14:48–49'    : { key: 'arrest-confront-mob',            subcat: 2 }, // currently in 27.3 — move to 27.2
  'Luke 22:48'       : { key: 'judas-kiss',                     subcat: 2 }, // currently in 27.3 — move to 27.2
  'Luke 22:51–53'    : { key: 'arrest-confront-mob',            subcat: 2 }, // currently in 27.3 — move to 27.2
  'John 18:4'        : { key: 'whom-seek-ye',                   subcat: 2 }, // currently in 27.3 — move to 27.2
  'John 18:11'       : { key: 'sword-saying',                   subcat: 2 }, // currently in 27.3 — move to 27.2

  // Trial — high priest and Pilate
  'John 18:20–21'    : { key: 'caiaphas-spoke-openly',          subcat: 3 },
  'John 18:23'       : { key: 'caiaphas-why-smitest',           subcat: 3 },
  'Mark 14:72'       : { key: 'peter-denial-warning',           subcat: 1 }, // flashback to Mark 14:30 — bible_datasets marks jesusIsSpeaking=true

  // Pilate — "King of the Jews"
  'Matt 27:11'       : { key: 'pilate-king-jews',               subcat: 3 },
  'Mark 15:2'        : { key: 'pilate-king-jews',               subcat: 3 },
  'Luke 23:3'        : { key: 'pilate-king-jews',               subcat: 3 },
  'John 18:34'       : { key: 'pilate-of-thyself',              subcat: 3 },
  'John 19:11'       : { key: 'pilate-no-power',                subcat: 3 },

  // Road to Calvary
  'Luke 23:28–31'    : { key: 'daughters-jerusalem',            subcat: 3 },
};

// Where existing subcat differs from suggested home (decision 3 moves)
const SUGGESTED_SUBCAT_FOR_KEY = {
  'shepherd-smitten':       1, // Matt 26:31-32 currently in 27.2 — belongs in 27.1
  'peter-denial-warning':   1, // Matt 26:34 currently in 27.2 — belongs in 27.1
  'arrest-confront-mob':    2, // Mark 14:48-49 / Luke 22:51-53 currently in 27.3
  'judas-kiss':             2, // Luke 22:48 currently in 27.3
  'whom-seek-ye':           2, // John 18:4 currently in 27.3
  'sword-saying':           2, // John 18:11 currently in 27.3 (Matt already in 27.2)
};

// Canonical-primary picking rule per decision 1: Matthew, Mark, Luke, John.
const GOSPEL_RANK = { Matt: 1, Mark: 2, Luke: 3, John: 4 };

// ── Helpers ──────────────────────────────────────────────────────────────────

function primaryRefOf(teaching) {
  return teaching.references.find(r => r.isPrimary) || teaching.references[0];
}

function refLabel(ref) {
  return ref ? ref.label : '(no ref)';
}

function subcatNumber(subId) {
  // subcat id like "27.2" -> 2
  return parseInt(subId.split('.')[1], 10);
}

// ── Main ─────────────────────────────────────────────────────────────────────

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const c27 = catalog.categories.find(c => c.slug === 'cat-27');
if (!c27) {
  console.error('cat-27 not found in catalog');
  process.exit(1);
}

// Pass 1: enumerate teachings + assign event keys
const rows = [];
for (const sub of c27.subcategories) {
  const subN = subcatNumber(sub.id);
  for (const t of sub.teachings) {
    const pr = primaryRefOf(t);
    const seed = SEED_EVENTS[pr?.label];
    rows.push({
      id: t.id,
      subcat: subN,
      primaryRef: refLabel(pr),
      bookAbbr: pr?.bookAbbr,
      currentQuote: t.quote || '',
      currentText: t.text || '',
      eventKeyGuess: seed?.key ?? `unmapped::${pr?.label ?? t.id}`,
      seedExpectedSubcat: seed?.subcat ?? null,
    });
  }
}

// Pass 2: candidateParallelEvents — for each row, list other event keys whose
// teachings cover the same Gospel/chapter (informational, low-precision).
const byKey = {};
for (const r of rows) {
  if (!byKey[r.eventKeyGuess]) byKey[r.eventKeyGuess] = [];
  byKey[r.eventKeyGuess].push(r);
}

// Pass 3: dispositions
//
// Logic:
//  - John 13 farewell fragments and the narration-only Mark 14:72 are flagged
//    "remove-from-cat27".
//  - For each event key with multiple teachings: pick canonical by Gospel rank,
//    others get "merge-into:<canonical>".
//  - If the row's current subcat differs from the suggested subcat, append
//    "+ move-subcat:<n>".
//  - Singletons that match seed -> "keep" (or "+ move-subcat:<n>").
//  - Unmapped rows -> "needs-review".
const REMOVE_KEYS = new Set([
  'farewell-discourse-fragment',
]);

function pickCanonical(group) {
  // Earliest Gospel by GOSPEL_RANK; tiebreak by lowest existing id.
  const sorted = [...group].sort((a, b) => {
    const ra = GOSPEL_RANK[a.bookAbbr] ?? 99;
    const rb = GOSPEL_RANK[b.bookAbbr] ?? 99;
    if (ra !== rb) return ra - rb;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
  return sorted[0];
}

const canonicalByKey = {};
for (const [key, group] of Object.entries(byKey)) {
  if (REMOVE_KEYS.has(key)) continue;
  if (key.startsWith('unmapped::')) continue;
  canonicalByKey[key] = pickCanonical(group).id;
}

for (const r of rows) {
  const dispositions = [];
  if (REMOVE_KEYS.has(r.eventKeyGuess)) {
    dispositions.push('remove-from-cat27');
  } else if (r.eventKeyGuess.startsWith('unmapped::')) {
    dispositions.push('needs-review');
  } else {
    const canonId = canonicalByKey[r.eventKeyGuess];
    if (canonId && canonId !== r.id) {
      dispositions.push(`merge-into:${canonId}`);
    } else {
      dispositions.push('keep');
    }
  }

  // Subcat moves (decision 3) — applies to keep AND merge dispositions
  // because the merge target may also need to move.
  const expected = SUGGESTED_SUBCAT_FOR_KEY[r.eventKeyGuess] ?? r.seedExpectedSubcat;
  if (expected && expected !== r.subcat
      && !dispositions[0].startsWith('remove-')
      && !dispositions[0].startsWith('needs-')) {
    dispositions.push(`move-subcat:${expected}`);
  }

  r.candidateParallelEvents = (byKey[r.eventKeyGuess] || [])
    .filter(o => o.id !== r.id)
    .map(o => ({ id: o.id, ref: o.primaryRef }));
  r.suggestedDisposition = dispositions.join(' + ');
}

// Decision 4: cat-9 institution words also need to surface in 27.1.
// Document this as gap-filler-needed entries (no source rows in cat-27 yet).
const GAP_FILLERS = [
  {
    id: 'gap-filler-1',
    subcat: 1,
    primaryRef: 'Matt 26:26–29',
    sourceCat: '9.1.2 / 9.1.3 / 9.1.4',
    suggestedDisposition: 'gap-filler-needed',
    note: 'Decision 4: institution-of-Lords-Supper teaching for Matthew (cat-9 stays canonical).',
  },
  {
    id: 'gap-filler-2',
    subcat: 1,
    primaryRef: 'Mark 14:22–25',
    sourceCat: '9.1.2 / 9.1.3 / 9.1.4',
    suggestedDisposition: 'gap-filler-needed',
    note: 'Decision 4: institution words — Mark parallel.',
  },
  {
    id: 'gap-filler-3',
    subcat: 1,
    primaryRef: 'Luke 22:17–20',
    sourceCat: '9.1.1 / 9.1.2 / 9.1.3 / 9.1.4',
    suggestedDisposition: 'gap-filler-needed',
    note: 'Decision 4: institution words — Luke parallel (covers cup-before, bread, cup-after).',
  },
];

// Tally
const summary = {
  totalTeachings: rows.length,
  bySubcat: { 1: 0, 2: 0, 3: 0 },
  byDisposition: {},
};
for (const r of rows) {
  summary.bySubcat[r.subcat]++;
  const key = r.suggestedDisposition.split(' + ')[0];
  summary.byDisposition[key] = (summary.byDisposition[key] || 0) + 1;
}

const out = {
  generatedAt: new Date().toISOString(),
  source: 'public/teachings.json (cat-27 only)',
  summary,
  rows,
  gapFillers: GAP_FILLERS,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

console.log(`Diagnosis -> ${path.relative(repoRoot, outPath)}`);
console.log(`  Total teachings  : ${rows.length}`);
console.log(`  By subcat        : 27.1=${summary.bySubcat[1]}  27.2=${summary.bySubcat[2]}  27.3=${summary.bySubcat[3]}`);
console.log(`  By disposition   : ${JSON.stringify(summary.byDisposition)}`);
