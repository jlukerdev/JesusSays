/**
 * validate-catalog.js
 *
 * Schema + structural linter for public/teachings.json.
 * Checks required fields, ID sequence integrity, slug format, reference integrity.
 * Exits with code 1 if any errors are found.
 *
 * Usage:
 *   node catalog_builds/engine/scripts/validate-catalog.js
 *   node catalog_builds/engine/scripts/validate-catalog.js --json
 */

import { fileURLToPath } from 'url';
import { loadCatalog } from './parse-catalog.js';

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validate the catalog and return a structured findings report.
 * @param {object} catalog
 * @returns {{ errors: Array, warnings: Array }}
 */
export function validateCatalog(catalog) {
  const errors = [];
  const warnings = [];

  const err = (level, path, message) => {
    if (level === 'error') errors.push({ level, path, message });
    else warnings.push({ level, path, message });
  };

  // ── Meta ──────────────────────────────────────────────────────────────────
  if (!catalog.meta) err('error', 'meta', 'Missing top-level "meta" object');
  else {
    if (!catalog.meta.version) err('error', 'meta.version', 'Missing "version" field — must be a semver-like string (e.g. "1.2")');
    else if (typeof catalog.meta.version !== 'string') err('error', 'meta.version', `"version" must be a string, got ${typeof catalog.meta.version}`);
  }
  if (!Array.isArray(catalog.categories)) {
    err('error', 'categories', 'Missing or non-array "categories" field');
    return { errors, warnings };
  }

  // ── Categories ────────────────────────────────────────────────────────────
  catalog.categories.forEach((cat, ci) => {
    const catPath = `categories[${ci}]`;
    const expectedCatId = ci + 1;

    // Required fields
    if (cat.id === undefined) err('error', catPath, 'Missing "id"');
    else if (cat.id !== expectedCatId) err('error', catPath, `id should be ${expectedCatId}, got ${cat.id}`);

    if (!cat.slug) err('error', catPath, 'Missing "slug"');
    else if (cat.slug !== `cat-${expectedCatId}`) err('error', catPath, `slug should be "cat-${expectedCatId}", got "${cat.slug}"`);

    if (!cat.title) err('error', catPath, 'Missing "title"');

    if (!cat.uid) err('warning', catPath, 'Missing "uid" — run apply-schema-uid.cjs to stamp stable identifiers');
    else if (typeof cat.uid !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cat.uid)) err('warning', catPath, `"uid" is not a valid UUID v4: "${cat.uid}"`);
    if (!Array.isArray(cat.subcategories)) {
      err('error', catPath, 'Missing or non-array "subcategories"');
      return;
    }

    // ── Subcategories ──────────────────────────────────────────────────────
    cat.subcategories.forEach((sub, si) => {
      const subPath = `${catPath}.subcategories[${si}]`;
      const expectedSubId = `${expectedCatId}.${si + 1}`;
      const expectedSubSlug = `cat-${expectedCatId}-${si + 1}`;

      if (!sub.id) err('error', subPath, 'Missing "id"');
      else if (sub.id !== expectedSubId) err('error', subPath, `id should be "${expectedSubId}", got "${sub.id}"`);

      if (!sub.slug) err('error', subPath, 'Missing "slug"');
      else if (sub.slug !== expectedSubSlug) err('error', subPath, `slug should be "${expectedSubSlug}", got "${sub.slug}"`);

      if (!sub.title) err('error', subPath, 'Missing "title"');

      if (!sub.uid) err('warning', subPath, 'Missing "uid" — run apply-schema-uid.cjs to stamp stable identifiers');
      else if (typeof sub.uid !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sub.uid)) err('warning', subPath, `"uid" is not a valid UUID v4: "${sub.uid}"`);
      if (!Array.isArray(sub.teachings)) {
        err('error', subPath, 'Missing or non-array "teachings"');
        return;
      }

      // ── Teachings ────────────────────────────────────────────────────────
      sub.teachings.forEach((teaching, ti) => {
        const tPath = `${subPath}.teachings[${ti}]`;
        const expectedTId = `${expectedSubId}.${ti + 1}`;

        if (!teaching.id) err('error', tPath, 'Missing "id"');
        else if (teaching.id !== expectedTId) err('error', tPath, `id should be "${expectedTId}", got "${teaching.id}"`);

        if (!teaching.uid) err('warning', tPath, 'Missing "uid" — run apply-schema-uid.cjs to stamp stable identifiers');
        else if (typeof teaching.uid !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(teaching.uid)) err('warning', tPath, `"uid" is not a valid UUID v4: "${teaching.uid}"`);

        if (!teaching.text || teaching.text.trim() === '') err('error', tPath, 'Missing or empty "text"');
        else if (teaching.text.trim().length < 20) err('warning', tPath, `text is very short (${teaching.text.length} chars): "${teaching.text}"`);

        if (teaching.quote === undefined) err('warning', tPath, 'Missing "quote" field (required since v2)');
        else if (teaching.quote !== null && teaching.quote.trim() === '') err('warning', tPath, '"quote" is empty string');

        if (!Array.isArray(teaching.tags)) err('error', tPath, '"tags" must be an array');

        if (!Array.isArray(teaching.references)) {
          err('error', tPath, '"references" must be an array');
          return;
        }
        if (teaching.references.length === 0) err('warning', tPath, 'Teaching has no references');

        // Exactly one isPrimary
        const primaryCount = teaching.references.filter(r => r.isPrimary === true).length;
        if (primaryCount === 0) err('error', tPath, 'No reference marked isPrimary: true');
        else if (primaryCount > 1) err('error', tPath, `${primaryCount} references marked isPrimary: true — must be exactly 1`);

        // Reference field checks
        teaching.references.forEach((ref, ri) => {
          const refPath = `${tPath}.references[${ri}]`;
          if (!ref.label) err('error', refPath, 'Missing "label"');
          if (!ref.book) err('error', refPath, 'Missing "book"');
          if (!ref.bookAbbr) err('error', refPath, 'Missing "bookAbbr"');
          if (ref.chapter === undefined || ref.chapter === null) err('error', refPath, 'Missing "chapter"');
          else if (!Number.isInteger(ref.chapter) || ref.chapter < 1) err('error', refPath, `"chapter" must be a positive integer, got ${ref.chapter}`);

          if (!Array.isArray(ref.ranges)) {
            err('error', refPath, '"ranges" must be an array');
          } else {
            if (ref.ranges.length === 0) err('warning', refPath, '"ranges" is empty');
            ref.ranges.forEach((range, rri) => {
              const rangePath = `${refPath}.ranges[${rri}]`;
              if (!Array.isArray(range) || range.length !== 2) {
                err('error', rangePath, 'Each range must be a 2-element array [start, end]');
              } else {
                const [start, end] = range;
                if (!Number.isInteger(start) || start < 1) err('error', rangePath, `range start must be a positive integer, got ${start}`);
                if (!Number.isInteger(end) || end < 1) err('error', rangePath, `range end must be a positive integer, got ${end}`);
                if (start > end) err('error', rangePath, `range start (${start}) > end (${end})`);
              }
            });
          }

          if (ref.isPrimary === undefined) err('error', refPath, 'Missing "isPrimary" field');
          else if (typeof ref.isPrimary !== 'boolean') err('error', refPath, `"isPrimary" must be boolean, got ${typeof ref.isPrimary}`);
        });
      });
    });
  });

  return { errors, warnings };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');

  const catalog = loadCatalog();
  const { errors, warnings } = validateCatalog(catalog);

  const summary = {
    errors: errors.length,
    warnings: warnings.length,
    passed: errors.length === 0,
  };

  if (jsonMode) {
    console.log(JSON.stringify({ errors, warnings, summary }, null, 2));
  } else {
    if (errors.length > 0) {
      console.error(`\n✗ ERRORS (${errors.length}):`);
      errors.forEach(e => console.error(`  [${e.path}] ${e.message}`));
    }
    if (warnings.length > 0) {
      console.warn(`\n⚠ WARNINGS (${warnings.length}):`);
      warnings.forEach(w => console.warn(`  [${w.path}] ${w.message}`));
    }
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✓ Catalog is valid — no errors or warnings.');
    } else if (errors.length === 0) {
      console.log(`\n✓ No errors. ${warnings.length} warning(s).`);
    } else {
      console.log(`\n✗ Validation failed: ${errors.length} error(s), ${warnings.length} warning(s).`);
    }
  }

  process.exit(errors.length > 0 ? 1 : 0);
}
