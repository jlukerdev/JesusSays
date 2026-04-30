/**
 * B1 — Global Override Compliance checks
 * G-1: John 17 <-> Cat 12
 * G-2: Passion scope <-> Cat 27 (with Farewell Discourse exception)
 * G-4: Rev 1-3 <-> Cat 31
 */

const catalog = require('../../public/teachings.json');

const findings = [];
let seq = 1;

function pad(n) { return String(n).padStart(3, '0'); }

function addFinding(batch, severity, teachingId, catId, subcatTitle, catTitle, refs, check, description, rule, proposed) {
  findings.push({
    id: `F-B1${pad(seq++)}`,
    severity,
    teachingId,
    location: `${catTitle} > ${subcatTitle}`,
    refs,
    check,
    description,
    rule,
    proposed,
  });
}

// Flatten all teachings with their category/subcategory context
function allTeachings() {
  const result = [];
  for (const cat of catalog.categories) {
    for (const subcat of cat.subcategories) {
      for (const teaching of subcat.teachings) {
        result.push({ teaching, cat, subcat });
      }
    }
  }
  return result;
}

// Helper: does a teaching have any reference matching the predicate?
function hasRef(teaching, predicate) {
  return teaching.references.some(predicate);
}

// ─────────────────────────────────────────────────────────────────────────────
// G-1: John 17 <-> Cat 12
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== G-1: John 17 <-> Cat 12 ===');

const cat12 = catalog.categories.find(c => c.id === 12);
if (!cat12) { console.error('ERROR: Category 12 not found!'); process.exit(1); }

const isJohn17Ref = r => r.bookAbbr === 'John' && r.chapter === 17;

// Forward: any teaching with John 17 ref that is NOT in Cat 12
for (const { teaching, cat, subcat } of allTeachings()) {
  if (cat.id === 12) continue; // already in Cat 12, handled in reverse
  if (hasRef(teaching, isJohn17Ref)) {
    const refLabels = teaching.references.map(r => r.label).join('; ');
    console.log(`  FORWARD ERROR: Teaching ${teaching.id} (${cat.title} > ${subcat.title}) refs John 17 but is NOT in Cat 12`);
    addFinding('B1', 'ERROR', teaching.id, cat.id, subcat.title, cat.title, refLabels,
      'B1-G1-Forward',
      `Teaching refs John 17 (${refLabels}) but is in Cat ${cat.id} "${cat.title}" not Cat 12.`,
      'G-1: Every John 17 reference must be in Category 12.',
      'Move to Cat 12 in the appropriate High Priestly Prayer subcategory.');
  }
}

// Reverse: any teaching in Cat 12 that has NO John 17 ref
for (const subcat of cat12.subcategories) {
  for (const teaching of subcat.teachings) {
    if (!hasRef(teaching, isJohn17Ref)) {
      const refLabels = teaching.references.map(r => r.label).join('; ');
      console.log(`  REVERSE ERROR: Teaching ${teaching.id} (Cat 12 > ${subcat.title}) has NO John 17 ref — refs: ${refLabels}`);
      addFinding('B1', 'ERROR', teaching.id, 12, subcat.title, cat12.title, refLabels,
        'B1-G1-Reverse',
        `Teaching is in Cat 12 but does not reference John 17. Refs: ${refLabels}`,
        'G-1: Every teaching in Cat 12 must reference John 17.',
        'Move to appropriate topical category OR verify if John 17 cross-reference is missing.');
    }
  }
}

const g1Errors = findings.filter(f => f.check.startsWith('B1-G1')).length;
console.log(`  G-1 findings: ${g1Errors}`);

// ─────────────────────────────────────────────────────────────────────────────
// G-2: Passion scope <-> Cat 27
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== G-2: Passion scope <-> Cat 27 ===');

const PASSION_SCOPE = [
  { bookAbbr: 'Matt', chapters: [26, 27] },
  { bookAbbr: 'Mark', chapters: [14, 15] },
  { bookAbbr: 'Luke', chapters: [22, 23] },
  { bookAbbr: 'John', chapters: [18, 19] },
];

const FAREWELL_DISCOURSE = { bookAbbr: 'John', chapters: [13, 14, 15, 16] };

function isPassionRef(r) {
  return PASSION_SCOPE.some(ps => ps.bookAbbr === r.bookAbbr && ps.chapters.includes(r.chapter));
}

function isFarewellDiscourseRef(r) {
  return r.bookAbbr === FAREWELL_DISCOURSE.bookAbbr && FAREWELL_DISCOURSE.chapters.includes(r.chapter);
}

const cat27 = catalog.categories.find(c => c.id === 27);
if (!cat27) { console.error('ERROR: Category 27 not found!'); process.exit(1); }

// Forward: any teaching with Passion ref that is NOT in Cat 27
for (const { teaching, cat, subcat } of allTeachings()) {
  if (cat.id === 27) continue;
  if (hasRef(teaching, isPassionRef)) {
    const refLabels = teaching.references.map(r => r.label).join('; ');
    console.log(`  FORWARD ERROR: Teaching ${teaching.id} (${cat.title} > ${subcat.title}) refs Passion scope but NOT in Cat 27 — refs: ${refLabels}`);
    addFinding('B1', 'ERROR', teaching.id, cat.id, subcat.title, cat.title, refLabels,
      'B1-G2-Forward',
      `Teaching refs Passion scope passage (${refLabels}) but is in Cat ${cat.id} "${cat.title}" not Cat 27.`,
      'G-2: Every teaching referencing Matt 26-27, Mark 14-15, Luke 22-23, or John 18-19 must be in Cat 27.',
      'Move to Cat 27 (Passion Narrative) in the appropriate subcategory.');
  }
}

