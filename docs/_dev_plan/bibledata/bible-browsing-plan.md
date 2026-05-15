# Bible Browsing Feature — Implementation Plan

**Translations:** KJV, NKJV, NIV  
**Scope:** NT only (Matthew–Revelation, 27 books)  
**Approach:** Online API — api.bible REST API, client-side adapter pattern  
**API:** https://rest.api.bible/v1/

---

## Section 4 — NT Book Reference Table

| Full Name | App Abbr | Chapters | api.bible OSIS ID |
|---|---|---|---|
| Matthew | Matt | 28 | MAT |
| Mark | Mark | 16 | MRK |
| Luke | Luke | 24 | LUK |
| John | John | 21 | JHN |
| Acts | Acts | 28 | ACT |
| Romans | Rom | 16 | ROM |
| 1 Corinthians | 1Cor | 16 | 1CO |
| 2 Corinthians | 2Cor | 13 | 2CO |
| Galatians | Gal | 6 | GAL |
| Ephesians | Eph | 6 | EPH |
| Philippians | Phil | 4 | PHP |
| Colossians | Col | 4 | COL |
| 1 Thessalonians | 1Thess | 5 | 1TH |
| 2 Thessalonians | 2Thess | 3 | 2TH |
| 1 Timothy | 1Tim | 6 | 1TI |
| 2 Timothy | 2Tim | 4 | 2TI |
| Titus | Titus | 3 | TIT |
| Philemon | Phlm | 1 | PHM |
| Hebrews | Heb | 13 | HEB |
| James | Jas | 5 | JAS |
| 1 Peter | 1Pet | 5 | 1PE |
| 2 Peter | 2Pet | 3 | 2PE |
| 1 John | 1John | 5 | 1JO |
| 2 John | 2John | 1 | 2JO |
| 3 John | 3John | 1 | 3JO |
| Jude | Jude | 1 | JUD |
| Revelation | Rev | 22 | REV |

This table must be coded as a constant in `src/data/ApiBibleClient.js` (OSIS ID mapping) and `src/utils/bookOrder.js` (the latter currently only covers 8 NT books and must be expanded to all 27).

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

## Section 6 — Data Layer: API Client Architecture

The static file loader (`bibleLoader.js`) is replaced entirely by a two-layer adapter architecture. No static JSON files are produced or served. All Bible text is fetched from the api.bible REST API at runtime.

### 6.1 Abstract Interface — `src/data/BibleService.js`

Defines the contract that any Bible API adapter must implement. Enables swapping the backend (e.g. replacing api.bible with a different provider) without changing any component code.

```js
// Abstract base — defines the contract any Bible API adapter must implement
export class BibleService {
  /**
   * Fetch all verses for a single chapter.
   * @param {string} translationKey  — 'KJV' | 'NKJV' | 'NIV'
   * @param {string} bookAbbr        — app abbreviation e.g. 'Matt', 'Rev'
   * @param {number} chapterNum      — 1-based chapter number
   * @returns {Promise<Array<{ verse: number, text: string, sectionHead?: string }>>}
   */
  async getChapter(translationKey, bookAbbr, chapterNum) {
    throw new Error('BibleService.getChapter() not implemented')
  }

  /**
   * Fetch a passage by reference string.
   * @param {string} translationKey  — 'KJV' | 'NKJV' | 'NIV'
   * @param {string} reference       — api.bible passage ID e.g. 'MAT.5.3-MAT.5.12'
   * @returns {Promise<Array<{ verse: number, text: string, sectionHead?: string }>>}
   */
  async getPassage(translationKey, reference) {
    throw new Error('BibleService.getPassage() not implemented')
  }
}
```

### 6.2 api.bible Adapter — `src/data/ApiBibleClient.js`

Implements `BibleService` using the api.bible REST API. Handles OSIS ID mapping, Bible version ID mapping, HTTP fetching, HTML response parsing, and in-memory caching.

#### api.bible Bible ID Constants

```js
// Bible IDs on api.bible. All three are confirmed available on the account tier.
const BIBLE_IDS = {
  KJV:  'de4e12af7f28f599-02',
  NKJV: '314e9f3b4e92a6b6-01',
  NIV:  '78a9f6124f344018-01',
}
```

