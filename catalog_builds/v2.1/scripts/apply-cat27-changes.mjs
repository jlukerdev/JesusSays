#!/usr/bin/env node
/**
 * apply-cat27-changes.mjs
 *
 * Reads public/teachings.json (does NOT mutate the live file) and the
 * cat-27-parallel-plan.json. Produces a fully patched catalog containing:
 *   - merges (parallel refs absorbed)
 *   - removes (John 13 farewell fragments per decision 5)
 *   - moves between subcats
 *   - subcat 27.2 renamed "Gethsemane" -> "Gethsemane and Arrest"
 *   - decision-4 institution-words gap-fillers added to 27.1
 *   - contiguous renumber within each affected subcat
 *
 * Outputs:
 *   output/teachings.cat27-patched.json   (entire catalog, only cat-27 changed)
 *   reports/redirects.json                (old id -> new id; null for removed)
 *
 * Pure transformation: cat-1 .. cat-26 and cat-28 .. cat-31 are passed through
 * untouched.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '../../..');

const catalogPath = path.join(repoRoot, 'public', 'teachings.json');
const planPath    = path.join(__dirname, '..', 'reports', 'cat-27-parallel-plan.json');
const outPath     = path.join(__dirname, '..', 'output',  'teachings.cat27-patched.json');
const redirectsPath = path.join(__dirname, '..', 'reports', 'redirects.json');

const SUBCAT_TITLE_OVERRIDES = {
  '27.2': 'Gethsemane and Arrest',
};

const SUBCAT_DESCRIPTION_OVERRIDES = {
  // Keep existing descriptions unless explicitly changed. Setting null means leave as-is.
  '27.2': null,
};

// Sort references in cat-9 / cat-27 friendly order
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

// ── Load inputs ─────────────────────────────────────────────────────────────

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const plan    = JSON.parse(fs.readFileSync(planPath,    'utf8'));

const c27 = catalog.categories.find(c => c.slug === 'cat-27');
if (!c27) { console.error('cat-27 not found'); process.exit(1); }

// ── Build new cat-27 from the plan ──────────────────────────────────────────

// Collect base teachings into target subcats (1, 2, 3) preserving plan order.
//
// We assemble per-subcat lists in *plan order* (which is canonical-row order
// from the diagnosis), then renumber contiguously.

const bySubcat = { 1: [], 2: [], 3: [] };

for (const t of plan.teachings) {
  bySubcat[t.targetSubcat].push({
    text: t.text,
    quote: t.quote,
    references: sortRefs(t.references),
    _oldId: t.canonicalId,
    _absorbed: t.absorbed,
  });
}

// Decision 4: institution-words gap-fillers — append to 27.1 in plan order
for (const a of plan.adds) {
  bySubcat[a.targetSubcat].push({
    text: a.text,
    quote: a.quote,
    references: sortRefs(a.references),
    _oldId: null,
    _addNote: a.note,
    _sourcedFromCat9: a.sourcedFromCat9,
  });
}

// Original primary teachings within a subcat were placed in plan order; sort
// each subcat's list by the canonical's primary ref book/chapter/verse so the
// reading order in cat-27 is narratively coherent.

function primaryOf(t) { return t.references.find(r => r.isPrimary) || t.references[0]; }
function refSortKey(r) { return [GOSPEL_RANK[r.bookAbbr] ?? 99, r.chapter, r.ranges[0]?.[0] ?? 0]; }

for (const subId of [1, 2, 3]) {
  bySubcat[subId].sort((a, b) => {
    const ka = refSortKey(primaryOf(a));
    const kb = refSortKey(primaryOf(b));
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] !== kb[i]) return ka[i] - kb[i];
    }
    return 0;
  });
}

// Renumber contiguously
const redirects = {};
const newSubcats = c27.subcategories.map(s => {
  const subN = parseInt(s.id.split('.')[1], 10);
  const list = bySubcat[subN] || [];
  const newTeachings = list.map((t, idx) => {
    const newId = `27.${subN}.${idx + 1}`;
    if (t._oldId && t._oldId !== newId) redirects[t._oldId] = newId;
    if (t._oldId === newId) {
      // unchanged identity; still record so front-end has a complete map
      redirects[t._oldId] = newId;
    }
    if (t._absorbed) {
      for (const absorbedId of t._absorbed) redirects[absorbedId] = newId;
    }
    return {
      id: newId,
      text: t.text,
      quote: t.quote,
      tags: [],
      references: t.references,
    };
  });

  return {
    id: s.id,
    slug: s.slug,
    title: SUBCAT_TITLE_OVERRIDES[s.id] ?? s.title,
    teachings: newTeachings,
  };
});

// Removed teachings (John 13 fragments per decision 5)
for (const removedId of plan.removes) {
  redirects[removedId] = null;
}

// ── Replace cat-27 in the catalog and write ─────────────────────────────────

const newCat27 = {
  ...c27,
  // refresh sources/description if needed (sources unchanged: Matt/Mark/Luke/John)
  subcategories: newSubcats,
};

const patched = {
  ...catalog,
  categories: catalog.categories.map(c => c.slug === 'cat-27' ? newCat27 : c),
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(patched, null, 2), 'utf8');
fs.mkdirSync(path.dirname(redirectsPath), { recursive: true });
fs.writeFileSync(redirectsPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  description: 'Maps every cat-27 teaching id that changed/was removed during the v2.1 cleanup. null means the teaching no longer exists in cat-27.',
  redirects,
}, null, 2), 'utf8');

// ── Report ──────────────────────────────────────────────────────────────────
const totalAfter = newSubcats.reduce((n, s) => n + s.teachings.length, 0);
console.log(`Patched catalog -> ${path.relative(repoRoot, outPath)}`);
console.log(`Redirects       -> ${path.relative(repoRoot, redirectsPath)}`);
console.log(`  cat-27 teachings before: ${c27.subcategories.reduce((n, s) => n + s.teachings.length, 0)}`);
console.log(`  cat-27 teachings after : ${totalAfter}`);
for (const s of newSubcats) {
  console.log(`    ${s.id} ${s.title} : ${s.teachings.length}`);
}
console.log(`  redirect entries: ${Object.keys(redirects).length}`);
