#!/usr/bin/env node
/**
 * apply-b6-resolutions.cjs
 * Applies mechanical B6-TAXONOMY findings to teachings.json:
 *   1. Delete empty subcategory Cat 16.2 "Truthfulness and Oaths" (F-B6017)
 *   2. Fix all reference label hyphens → en-dashes for 21 findings (F-B6057–F-B6077)
 * 
 * Run from project root:
 *   node catalog_builds/validation/apply-b6-resolutions.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.resolve(__dirname, '../../public/teachings.json');

// Read with BOM handling
const buf = fs.readFileSync(CATALOG_PATH);
let raw;
if (buf[0] === 0xFF && buf[1] === 0xFE) {
  raw = buf.slice(2).toString('utf16le');
} else if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
  raw = buf.slice(3).toString('utf-8');
} else {
  raw = buf.toString('utf-8');
}
raw = raw.replace(/^\uFEFF+/, '');
const catalog = JSON.parse(raw);

let changeLog = [];

// ── 1. Delete Cat 16.2 "Truthfulness and Oaths" (0 teachings) ─────────────────
const cat16 = catalog.categories.find(c => c.id === 16);
if (!cat16) throw new Error('Cat 16 not found');

const subcatIdx = cat16.subcategories.findIndex(s => s.id === '16.2');
if (subcatIdx === -1) {
  console.log('SKIP: Cat 16.2 not found (already deleted?)');
} else {
  const sub = cat16.subcategories[subcatIdx];
  if (sub.teachings.length > 0) {
    throw new Error(`Cat 16.2 is not empty — has ${sub.teachings.length} teachings. Aborting.`);
  }
  cat16.subcategories.splice(subcatIdx, 1);
  changeLog.push('DELETED: Cat 16.2 "Truthfulness and Oaths" (was empty)');
}

// ── 2. Fix reference label hyphens → en-dashes ────────────────────────────────
const LABEL_FIXES = {
  // teaching_id → [ [old_label, new_label], ... ]
  '2.7.21': [['John 5:6-8', 'John 5:6\u20138']],
  '5.1.4':  [['Luke 13:6-9', 'Luke 13:6\u20139']],
  '5.1.11': [['Matt 12:43-45', 'Matt 12:43\u201345'], ['Luke 11:24-26', 'Luke 11:24\u201326']],
  '19.1.4': [['Matt 19:10-12', 'Matt 19:10\u201312']],
  '20.3.6': [['Matt 22:15-22', 'Matt 22:15\u201322'], ['Mark 12:13-17', 'Mark 12:13\u201317'], ['Luke 20:20-26', 'Luke 20:20\u201326']],
  '22.1.4': [['Luke 10:38-42', 'Luke 10:38\u201342']],
  '26.3.1': [['Acts 9:10-16', 'Acts 9:10\u201316']],
  '26.3.2': [['Acts 18:9-10', 'Acts 18:9\u201310']],
  '26.3.3': [['Acts 22:18-21', 'Acts 22:18\u201321']],
  '26.3.5': [['Acts 10:13-15', 'Acts 10:13\u201315'], ['Acts 11:7-9', 'Acts 11:7\u20139']],
  '26.3.6': [['Acts 9:4-6', 'Acts 9:4\u20136'], ['Acts 22:7-10', 'Acts 22:7\u201310'], ['Acts 26:14-18', 'Acts 26:14\u201318']],
  '27.2.6': [['John 18:5-8', 'John 18:5\u20138']],
  '27.4.3': [['John 19:26-27', 'John 19:26\u201327']],
  '29.2.4': [['Rev 21:5-8', 'Rev 21:5\u20138']],
  '31.1.3': [['Rev 1:19-20', 'Rev 1:19\u201320']],
};

function findTeaching(id) {
  for (const cat of catalog.categories) {
    for (const sub of cat.subcategories) {
      for (const t of sub.teachings) {
        if (t.id === id) return t;
      }
    }
  }
  return null;
}

for (const [tid, fixes] of Object.entries(LABEL_FIXES)) {
  const teaching = findTeaching(tid);
  if (!teaching) {
    console.log(`WARN: Teaching ${tid} not found (renumbered?)`);
    continue;
  }
  for (const [oldLabel, newLabel] of fixes) {
    const ref = teaching.references.find(r => r.label === oldLabel);
    if (!ref) {
      console.log(`WARN: Teaching ${tid} — label "${oldLabel}" not found`);
      continue;
    }
    ref.label = newLabel;
    changeLog.push(`FIXED LABEL: ${tid} — "${oldLabel}" → "${newLabel}"`);
  }
}

// ── Write output ──────────────────────────────────────────────────────────────
const outJson = JSON.stringify(catalog, null, 2);
fs.writeFileSync(CATALOG_PATH, outJson, 'utf-8');

console.log('\n=== apply-b6-resolutions.cjs complete ===');
console.log(`Changes made: ${changeLog.length}`);
for (const c of changeLog) {
  console.log(' ', c);
}
