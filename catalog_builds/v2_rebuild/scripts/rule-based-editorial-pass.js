#!/usr/bin/env node
/**
 * rule-based-editorial-pass.js
 *
 * Replaces the AI editorial pass: reads pre-authored annotation chunks from
 * bible_datasets/reports/chunks/annotations_*.json and applies them to every
 * Type B gap in gaps-annotated.json.
 *
 * Input:  bible_datasets/reports/chunks/annotations_{Matthew,Mark,Luke,John_1_10,John_11_21,Acts_Rev}.json
 *         bible_datasets/reports/gaps-annotated.json
 * Output: bible_datasets/reports/gaps-annotated.json (in place)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const GAPS_FILE = path.resolve(ROOT, 'reports', 'gaps-annotated.json');
const CHUNKS_DIR = path.resolve(ROOT, 'reports', 'chunks');

const CHUNK_FILES = [
  'annotations_Matthew.json',
  'annotations_Mark.json',
  'annotations_Luke.json',
  'annotations_John_1_10.json',
  'annotations_John_11_21.json',
  'annotations_Acts_Rev.json',
];

const VALID_SUBS = new Set([
  '1.1','1.2','1.3','2.1','2.2','2.3','2.4','2.5','2.6','2.7','3.1','3.2','3.3','3.4',
  '4.1','4.2','4.3','4.4','4.5','5.1','5.2','5.3','6.1','6.2','6.3','6.4','7.1','7.2','7.3',
  '8.1','8.2','8.3','9.1','9.2','9.3','10.1','10.2','10.3','10.4','10.5','11.1','11.2',
  '12.1','12.2','12.3','13.1','13.2','13.3','13.4','14.1','14.2','14.3','14.4','14.5','14.6',
  '15.1','15.2','15.3','15.4','16.1','16.2','16.3','17.1','17.2','17.3','17.4','18.1','18.2','18.3',
  '19.1','19.2','19.3','19.4','20.1','20.2','20.3','20.4','21.1','21.2','21.3',
  '22.1','22.2','22.3','22.4','22.5','23.1','23.2','23.3','24.1','24.2','24.3','24.4','24.5',
  '25.1','25.2','25.3','25.4','26.1','26.2','26.3','26.4','26.5','27.1','27.2','27.3','27.4',
  '28.1','28.2','28.3','28.4','29.1','29.2','29.3','30.1','30.2','30.3','30.4','30.5','30.6','30.7','30.8',
  '31.1','31.2','31.3',
]);

function loadAnnotations() {
  const map = new Map();
  for (const file of CHUNK_FILES) {
    const arr = JSON.parse(fs.readFileSync(path.join(CHUNKS_DIR, file), 'utf8'));
    for (const a of arr) {
      if (map.has(a.id)) {
        throw new Error(`Duplicate annotation for ${a.id} (file ${file})`);
      }
      if (!VALID_SUBS.has(a.suggestedSubcategory)) {
        throw new Error(`Invalid subcategory ${a.suggestedSubcategory} on ${a.id}`);
      }
      map.set(a.id, a);
    }
  }
  return map;
}

function main() {
  const annotations = loadAnnotations();
  console.log(`Loaded ${annotations.size} annotations from ${CHUNK_FILES.length} chunk files`);

  const gapsFile = JSON.parse(fs.readFileSync(GAPS_FILE, 'utf8'));
  const gaps = gapsFile.gaps;
  let applied = 0;
  let stillNull = 0;
  const missingAnnotations = [];

  for (const gap of gaps) {
    if (gap.type !== 'B') continue;
    const a = annotations.get(gap.id);
    if (!a) {
      missingAnnotations.push(gap.id);
      stillNull++;
      continue;
    }
    gap.text = a.text;
    gap.suggestedCategory = a.suggestedCategory;
    gap.suggestedSubcategory = a.suggestedSubcategory;
    gap.tags = a.tags || [];
    gap.groupWithGapId = a.groupWithGapId || null;
    applied++;
  }

  gapsFile.editorialPassAt = new Date().toISOString();

  fs.writeFileSync(GAPS_FILE, JSON.stringify(gapsFile, null, 2));

  console.log(`\nApplied: ${applied}`);
  console.log(`Type B gaps still missing text: ${stillNull}`);
  if (missingAnnotations.length > 0) {
    console.log(`Missing annotations for:`, missingAnnotations);
  }
  console.log(`Wrote: ${GAPS_FILE}`);
}

main();
