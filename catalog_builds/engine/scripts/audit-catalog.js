/**
 * audit-catalog.js
 *
 * Thematic audit tool. Flags potential data quality issues including:
 *   - Teachings with short or empty text
 *   - Teachings missing the "quote" field (required since v2)
 *   - Teachings with no references
 *   - Untagged parable candidates (text/quote signals a narrative analogy but no "parable" tag)
 *   - Duplicate-looking teachings (same teaching in multiple subcategories via cross-classification)
 *
 * Usage:
 *   node catalog_builds/engine/scripts/audit-catalog.js
 *   node catalog_builds/engine/scripts/audit-catalog.js --json
 *   node catalog_builds/engine/scripts/audit-catalog.js --type missing-quote
 *   node catalog_builds/engine/scripts/audit-catalog.js --type parable-candidates
 */

import { fileURLToPath } from 'url';
import { loadCatalog } from './parse-catalog.js';

// ─── Patterns that suggest a teaching is a parable ───────────────────────────
const PARABLE_SIGNALS = [
  /parable of/i,
  /parable about/i,
  /likened? to/i,
  /compared? to a/i,
  /compared? to the kingdom/i,
  /kingdom of heaven? (is like|may be compared to)/i,
  /kingdom of god (is like|may be compared to)/i,
  /a certain (man|woman|king|father|farmer|merchant|shepherd|sower)/i,
  /there was a (man|woman|king|father|farmer|merchant|shepherd|sower|rich)/i,
];

function looksLikeParable(teaching) {
  if (teaching.tags.includes('parable')) return false; // already tagged
  const combined = [teaching.text, teaching.quote].filter(Boolean).join(' ');
  return PARABLE_SIGNALS.some(re => re.test(combined));
}

// ─── Auditor ─────────────────────────────────────────────────────────────────

/**
 * Run all audit checks and return a findings report.
 * @param {object} catalog
 * @returns {{ findings: Array, summary: object }}
 */
export function auditCatalog(catalog) {
  const findings = [];
  const textIndex = new Map(); // text → first teaching id (for duplicate detection)

  const find = (type, teachingId, location, message) => {
    findings.push({ type, teachingId, location, message });
  };

  for (const cat of catalog.categories) {
    for (const sub of cat.subcategories) {
      for (const t of sub.teachings) {
        const loc = `${cat.title} > ${sub.title}`;

        // Short or empty text
        if (!t.text || t.text.trim().length === 0) {
          find('empty-text', t.id, loc, 'Teaching has no text summary');
        } else if (t.text.trim().length < 20) {
          find('short-text', t.id, loc, `Text is very short (${t.text.length} chars): "${t.text}"`);
        }

        // Missing quote field
        if (t.quote === undefined) {
          find('missing-quote', t.id, loc, 'Teaching has no "quote" field (required since v2)');
        } else if (t.quote !== null && t.quote.trim() === '') {
          find('empty-quote', t.id, loc, 'Teaching has an empty string "quote" (should be null or populated)');
        }

        // No references
        if (!t.references || t.references.length === 0) {
          find('no-references', t.id, loc, 'Teaching has no scripture references');
        }

        // Untagged parable candidate
        if (looksLikeParable(t)) {
          find('parable-candidate', t.id, loc, `Teaching text signals a parable but lacks the "parable" tag: "${t.text.substring(0, 80)}"`);
        }

        // Duplicate text detection (same summary text in different subcategories)
        const normalizedText = t.text.trim().toLowerCase();
        if (textIndex.has(normalizedText)) {
          const firstId = textIndex.get(normalizedText);
          if (firstId !== t.id) {
            find('duplicate-text', t.id, loc, `Duplicate text match with teaching ${firstId}: "${t.text.substring(0, 60)}"`);
          }
        } else {
          textIndex.set(normalizedText, t.id);
        }
      }
    }
  }

  // Summary by type
  const typeCounts = {};
  for (const f of findings) {
    typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
  }

  return {
    findings,
    summary: {
      total: findings.length,
      byType: typeCounts,
    },
  };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const typeFilter = (() => {
    const idx = args.indexOf('--type');
    return idx !== -1 ? args[idx + 1] : null;
  })();

  const catalog = loadCatalog();
  let { findings, summary } = auditCatalog(catalog);

  if (typeFilter) {
    findings = findings.filter(f => f.type === typeFilter);
    summary = {
      total: findings.length,
      byType: typeFilter ? { [typeFilter]: findings.length } : summary.byType,
    };
  }

  if (jsonMode) {
    console.log(JSON.stringify({ findings, summary }, null, 2));
  } else {
    if (findings.length === 0) {
      console.log('✓ No audit findings' + (typeFilter ? ` of type "${typeFilter}"` : '') + '.');
    } else {
      const typeGroups = {};
      for (const f of findings) {
        if (!typeGroups[f.type]) typeGroups[f.type] = [];
        typeGroups[f.type].push(f);
      }
      for (const [type, items] of Object.entries(typeGroups)) {
        console.log(`\n── ${type.toUpperCase()} (${items.length}) ──`);
        for (const f of items) {
          console.log(`  [${f.teachingId}] ${f.location}`);
          console.log(`    ${f.message}`);
        }
      }
      console.log(`\n─────────────────────────────────────`);
      console.log(`Total findings: ${summary.total}`);
      for (const [type, count] of Object.entries(summary.byType)) {
        console.log(`  ${type}: ${count}`);
      }
    }
  }
}
