# Bible Browsing Feature — Implementation Plan

**Translations:** KJV, NKJV, NIV  
**Scope:** NT only (Matthew–Revelation, 27 books)  
**Approach:** Option 3 — static JSON chunks served from `public/bible/`, runtime-cached by Workbox  
**ETL:** Standalone Node.js script, run manually by developer

---

## Section 1 — Source Data Overview

### Shared Schema

All three translations (KJV, NIV, NKJV) share the same JSON structure: a flat array of verse objects at the top level.

**Common fields on every verse object:**

| Field | Type | Description |
|-------|------|-------------|
| `pk` | integer | Primary key (unique across all translations; omitted from output) |
| `translation` | string | `"KJV"`, `"NIV"`, or `"NKJV"` |
| `book` | integer | Protestant canon book number (1 = Genesis, 66 = Revelation) |
| `chapter` | integer | Chapter number |
| `verse` | integer | Verse number |
| `text` | string | Verse text with translation-specific markup |

**NKJV-only additional field:**

| Field | Type | Description |
|-------|------|-------------|
| `comment` | string | Cross-references as HTML anchor tags; not always present on every verse |

### NT Book Integer Range

- Matthew = book integer **40**
- Revelation = book integer **66**
- NT filter: include records where `book >= 40 && book <= 66`

### Per-Translation Markup Quirks

**KJV:**
- Strong's number tags: `<S>7225</S>` inline within `text`. Must be stripped.
- Translator notes in `<sup>…</sup>` tags. Must be stripped.
- No additional fields beyond the common schema.

**NIV:**
- Section headings are embedded in `text` as `HeadingText<br/>actual verse text`. Example: `"The Beatitudes<br/>Now when he saw the crowds..."`.
- In-verse `<br/>` also appears in poetic verses. These should be preserved or converted to a space.
- Detection heuristic for section heading vs. in-verse break: **The section heading is always the first `<br/>` occurrence, and the text before it is a short title (fewer than 8 words, no trailing comma, starts with an uppercase letter).** Split on `<br/>`, evaluate the first segment.
- No `comment` field.

**NKJV:**
- Implied words are wrapped in `<i>…</i>`. Example: `"darkness <i>was</i> on the face of the deep"`. These are semantically meaningful and must be **preserved** in output `text`.
- `comment` field contains cross-reference HTML with `<a href='/NKJV/...'>` links. **Omit entirely** from output to keep files lean.
- Some verses omit the `comment` field entirely.

---

## Section 2 — Output Data Format

### Chunk File JSON Schema

Each output file represents one book in one translation.

**Top-level structure:**

```json
{
  "translation": "KJV",
  "book": "Matt",
  "chapters": {
    "1": [
      { "verse": 1, "text": "The book of the generation of Jesus Christ..." },
      { "verse": 2, "text": "Abraham begat Isaac;..." }
    ],
    "2": [ ... ]
  }
}
```

**Verse object fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `verse` | integer | always | Verse number |
| `text` | string | always | Cleaned verse text |
| `sectionHead` | string | NIV only, when present | Section heading extracted from text |

Chapter keys in `chapters` are **strings** (JSON object keys). Values are arrays of verse objects ordered by verse number ascending.

### Concrete Example: Matthew 1 (abbreviated)

`public/bible/KJV/Matt.json` (excerpt):
```json
{
  "translation": "KJV",
  "book": "Matt",
  "chapters": {
    "1": [
      { "verse": 1, "text": "The book of the generation of Jesus Christ, the son of David, the son of Abraham." },
      { "verse": 2, "text": "Abraham begat Isaac; and Isaac begat Jacob; and Jacob begat Judas and his brethren;" }
    ]
  }
}
```

