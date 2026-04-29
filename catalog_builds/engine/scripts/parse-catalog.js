/**
 * parse-catalog.js
 *
 * Standard catalog reader. Loads public/teachings.json and exposes loadCatalog()
 * for other scripts to import. Also runs as a CLI tool for outline and stats output.
 *
 * Usage:
 *   node catalog_builds/engine/scripts/parse-catalog.js
 *   node catalog_builds/engine/scripts/parse-catalog.js --stats
 *   node catalog_builds/engine/scripts/parse-catalog.js --json
 *   node catalog_builds/engine/scripts/parse-catalog.js --stats --json
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const CATALOG_PATH = join(__dirname, '../../../public/teachings.json');

/**
 * Load and parse the catalog from disk.
 * @returns {object} The full teachings.json object
 */
export function loadCatalog() {
  return JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
}

/**
 * Compute aggregate statistics for a catalog object.
 * @param {object} catalog
 * @returns {{ totalCategories, totalSubcategories, totalTeachings, totalParables }}
 */
export function catalogStats(catalog) {
  let totalSubcategories = 0;
  let totalTeachings = 0;
  let totalParables = 0;
  for (const cat of catalog.categories) {
    totalSubcategories += cat.subcategories.length;
    for (const sub of cat.subcategories) {
      totalTeachings += sub.teachings.length;
      for (const t of sub.teachings) {
        if (t.tags.includes('parable')) totalParables++;
      }
    }
  }
  return {
    totalCategories: catalog.categories.length,
    totalSubcategories,
    totalTeachings,
    totalParables,
  };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const statsMode = args.includes('--stats');

  const catalog = loadCatalog();

  if (statsMode) {
    const stats = catalogStats(catalog);
    if (jsonMode) {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      console.log(`Categories:    ${stats.totalCategories}`);
      console.log(`Subcategories: ${stats.totalSubcategories}`);
      console.log(`Teachings:     ${stats.totalTeachings}`);
      console.log(`Parables:      ${stats.totalParables}`);
    }
  } else {
    // Outline mode
    if (jsonMode) {
      const outline = {
        meta: catalog.meta,
        categories: catalog.categories.map(cat => ({
          id: cat.id,
          slug: cat.slug,
          title: cat.title,
          subcategories: cat.subcategories.map(sub => ({
            id: sub.id,
            slug: sub.slug,
            title: sub.title,
            count: sub.teachings.length,
          })),
        })),
      };
      console.log(JSON.stringify(outline, null, 2));
    } else {
      for (const cat of catalog.categories) {
        console.log(`\n[${cat.id}] ${cat.title}`);
        for (const sub of cat.subcategories) {
          console.log(`  [${sub.id}] ${sub.title} (${sub.teachings.length} teachings)`);
        }
      }
      const stats = catalogStats(catalog);
      console.log(`\n─────────────────────────────────────`);
      console.log(`Total: ${stats.totalCategories} categories · ${stats.totalSubcategories} subcategories · ${stats.totalTeachings} teachings · ${stats.totalParables} parables`);
    }
  }
}