#### App Abbr → OSIS ID Map

```js
const OSIS_IDS = {
  Matt: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN',
  Acts: 'ACT', Rom: 'ROM', '1Cor': '1CO', '2Cor': '2CO',
  Gal: 'GAL', Eph: 'EPH', Phil: 'PHP', Col: 'COL',
  '1Thess': '1TH', '2Thess': '2TH', '1Tim': '1TI', '2Tim': '2TI',
  Titus: 'TIT', Phlm: 'PHM', Heb: 'HEB', Jas: 'JAS',
  '1Pet': '1PE', '2Pet': '2PE', '1John': '1JO', '2John': '2JO',
  '3John': '3JO', Jude: 'JUD', Rev: 'REV',
}
```

#### Chapter Endpoint

```
GET https://rest.api.bible/v1/bibles/{bibleId}/chapters/{chapterId}
  ?content-type=html
  &include-notes=false
  &include-titles=true
  &include-chapter-numbers=false
  &include-verse-numbers=true
  &include-verse-spans=true
```

Headers: `api-key: {key}`

**Response envelope:** `{ data: { ..., content, next, previous }, meta: { fumsToken } }`

Chapter ID format: `{OSIS_ID}.{chapterNum}` — e.g. `MAT.1`, `REV.22`

#### Passage Endpoint

```
GET https://rest.api.bible/v1/bibles/{bibleId}/passages/{passageId}
  ?content-type=html
  &include-verse-numbers=true
```

Passage ID format: `{OSIS_ID}.{chapter}.{verse}` or a range like `MAT.5.3-MAT.5.12`.

#### In-Memory Cache

Cache key pattern: `"${translationKey}-${bookAbbr}-${chapterNum}"`

```js
const cache = new Map()  // module-level, lives for the page session
```

Cache `getChapter` results after the first successful fetch. Never cache error responses. The cache is intentionally not persisted to `localStorage` or `IndexedDB` in Phase 1 (see Section 12, rate limits question).

#### HTML Response Parsing

api.bible returns HTML content. The `ApiBibleClient` must parse this HTML into the verse array shape `Array<{ verse: number, text: string, sectionHead?: string }>`.

**Approach:** Use `DOMParser` in the browser (`new DOMParser().parseFromString(html, 'text/html')`) to walk the response DOM and extract verse spans. With `include-verse-spans=true`, api.bible wraps each verse in a `<span data-number="N">` element. Walk these spans, read `data-number` as the verse integer, strip remaining HTML tags from inner text, and push to the output array. Extract `<h3>` or `<h4>` title elements that precede a verse span as the `sectionHead` for that verse.

The specific parsing logic is an implementation detail for the developer and may require adjustment after inspecting actual api.bible responses. The output shape must match `Array<{ verse: number, text: string, sectionHead?: string }>` regardless of parsing strategy.

**For NKJV:** Preserve `<i>` tags in the parsed `text` (they denote implied words). All other tags should be stripped.

#### Class Skeleton