`public/bible/NIV/Matt.json` (excerpt, showing `sectionHead`):
```json
{
  "translation": "NIV",
  "book": "Matt",
  "chapters": {
    "1": [
      { "verse": 1, "sectionHead": "The Genealogy of Jesus", "text": "A record of the genealogy of Jesus Christ the son of David, the son of Abraham:" },
      { "verse": 2, "text": "Abraham was the father of Isaac, Isaac the father of Jacob..." }
    ]
  }
}
```

### File Naming Convention

```
public/
  bible/
    KJV/
      Matt.json   Mark.json   Luke.json  ...  Rev.json
    NIV/
      Matt.json   ...
    NKJV/
      Matt.json   ...
```

Full path pattern: `public/bible/{TRANSLATION}/{Abbr}.json`

**Total output: 27 books × 3 translations = 81 files**

---

## Section 3 — ETL Script Specification

**File:** `scripts/process-bible.js`

**Run command (from project root):**
```bash
node scripts/process-bible.js
```

No command-line arguments. Fully self-contained.

### Input Paths
```
bible_datasets/bibles/raw_sources/bolls_bible/KJV.json
bible_datasets/bibles/raw_sources/bolls_bible/NIV.json
bible_datasets/bibles/raw_sources/bolls_bible/NKJV.json
```

### Output Paths
```
public/bible/KJV/Matt.json ... Rev.json
public/bible/NIV/Matt.json ... Rev.json
public/bible/NKJV/Matt.json ... Rev.json
```

The script must call `mkdirSync(dir, { recursive: true })` for each `public/bible/{TRANSLATION}/` directory before writing.

> **Note:** Check `package.json` for `"type": "module"` before writing the script. If not set, either add it or name the file `process-bible.mjs`.

### NT Filter
```js
const ntVerses = allVerses.filter(v => v.book >= 40 && v.book <= 66)
```

### Markup Cleanup Functions

**KJV — strip `<S>…</S>` and `<sup>…</sup>`:**
```js
function cleanKJV(text) {
  return text
    .replace(/<S>\d+<\/S>/g, '')
    .replace(/<sup>[^<]*<\/sup>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
```

**NIV — extract section heading, preserve in-verse `<br/>` as space:**
```js
function cleanNIV(text) {
  const result = { text, sectionHead: null }
  const brIdx = text.indexOf('<br/>')
  if (brIdx > 0) {
    const before = text.slice(0, brIdx)
    const after = text.slice(brIdx + 5)
    const words = before.trim().split(/\s+/)
    const looksLikeHeading =
      words.length <= 7 &&
      !before.trim().endsWith(',') &&
      /^[A-Z]/.test(before.trim())
    if (looksLikeHeading) {
      result.sectionHead = before.trim()
      result.text = after.replace(/<br\/>/g, ' ').trim()
    } else {
      result.text = text.replace(/<br\/>/g, ' ').trim()
    }
  }
  return result
}
```

**NKJV — preserve `<i>` tags, omit `comment`:**
```js
function cleanNKJV(text) {
  // <i> tags are preserved intentionally (implied words)
  return text.trim()
}
```

### Grouping Logic
```
for each translation:
  parse source JSON
  filter to NT verses (book 40-66)
  group by book integer -> chapter integer -> array of verse objects
  for each book (40-66):
    abbr = NT_BOOKS[bookInt].abbr
    build chapters object: { "1": [...], "2": [...], ... }
    write to public/bible/{TRANSLATION}/{abbr}.json
```

### Console Progress Output
```
Writing KJV/Matt.json — 28 chapters, 1071 verses
Writing KJV/Mark.json — 16 chapters, 678 verses
...
Done. 81 files written.
```

### Error Handling
If a source file is missing, log a clear error and skip that translation — do not write partial output:
```js
try {
  const raw = readFileSync(sourcePath, 'utf-8')
  // ...
} catch (err) {
  console.error(`ERROR: Could not read ${sourcePath} — skipping ${translation}`)
  console.error(err.message)
  continue
}
```

---

## Section 4 — NT Book Reference Table

