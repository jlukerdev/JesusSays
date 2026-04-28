#!/usr/bin/env node
/**
 * parse-usfm.js
 *
 * Parses a USFM Bible file and outputs a JSON with all verses.
 * Verses containing Words of Christ (\wj...\wj*) get:
 *   - jesusIsSpeaking: true
 *   - jesusText: string[] — one entry per \wj span (single-span verses still get an array)
 * All verses get full plain-text in the `text` field.
 *
 * Usage:
 *   node parse-usfm.js <input.usfm> [output-dir]
 *
 * Output: <output-dir>/<BOOKABBR>.json
 * Defaults output-dir to: catalog/output (relative to this script's location)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const [, , inputFile, outputDir, prefixArg] = process.argv;

if (!inputFile) {
  console.error("Usage: node parse-usfm.js <input.usfm> [output-dir] [prefix]");
  process.exit(1);
}

// Derive prefix from argument, or fall back to the numeric prefix in the filename
const filePrefix =
  prefixArg ||
  (() => {
    const m = path.basename(inputFile).match(/^(\d+)-/);
    return m ? m[1] : null;
  })();

const resolvedInput = path.resolve(inputFile);
const resolvedOutput = outputDir
  ? path.resolve(outputDir)
  : path.resolve(__dirname, "../output");

if (!fs.existsSync(resolvedInput)) {
  console.error(`File not found: ${resolvedInput}`);
  process.exit(1);
}

if (!fs.existsSync(resolvedOutput)) {
  fs.mkdirSync(resolvedOutput, { recursive: true });
}

// ---------------------------------------------------------------------------
// Text cleaning helpers
// ---------------------------------------------------------------------------

/**
 * Strip all USFM inline markup and return plain text.
 * Handles both nested (\+w ... \+w*) and top-level (\w ... \w*) word markers,
 * \add...\add* (translator additions), and any remaining backslash tags.
 */
function stripMarkup(raw) {
  let s = raw;

  // \w word|strong="..."\w*  and  \+w word|strong="..."\+w*
  // Keep the word, drop the strong attribute
  s = s.replace(/\\[+]?w\s+(.*?)\|[^\\]*?\\[+]?w\*/g, "$1");

  // \add text\add*  — keep the text
  s = s.replace(/\\[+]?add\s+(.*?)\\[+]?add\*/g, "$1");

  // Any remaining inline tag pairs: \tag text\tag*
  s = s.replace(/\\[+]?\w+\s+(.*?)\\[+]?\w+\*/g, "$1");

  // Any lone backslash tags with no content (e.g. stray \p, \q etc.)
  s = s.replace(/\\[+]?\w+\*/g, "");
  s = s.replace(/\\[+]?\w+/g, "");

  // Collapse multiple spaces, trim
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}

/**
 * Extract only the \wj...\wj* spans from a raw verse line, then strip markup.
 * Returns null if no \wj spans found.
 * Returns a string[] — one element per span. Single-span verses still get an array.
 */
function extractJesusSegments(raw) {
  const spans = [];
  const re = /\\wj\s([\s\S]*?)\\wj\*/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const cleaned = stripMarkup(m[1]);
    if (cleaned) spans.push(cleaned);
  }
  return spans.length === 0 ? null : spans;
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------
const raw = fs.readFileSync(resolvedInput, "utf8");
const lines = raw.split(/\r?\n/);

// Pull book abbreviation and full name from \id and \toc1 / \h
let bookAbbr = "";
let bookName = "";

for (const line of lines) {
  const idMatch = line.match(/^\\id\s+(\S+)/);
  if (idMatch) bookAbbr = idMatch[1].trim();

  const toc1Match = line.match(/^\\toc1\s+(.+)/);
  if (toc1Match) {
    bookName = toc1Match[1].trim();
    // Remove leading "THE GOSPEL ACCORDING TO ST." style prefixes if desired,
    // but keep full title as-is — consumer can normalize.
  }

  const hMatch = line.match(/^\\h\s+(.+)/);
  if (hMatch && !bookName) bookName = hMatch[1].trim();

  if (bookAbbr && bookName) break;
}

// Walk lines, tracking chapter and accumulating verse content
const verses = [];
let currentChapter = 0;
let currentVerseNum = 0;
let currentVerseLines = [];

function flushVerse() {
  if (!currentVerseLines.length) return;

  const combined = currentVerseLines.join(" ");
  const fullText = stripMarkup(combined);
  const segments = extractJesusSegments(combined);

  const verse = {
    book: bookName,
    bookAbbr,
    chapter: currentChapter,
    verse: currentVerseNum,
    text: fullText,
  };

  if (segments !== null) {
    verse.jesusIsSpeaking = true;
    verse.jesusText = segments;
  }

  verses.push(verse);
  currentVerseLines = [];
}

for (const line of lines) {
  const chapterMatch = line.match(/^\\c\s+(\d+)/);
  if (chapterMatch) {
    flushVerse();
    currentChapter = parseInt(chapterMatch[1], 10);
    currentVerseNum = 0;
    continue;
  }

  const verseMatch = line.match(/^\\v\s+(\d+)\s*(.*)/);
  if (verseMatch) {
    flushVerse();
    currentVerseNum = parseInt(verseMatch[1], 10);
    const rest = verseMatch[2] || "";
    if (rest.trim()) currentVerseLines.push(rest);
    continue;
  }

  // Non-structural lines that are part of the current verse content
  // Skip pure paragraph/section markers (\p, \q, \s, etc.) with no text
  if (currentVerseNum > 0) {
    const trimmed = line.trim();
    // Skip lines that are only a USFM paragraph marker
    if (/^\\[a-z0-9]+\*?$/.test(trimmed)) continue;
    if (trimmed) currentVerseLines.push(trimmed);
  }
}
flushVerse();

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
const output = {
  book: bookName,
  bookAbbr,
  verses,
};

const outName = filePrefix ? `${filePrefix}_${bookAbbr}.json` : `${bookAbbr}.json`;
const outFile = path.join(resolvedOutput, outName);
fs.writeFileSync(outFile, JSON.stringify(output, null, 2), "utf8");

console.log(`Parsed ${verses.length} verses → ${outFile}`);
const jesusCount = verses.filter((v) => v.jesusIsSpeaking).length;
console.log(`  Words of Christ flagged: ${jesusCount} verses`);