```js
import { BibleService } from './BibleService.js'

const BASE_URL = 'https://rest.api.bible/v1'

const BIBLE_IDS = { /* ... */ }
const OSIS_IDS  = { /* ... */ }

export class ApiBibleClient extends BibleService {
  constructor(apiKey) {
    super()
    this.apiKey = apiKey
    this.cache  = new Map()
  }

  async getChapter(translationKey, bookAbbr, chapterNum) {
    const cacheKey = `${translationKey}-${bookAbbr}-${chapterNum}`
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)

    const bibleId   = BIBLE_IDS[translationKey]
    const osisId    = OSIS_IDS[bookAbbr]
    const chapterId = `${osisId}.${chapterNum}`
    const url       = `${BASE_URL}/bibles/${bibleId}/chapters/${chapterId}` +
                      `?content-type=html&include-notes=false&include-titles=true` +
                      `&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=true`

    const res = await fetch(url, { headers: { 'api-key': this.apiKey } })
    if (!res.ok) {
      throw new Error(`api.bible error: ${res.status} for ${chapterId} (${translationKey})`)
    }
    const json    = await res.json()
    const verses  = this._parseHtml(json.data.content, translationKey)
    this.cache.set(cacheKey, verses)
    return verses
  }

  async getPassage(translationKey, reference) {
    const bibleId = BIBLE_IDS[translationKey]
    const url     = `${BASE_URL}/bibles/${bibleId}/passages/${reference}` +
                    `?content-type=html&include-verse-numbers=true`
    const res     = await fetch(url, { headers: { 'api-key': this.apiKey } })
    if (!res.ok) {
      throw new Error(`api.bible error: ${res.status} for passage ${reference} (${translationKey})`)
    }
    const json = await res.json()
    return this._parseHtml(json.data.content, translationKey)
  }

  _parseHtml(html, translationKey) {
    // Use DOMParser to walk the HTML response from api.bible.
    // Extract verse spans (data-number attribute), section headings, and verse text.
    // For NKJV: preserve <i> tags. For all others: strip all HTML tags.
    // Returns Array<{ verse: number, text: string, sectionHead?: string }>
    throw new Error('_parseHtml() not yet implemented')
  }
}
```

#### Note on `meta.fumsToken`

The api.bible response envelope includes a `meta.fumsToken` field (Fair Use Monitoring System token). This is required by api.bible for tracking licensed translation usage. For Phase 1, this field can be ignored—no action needed beyond awareness. If api.bible's service terms later require reporting this token (e.g., to their analytics endpoint), log it or add a separate metrics handler.
```

### 6.3 Singleton Factory — `src/data/bibleApi.js`

All components import `bibleApi` from this singleton. No component should ever instantiate `ApiBibleClient` directly.

```js
import { ApiBibleClient } from './ApiBibleClient.js'

const apiKey = import.meta.env.VITE_BIBLE_API_KEY ?? ''

export const bibleApi = new ApiBibleClient(apiKey)
```

### 6.4 Usage Pattern in Components

Components call `bibleApi.getChapter(...)` instead of the old `loadBibleBook(...)`:

```js
const [verses, setVerses]   = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError]     = useState(null)

useEffect(() => {
  if (!bibleRef) return
  setLoading(true)
  setError(null)
  bibleApi.getChapter(bibleTranslation, bibleRef.bookAbbr, bibleRef.chapter)
    .then(v => { setVerses(v); setLoading(false) })
    .catch(e => { setError(e.message); setLoading(false) })
}, [bibleRef, bibleTranslation])
```

---

## Section 6A — API Key Storage

Because this project deploys to GitHub Pages (a static host with no backend), the API key is handled differently for development and production.

### Development

Store the key in `.env.local` at the project root. Vite automatically loads this file and it is already gitignored by default in Vite projects.

```
# .env.local  (do NOT commit this file)
VITE_BIBLE_API_KEY=your_key_here
```

Verify `.env.local` is present in `.gitignore` before committing.

### Production (GitHub Pages via GitHub Actions)

1. Add the key as a **GitHub Actions secret** named `VITE_BIBLE_API_KEY` in the repository settings (Settings → Secrets and variables → Actions → New repository secret).

2. Pass the secret as an environment variable during the build step in `.github/workflows/deploy.yml`:

```yaml
- name: Build
  env:
    VITE_BIBLE_API_KEY: ${{ secrets.VITE_BIBLE_API_KEY }}
  run: npm run build
```

Vite inlines `import.meta.env.VITE_BIBLE_API_KEY` into the compiled bundle at build time. The key is present in the deployed JavaScript.

### Security Note

> **Important:** Because this is a static site with no backend, the API key will be embedded in the compiled JavaScript bundle. Anyone who inspects the source can extract it. Mitigate by: (1) registering the key with an allowed-domain restriction on api.bible if the service supports it, (2) treating the key as semi-public and relying on api.bible's rate limits as the primary protection, (3) optionally adding a Cloudflare Worker proxy in the future if key abuse becomes a problem.

---

## Section 7 — New UI Components

### 7.1 `TranslationPicker.jsx`

**File:** `src/components/ModernApp/BibleViewer/TranslationPicker.jsx`

**Props:** none (reads/writes from store directly)

**Renders:** A row of 3 buttons: KJV | NKJV | NIV. Active translation is highlighted.

```jsx
import useStore from '../../../store.js'