| Book Int (bolls) | Full Name | Output Abbr | Chapters |
|---|---|---|---|
| 40 | Matthew | Matt | 28 |
| 41 | Mark | Mark | 16 |
| 42 | Luke | Luke | 24 |
| 43 | John | John | 21 |
| 44 | Acts | Acts | 28 |
| 45 | Romans | Rom | 16 |
| 46 | 1 Corinthians | 1Cor | 16 |
| 47 | 2 Corinthians | 2Cor | 13 |
| 48 | Galatians | Gal | 6 |
| 49 | Ephesians | Eph | 6 |
| 50 | Philippians | Phil | 4 |
| 51 | Colossians | Col | 4 |
| 52 | 1 Thessalonians | 1Thess | 5 |
| 53 | 2 Thessalonians | 2Thess | 3 |
| 54 | 1 Timothy | 1Tim | 6 |
| 55 | 2 Timothy | 2Tim | 4 |
| 56 | Titus | Titus | 3 |
| 57 | Philemon | Phlm | 1 |
| 58 | Hebrews | Heb | 13 |
| 59 | James | Jas | 5 |
| 60 | 1 Peter | 1Pet | 5 |
| 61 | 2 Peter | 2Pet | 3 |
| 62 | 1 John | 1John | 5 |
| 63 | 2 John | 2John | 1 |
| 64 | 3 John | 3John | 1 |
| 65 | Jude | Jude | 1 |
| 66 | Revelation | Rev | 22 |

This table must be coded as a constant in both `scripts/process-bible.js` and `src/utils/bookOrder.js` (the latter currently only covers 8 NT books and must be expanded).

---

## Section 5 — Store Changes

**File:** `src/store.js`

The store currently uses no localStorage middleware. Persist `bibleTranslation` manually in the setter.

### New State Fields

```js
// Added to the create((set) => ({ ... })) object:

// Bible translation preference — persisted to localStorage
bibleTranslation: localStorage.getItem('bibleTranslation') ?? 'KJV',

// Browse mode navigation state — session only, not persisted
bibleBrowseBook: null,       // string abbr e.g. 'Matt', or null
bibleBrowseChapter: 1,       // integer

setBibleTranslation: (translation) => {
  localStorage.setItem('bibleTranslation', translation)
  set({ bibleTranslation: translation })
},
setBibleBrowseBook: (bookAbbr) => set({ bibleBrowseBook: bookAbbr }),
setBibleBrowseChapter: (chapter) => set({ bibleBrowseChapter: chapter }),
```

**Notes:**
- `bibleTranslation` valid values: `'KJV'` | `'NKJV'` | `'NIV'`
- `bibleBrowseBook` is `null` when no book is selected (prompts book picker)
- `bibleBrowseChapter` should reset to 1 whenever `bibleBrowseBook` changes (caller responsibility)
- Do NOT add `bibleOpen` or `bibleRef` to the store — they remain local state in `ModernApp.jsx`

---

## Section 6 — Data Loader Module

**File:** `src/data/bibleLoader.js`

```js
// Lazy-loads Bible chapter data for a given translation and book abbreviation.
// Served from /JesusSays/bible/{TRANSLATION}/{Abbr}.json

const cache = new Map()  // key: "${translation}-${bookAbbr}"

/**
 * Load all chapters for a given book and translation.
 * @param {string} translation  — 'KJV' | 'NKJV' | 'NIV'
 * @param {string} bookAbbr     — e.g. 'Matt', 'Rev'
 * @returns {Promise<Object>}   — resolves to chapters map: { "1": [...verses], ... }
 */
export async function loadBibleBook(translation, bookAbbr) {
  const key = `${translation}-${bookAbbr}`
  if (cache.has(key)) return cache.get(key)

  const url = `/JesusSays/bible/${translation}/${bookAbbr}.json`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to load Bible data: ${url} (${res.status})`)
  }
  const json = await res.json()
  cache.set(key, json.chapters)
  return json.chapters
}

