#!/usr/bin/env node
/**
 * B6 Taxonomy Compliance — automated checks
 * Runs checks A-G and outputs JSON findings to stdout.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.resolve(__dirname, '../../public/teachings.json');
// Strip BOM if present
let catalogRaw = fs.readFileSync(CATALOG_PATH, 'utf-8');
if (catalogRaw.charCodeAt(0) === 0xFEFF) catalogRaw = catalogRaw.slice(1);
const catalog = JSON.parse(catalogRaw);

const VALID_BOOK_ABBRS = new Set(['Matt', 'Mark', 'Luke', 'John', 'Acts', '1Cor', '2Cor', 'Rev']);
const VALID_TAGS = new Set(['parable', 'i-am', 'healing', 'prayer', 'prophecy', 'woe', 'blessing']);
const GOVERNED_TAGS = new Set(['parable']);

// B5 canonical parables (38 as of post-B5 state)
const CANONICAL_PARABLE_IDS = new Set([
  '4.1.1','4.1.2','4.1.3','4.1.4','4.1.5','4.1.6','4.1.11',
  '4.2.1','4.2.2','4.2.3','4.2.5','4.5.1','4.5.2','4.5.3',
  '5.1.4','5.2.1','5.2.2','5.2.3',
  '9.3.1',
  '10.3.2','10.3.3',
  '13.1.2',
  '14.6.2',
  '15.3.1','15.3.2','15.3.3',
  '18.1.3','18.2.3',
  '20.2.1','20.3.3','20.3.4',
  '21.3.2',
  '22.2.4',
  '24.2.3',
  '29.3.2','29.3.3','29.3.6','29.4.1'
]);

const findings = [];
let findingSeq = 1;

function addFinding(severity, check, teachingId, location, refs, description, ruleNote, proposed) {
  const id = `F-B6${String(findingSeq++).padStart(3, '0')}`;
  findings.push({ id, severity, check, teachingId, location, refs, description, ruleNote, proposed, status: 'OPEN' });
}

// Flatten all teachings
const allTeachings = [];
for (const cat of catalog.categories) {
  for (const sub of cat.subcategories) {
    for (const t of sub.teachings) {
      allTeachings.push({ teaching: t, cat, sub });
    }
  }
}

// ─── CHECK A — Subcategory volume ────────────────────────────────────────────
for (const cat of catalog.categories) {
  for (const sub of cat.subcategories) {
    const count = sub.teachings.length;
    if (count === 0) {
      addFinding(
        'WARNING',
        'B6-CheckA-SubcatVolume',
        null,
        `Cat ${cat.id} "${cat.title}" > "${sub.title}"`,
        [],
        `Subcategory has 0 teachings.`,
        'TAXONOMY_STANDARDS.md Part 1: ≥3 teachings required for a subcategory to stand alone.',
        'Delete subcategory or populate it.'
      );
    } else if (count < 3) {
      addFinding(
        'INFO',
        'B6-CheckA-SubcatVolume',
        null,
        `Cat ${cat.id} "${cat.title}" > "${sub.title}"`,
        [],
        `Subcategory has only ${count} teaching${count === 1 ? '' : 's'} (below the 3-teaching threshold).`,
        'TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.',
        'Consider merging into an adjacent subcategory if themes overlap.'
      );
    }
  }
}

// ─── CHECK B — Text field format ─────────────────────────────────────────────
for (const { teaching, cat, sub } of allTeachings) {
  const text = teaching.text || '';
  const location = `Cat ${cat.id} "${cat.title}" > "${sub.title}" > teaching ${teaching.id}`;

  if (text.startsWith('"') || text.startsWith('\u201c') || text.startsWith('\u2018')) {
    addFinding(
      'WARNING',
      'B6-CheckB-TextField',
      teaching.id,
      location,
      [],
      `text field starts with a quotation mark: "${text.slice(0, 60)}..."`,
      'TAXONOMY_STANDARDS.md: text is an editorial summary, not a direct scripture quote.',
      'Rewrite as a third-person summary sentence without leading quote marks.'
    );
  }

  // Check for inline scripture quotes (text contains > 80 chars of all-caps or starts looking like a KJV quote)
  // Heuristic: text longer than 200 chars may be a direct quote rather than a summary
  if (text.length > 250) {
    addFinding(
      'INFO',
      'B6-CheckB-TextField',
      teaching.id,
      location,
      [],
      `text field is unusually long (${text.length} chars) — may contain direct scripture quote rather than editorial summary.`,
      'TAXONOMY_STANDARDS.md: text should be a concise summary (≥20 chars, typically 1 sentence).',
      'Review and shorten to a true summary sentence.'
    );
  }
}

// ─── CHECK C — isPrimary source order ────────────────────────────────────────
const SYNOPTIC_GOSPELS = new Set(['Matt', 'Mark', 'Luke']);

for (const { teaching, cat, sub } of allTeachings) {
  const refs = teaching.references || [];
  if (refs.length < 2) continue;

  const hasMatt = refs.some(r => r.bookAbbr === 'Matt');
  if (!hasMatt) continue;

  const primaryRef = refs.find(r => r.isPrimary === true);
  if (!primaryRef) continue;

  // If primary is a non-Matt synoptic, and Matt is also present → REVIEW
  if (primaryRef.bookAbbr !== 'Matt' && SYNOPTIC_GOSPELS.has(primaryRef.bookAbbr)) {
    const mattRefs = refs.filter(r => r.bookAbbr === 'Matt').map(r => r.label).join(', ');
    addFinding(
      'REVIEW',
      'B6-CheckC-isPrimary',
      teaching.id,
      `Cat ${cat.id} "${cat.title}" > "${sub.title}" > teaching ${teaching.id}`,
      refs.map(r => r.label),
      `Primary reference is ${primaryRef.label} (${primaryRef.bookAbbr}), but Matt is also present (${mattRefs}). Matt should be isPrimary unless the fullest account is clearly in another gospel.`,
      'CLASSIFICATION_RULES.md: Matthew is the default primary synoptic.',
      'Review whether the fuller account is truly in the non-Matt synoptic. If not, swap isPrimary.'
    );
  }
}

// ─── CHECK D — Reference label format ────────────────────────────────────────
// Flag labels with plain hyphens between verse numbers (should be en-dash –)
const HYPHEN_RANGE_RE = /\d-\d/;

for (const { teaching, cat, sub } of allTeachings) {
  for (const ref of (teaching.references || [])) {
    if (HYPHEN_RANGE_RE.test(ref.label)) {
      addFinding(
        'INFO',
        'B6-CheckD-LabelFormat',
        teaching.id,
        `Cat ${cat.id} "${cat.title}" > "${sub.title}" > teaching ${teaching.id}`,
        [ref.label],
        `Reference label "${ref.label}" uses a plain hyphen (-) in a verse range. Should use en-dash (–).`,
        'PLAN.md B6 Check D: label format convention is "Book ch:v–v" with en-dash.',
        'Replace hyphen with en-dash (–) in the label string.'
      );
    }
  }
}

// ─── CHECK E — bookAbbr canonical values ─────────────────────────────────────
for (const { teaching, cat, sub } of allTeachings) {
  for (const ref of (teaching.references || [])) {
    if (!VALID_BOOK_ABBRS.has(ref.bookAbbr)) {
      addFinding(
        'ERROR',
        'B6-CheckE-BookAbbr',
        teaching.id,
        `Cat ${cat.id} "${cat.title}" > "${sub.title}" > teaching ${teaching.id}`,
        [ref.label || `(no label)`],
        `bookAbbr "${ref.bookAbbr}" is not a canonical value.`,
        'CLASSIFICATION_RULES.md: valid bookAbbr values: Matt | Mark | Luke | John | Acts | 1Cor | 2Cor | Rev.',
        'Fix bookAbbr to use the canonical abbreviation.'
      );
    }
  }
}

// ─── CHECK F — Unexpected tag values ─────────────────────────────────────────
for (const { teaching, cat, sub } of allTeachings) {
  const tags = teaching.tags;

  // tags must be an array
  if (!Array.isArray(tags)) {
    addFinding(
      'ERROR',
      'B6-CheckF-Tags',
      teaching.id,
      `Cat ${cat.id} "${cat.title}" > "${sub.title}" > teaching ${teaching.id}`,
      [],
      `tags field is not an array (value: ${JSON.stringify(tags)}).`,
      'TAXONOMY_STANDARDS.md: tags must be an array.',
      'Set tags to [] or a valid array.'
    );
    continue;
  }

  for (const tag of tags) {
    if (!VALID_TAGS.has(tag)) {
      addFinding(
        'ERROR',
        'B6-CheckF-Tags',
        teaching.id,
        `Cat ${cat.id} "${cat.title}" > "${sub.title}" > teaching ${teaching.id}`,
        [],
        `Unknown tag value "${tag}" in teaching ${teaching.id}.`,
        'PLAN.md B6 Check F / TAG_RULES.md: only governed/informational tags are valid.',
        `Remove or correct the tag "${tag}".`
      );
    }
  }
}

// ─── CHECK G — Duplicate text detection ──────────────────────────────────────
// Cross-list against b0-audit-output.json duplicate-text findings
const B0_AUDIT_PATH = path.resolve(__dirname, 'b0-audit-output.json');
let b0Audit = null;
if (fs.existsSync(B0_AUDIT_PATH)) {
  const buf = fs.readFileSync(B0_AUDIT_PATH);
  // Detect encoding from BOM
  let raw;
  if (buf[0] === 0xFF && buf[1] === 0xFE) {
    // UTF-16 LE
    raw = buf.slice(2).toString('utf16le');
  } else if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    // UTF-8 BOM
    raw = buf.slice(3).toString('utf-8');
  } else {
    raw = buf.toString('utf-8');
  }
  // Strip any remaining BOM chars
  raw = raw.replace(/^\uFEFF+/, '');
  b0Audit = JSON.parse(raw);
}

// Build deduplicated pairs from b0 audit (each pair will appear twice in b0 output)
const duplicatePairs = [];
const seenPairs = new Set();
if (b0Audit && b0Audit.findings) {
  for (const f of b0Audit.findings) {
    if (f.type === 'duplicate-text') {
      const match = (f.message || '').match(/with teaching ([\d.]+):/);
      const otherId = match ? match[1] : null;
      if (otherId) {
        const pairKey = [f.teachingId, otherId].sort().join('|');
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          const textSnippet = (f.message || '').replace(/.*?:\s*"(.*)"$/, '$1').slice(0, 80);
          duplicatePairs.push({ id1: f.teachingId, id2: otherId, location: f.location, textSnippet });
        }
      }
    }
  }
}

if (duplicatePairs.length > 0) {
  for (const dup of duplicatePairs) {
    addFinding(
      'REVIEW',
      'B6-CheckG-DuplicateText',
      `${dup.id1}, ${dup.id2}`,
      `${dup.id1} (${dup.location})`,
      [],
      `Duplicate text detected: teachings ${dup.id1} and ${dup.id2} share the same text. Snippet: "${dup.textSnippet}"`,
      'TAXONOMY_STANDARDS.md Part 3: duplicate resolution — classify as true duplicate (delete) or legitimate cross-listing (accept).',
      'Determine if this is intentional cross-listing or a true duplicate. If true duplicate, delete the non-primary one after renumber.'
    );
  }
} else {
  // If b0 audit not available or no duplicates recorded, note it
  findings.push({
    id: `F-B6${String(findingSeq++).padStart(3, '0')}`,
    severity: 'INFO',
    check: 'B6-CheckG-DuplicateText',
    teachingId: null,
    location: 'Global',
    refs: [],
    description: b0Audit ? 'No duplicate-text findings in b0-audit-output.json.' : 'b0-audit-output.json not found; skipping duplicate-text re-check.',
    ruleNote: 'B6 Check G',
    proposed: 'No action needed.',
    status: 'OPEN'
  });
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
const summary = { ERROR: 0, WARNING: 0, REVIEW: 0, INFO: 0 };
for (const f of findings) {
  if (f.severity in summary) summary[f.severity]++;
}

console.log(JSON.stringify({ summary, findings }, null, 2));