export default function TranslationPicker() {
  const bibleTranslation    = useStore(s => s.bibleTranslation)
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
  verses: Array<{ verse: number, text: string, sectionHead?: string }>,
  highlightVerses?: Array<[number, number]>,   // e.g. [[8,8],[10,12]]
  translation: 'KJV' | 'NKJV' | 'NIV'
}
```

**Renders:** Scrollable verse list. Verse numbers as `<sup>`. `sectionHead` (when present on a verse object) rendered as a styled `<div>` above that verse. Highlighted verses get a CSS modifier. After render, scrolls first highlighted verse into view.

**Key implementation note:** Use `dangerouslySetInnerHTML` for NKJV `text` only (to preserve `<i>` implied-word markup parsed from the api.bible response). KJV and NIV render as plain text. The NKJV content comes exclusively from the api.bible API response after controlled parsing in `ApiBibleClient`, so this is safe — document this assumption in a comment.

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

**Props:** none (reads from store: `bibleTranslation`, `bibleBrowseBook`, `bibleBrowseChapter`)

**Default initial chapter:** John 1. If `bibleBrowseBook` is null on mount, load `John 1`.

#### State model

```js
const [segments, setSegments] = useState([])
// segment shape: { id, bookAbbr, bookName, chapterNum, verses }

const [loadingPrev, setLoadingPrev] = useState(false)
const [loadingNext, setLoadingNext] = useState(false)
```

Each segment has a stable `id = "${bookAbbr}-${chapterNum}"`. The DOM header element for each chapter gets `id="bible-ch-${bookAbbr}-${chapterNum}"` for `scrollIntoView`.

#### Boundary navigation logic

Using the NT_BOOKS array (Section 4), given the topmost or bottommost segment:

```
prevTarget:
  if chapterNum > 1        → { same book, chapterNum - 1 }
  else if book !== Matt    → { prevBook, prevBook.chapterCount }
  else                     → null   (Matthew 1 — no prev)

nextTarget:
  if chapterNum < book.chapterCount  → { same book, chapterNum + 1 }
  else if book !== Rev               → { nextBook, 1 }
  else                               → null  (Revelation 22 — no next)
```

#### Load-or-scroll

```
navigateTo(bookAbbr, chapterNum, direction):
  id = `${bookAbbr}-${chapterNum}`
  if segments includes id:
    scrollIntoView(`bible-ch-${id}`, smooth)
  else if direction === 'prev':
    setLoadingPrev(true) → fetch → prepend → setLoadingPrev(false) → scrollIntoView
  else:
    setLoadingNext(true) → fetch → append → setLoadingNext(false) → scrollIntoView
```

When `bibleTranslation` changes: clear segments and reload the first loaded segment's book/chapter in the new translation.

#### Layout

Nav bars appear **only at the very top and bottom** of the scroll container:

```jsx
<div className="bible-browser">
  {/* top */}
  {loadingPrev
    ? <LoadingDots />
    : prevOfTop && <BibleNavBar direction="prev" target={prevOfTop} onNavigate={navigateTo} />}

  {segments.map((seg, i) => (
    <ChapterSegment key={seg.id} seg={seg} prevSeg={segments[i-1] ?? null} translation={bibleTranslation} />
  ))}

  {/* bottom */}
  {loadingNext
    ? <LoadingDots />
    : nextOfBottom && <BibleNavBar direction="next" target={nextOfBottom} onNavigate={navigateTo} />}
