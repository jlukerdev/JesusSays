#!/usr/bin/env node
/**
 * apply-summaries.mjs
 *
 * Reads a summary-rewrite mapping JSON and updates the `text` field of each
 * matching teaching in public/teachings.json, keyed by the stable `uid`.
 *
 * After applying, runs renumber.js then validate-catalog.js to honor the
 * standard catalog-engine close-out workflow.
 *
 * Usage (from project root):
 *   node catalog_builds/engine/summary_rewrite/apply-summaries.mjs [options]
 *
 * Options:
 *   --mapping <path>     Path to mapping JSON (default: ./output/summary-rewrite.json relative to script)
 *   --catalog <path>     Path to catalog JSON  (default: public/teachings.json)
 *   --dry-run            Compute and report changes but do not write
 *   --include-review     Apply entries with needsReview: true (default: skip them)
 *   --force              Apply even when current text does not equal entry.old (catalog drift)
 *   --skip-postchecks    Skip running renumber.js + validate-catalog.js after writing
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..', '..', '..');

function parseArgs(argv) {
  const args = {
    mapping: resolve(__dirname, 'output', 'summary-rewrite.json'),
    catalog: resolve(projectRoot, 'public', 'teachings.json'),
    dryRun: false,
    includeReview: false,
    force: false,
    skipPostchecks: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--include-review') args.includeReview = true;
    else if (a === '--force') args.force = true;
    else if (a === '--skip-postchecks') args.skipPostchecks = true;
    else if (a === '--mapping') args.mapping = resolve(argv[++i]);
    else if (a === '--catalog') args.catalog = resolve(argv[++i]);
    else if (a === '-h' || a === '--help') {
      process.stdout.write(usage());
      process.exit(0);
    } else {
      process.stderr.write(`unknown arg: ${a}\n`);
      process.exit(2);
    }
  }
  return args;
}

function usage() {
  return `apply-summaries.mjs — apply teaching-summary rewrites by uid\n\n` +
    `Options:\n` +
    `  --mapping <path>      mapping JSON (default: output/summary-rewrite.json)\n` +
    `  --catalog <path>      catalog JSON (default: public/teachings.json)\n` +
    `  --dry-run             show changes without writing\n` +
    `  --include-review      apply entries flagged needsReview: true\n` +
    `  --force               apply even when current text != entry.old\n` +
    `  --skip-postchecks     skip renumber + validate after writing\n`;
}

function buildUidIndex(catalog) {
  const index = new Map();
  for (const cat of catalog.categories) {
    for (const sub of cat.subcategories) {
      for (const t of sub.teachings) {
        if (t.uid) index.set(t.uid, t);
      }
    }
  }
  return index;
}

function main() {
  const args = parseArgs(process.argv);

  const mapping = JSON.parse(readFileSync(args.mapping, 'utf8'));
  if (!Array.isArray(mapping.entries)) {
    throw new Error(`mapping has no "entries" array: ${args.mapping}`);
  }

  const catalog = JSON.parse(readFileSync(args.catalog, 'utf8'));
  const byUid = buildUidIndex(catalog);

  const result = {
    applied: [],
    skippedReview: [],
    skippedDrift: [],
    notFound: [],
    unchanged: [],
  };

  for (const entry of mapping.entries) {
    if (!entry.uid || !entry.new) {
      throw new Error(`entry missing uid or new: ${JSON.stringify(entry)}`);
    }
    if (entry.needsReview && !args.includeReview) {
      result.skippedReview.push(entry);
      continue;
    }
    const teaching = byUid.get(entry.uid);
    if (!teaching) {
      result.notFound.push(entry);
      continue;
    }
    if (teaching.text === entry.new) {
      result.unchanged.push(entry);
      continue;
    }
    if (entry.old != null && teaching.text !== entry.old && !args.force) {
      result.skippedDrift.push({
        entry,
        currentText: teaching.text,
      });
      continue;
    }
    if (!args.dryRun) {
      teaching.text = entry.new;
    }
    result.applied.push(entry);
  }

  const summaryLine = (label, items) => `  ${label}: ${items.length}`;
  process.stdout.write(`apply-summaries — mapping=${args.mapping}\n`);
  process.stdout.write(`${summaryLine('applied', result.applied)}\n`);
  process.stdout.write(`${summaryLine('skipped (needsReview)', result.skippedReview)}\n`);
  process.stdout.write(`${summaryLine('skipped (catalog drift)', result.skippedDrift)}\n`);
  process.stdout.write(`${summaryLine('not found by uid', result.notFound)}\n`);
  process.stdout.write(`${summaryLine('already up to date', result.unchanged)}\n`);

  if (result.skippedDrift.length) {
    process.stdout.write(`\nDrift detected for ${result.skippedDrift.length} entries (use --force to override):\n`);
    for (const { entry, currentText } of result.skippedDrift) {
      process.stdout.write(`  ${entry.uid} (${entry.id})\n`);
      process.stdout.write(`    expected old: ${JSON.stringify(entry.old)}\n`);
      process.stdout.write(`    actual text:  ${JSON.stringify(currentText)}\n`);
    }
  }
  if (result.notFound.length) {
    process.stdout.write(`\nUIDs not found in catalog:\n`);
    for (const e of result.notFound) {
      process.stdout.write(`  ${e.uid} (${e.id})\n`);
    }
  }

  if (args.dryRun) {
    process.stdout.write(`\n[dry-run] no files written\n`);
    return;
  }

  if (result.applied.length === 0) {
    process.stdout.write(`\nNo changes to write.\n`);
    return;
  }

  writeFileSync(args.catalog, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  process.stdout.write(`\nWrote ${args.catalog}\n`);

  if (args.skipPostchecks) {
    process.stdout.write(`[skip-postchecks] not running renumber/validate\n`);
    return;
  }

  process.stdout.write(`\nRunning renumber.js…\n`);
  execFileSync('node', ['catalog_builds/engine/scripts/renumber.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  process.stdout.write(`\nRunning validate-catalog.js…\n`);
  execFileSync('node', ['catalog_builds/engine/scripts/validate-catalog.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
}

main();
