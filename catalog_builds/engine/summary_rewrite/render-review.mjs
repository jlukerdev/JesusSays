#!/usr/bin/env node
/**
 * render-review.mjs
 *
 * Renders the consolidated review markdown file from the mapping JSON.
 * Includes only entries with needsReview: true. Grouped by review reason,
 * then by category. Each entry shows old vs. new text, the primary reference,
 * verse span, tags, and a checkbox for approval.
 *
 * Usage (from project root):
 *   node catalog_builds/engine/summary_rewrite/render-review.mjs [options]
 *
 * Options:
 *   --mapping <path>   Path to mapping JSON (default: output/summary-rewrite.json)
 *   --out <path>       Path to write the markdown (default: output/summary-rewrite-review.md)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {
    mapping: resolve(__dirname, 'output', 'summary-rewrite.json'),
    out: resolve(__dirname, 'output', 'summary-rewrite-review.md'),
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mapping') args.mapping = resolve(argv[++i]);
    else if (a === '--out') args.out = resolve(argv[++i]);
    else if (a === '-h' || a === '--help') {
      process.stdout.write(`render-review.mjs — render review markdown from mapping JSON\n`);
      process.exit(0);
    } else {
      process.stderr.write(`unknown arg: ${a}\n`);
      process.exit(2);
    }
  }
  return args;
}

const REASON_HEADINGS = {
  'parable': 'Parables',
  'long-passage': 'Long Passages (>10 verses)',
  'structural-change': 'Large Structural Change (>70%)',
};

function pickPrimaryReason(reasons) {
  for (const r of ['parable', 'long-passage', 'structural-change']) {
    if (reasons.includes(r)) return r;
  }
  return reasons[0] || 'other';
}

function renderEntry(entry) {
  const tagStr = entry.tags && entry.tags.length ? ` · tags: ${entry.tags.join(', ')}` : '';
  return [
    `### ${entry.id} — ${entry.subcategoryTitle}`,
    ``,
    `- **uid:** \`${entry.uid}\``,
    `- **Category:** ${entry.categoryTitle}`,
    `- **Primary reference:** ${entry.primaryRef} (${entry.verseSpan} verse${entry.verseSpan === 1 ? '' : 's'})${tagStr}`,
    `- **Review reasons:** ${entry.reviewReasons.join(', ')}`,
    ``,
    `**Old:**`,
    ``,
    `> ${entry.old}`,
    ``,
    `**New:**`,
    ``,
    `> ${entry.new}`,
    ``,
    `- [ ] Approved as written`,
    `- [ ] Needs edit (note below):`,
    ``,
    `---`,
    ``,
  ].join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const mapping = JSON.parse(readFileSync(args.mapping, 'utf8'));
  const flagged = mapping.entries.filter((e) => e.needsReview);

  const lines = [];
  lines.push(`# Summary Rewrite — Review Queue`);
  lines.push(``);
  lines.push(`- **Phase:** ${mapping.phase || 'unspecified'}`);
  lines.push(`- **Generated:** ${mapping.generatedAt || ''}`);
  lines.push(`- **Total entries in mapping:** ${mapping.entries.length}`);
  lines.push(`- **Flagged for review:** ${flagged.length}`);
  lines.push(``);
  lines.push(`Review each entry below; check **Approved as written** or note required edits.`);
  lines.push(`To apply, run \`node catalog_builds/engine/summary_rewrite/apply-summaries.mjs --include-review\` once approved.`);
  lines.push(``);

  if (flagged.length === 0) {
    lines.push(`_No entries currently flagged for review._`);
    writeFileSync(args.out, lines.join('\n') + '\n', 'utf8');
    process.stdout.write(`Wrote ${args.out} (0 flagged entries)\n`);
    return;
  }

  const groups = new Map();
  for (const entry of flagged) {
    const reason = pickPrimaryReason(entry.reviewReasons || []);
    if (!groups.has(reason)) groups.set(reason, []);
    groups.get(reason).push(entry);
  }

  const orderedReasons = ['parable', 'long-passage', 'structural-change']
    .filter((r) => groups.has(r))
    .concat([...groups.keys()].filter((r) => !['parable', 'long-passage', 'structural-change'].includes(r)));

  for (const reason of orderedReasons) {
    const heading = REASON_HEADINGS[reason] || reason;
    const entries = groups.get(reason).slice().sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
    lines.push(`## ${heading} (${entries.length})`);
    lines.push(``);
    for (const entry of entries) {
      lines.push(renderEntry(entry));
    }
  }

  writeFileSync(args.out, lines.join('\n').trimEnd() + '\n', 'utf8');
  process.stdout.write(`Wrote ${args.out} (${flagged.length} flagged entries)\n`);
}

main();
