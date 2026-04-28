// Triage script for the `text` field on every teaching in public/teachings.json.
// READ-ONLY with respect to teachings.json. Emits scripts/text-cleanup-worklist.json
// and prints a human-readable summary.
//
// Run: node scripts/triage-text-cleanup.mjs
//
// Flags:
//   KJV       — text contains KJV-isms (thou/thee/thy/...) as whole words
//   LONG      — text.length > 140
//   VERY_LONG — text.length > 180
//   OVERLAP   — >=70% of summary content words also appear in the quote

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const TEACHINGS_PATH = path.join(REPO_ROOT, 'public', 'teachings.json');
const WORKLIST_PATH = path.join(REPO_ROOT, 'scripts', 'text-cleanup-worklist.json');

const KJV_WORDS = [
  'thou', 'thee', 'thy', 'thine', 'ye', 'hath', 'hast', 'shalt',
  'cometh', 'goeth', 'saith', 'verily', 'wist', 'wherefore', 'unto',
  'dost', 'doth', 'art',
];
const KJV_REGEX = new RegExp(`\\b(?:${KJV_WORDS.join('|')})\\b`, 'i');

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'in', 'on', 'to', 'for',
  'with', 'at', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'he', 'she', 'it', 'they', 'them', 'his', 'her',
  'their', 'this', 'that', 'these', 'those', 'who', 'whom', 'which',
  'what', 'when', 'where', 'why', 'how', 'not', 'no', 'nor', 'so',
  'if', 'then', 'than',
]);

const LONG_THRESHOLD = 140;
const VERY_LONG_THRESHOLD = 180;
const OVERLAP_THRESHOLD = 0.7;

function contentWords(s) {
  if (!s) return [];
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function computeFlags(text, quote) {
  const flags = [];
  const t = text || '';
  if (KJV_REGEX.test(t)) flags.push('KJV');
  if (t.length > LONG_THRESHOLD) flags.push('LONG');
  if (t.length > VERY_LONG_THRESHOLD) flags.push('VERY_LONG');

  const summaryWords = contentWords(t);
  if (summaryWords.length > 0 && quote) {
    const quoteSet = new Set(contentWords(quote));
    const hits = summaryWords.filter((w) => quoteSet.has(w)).length;
    const ratio = hits / summaryWords.length;
    if (ratio >= OVERLAP_THRESHOLD) flags.push('OVERLAP');
  }
  return flags;
}

function quotePreview(quote) {
  if (!quote) return '';
  const q = quote.replace(/\s+/g, ' ').trim();
  return q.length <= 120 ? q : q.slice(0, 120) + '…';
}

// Numeric-aware comparator for hierarchical IDs like "1.2.10"
function compareIds(a, b) {
  const av = a.split('.').map((n) => parseInt(n, 10));
  const bv = b.split('.').map((n) => parseInt(n, 10));
  const len = Math.max(av.length, bv.length);
  for (let i = 0; i < len; i++) {
    const ai = av[i] ?? 0;
    const bi = bv[i] ?? 0;
    if (ai !== bi) return ai - bi;
  }
  return 0;
}

async function main() {
  const raw = await readFile(TEACHINGS_PATH, 'utf8');
  const data = JSON.parse(raw);

  const rows = [];
  const byCategory = {};
  let totalTeachings = 0;
  const byFlag = { KJV: 0, LONG: 0, VERY_LONG: 0, OVERLAP: 0 };

  for (const cat of data.categories || []) {
    const catKey = String(cat.id);
    if (!byCategory[catKey]) byCategory[catKey] = { total: 0, flagged: 0 };
    for (const sub of cat.subcategories || []) {
      for (const teaching of sub.teachings || []) {
        totalTeachings++;
        byCategory[catKey].total++;
        const flags = computeFlags(teaching.text, teaching.quote);
        if (flags.length === 0) continue;
        byCategory[catKey].flagged++;
        for (const f of flags) byFlag[f]++;
        rows.push({
          id: teaching.id,
          categoryId: cat.id,
          categoryTitle: cat.title,
          subcategoryTitle: sub.title,
          len: (teaching.text || '').length,
          flags,
          text: teaching.text || '',
          quotePreview: quotePreview(teaching.quote),
        });
      }
    }
  }

  rows.sort((a, b) => compareIds(a.id, b.id));

  const out = {
    summary: {
      totalTeachings,
      flagged: rows.length,
      byFlag,
      byCategory,
    },
    rows,
  };

  await writeFile(WORKLIST_PATH, JSON.stringify(out, null, 2), 'utf8');

  // Human-readable stdout summary
  console.log('--- text-cleanup triage ---');
  console.log(`Total teachings: ${totalTeachings}`);
  console.log(`Total flagged:   ${rows.length}`);
  console.log('Flag counts (a teaching can have multiple flags):');
  for (const [flag, count] of Object.entries(byFlag)) {
    console.log(`  ${flag.padEnd(10)} ${count}`);
  }
  console.log('\nPer-category (id : flagged / total):');
  const catIds = Object.keys(byCategory).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  for (const cid of catIds) {
    const c = byCategory[cid];
    console.log(`  cat-${cid.padEnd(3)} ${String(c.flagged).padStart(3)} / ${String(c.total).padStart(3)}`);
  }
  console.log(`\nWorklist written to: ${path.relative(REPO_ROOT, WORKLIST_PATH)}`);
}

main().catch((err) => {
  console.error('Triage failed:', err);
  process.exit(1);
});