// Reverse: any teaching in Cat 27 with NO Passion ref
for (const subcat of cat27.subcategories) {
  for (const teaching of subcat.teachings) {
    const hasPassion = hasRef(teaching, isPassionRef);
    const hasFarewell = hasRef(teaching, isFarewellDiscourseRef);
    if (!hasPassion) {
      const refLabels = teaching.references.map(r => r.label).join('; ');
      if (hasFarewell) {
        // Flag as REVIEW — likely Farewell Discourse misrouted into Cat 27
        console.log(`  REVERSE REVIEW: Teaching ${teaching.id} (Cat 27 > ${subcat.title}) has John 13-16 ref but no Passion ref — refs: ${refLabels}`);
        addFinding('B1', 'REVIEW', teaching.id, 27, subcat.title, cat27.title, refLabels,
          'B1-G2-Reverse',
          `Teaching is in Cat 27 but only refs John 13–16 (Farewell Discourse), not a Passion scope passage. Refs: ${refLabels}. Must verify this is an actual Passion event (Judas departure, denial prediction), not topical teaching.`,
          'G-2 Exception: John 13–16 are Farewell Discourse passages classified topically; they are not Passion scope.',
          'Review: if topical Farewell Discourse content → move to appropriate topical category; if genuine Passion event → accept.');
      } else {
        console.log(`  REVERSE ERROR: Teaching ${teaching.id} (Cat 27 > ${subcat.title}) has NO Passion ref — refs: ${refLabels}`);
        addFinding('B1', 'ERROR', teaching.id, 27, subcat.title, cat27.title, refLabels,
          'B1-G2-Reverse',
          `Teaching is in Cat 27 but does not reference any Passion scope passage. Refs: ${refLabels}`,
          'G-2: Every teaching in Cat 27 must reference a Passion scope passage.',
          'Move to appropriate topical category.');
      }
    }
  }
}

const g2Findings = findings.filter(f => f.check.startsWith('B1-G2'));
const g2Errors = g2Findings.filter(f => f.severity === 'ERROR').length;
const g2Reviews = g2Findings.filter(f => f.severity === 'REVIEW').length;
console.log(`  G-2 findings: ${g2Errors} errors, ${g2Reviews} reviews`);

// ─────────────────────────────────────────────────────────────────────────────
// G-4: Rev 1-3 <-> Cat 31
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== G-4: Rev 1-3 <-> Cat 31 ===');

const cat31 = catalog.categories.find(c => c.id === 31);
if (!cat31) { console.error('ERROR: Category 31 not found!'); process.exit(1); }

const isRev13Ref = r => r.bookAbbr === 'Rev' && [1, 2, 3].includes(r.chapter);

// Forward: any teaching with Rev 1-3 ref not in Cat 31
for (const { teaching, cat, subcat } of allTeachings()) {
  if (cat.id === 31) continue;
  if (hasRef(teaching, isRev13Ref)) {
    const refLabels = teaching.references.map(r => r.label).join('; ');
    console.log(`  FORWARD ERROR: Teaching ${teaching.id} (${cat.title} > ${subcat.title}) refs Rev 1-3 but NOT in Cat 31 — refs: ${refLabels}`);
    addFinding('B1', 'ERROR', teaching.id, cat.id, subcat.title, cat.title, refLabels,
      'B1-G4-Forward',
      `Teaching refs Rev 1–3 (${refLabels}) but is in Cat ${cat.id} "${cat.title}" not Cat 31.`,
      'G-4: Every teaching referencing Rev 1–3 must be in Cat 31.',
      'Move to Cat 31 (Seven Churches) in the appropriate subcategory.');
  }
}

// Reverse: any teaching in Cat 31 with NO Rev 1-3 ref
for (const subcat of cat31.subcategories) {
  for (const teaching of subcat.teachings) {
    if (!hasRef(teaching, isRev13Ref)) {
      const refLabels = teaching.references.map(r => r.label).join('; ');
      console.log(`  REVERSE ERROR: Teaching ${teaching.id} (Cat 31 > ${subcat.title}) has NO Rev 1-3 ref — refs: ${refLabels}`);
      addFinding('B1', 'ERROR', teaching.id, 31, subcat.title, cat31.title, refLabels,
        'B1-G4-Reverse',
        `Teaching is in Cat 31 but does not reference Rev 1–3. Refs: ${refLabels}`,
        'G-4: Every teaching in Cat 31 must reference Rev 1–3.',
        'Move to appropriate topical category OR verify if Rev 1-3 cross-reference is missing.');
    }
  }
}

const g4Errors = findings.filter(f => f.check.startsWith('B1-G4')).length;
console.log(`  G-4 findings: ${g4Errors}`);

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
const errors = findings.filter(f => f.severity === 'ERROR').length;
const warnings = findings.filter(f => f.severity === 'WARNING').length;
const reviews = findings.filter(f => f.severity === 'REVIEW').length;
const infos = findings.filter(f => f.severity === 'INFO').length;

console.log('\n=== B1 SUMMARY ===');
console.log(`Total findings: ${findings.length} (${errors} errors, ${warnings} warnings, ${reviews} reviews, ${infos} info)`);
console.log('Findings JSON:\n' + JSON.stringify(findings, null, 2));
