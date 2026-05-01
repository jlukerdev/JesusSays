/**
 * apply-schema-uid.cjs
 *
 * Migration: add a stable `uid` (UUID v4) field to every category, subcategory,
 * and teaching object in public/teachings.json.
 *
 * The `uid` field is immutable — it is never modified by renumber.js or any
 * other script. It exists purely as a stable cross-reference identifier that
 * survives renumbering operations.
 *
 * Usage:
 *   node catalog_builds/validation/apply-schema-uid.cjs
 *   node catalog_builds/validation/apply-schema-uid.cjs --dry-run
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CATALOG_PATH = path.resolve(__dirname, '../../public/teachings.json');
const dryRun = process.argv.includes('--dry-run');

// ── Load ──────────────────────────────────────────────────────────────────────
let catalog;
try {
  catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
} catch (e) {
  console.error(`✗ Failed to read catalog: ${e.message}`);
  process.exit(1);
}

// ── Migrate ───────────────────────────────────────────────────────────────────
let catCount = 0;
let subcatCount = 0;
let teachingCount = 0;
let skipped = 0;

for (const cat of catalog.categories) {
  if (!cat.uid) {
    cat.uid = crypto.randomUUID();
    catCount++;
  } else {
    skipped++;
  }
  for (const subcat of cat.subcategories) {
    if (!subcat.uid) {
      subcat.uid = crypto.randomUUID();
      subcatCount++;
    } else {
      skipped++;
    }
    for (const teaching of subcat.teachings) {
      if (!teaching.uid) {
        teaching.uid = crypto.randomUUID();
        teachingCount++;
      } else {
        skipped++;
      }
    }
  }
}

// ── Bump meta.version ─────────────────────────────────────────────────────────
const prevVersion = catalog.meta.version;
const [major, minor] = prevVersion.split('.').map(Number);
catalog.meta.version = `${major}.${minor + 1}`;

// ── Report ─────────────────────────────────────────────────────────────────────
console.log(`uid migration:`);
console.log(`  Categories stamped:    ${catCount}`);
console.log(`  Subcategories stamped: ${subcatCount}`);
console.log(`  Teachings stamped:     ${teachingCount}`);
if (skipped > 0) console.log(`  Already had uid:       ${skipped} (skipped)`);
console.log(`  meta.version:          ${prevVersion} → ${catalog.meta.version}`);

// ── Write ──────────────────────────────────────────────────────────────────────
if (dryRun) {
  console.log('\n── DRY RUN — no file written ──');
} else {
  try {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
    console.log(`\n✓ Written to ${CATALOG_PATH}`);
  } catch (e) {
    console.error(`✗ Failed to write catalog: ${e.message}`);
    process.exit(1);
  }
}