export function clearBibleCache() {
  cache.clear()
}
```

### Usage Pattern in Components

```js
const [chapters, setChapters] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  if (!bibleRef) return
  setLoading(true)
  setError(null)
  loadBibleBook(bibleTranslation, bibleRef.bookAbbr)
    .then(chaps => { setChapters(chaps); setLoading(false) })
    .catch(err => { setError(err.message); setLoading(false) })
}, [bibleRef, bibleTranslation])
```

---

## Section 7 — New UI Components

### 7.1 `TranslationPicker.jsx`

**File:** `src/components/ModernApp/BibleViewer/TranslationPicker.jsx`

**Props:** none (reads/writes from store directly)

**Renders:** A row of 3 buttons: KJV | NKJV | NIV. Active translation is highlighted.

```jsx
import useStore from '../../../store.js'

export default function TranslationPicker() {
  const bibleTranslation = useStore(s => s.bibleTranslation)
  const setBibleTranslation = useStore(s => s.setBibleTranslation)
  const options = ['KJV', 'NKJV', 'NIV']

  return (
    <div className="translation-picker" role="group" aria-label="Bible translation">
      {options.map(t => (
        <button
          key={t}
          className={`translation-picker__btn${bibleTranslation === t ? ' translation-picker__btn--active' : ''}`}
          onClick={() => setBibleTranslation(t)}
          aria-pressed={bibleTranslation === t}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
```

### 7.2 `BibleContent.jsx`

**File:** `src/components/ModernApp/BibleViewer/BibleContent.jsx`

**Props:**
```ts
{
  chapterVerses: Array<{ verse: number, text: string, sectionHead?: string }>,
  highlightVerses?: Array<[number, number]>,   // e.g. [[8,8],[10,12]]
  translation: 'KJV' | 'NKJV' | 'NIV'
}
```

**Renders:** Scrollable verse list. Verse numbers as `<sup>`. NIV `sectionHead` as styled `<div>` above the verse. Highlighted verses get a CSS modifier. After render, scrolls first highlighted verse into view.

**Key implementation note:** Use `dangerouslySetInnerHTML` for NKJV `text` only (to preserve `<i>` implied-word markup). KJV and NIV render as plain text. The NKJV content comes exclusively from our own ETL output, so this is safe.

```jsx
function buildHighlightSet(ranges) {
  const set = new Set()
  for (const [start, end] of (ranges ?? [])) {
    for (let v = start; v <= end; v++) set.add(v)
  }
  return set
}
```

### 7.3 `BibleBrowser.jsx`

**File:** `src/components/ModernApp/BibleViewer/BibleBrowser.jsx`

**Props:** none (all state from store)

**Renders:**
1. **Book selector** — scrollable grid of all 27 NT abbreviations. Tapping sets `bibleBrowseBook` and resets `bibleBrowseChapter` to 1.
2. **Chapter picker** — scrollable chip row numbered 1–N once a book is selected.
3. **Verse content** — renders `<BibleContent>` for the selected chapter.

**State:** Local `chapters`, `loading`, `error`. Re-fetches when `translation` or `browseBook` changes via `loadBibleBook`.

---

## Section 8 — BiblePanel and BibleDrawer Changes

Changes are symmetric between the two files. Only CSS class name prefixes differ (`modern-panel-*` vs `modern-drawer-*`).

### New Imports (both files)
```js
import { useState, useEffect } from 'react'
import useStore from '../../../store.js'
import { loadBibleBook } from '../../../data/bibleLoader.js'
import TranslationPicker from './TranslationPicker.jsx'
import BibleContent from './BibleContent.jsx'
import BibleBrowser from './BibleBrowser.jsx'
```

### New Local State (both files)
```js
const [mode, setMode] = useState('reference')   // 'reference' | 'browse'
const [chapters, setChapters] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const bibleTranslation = useStore(s => s.bibleTranslation)
```

### Fetch Effect (reference mode only)
```js
useEffect(() => {
  if (mode !== 'reference' || !bibleRef) return
  setLoading(true)
  setError(null)
  loadBibleBook(bibleTranslation, bibleRef.bookAbbr)
    .then(c => { setChapters(c); setLoading(false) })
    .catch(e => { setError(e.message); setLoading(false) })
}, [bibleRef, bibleTranslation, mode])
```

### Header Additions
- Add `<TranslationPicker />` below the existing ref label block
- Add a Browse toggle button in the actions row

### Body Replacement
Replace the placeholder `div` with:
```jsx
{mode === 'reference' ? (
  loading  ? <div className="bible-loading">Loading…</div> :
  error    ? <div className="bible-error">{error}</div> :
  chapters ? (
    <BibleContent
      chapterVerses={chapters[String(bibleRef?.chapter)] ?? []}
      highlightVerses={bibleRef?.ranges ?? []}
      translation={bibleTranslation}
    />
  ) : <div className="modern-panel-placeholder">Select a scripture reference to view text.</div>
) : (
  <BibleBrowser />
)}
```

**BibleDrawer note:** The drawer already tracks `lastRef` for peeking. Use `lastRef` as the fallback `bibleRef` when `bibleRef` is null during re-open.

---

## Section 9 — PWA / Workbox Configuration

**File:** `vite.config.js`

### Problem
Current `globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']` will greedily precache all 81 bible chunk files on first install (~tens of MB). These must be excluded from precache and runtime-cached on demand instead.

### Required Changes

**1. Exclude `public/bible/` from precache:**
```js
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
  globIgnores: ['bible/**'],   // paths relative to dist/
  runtimeCaching: [ ... ]
}
```

**2. Add `CacheFirst` runtime caching for bible chunks:**
```js
{
  urlPattern: /\/JesusSays\/bible\/.+\.json$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'bible-chunks',
    expiration: {
      maxEntries: 90,          // 27 books × 3 translations + headroom
      maxAgeSeconds: 7776000   // 90 days
    }
  }
}
```

Add this entry after the existing `teachings-data` runtime cache entry.

**Verify after build:** Inspect `dist/sw.js` to confirm:
- `public/bible/**` entries do NOT appear in the precache manifest
- The `bible-chunks` `CacheFirst` handler is present

---

## Section 10 — CSS Additions

**File:** Create `src/styles/bible-viewer.css` and import it from the BibleViewer component files (or from `base.css`).

```css
/* Verse display */
.bible-content {
  overflow-y: auto;
  padding: 0 16px 24px;
  line-height: 1.7;
  font-size: var(--font-size-body, 0.95rem);
}

.bible-verse {
  margin-bottom: 0.5em;
}

.bible-verse--highlight {
  background-color: var(--color-highlight, #fef9c3);
  border-radius: 3px;
  padding: 2px 4px;
  margin: -2px -4px;
}

.bible-verse__num {
  font-size: 0.65em;
  color: var(--color-muted, #888);
  margin-right: 3px;
  vertical-align: super;
  user-select: none;
}

.bible-section-head {
  display: block;
  font-weight: 700;
  font-size: 0.85em;
  color: var(--color-heading, #333);
  margin: 1.2em 0 0.3em;
  padding-top: 0.5em;
  border-top: 1px solid var(--color-border, #e5e5e5);
}

/* Translation picker */
.translation-picker {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.translation-picker__btn {
  flex: 1;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: var(--color-muted, #666);
  transition: background 0.15s, color 0.15s;
}

.translation-picker__btn--active {
  background: var(--color-accent, #1b2a40);
  color: #fff;
  border-color: var(--color-accent, #1b2a40);
}

/* Browse mode */
.bible-browser {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.bible-browser__book-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
  overflow-y: auto;
  max-height: 160px;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
}

.bible-browser__book-btn {
  padding: 4px 8px;
  font-size: 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.bible-browser__book-btn--active {
  background: var(--color-accent, #1b2a40);
  color: #fff;
  border-color: var(--color-accent, #1b2a40);
}

.bible-browser__chapter-row {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  overflow-x: auto;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
}

.bible-browser__ch-btn {
  min-width: 28px;
  padding: 3px 6px;
  font-size: 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.bible-browser__ch-btn--active {
  background: var(--color-accent, #1b2a40);
  color: #fff;
}

/* Loading / error states */
.bible-loading {
  text-align: center;
  padding: 24px;
  color: var(--color-muted, #888);
  font-size: 0.85rem;
}

.bible-error {
  padding: 12px;
  color: #c00;
  font-size: 0.8rem;
}

/* Browse mode toggle button */
.modern-panel-mode-btn,
.modern-drawer-mode-btn {
  font-size: 0.7rem;
  padding: 2px 6px;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.modern-panel-mode-btn--active,
.modern-drawer-mode-btn--active {
  background: var(--color-accent, #1b2a40);
  color: #fff;
  border-color: var(--color-accent, #1b2a40);
}
```

**Check `theme-classic.css` before adding custom property fallbacks** — some vars (e.g. `--color-accent`) may already exist under different names.

---

## Section 11 — Implementation Sequence

### Phase 1: ETL (Script + Output Files)

- [ ] 1.1 Check `package.json` for `"type": "module"` — add it if absent or name script `.mjs`
- [ ] 1.2 Expand `src/utils/bookOrder.js` to include all 27 NT books (bolls int, full name, abbr, chapter count)
- [ ] 1.3 Create `scripts/process-bible.js` per Section 3
- [ ] 1.4 Run `node scripts/process-bible.js` from project root
- [ ] 1.5 Spot-check output:
  - `public/bible/KJV/Matt.json` — verify no `<S>` tags in verse text
  - `public/bible/NIV/Matt.json` Matt 5:1 — verify `sectionHead: "The Beatitudes"` and clean `text`
  - `public/bible/NKJV/Matt.json` — verify `<i>` preserved in text, no `comment` field
  - `public/bible/KJV/Rev.json` Rev 22:21 — verify last verse present
- [ ] 1.6 Commit: `git add public/bible/` → `feat: add NT bible chunk files (KJV/NIV/NKJV)`

### Phase 2: Infrastructure (Store + Loader)

- [ ] 2.1 Add `bibleTranslation`, `bibleBrowseBook`, `bibleBrowseChapter` and setters to `src/store.js`
- [ ] 2.2 Create `src/data/bibleLoader.js` per Section 6
- [ ] 2.3 Smoke test in browser console: `loadBibleBook('KJV', 'Matt').then(c => console.log(Object.keys(c)))` → should log `["1", ..., "28"]`

### Phase 3: Core Viewer (BibleContent + Wire into BiblePanel/BibleDrawer)

- [ ] 3.1 Create `src/styles/bible-viewer.css` with all classes from Section 10
- [ ] 3.2 Import `bible-viewer.css` from `BiblePanel.jsx` or `BibleViewer.jsx`
- [ ] 3.3 Create `src/components/ModernApp/BibleViewer/BibleContent.jsx`
- [ ] 3.4 Update `BiblePanel.jsx`: add fetch logic, replace placeholder with `BibleContent` / loading / error
- [ ] 3.5 Update `BibleDrawer.jsx`: same changes
- [ ] 3.6 Test: tap a scripture reference in TeachingDetail → verify text loads, highlighted verses scroll into view (both mobile drawer and desktop panel)

### Phase 4: Translation Picker

- [ ] 4.1 Create `src/components/ModernApp/BibleViewer/TranslationPicker.jsx`
- [ ] 4.2 Add `<TranslationPicker />` to `BiblePanel` header
- [ ] 4.3 Add `<TranslationPicker />` to `BibleDrawer` header
- [ ] 4.4 Test: switch translation while a reference is open → content updates, preference persists on reload

### Phase 5: Browse Mode (BibleBrowser)

- [ ] 5.1 Create `src/components/ModernApp/BibleViewer/BibleBrowser.jsx`
- [ ] 5.2 Add Browse toggle button to `BiblePanel` and `BibleDrawer` headers
- [ ] 5.3 Wire mode state: `'reference'` | `'browse'`
- [ ] 5.4 Test: toggle Browse → select a book → select a chapter → verify verses render

### Phase 6: PWA Config

- [ ] 6.1 Add `globIgnores: ['bible/**']` to `workbox` config in `vite.config.js`
- [ ] 6.2 Add `runtimeCaching` entry for `/JesusSays/bible/.+\.json$` per Section 9
- [ ] 6.3 Run `npm run build`; inspect `dist/sw.js`:
  - No `bible/` entries in precache manifest
  - `bible-chunks` `CacheFirst` handler present
- [ ] 6.4 Deploy to GitHub Pages; test offline: open a chapter, go offline, reload → chapter served from cache

### Phase 7: Inline Snippets in TeachingDetail (Stretch)

- [ ] 7.1 Replace `modern-verse-snippet__placeholder` span in `TeachingDetail.jsx` with actual first verse of first range
- [ ] 7.2 Call `loadBibleBook(bibleTranslation, ref.bookAbbr)` for each unique book in `teaching.references`
- [ ] 7.3 Decide on truncation behavior (first verse only vs. first N characters)

---

## Section 12 — Open Questions / Decisions

1. **`package.json` module type:** Is `"type": "module"` already set? If not, add it or name the ETL script `.mjs`. Check before writing.

2. **NIV in-verse `<br/>` rendering:** Poetic verses (Beatitudes, etc.) use `<br/>` for line breaks after the heading is extracted. The current plan replaces them with a space. Should these render as visual line breaks (`<br>` in HTML)? If so, `BibleContent` needs `dangerouslySetInnerHTML` for NIV too, not just NKJV.

3. **`bookOrder.js` expansion strategy:** Current file has a partial 8-book list. Should the new 27-book constants *replace* the existing ones (check all import sites first) or be *added alongside* them? Audit all imports of `bookOrder.js` before deciding.

4. **Browse mode default book:** When the user opens browse mode for the first time (`bibleBrowseBook === null`), should the book picker default to the book from the current `bibleRef`? Currently the plan shows an empty book picker. Defaulting to `bibleRef?.bookAbbr` may feel more natural.

5. **Verse snippet in TeachingDetail (Phase 7):** How much text to show? First verse only? First 100 characters? Affects layout of the existing `.modern-verse-snippet` shell div.

6. **Mobile drawer height in browse mode:** Browse mode needs more vertical space (book grid + chapter row + content). The current drawer may default to 55% of screen height. Consider expanding to 70–80% when browse mode is active.

7. **`dangerouslySetInnerHTML` for NKJV:** Safe because content comes exclusively from our ETL output. Document this assumption in a comment near the usage so future devs don't sanitize it away or replicate the pattern for user input.

---

## Critical Files

| File | Action |
|---|---|
| `scripts/process-bible.js` | **Create** — the entire data pipeline depends on this running first |
| `src/utils/bookOrder.js` | **Expand** — add all 27 NT books before running ETL |
| `src/store.js` | **Modify** — add 3 new state fields + setters |
| `src/data/bibleLoader.js` | **Create** — async fetch/cache module all viewer components depend on |
| `src/components/ModernApp/BibleViewer/BiblePanel.jsx` | **Modify** — primary desktop composition point |
| `src/components/ModernApp/BibleViewer/BibleDrawer.jsx` | **Modify** — mobile equivalent |
| `vite.config.js` | **Modify** — PWA caching for bible chunks |
| `src/styles/bible-viewer.css` | **Create** — all new Bible UI CSS |
