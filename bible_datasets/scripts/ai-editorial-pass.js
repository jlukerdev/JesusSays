#!/usr/bin/env node
/**
 * ai-editorial-pass.js
 *
 * AI editorial pass on all Type B gaps in gaps-annotated.json.
 * Fills in: text, suggestedCategory, suggestedSubcategory, tags, groupWithGapId
 *
 * Processes gaps in batches of 25, grouped by source book.
 * Calls the claude CLI for each batch.
 *
 * Usage:
 *   node bible_datasets/scripts/ai-editorial-pass.js
 *
 * Output: gaps-annotated.json updated in place
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const gapsPath = path.resolve(__dirname, '../reports/gaps-annotated.json');
const catalogPath = path.resolve(__dirname, '../../public/teachings.json');

const gapsData = JSON.parse(fs.readFileSync(gapsPath, 'utf8'));
const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// ── Few-shot examples ────────────────────────────────────────────────────────
const allTeachings = catalogData.categories.flatMap(c =>
  c.subcategories.flatMap(s => s.teachings)
);
const exampleIds = ['1.1.1', '4.1.1', '14.1.1', '22.1.1', '29.1.1'];
const examples = exampleIds.map(id => {
  const t = allTeachings.find(t => t.id === id);
  return { id: t.id, text: t.text, tags: t.tags };
});

// ── Category list ────────────────────────────────────────────────────────────
const CATEGORY_LIST = catalogData.categories.map(c => ({
  id: c.id,
  title: c.title,
  subcategories: c.subcategories.map(s => ({ id: s.id, title: s.title })),
}));
// Add cat-31 (not yet in catalog)
CATEGORY_LIST.push({
  id: 31,
  title: 'The Passion Narrative',
  subcategories: [
    { id: '31.1', title: 'The Last Supper' },
    { id: '31.2', title: 'Gethsemane' },
    { id: '31.3', title: 'The Trial and Crucifixion' },
  ],
});

const categoryListText = CATEGORY_LIST.map(c => {
  const subs = c.subcategories.map(s => `    ${s.id}: ${s.title}`).join('\n');
  return `${c.id}. ${c.title}\n${subs}`;
}).join('\n');

const BATCH_SIZE = 15;

function buildPrompt(batch) {
  const examplesJson = JSON.stringify(examples, null, 2);
  const gapsJson = JSON.stringify(batch.map(g => ({
    id: g.id,
    label: g.label,
    verseText: g.verseText,
    jesusText: g.jesusText,
    parallelGroup: g.parallelGroup,
  })), null, 2);

  return `You are building a teaching catalog of the recorded words of Jesus Christ.

For each gap below, fill in these fields:
- "text": one sentence (10-20 words) summarizing what Jesus said, in present tense, third person. Match the style of the examples.
- "suggestedCategory": integer 1-31 (see category list below)
- "suggestedSubcategory": string like "1.1", "4.2" — the subcategory id within the chosen category
- "tags": array of applicable tags from: ["parable", "healing", "i-am", "prophecy", "prayer", "blessing", "woe"]
- "groupWithGapId": if this gap should be merged with an adjacent gap id (same speech, interrupted only by narration, same chapter, within 5 verses), set this field to the gap id string. Otherwise null. Only group if the verses are thematically unified and part of the same speech unit.

STYLE EXAMPLES (match this tone and length):
${examplesJson}

CATEGORY LIST:
${categoryListText}

FRAGMENT GROUPING RULES:
- Same chapter, within 5 verses, same speaker context — consider grouping if thematically unified.
- Do NOT group if thematically distinct or from different chapters.
- Do NOT group healing pronouncements with other statements unless part of the same speech.
- Only set groupWithGapId if the other gap is also in THIS batch.

GAPS TO PROCESS:
${gapsJson}

IMPORTANT: Return ONLY a valid JSON array. No explanation, no markdown fences, no other text.
Each element must be: { "id": "gap-xxx", "text": "...", "suggestedCategory": N, "suggestedSubcategory": "N.N", "tags": [...], "groupWithGapId": null }`;
}

function callClaude(prompt) {
  // Use spawnSync with args array to avoid shell escaping issues with Bible text
  // Run from /tmp to avoid repo CLAUDE.md loading codebase context.
  // --no-session-persistence avoids session startup overhead.
  const result = spawnSync('claude', [
    '-p', prompt,
    '--output-format', 'json',
    '--no-session-persistence',
  ], { maxBuffer: 10 * 1024 * 1024, timeout: 300000, encoding: 'utf8', cwd: '/tmp' });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`claude exited ${result.status}: ${result.stderr}`);
  }

  const parsed = JSON.parse(result.stdout);
  const text = typeof parsed === 'object' && parsed.result !== undefined
    ? parsed.result
    : result.stdout;

  if (typeof text === 'string') {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  }
  return text;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const typeB = gapsData.gaps.filter(g => g.type === 'B');
console.log(`Total Type B gaps: ${typeB.length}`);

// Group by book order
const bookOrder = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'REV'];
const grouped = {};
bookOrder.forEach(b => { grouped[b] = []; });
typeB.forEach(g => {
  if (!grouped[g.sourceBook]) grouped[g.sourceBook] = [];
  grouped[g.sourceBook].push(g);
});

const results = {};
let totalProcessed = 0;
let totalErrors = 0;

for (const book of bookOrder) {
  const gaps = grouped[book] || [];
  if (gaps.length === 0) continue;
  console.log(`\nProcessing ${book}: ${gaps.length} gaps`);

  // Split into batches
  for (let i = 0; i < gaps.length; i += BATCH_SIZE) {
    const batch = gaps.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(gaps.length / BATCH_SIZE);
    console.log(`  Batch ${batchNum}/${totalBatches} (gaps ${i + 1}–${Math.min(i + BATCH_SIZE, gaps.length)})...`);

    let retries = 3;
    while (retries > 0) {
      try {
        const prompt = buildPrompt(batch);
        const batchResults = callClaude(prompt);
        batchResults.forEach(r => { results[r.id] = r; });
        totalProcessed += batch.length;
        console.log(`    ✓ Got ${batchResults.length} results`);
        break;
      } catch (err) {
        retries--;
        console.error(`    ✗ Error: ${err.message}. Retries left: ${retries}`);
        if (retries === 0) {
          totalErrors += batch.length;
          batch.forEach(g => {
            results[g.id] = {
              id: g.id,
              text: null,
              suggestedCategory: null,
              suggestedSubcategory: null,
              tags: [],
              groupWithGapId: null,
            };
          });
        }
      }
    }
  }
}

// ── Merge results back into gaps-annotated.json ──────────────────────────────
let merged = 0;
gapsData.gaps.forEach(gap => {
  if (gap.type !== 'B') return;
  const r = results[gap.id];
  if (!r) return;
  gap.text = r.text;
  gap.suggestedCategory = r.suggestedCategory;
  gap.suggestedSubcategory = r.suggestedSubcategory;
  gap.tags = r.tags || [];
  gap.groupWithGapId = r.groupWithGapId || null;
  merged++;
});

fs.writeFileSync(gapsPath, JSON.stringify(gapsData, null, 2), 'utf8');

console.log(`\n✓ Editorial pass complete.`);
console.log(`  Processed: ${totalProcessed}, Errors: ${totalErrors}, Merged: ${merged}`);
const nullText = gapsData.gaps.filter(g => g.type === 'B' && g.text === null).length;
console.log(`  Type B gaps still missing text: ${nullText}`);