</div>
```

#### Internal sub-components (defined in the same file)

**`ChapterSegment`** — renders:
1. `.bible-book-divider` (with ornamental rule lines and book name) when `seg.bookAbbr !== prevSeg?.bookAbbr`
2. `.bible-chapter-header` with `id="bible-ch-${seg.id}"`, text "Chapter N"
3. `<BibleContent verses={seg.verses} translation={translation} />` — no highlight ranges in browse mode

**`BibleNavBar`** — renders a `.bible-nav-bar` with a single pill button (`.bible-nav-btn`, `.bible-nav-btn--book` for cross-book jumps). Label format: `← Ch 3` or `← Mark (Ch 16)` for book jumps. `→ Ch 5` or `→ Acts (Ch 1)` for forward book jumps.

**`LoadingDots`** — three `<span>` elements inside `.bible-loading-dots`, animated by `@keyframes bible-pulse`.

---

## Section 8 — BiblePanel and BibleDrawer Changes

Changes are symmetric between the two files. Only CSS class name prefixes differ (`modern-panel-*` vs `modern-drawer-*`).

### New Imports (both files)
```js
import { useState, useEffect } from 'react'
import useStore from '../../../store.js'
import { bibleApi } from '../../../data/bibleApi.js'
import TranslationPicker from './TranslationPicker.jsx'
import BibleContent from './BibleContent.jsx'
import BibleBrowser from './BibleBrowser.jsx'
```

### New Local State (both files)
```js
const [mode, setMode]       = useState('reference')   // 'reference' | 'browse'
const [verses, setVerses]   = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError]     = useState(null)
const bibleTranslation      = useStore(s => s.bibleTranslation)
```

### Fetch Effect (reference mode only)
```js
useEffect(() => {
  if (mode !== 'reference' || !bibleRef) return
  setLoading(true)
  setError(null)
  bibleApi.getChapter(bibleTranslation, bibleRef.bookAbbr, bibleRef.chapter)
    .then(v => { setVerses(v); setLoading(false) })
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
  verses   ? (
    <BibleContent
      verses={verses}
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

### What Changed

The static `public/bible/` chunk files no longer exist. Instead, Bible content is fetched live from `https://rest.api.bible/`. The Workbox config must be updated to:

- Remove the `globIgnores: ['bible/**']` entry (no longer needed — there are no static bible files to exclude from precache)
- Remove the `CacheFirst` rule for `/JesusSays/bible/.+\.json$`
- Add a `NetworkFirst` runtime cache rule for api.bible API responses

### Required Changes

**Remove (if already added):**
```js
// DELETE these — no longer applicable:
globIgnores: ['bible/**'],
{
  urlPattern: /\/JesusSays\/bible\/.+\.json$/,
  handler: 'CacheFirst',
  options: { cacheName: 'bible-chunks', ... }
}
```

**Add `CacheFirst` caching for api.bible responses:**
```js
{
  urlPattern: /^https:\/\/rest\.api\.bible\//,
  handler: 'CacheFirst',
  options: {
    cacheName: 'bible-api-cache',
    expiration: {
      maxEntries: 300,
      maxAgeSeconds: 1209600   // 14 days
    }
  }
}
```

Add this entry after the existing `teachings-data` runtime cache entry.

**Why `CacheFirst`:** Bible text is immutable — the KJV, NKJV, and NIV content will never change. `CacheFirst` means any chapter the user has opened before is served instantly from cache with zero API calls, which is critical for staying within api.bible rate limits. A 90-day TTL is appropriate; the cache will be pruned by the `maxEntries: 300` limit (27 books × 3 translations = 81 total chapters maximum, with headroom for browse mode navigation).

**Verify after build:** Inspect `dist/sw.js` to confirm:
- No `bible/` entries in the precache manifest
- The `bible-api-cache` `CacheFirst` handler is present for the rest.api.bible URL pattern

---

## Section 10 — CSS Additions

### Step 10.0 — Add new tokens to `src/styles/themes/theme-classic.css`

Two custom properties used by the Bible UI don't exist yet. Add them to `theme-classic.css` inside the existing `:root` block alongside the other color tokens:

```css
/* Bible viewer */
--color-highlight: #fef9c3;   /* verse highlight — warm yellow */
--color-error: #cc0000;        /* inline error text */
```

Do **not** add a `--color-heading` or `--font-size-body` token — the existing `--color-ink` and `--text-sm` cover those roles.

### Step 10.1 — Create `src/styles/bible-viewer.css`

Import this file from `BiblePanel.jsx` or `BibleViewer.jsx`. All vars reference tokens already defined in `theme-classic.css` — no inline fallback values.

**Correct var mapping against `theme-classic.css`:**
- Active button background/border → `--color-authority` (navy `#1b2a40`) — **not** `--color-accent` (gold `#9a7b34`)
- Muted text → `--color-muted`
- Borders → `--color-border`
- Heading text → `--color-ink`
- Body font size → `--text-sm`
- Verse highlight → `--color-highlight` (added in Step 10.0)
- Error text → `--color-error` (added in Step 10.0)

```css
/* Verse display */
.bible-content {
  overflow-y: auto;
  padding: 0 16px 24px;
  line-height: 1.7;
  font-size: var(--text-sm);
}

.bible-verse {
  margin-bottom: 0.5em;
}

.bible-verse--highlight {
  background-color: var(--color-highlight);
  border-radius: 3px;
  padding: 2px 4px;
  margin: -2px -4px;
}

.bible-verse__num {
  font-size: 0.65em;
  color: var(--color-muted);
  margin-right: 3px;
  vertical-align: super;
  user-select: none;
}

.bible-section-head {
  display: block;
  font-weight: 700;
  font-size: 0.85em;
  color: var(--color-ink);
  margin: 1.2em 0 0.3em;
  padding-top: 0.5em;
  border-top: 1px solid var(--color-border);
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
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: var(--color-muted);
  transition: background 0.15s, color 0.15s;
}

.translation-picker__btn--active {
  background: var(--color-authority);
  color: var(--color-authority-fg);
  border-color: var(--color-authority);
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
  border-bottom: 1px solid var(--color-border);
}

.bible-browser__book-btn {
  padding: 4px 8px;
  font-size: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.bible-browser__book-btn--active {
  background: var(--color-authority);
  color: var(--color-authority-fg);
  border-color: var(--color-authority);
}

.bible-browser__chapter-row {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  overflow-x: auto;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);
}

.bible-browser__ch-btn {
  min-width: 28px;
  padding: 3px 6px;
  font-size: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.bible-browser__ch-btn--active {
  background: var(--color-authority);
  color: var(--color-authority-fg);
  border-color: var(--color-authority);
}

/* Loading / error states */
.bible-loading {
  text-align: center;
  padding: 24px;
  color: var(--color-muted);
  font-size: 0.85rem;
}

.bible-error {
  padding: 12px;
  color: var(--color-error);
  font-size: 0.8rem;
}

/* Browse mode toggle button */
.modern-panel-mode-btn,
.modern-drawer-mode-btn {
  font-size: 0.7rem;
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.modern-panel-mode-btn--active,
.modern-drawer-mode-btn--active {
  background: var(--color-authority);
  color: var(--color-authority-fg);
  border-color: var(--color-authority);
}

/* ── Browse mode: chapter / book dividers ── */

.bible-chapter-header {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-authority);
  padding: 16px 16px 8px;
  margin: 0;
}

.bible-book-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 4px;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.bible-book-divider::before,
.bible-book-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-accent-mid);
}

/* ── Browse mode: prev / next nav bar ── */

.bible-nav-bar {
  display: flex;
  justify-content: center;
  padding: 10px 16px;
}

.bible-nav-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-authority);
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent-mid);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.bible-nav-btn:hover {
  background: var(--color-accent-mid);
  color: #fff;
}
.bible-nav-btn--book {
  font-style: italic;
}

/* ── Loading indicator: three-dot pulse ── */

@keyframes bible-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40%           { opacity: 1;   transform: scale(1);   }
}

.bible-loading-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 20px;
}
.bible-loading-dots span {
  width: 8px;
  height: 8px;
  background: var(--color-accent-mid);
  border-radius: 50%;
  animation: bible-pulse 1.4s ease-in-out infinite;
}
.bible-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.bible-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
```

---

## Section 11 — Implementation Sequence

### Phase 1: API Client Setup

- [ ] 1.1 Register for an api.bible API key at https://scripture.api.bible/
- [ ] 1.2 Add `VITE_BIBLE_API_KEY=your_key_here` to `.env.local` at project root — verify `.env.local` is listed in `.gitignore`
- [ ] 1.3 Confirm the three Bible IDs in `BIBLE_IDS` respond correctly — call `GET /bibles/{id}` for each with your key to validate (all three are confirmed available on the account tier)
- [ ] 1.4 Create `src/data/BibleService.js` — abstract base class per Section 6.1
- [ ] 1.5 Create `src/data/ApiBibleClient.js` — OSIS ID map, Bible ID map, `getChapter`, `getPassage`, `_parseHtml`, in-memory cache per Section 6.2
- [ ] 1.6 Create `src/data/bibleApi.js` — singleton factory per Section 6.3
- [ ] 1.7 Add `VITE_BIBLE_API_KEY` as a secret in GitHub repository settings (Settings → Secrets and variables → Actions)
- [ ] 1.8 Update `.github/workflows/deploy.yml` to pass the secret as `VITE_BIBLE_API_KEY` env var in the build step per Section 6A
- [ ] 1.9 Smoke test in browser console: `bibleApi.getChapter('KJV', 'Matt', 1).then(v => console.log(v))` → verify array of `{ verse, text }` objects for Matthew 1

### Phase 2: Infrastructure (Store + bookOrder.js)

- [ ] 2.1 Expand `src/utils/bookOrder.js` to include all 27 NT books (full name, app abbr, chapter count, OSIS ID) — audit all existing import sites before changing the existing structure
- [ ] 2.2 Add `bibleTranslation`, `bibleBrowseBook`, `bibleBrowseChapter` and setters to `src/store.js` per Section 5

### Phase 3: Core Viewer (BibleContent + Wire into BiblePanel/BibleDrawer)

- [ ] 3.1 Add `--color-highlight` and `--color-error` tokens to `src/styles/themes/theme-classic.css` per Section 10 Step 10.0
- [ ] 3.2 Create `src/styles/bible-viewer.css` with all classes from Section 10 Step 10.1
- [ ] 3.3 Import `bible-viewer.css` from `BiblePanel.jsx` or `BibleViewer.jsx`
- [ ] 3.4 Create `src/components/ModernApp/BibleViewer/BibleContent.jsx` per Section 7.2 — accepts `verses` array (not `chapterVerses`)
- [ ] 3.5 Update `BiblePanel.jsx`: add fetch logic using `bibleApi.getChapter`, replace placeholder with `BibleContent` / loading / error
- [ ] 3.6 Update `BibleDrawer.jsx`: same changes as BiblePanel
- [ ] 3.7 Test: tap a scripture reference in TeachingDetail → verify text loads from api.bible, highlighted verses scroll into view (both mobile drawer and desktop panel)

### Phase 4: Translation Picker

- [ ] 4.1 Create `src/components/ModernApp/BibleViewer/TranslationPicker.jsx` per Section 7.1
- [ ] 4.2 Add `<TranslationPicker />` to `BiblePanel` header
- [ ] 4.3 Add `<TranslationPicker />` to `BibleDrawer` header
- [ ] 4.4 Test: switch translation while a reference is open → content re-fetches from api.bible, preference persists on reload

### Phase 5: Browse Mode (BibleBrowser)

- [ ] 5.1 Create `src/components/ModernApp/BibleViewer/BibleBrowser.jsx` per Section 7.3 — uses `bibleApi.getChapter`
- [ ] 5.2 Add Browse toggle button to `BiblePanel` and `BibleDrawer` headers
- [ ] 5.3 Wire mode state: `'reference'` | `'browse'`
- [ ] 5.4 Test: toggle Browse → select a book → select a chapter → verify verses render from live API

### Phase 6: PWA Config

- [ ] 6.1 Remove any `globIgnores: ['bible/**']` entry from `vite.config.js` if present (no static bible files exist)
- [ ] 6.2 Add `CacheFirst` `runtimeCaching` entry for `rest.api.bible` URLs per Section 9
- [ ] 6.3 Run `npm run build`; inspect `dist/sw.js`:
  - No `bible/` entries in precache manifest
  - `bible-api-cache` `CacheFirst` handler present for the api.bible URL pattern
- [ ] 6.4 Deploy to GitHub Pages; test: open a chapter, reload → served from `bible-api-cache` (no network request); go offline, reload → chapter still available

### Phase 7: Inline Snippets in TeachingDetail (Stretch)

- [ ] 7.1 Replace `modern-verse-snippet__placeholder` span in `TeachingDetail.jsx` with actual first verse of first range
- [ ] 7.2 Call `bibleApi.getChapter(bibleTranslation, ref.bookAbbr, ref.chapter)` for each unique book/chapter combo in `teaching.references`
- [ ] 7.3 Decide on truncation behavior (first verse only vs. first N characters)

---

## Section 12 — Open Questions / Decisions

1. **NIV and NKJV availability:** ✅ Confirmed — the account tier includes NIV, NKJV, and KJV. All three Bible IDs in `BIBLE_IDS` are valid and accessible. No substitution needed.

2. **api.bible HTML parsing complexity:** The HTML response from api.bible includes structural tags (`<span>`, `<h3>`, `<h4>`, paragraph wrappers). Decide how much parsing is acceptable in `ApiBibleClient._parseHtml()`. A full `DOMParser` pass is safer and more robust than regex, but adds complexity. Inspect an actual API response early in Phase 1 to determine the right approach.

3. **API key domain restriction:** Does api.bible support domain-restricted keys? If so, register the key with the GitHub Pages origin (e.g. `jesussays.github.io` or the actual custom domain) as the allowed origin. This is the most effective mitigation for key abuse on a static site.

4. **Rate limits:** The `CacheFirst` Workbox strategy means any chapter fetched once is served from cache on all subsequent page loads — zero API calls. The in-memory `ApiBibleClient.cache` handles deduplication within a single session. Together these should keep API usage minimal. If rate-limit errors appear in production (HTTP 429), the first mitigation is to verify the Workbox cache is functioning; IndexedDB persistence would only be needed as a further measure.

5. **Offline support:** With a live API, offline browsing only works for chapters already cached by the Workbox `NetworkFirst` handler. Chapters the user has never opened will not be available offline. Decide whether this is acceptable for the initial release, or whether a "download for offline" feature should be planned as a future phase.

6. **`bookOrder.js` expansion strategy:** The current file has a partial 8-book list. The new 27-book constants (including OSIS IDs) need to be added. Should they replace the existing constants (audit all import sites first) or be added alongside them? Audit all imports of `bookOrder.js` before deciding.

7. **Browse mode default book:** When the user opens browse mode for the first time (`bibleBrowseBook === null`), should the book picker default to the book from the current `bibleRef`? Defaulting to `bibleRef?.bookAbbr` may feel more natural than an empty picker.

8. **Verse snippet in TeachingDetail (Phase 7):** How much text to show? First verse only? First 100 characters? Affects layout of the existing `.modern-verse-snippet` shell div.

9. **Mobile drawer height in browse mode:** Browse mode needs more vertical space (book grid + chapter row + content). The current drawer may default to 55% of screen height. Consider expanding to 70–80% when browse mode is active.

---

## Critical Files

| File | Action |
|---|---|
| `src/data/BibleService.js` | **Create** — abstract interface, enables future adapter swaps |
| `src/data/ApiBibleClient.js` | **Create** — api.bible adapter implementing BibleService; OSIS map, Bible ID map, fetch + parse logic, chapter cache |
| `src/data/bibleApi.js` | **Create** — singleton factory imported by all components |
| `.env.local` | **Create** (not committed) — holds `VITE_BIBLE_API_KEY` for local development |
| `.github/workflows/deploy.yml` | **Modify** — pass `VITE_BIBLE_API_KEY` secret as env var during build step |
| `src/utils/bookOrder.js` | **Expand** — add all 27 NT books with OSIS IDs before Phase 2 |
| `src/store.js` | **Modify** — add 3 new state fields + setters |
| `src/components/ModernApp/BibleViewer/BiblePanel.jsx` | **Modify** — primary desktop composition point |
| `src/components/ModernApp/BibleViewer/BibleDrawer.jsx` | **Modify** — mobile equivalent |
| `vite.config.js` | **Modify** — PWA caching for api.bible API responses |
| `src/styles/bible-viewer.css` | **Create** — all new Bible UI CSS |
