#!/usr/bin/env node
/**
 * parse-usfm-nt.js
 *
 * Iterates all NT USFM files (prefixed 70–96) in a given directory and runs
 * the USFM parser on each, writing one JSON per book to the output directory.
 *
 * Usage:
 *   node parse-usfm-nt.js [usfm-dir] [output-dir]
 *
 * Defaults:
 *   usfm-dir   → catalog/bibles/eng-kjv2006_usfm  (relative to this script)
 *   output-dir → catalog/output                   (relative to this script)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [, , usfmDirArg, outputDirArg] = process.argv;

const usfmDir = usfmDirArg
  ? path.resolve(usfmDirArg)
  : path.resolve(__dirname, "../bibles/eng-kjv2006_usfm");

const outputDir = outputDirArg
  ? path.resolve(outputDirArg)
  : path.resolve(__dirname, "../output");

const parserScript = path.resolve(__dirname, "parse-usfm.js");

if (!fs.existsSync(usfmDir)) {
  console.error(`USFM directory not found: ${usfmDir}`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// NT files are prefixed 70–96
const ntFiles = fs
  .readdirSync(usfmDir)
  .filter((f) => {
    const prefix = parseInt(f.split("-")[0], 10);
    return f.endsWith(".usfm") && prefix >= 70 && prefix <= 96;
  })
  .sort();

if (ntFiles.length === 0) {
  console.error(`No NT USFM files (prefix 70–96) found in: ${usfmDir}`);
  process.exit(1);
}

console.log(`Found ${ntFiles.length} NT files in ${usfmDir}\n`);

const results = [];

for (const file of ntFiles) {
  const inputPath = path.join(usfmDir, file);
  try {
    const stdout = execFileSync(
      process.execPath,
      [parserScript, inputPath, outputDir],
      { encoding: "utf8" }
    );
    // Parse summary line from parser output
    const verseMatch = stdout.match(/Parsed (\d+) verses/);
    const flagMatch = stdout.match(/Words of Christ flagged: (\d+)/);
    const verses = verseMatch ? parseInt(verseMatch[1], 10) : "?";
    const flagged = flagMatch ? parseInt(flagMatch[1], 10) : 0;
    results.push({ file, verses, flagged, error: null });
    process.stdout.write(stdout);
  } catch (err) {
    const msg = err.stderr || err.message;
    results.push({ file, verses: 0, flagged: 0, error: msg.trim() });
    console.error(`  ERROR processing ${file}:\n  ${msg.trim()}\n`);
  }
}

// Summary table
const totalVerses = results.reduce((s, r) => s + (r.verses || 0), 0);
const totalFlagged = results.reduce((s, r) => s + r.flagged, 0);
const failed = results.filter((r) => r.error);

console.log("\n" + "─".repeat(60));
console.log(
  `Processed ${results.length - failed.length}/${results.length} books successfully`
);
console.log(`Total verses parsed : ${totalVerses.toLocaleString()}`);
console.log(`Words of Christ     : ${totalFlagged.toLocaleString()} verses`);
if (failed.length) {
  console.log(`\nFailed (${failed.length}):`);
  failed.forEach((r) => console.log(`  ${r.file}: ${r.error}`));
}
