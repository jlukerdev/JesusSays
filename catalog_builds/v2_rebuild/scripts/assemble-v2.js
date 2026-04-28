#!/usr/bin/env node
/**
 * assemble-v2.js  (Script 6)
 *
 * Assembles teachings_v2.json from:
 *   1. catalog-with-parallels.json (Type A refs already applied)
 *   2. stubs.json (new Type B teachings)
 *   3. output/*.json (source verse files for quote backfill)
 *
 * Steps:
 *   1. Load base catalog (catalog-with-parallels.json)
 *   2. Backfill `quote` on all existing teachings from source JSON
 *   3. Normalize all bookAbbr values (1 Cor → 1Cor, 2 Cor → 2Cor)
 *   4. Insert stubs into their categories
 *   5. Build cat-31 if any stubs have suggestedCategory === 31
 *   6. Strip _stub, _gapId, _merged fields
 *   7. Update meta
 *   8. Write teachings_v2.json
 *
 * Input:  bible_datasets/reports/catalog-with-parallels.json
 *         bible_datasets/reports/stubs.json
 *         bible_datasets/output/*.json
 * Output: bible_datasets/jesussays_datasets/teachings_v2.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath   = path.resolve(__dirname, '../reports/catalog-with-parallels.json');
const stubsPath  = path.resolve(__dirname, '../reports/stubs.json');
const outputDir  = path.resolve(__dirname, '../output');
const outPath    = path.resolve(__dirname, '../jesussays_datasets/teachings_v2.json');

const catalog = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const stubs   = JSON.parse(fs.readFileSync(stubsPath, 'utf8'));

// ── 1. Load source verse files ────────────────────────────────────────────────
// Map: sourceBookAbbr (MAT etc.) → Map<`ch:vs` → jesusText[]>
const verseIndex = {};

const sourceAbbrMap = {
  Matt: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN',
  Acts: 'ACT', '1Cor': '1CO', '2Cor': '2CO', Rev: 'REV',
  '1 Cor': '1CO', '2 Cor': '2CO',
};
const sourceFiles = {
  MAT: '70_MAT.json', MRK: '71_MRK.json', LUK: '72_LUK.json',
  JHN: '73_JHN.json', ACT: '74_ACT.json', '1CO': '76_1CO.json',
  '2CO': '77_2CO.json',
};

// Find REV file — filename may differ
const outputFiles = fs.readdirSync(outputDir);
const revFile = outputFiles.find(f => /REV/i.test(f));
if (revFile) sourceFiles['REV'] = revFile;

for (const [abbr, filename] of Object.entries(sourceFiles)) {
  const filepath = path.join(outputDir, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`  ⚠ Source file not found: ${filepath}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  verseIndex[abbr] = {};
  for (const verse of data.verses) {
    if (verse.jesusIsSpeaking && verse.jesusText) {
      const key = `${verse.chapter}:${verse.verse}`;
      verseIndex[abbr][key] = verse.jesusText;
    }
  }
}

function getJesusTexts(bookAbbr, chapter, ranges) {
  const srcAbbr = sourceAbbrMap[bookAbbr] ?? bookAbbr;
  const idx = verseIndex[srcAbbr];
  if (!idx) return null;
  const texts = [];
  for (const [start, end] of ranges) {
    for (let v = start; v <= end; v++) {
      const key = `${chapter}:${v}`;
      if (idx[key]) texts.push(...idx[key]);
    }
  }
  return texts.length > 0 ? texts : null;
}

// ── 2. Normalize bookAbbr ────────────────────────────────────────────────────
function normalizeAbbr(abbr) {
  const map = { '1 Cor': '1Cor', '2 Cor': '2Cor' };
  return map[abbr] ?? abbr;
}

function normalizeRefs(refs) {
  for (const r of refs) {
    r.bookAbbr = normalizeAbbr(r.bookAbbr);
  }
}

// ── 3. Process existing teachings: backfill quote + normalize ────────────────
let quotesFilled = 0;
let quotesMissing = 0;

for (const cat of catalog.categories) {
  for (const sub of cat.subcategories) {
    for (const t of sub.teachings) {
      normalizeRefs(t.references);

      // Find primary reference for quote backfill
      const primary = t.references.find(r => r.isPrimary);
      if (!primary) {
        console.warn(`  ⚠ Teaching ${t.id} has no primary reference`);
        quotesMissing++;
        t.quote = t.quote ?? null;
        continue;
      }

      if (!t.quote) {
        const texts = getJesusTexts(primary.bookAbbr, primary.chapter, primary.ranges);
        if (texts) {
          t.quote = texts.join(' ');
          quotesFilled++;
        } else {
          console.warn(`  ⚠ No source text for teaching ${t.id} (${primary.label})`);
          t.quote = null;
          quotesMissing++;
        }
      }
    }
  }
}

console.log(`Quote backfill: ${quotesFilled} filled, ${quotesMissing} missing`);

// ── 4. Build category lookup ─────────────────────────────────────────────────
const catIndex = {};    // catId (int) → category object
const subIndex = {};    // subId (str) → subcategory object

for (const cat of catalog.categories) {
  catIndex[cat.id] = cat;
  for (const sub of cat.subcategories) {
    subIndex[sub.id] = sub;
  }
}

// ── 5. Insert stubs ──────────────────────────────────────────────────────────
// Separate cat-31 stubs from the rest
const cat31Stubs = stubs.filter(s => s.suggestedCategory === 31);
const regularStubs = stubs.filter(s => s.suggestedCategory !== 31);

let inserted = 0;
let insertWarnings = 0;

for (const stub of regularStubs) {
  if (!stub.suggestedCategory || !stub.suggestedSubcategory) {
    console.warn(`  ⚠ Stub ${stub._gapId} missing category/subcategory — skipping`);
    insertWarnings++;
    continue;
  }

  const sub = subIndex[String(stub.suggestedSubcategory)];
  if (!sub) {
    // Fallback: find by category and use first subcategory
    const cat = catIndex[stub.suggestedCategory];
    if (!cat || !cat.subcategories[0]) {
      console.warn(`  ⚠ Stub ${stub._gapId}: category ${stub.suggestedCategory} not found`);
      insertWarnings++;
      continue;
    }
    console.warn(`  ⚠ Stub ${stub._gapId}: subcat ${stub.suggestedSubcategory} not found — using first subcat of cat ${stub.suggestedCategory}`);
    const fallbackSub = cat.subcategories[0];
    const newIdx = fallbackSub.teachings.length + 1;
    const newId = `${stub.suggestedCategory}.1.${newIdx}`;
    const clean = buildClean(stub, newId);
    fallbackSub.teachings.push(clean);
    inserted++;
    continue;
  }

  const cat = catIndex[stub.suggestedCategory];
  const catId = cat.id;
  const subParts = String(stub.suggestedSubcategory).split('.');
  const subOrdinal = subParts[1] || '1';
  const newIdx = sub.teachings.length + 1;
  const newId = `${catId}.${subOrdinal}.${newIdx}`;
  const clean = buildClean(stub, newId);
  sub.teachings.push(clean);
  inserted++;
}

// ── 6. Build cat-31 ──────────────────────────────────────────────────────────
let cat31inserted = 0;
if (cat31Stubs.length > 0) {
  const subGroups = { '31.1': [], '31.2': [], '31.3': [] };

  for (const stub of cat31Stubs) {
    const subId = String(stub.suggestedSubcategory);
    if (!subGroups[subId]) subGroups[subId] = [];
    subGroups[subId].push(stub);
  }

  const cat31 = {
    id: 31,
    slug: 'cat-31',
    title: 'The Passion Narrative',
    sources: ['Matt', 'Mark', 'Luke', 'John'],
    description: 'The words of Jesus during his final hours — the Last Supper, Gethsemane, his trial, and crucifixion.',
    subcategories: [],
  };

  const subDefs = [
    { id: '31.1', slug: 'cat-31-1', title: 'The Last Supper' },
    { id: '31.2', slug: 'cat-31-2', title: 'Gethsemane' },
    { id: '31.3', slug: 'cat-31-3', title: 'The Trial and Crucifixion' },
  ];

  for (const def of subDefs) {
    const stubs31 = subGroups[def.id] || [];
    const teachings = stubs31.map((stub, i) => {
      const newId = `31.${def.id.split('.')[1]}.${i + 1}`;
      cat31inserted++;
      return buildClean(stub, newId);
    });
    cat31.subcategories.push({
      id: def.id,
      slug: def.slug,
      title: def.title,
      teachings,
    });
  }

  // Insert at position 30 (after the existing 30 categories)
  catalog.categories.splice(30, 0, cat31);
  catIndex[31] = cat31;
}

console.log(`Stubs inserted: ${inserted} regular + ${cat31inserted} cat-31, ${insertWarnings} warnings`);

// ── 7. Strip private fields ──────────────────────────────────────────────────
for (const cat of catalog.categories) {
  for (const sub of cat.subcategories) {
    for (const t of sub.teachings) {
      delete t._stub;
      delete t._gapId;
      delete t._merged;
      delete t.suggestedCategory;
      delete t.suggestedSubcategory;
    }
  }
}

// ── 8. Update meta ────────────────────────────────────────────────────────────
catalog.meta.totalCategories = catalog.categories.length;
// Update sources to include 2 Corinthians if not already there
if (!catalog.meta.sources.includes('2 Corinthians')) {
  catalog.meta.sources.push('2 Corinthians');
}

// ── 9. Write output ───────────────────────────────────────────────────────────
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf8');

// Count total teachings
const totalTeachings = catalog.categories.reduce((sum, c) =>
  sum + c.subcategories.reduce((s2, sub) => s2 + sub.teachings.length, 0), 0
);
console.log(`\n✓ teachings_v2.json written`);
console.log(`  Categories: ${catalog.categories.length}`);
console.log(`  Total teachings: ${totalTeachings}`);
console.log(`  Output: ${outPath}`);

// ── Helper ───────────────────────────────────────────────────────────────────
function buildClean(stub, newId) {
  normalizeRefs(stub.references);
  return {
    id: newId,
    text: stub.text,
    quote: stub.quote,
    tags: stub.tags || [],
    references: stub.references,
  };
}
