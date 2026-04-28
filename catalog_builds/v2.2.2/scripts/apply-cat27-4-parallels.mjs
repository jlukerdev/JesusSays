#!/usr/bin/env node
/**
 * apply-cat27-4-parallels.mjs
 *
 * v2.2.2 patch: insert "Father, forgive them" (Luke 23:34) as the new 27.4.1
 * and renumber existing 27.4.1–27.4.6 to 27.4.2–27.4.7. Patch the renumbered
 * 27.4.7 ("Father, into thy hands I commend my spirit") with parallel refs
 * to Matt 27:50 and Mark 15:37 (Luke 23:46 stays primary — content-quoting
 * exception).
 *
 * Reads:
 *   catalog_builds/teachings_v2.json   (input — never mutated)
 *
 * Writes:
 *   v2.2.2/output/teachings_v2_2_2.json
 *   v2.2.2/reports/cat-27-4-patch-summary.json
 *   v2.2.2/reports/redirects.json
 *
 * All categories other than cat-27 pass through byte-identical.
 * Subcats 27.1, 27.2, 27.3 also pass through byte-identical.
 * Only 27.4 changes.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// catalog_builds/v2.2.2/scripts -> catalog_builds
const buildsRoot = path.resolve(__dirname, '..', '..');
const repoRoot   = path.resolve(buildsRoot, '..');

const inputPath        = path.join(buildsRoot, 'teachings_v2.json');
const outputPath       = path.join(__dirname, '..', 'output',  'teachings_v2_2_2.json');
const summaryPath      = path.join(__dirname, '..', 'reports', 'cat-27-4-patch-summary.json');
const redirectsPath    = path.join(__dirname, '..', 'reports', 'redirects.json');

// ── Reference sort: primary first, then Matt > Mark > Luke > John, then ch/v ─
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

// ── Build a teaching object with the catalog's existing field order ─────────
// Existing 27.4 entries use: id, text, tags, references, quote
function buildTeaching({ id, text, tags, references, quote }) {
  return {
    id,
    text,
    tags,
    references,
    quote,
  };
}

// ── Load input ──────────────────────────────────────────────────────────────
const inputText = fs.readFileSync(inputPath, 'utf8');
const data      = JSON.parse(inputText);

// ── Locate cat-27 ───────────────────────────────────────────────────────────
const c27Index = data.categories.findIndex(c => c.id === 27 || c.id === 'cat-27' || c.slug === 'cat-27');
if (c27Index !== 26) {
  throw new Error(`Expected cat-27 at index 26; found at index ${c27Index}`);
}
const c27 = data.categories[c27Index];
if (!c27) throw new Error('cat-27 not found');

// ── Locate subcat 27.4 ──────────────────────────────────────────────────────
const s274Index = c27.subcategories.findIndex(s => s.id === '27.4');
if (s274Index !== 3) {
  throw new Error(`Expected subcat 27.4 at index 3; found at index ${s274Index}`);
}
const s274 = c27.subcategories[s274Index];
if (s274.title !== 'Words from the Cross') {
  throw new Error(`Expected subcat 27.4 title "Words from the Cross"; got "${s274.title}"`);
}

const beforeCount = s274.teachings.length;
if (beforeCount !== 6) {
  throw new Error(`Expected 6 teachings in 27.4 before patching; got ${beforeCount}`);
}

// ── Build the new 27.4.1 entry ──────────────────────────────────────────────
const newFirstTeaching = buildTeaching({
  id: '27.4.1',
  text: 'From the cross Jesus prays for those who are crucifying him, asking the Father to forgive them on the ground that they do not understand what they are doing — extending mercy to his executioners at the very moment of his suffering.',
  tags: [],
  references: [
    {
      label: 'Luke 23:34',
      book: 'Luke',
      bookAbbr: 'Luke',
      chapter: 23,
      ranges: [[34, 34]],
      isPrimary: true,
    },
  ],
  quote: 'Father, forgive them; for they know not what they do.',
});

// ── Renumber existing teachings ─────────────────────────────────────────────
const renumberMap = {};
const renumbered = s274.teachings.map((t, idx) => {
  const oldId = t.id;
  const newId = `27.4.${idx + 2}`; // shift +1
  renumberMap[oldId] = newId;
  return buildTeaching({
    id: newId,
    text: t.text,
    tags: t.tags,
    references: t.references,
    quote: t.quote,
  });
});

// ── Patch new 27.4.7 ("Father, into thy hands I commend my spirit") ─────────
const target = renumbered[renumbered.length - 1]; // new 27.4.7 (was 27.4.6)
if (target.id !== '27.4.7') {
  throw new Error(`Expected last renumbered teaching id 27.4.7; got ${target.id}`);
}
if (target.quote !== 'Father, into thy hands I commend my spirit:') {
  throw new Error(`Expected 27.4.7 quote to be the commendation of spirit; got "${target.quote}"`);
}

// Ensure existing Luke 23:46 stays primary
const existingLuke = target.references.find(r => r.bookAbbr === 'Luke' && r.chapter === 23);
if (!existingLuke) throw new Error('Expected existing Luke 23:46 ref on 27.4.7');
existingLuke.isPrimary = true;

const refsAdded = [
  {
    label: 'Matt 27:50',
    book: 'Matthew',
    bookAbbr: 'Matt',
    chapter: 27,
    ranges: [[50, 50]],
    isPrimary: false,
  },
  {
    label: 'Mark 15:37',
    book: 'Mark',
    bookAbbr: 'Mark',
    chapter: 15,
    ranges: [[37, 37]],
    isPrimary: false,
  },
];

target.references = sortRefs([...target.references, ...refsAdded]);

// ── Assemble new teachings array ────────────────────────────────────────────
const newTeachings = [newFirstTeaching, ...renumbered];

// ── Sanity checks ───────────────────────────────────────────────────────────
if (newTeachings.length !== 7) {
  throw new Error(`Expected 7 teachings after patching; got ${newTeachings.length}`);
}
for (let i = 0; i < newTeachings.length; i++) {
  const expected = `27.4.${i + 1}`;
  if (newTeachings[i].id !== expected) {
    throw new Error(`Teaching at index ${i} expected id ${expected}; got ${newTeachings[i].id}`);
  }
}

const t1 = newTeachings[0];
const t1Primary = t1.references.find(r => r.isPrimary);
if (!t1Primary || t1Primary.label !== 'Luke 23:34') {
  throw new Error('New 27.4.1 must have primary ref Luke 23:34');
}

const t7 = newTeachings[6];
if (t7.references.length !== 3) {
  throw new Error(`27.4.7 must have 3 refs; got ${t7.references.length}`);
}
const t7Primary = t7.references.find(r => r.isPrimary);
if (!t7Primary || t7Primary.label !== 'Luke 23:46') {
  throw new Error('27.4.7 primary ref must be Luke 23:46');
}
const labels = t7.references.map(r => r.label);
if (!labels.includes('Matt 27:50')) throw new Error('27.4.7 must include Matt 27:50');
if (!labels.includes('Mark 15:37')) throw new Error('27.4.7 must include Mark 15:37');

// ── Build patched catalog ───────────────────────────────────────────────────
const newSubcat274 = {
  ...s274,
  teachings: newTeachings,
};

const newC27Subcats = c27.subcategories.map((s, i) => i === s274Index ? newSubcat274 : s);
const newC27 = {
  ...c27,
  subcategories: newC27Subcats,
};

const patched = {
  ...data,
  categories: data.categories.map((c, i) => i === c27Index ? newC27 : c),
};

// ── Cross-check: every other category & every other 27.x subcat unchanged ───
const unchangedCategoryIds = [];
for (let i = 0; i < data.categories.length; i++) {
  if (i === c27Index) continue;
  const before = JSON.stringify(data.categories[i]);
  const after  = JSON.stringify(patched.categories[i]);
  if (before !== after) {
    throw new Error(`Category at index ${i} (id ${data.categories[i].id}) changed unexpectedly`);
  }
  unchangedCategoryIds.push(data.categories[i].id);
}

for (let j = 0; j < c27.subcategories.length; j++) {
  if (j === s274Index) continue;
  const before = JSON.stringify(c27.subcategories[j]);
  const after  = JSON.stringify(patched.categories[c27Index].subcategories[j]);
  if (before !== after) {
    throw new Error(`Subcat ${c27.subcategories[j].id} changed unexpectedly`);
  }
}

// ── Write outputs ───────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(outputPath),    { recursive: true });
fs.mkdirSync(path.dirname(summaryPath),   { recursive: true });
fs.mkdirSync(path.dirname(redirectsPath), { recursive: true });

fs.writeFileSync(outputPath, JSON.stringify(patched, null, 2) + '\n', 'utf8');

const generatedAt = new Date().toISOString();

const summary = {
  generatedAt,
  inputPath:  path.relative(repoRoot, inputPath).replaceAll(path.sep, '/'),
  outputPath: path.relative(repoRoot, outputPath).replaceAll(path.sep, '/'),
  decisions: {
    placement: 'Option B — insert Luke 23:34 as new 27.4.1; renumber existing 27.4.1–27.4.6 to 27.4.2–27.4.7',
    primaryFor_27_4_7: 'Luke 23:46 (content-quoting exception — Luke is the only gospel quoting the words). Matt 27:50 and Mark 15:37 added as non-primary parallels.',
    duplicationOfLuke23_34: 'Intentional: Luke 23:34 also lives at 18.2.4; left alone.',
    tagsForNewEntry: '[] (empty, consistent with other 27.4 entries)',
  },
  newTeaching: newFirstTeaching,
  renumberMap,
  refsAddedTo_27_4_7: refsAdded,
  counts: {
    cat274_before: beforeCount,
    cat274_after:  newTeachings.length,
  },
  unchangedCategoryIds,
  unchangedCat27Subcats: c27.subcategories
    .filter((_, j) => j !== s274Index)
    .map(s => s.id),
};
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');

const redirectsList = Object.entries(renumberMap).map(([from, to]) => ({ from, to }));
const redirectsDoc = {
  generatedAt,
  description: 'Maps every cat-27.4 teaching id that shifted during the v2.2.2 cleanup. New 27.4.1 (Luke 23:34) has no predecessor.',
  redirects: redirectsList,
};
fs.writeFileSync(redirectsPath, JSON.stringify(redirectsDoc, null, 2) + '\n', 'utf8');

// ── Stdout summary ──────────────────────────────────────────────────────────
console.log('cat-27.4 parallel-passages patch (v2.2.2) — done');
console.log(`  input            : ${path.relative(repoRoot, inputPath).replaceAll(path.sep, '/')}`);
console.log(`  patched catalog  : ${path.relative(repoRoot, outputPath).replaceAll(path.sep, '/')}`);
console.log(`  patch summary    : ${path.relative(repoRoot, summaryPath).replaceAll(path.sep, '/')}`);
console.log(`  redirects        : ${path.relative(repoRoot, redirectsPath).replaceAll(path.sep, '/')}`);
console.log(`  27.4 teachings   : ${beforeCount} -> ${newTeachings.length}`);
console.log(`  refs on 27.4.7   : ${t7.references.map(r => `${r.label}${r.isPrimary ? '*' : ''}`).join(', ')}  (* = primary)`);
console.log(`  redirects written: ${redirectsList.length}`);
