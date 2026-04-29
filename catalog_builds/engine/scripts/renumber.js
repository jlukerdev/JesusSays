/**
 * renumber.js
 *
 * CLI write script. Reads public/teachings.json, runs renumberCatalog()
 * from src/utils/renumber.js, validates the result, and writes it back.
 *
 * This is the ONLY script in the engine that writes to the catalog.
 * Always runs validate-catalog logic after writing and reports pass/fail.
 * Exits with code 1 if post-renumber validation fails.
 *
 * Usage:
 *   node catalog_builds/engine/scripts/renumber.js
 *   node catalog_builds/engine/scripts/renumber.js --dry-run   (preview changes, no write)
 *   node catalog_builds/engine/scripts/renumber.js --json      (machine-readable output)
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { CATALOG_PATH } from './parse-catalog.js';
import { validateCatalog } from './validate-catalog.js';
import { renumberCatalog, stripHidden } from '../../../src/utils/renumber.js';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const jsonMode = args.includes('--json');

  // ── Read ──────────────────────────────────────────────────────────────────
  let catalog;
  try {
    catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  } catch (e) {
    const msg = `Failed to read catalog: ${e.message}`;
    if (jsonMode) console.log(JSON.stringify({ success: false, error: msg }));
    else console.error(`✗ ${msg}`);
    process.exit(1);
  }

  // ── Strip hidden, then renumber ──────────────────────────────────────────
  const stripped = stripHidden(catalog);
  const renumbered = renumberCatalog(stripped);

  // ── Validate ──────────────────────────────────────────────────────────────
  const { errors, warnings } = validateCatalog(renumbered);

  if (errors.length > 0) {
    const msg = `Renumbered catalog has ${errors.length} validation error(s). Aborting write.`;
    if (jsonMode) {
      console.log(JSON.stringify({ success: false, error: msg, errors, warnings }));
    } else {
      console.error(`\n✗ ${msg}`);
      errors.forEach(e => console.error(`  [${e.path}] ${e.message}`));
    }
    process.exit(1);
  }

  // ── Write (unless dry-run) ────────────────────────────────────────────────
  if (!dryRun) {
    try {
      writeFileSync(CATALOG_PATH, JSON.stringify(renumbered, null, 2) + '\n', 'utf8');
    } catch (e) {
      const msg = `Failed to write catalog: ${e.message}`;
      if (jsonMode) console.log(JSON.stringify({ success: false, error: msg }));
      else console.error(`✗ ${msg}`);
      process.exit(1);
    }
  }

  // ── Report ────────────────────────────────────────────────────────────────
  const stats = {
    categories: renumbered.categories.length,
    subcategories: renumbered.categories.reduce((n, c) => n + c.subcategories.length, 0),
    teachings: renumbered.categories.reduce((n, c) =>
      n + c.subcategories.reduce((m, s) => m + s.teachings.length, 0), 0),
  };

  if (jsonMode) {
    console.log(JSON.stringify({
      success: true,
      dryRun,
      written: !dryRun,
      stats,
      warnings: warnings.length,
    }));
  } else {
    if (dryRun) {
      console.log('── DRY RUN — no file was written ──');
    } else {
      console.log(`✓ Catalog renumbered and written to ${CATALOG_PATH}`);
    }
    console.log(`  Categories:    ${stats.categories}`);
    console.log(`  Subcategories: ${stats.subcategories}`);
    console.log(`  Teachings:     ${stats.teachings}`);
    if (warnings.length > 0) {
      console.warn(`  ⚠ ${warnings.length} warning(s) — run validate-catalog.js for details`);
    } else {
      console.log(`  ✓ Validation passed`);
    }
  }
}
