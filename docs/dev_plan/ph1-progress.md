# Phase 1 Progress Summary

**Branch:** `ph1-stg7` (current — see Push Status below)
**Date started:** 2026-04-26
**Scope:** Stages 1–8 of `phase-1-dev.md` (Stages 1–7 complete; Stage 8 pending)

---

## Work Completed

### Stage 1 — Project Scaffolding ✅

All scaffolding tasks are complete:

- `package.json` created with React 18, Vite 5, react-router-dom v6, zustand, lucide-react, vite-plugin-pwa, gh-pages
- `vite.config.js` configured with `base: '/JesusSays/'`, `@vitejs/plugin-react`, and `vite-plugin-pwa` with Workbox caching strategies
- `index.html` created with Google Fonts (Playfair Display + Source Sans 3), meta tags, and correct script entry point
- GitHub Actions workflow created at `.github/workflows/deploy.yml` — triggers on push to `main`, builds `dist/`, deploys to `gh-pages` branch via `peaceiris/actions-gh-pages@v4`
- `HashRouter` wired in `App.jsx` — no server-side routing needed; all navigation is hash-based (no 404s on direct URL access)
- `teachings.json` copied to `public/` — served as a static asset at `/JesusSays/teachings.json`; fetched at runtime by `loader.js`
- Placeholder PWA icons created (192×192 and 512×512 PNGs) — navy/gold cross design, acceptable for Phase 1
- `npm install` succeeded; `npm run build` produces clean `dist/` with service worker

**Not yet verified (requires live deployment):**
- 1.7: First deployment confirmation (live GitHub Pages URL load)
- 1.9: `teachings.json` resolves from the deployed base path

### Stage 2 — Project Structure ✅

Directory tree per A-07:
```
src/
  main.jsx
  App.jsx
  store.js
  data/
    loader.js
    reverseIndex.js
  components/
    AppHeader/AppHeader.jsx
    ModeSwitcher/ModeSwitcher.jsx
    Layout/Layout.jsx
  hooks/
    useLocalPreference.js
    useBreakpoint.js
  utils/
    bookOrder.js
    slugify.js
    clipboardCopy.js
  styles/
    base.css
    themes/
      theme-classic.css
```

- `src/data/loader.js` — fetches `teachings.json`, exports `categories` array and `teachingsMap` (keyed by teaching ID); singleton-memoised
- `src/data/reverseIndex.js` — builds book→chapter→verse index from categories; sorted by NT canonical order; singleton-memoised
- `src/utils/bookOrder.js` — 7 NT source books in canonical order, abbr↔full name maps, BLB slug map, `sortByBookOrder()` helper
- `src/utils/slugify.js` — `catId()`, `subcatId()`, `teachingAnchorId()`, `parseTeachingId()` matching JSON slug patterns
- `src/utils/clipboardCopy.js` — `copyPermalink(teachingId)` using `navigator.clipboard.writeText()`
- `src/store.js` — Zustand store with `activeMode`, `activeCategorySlug`, `activeBookAbbr`, `filters`, `fontSize`, `theme`, and data loading state

### Stage 3 — Theme System ✅

- `src/styles/themes/theme-classic.css` — full `:root {}` block with all CSS custom properties: palette, accent/gold, authority/navy, tag colors, typography (Playfair Display + Source Sans 3), radii, shadows, layout variables including `--filter-bar-height: 52px`
- `src/styles/base.css` — layout, spacing, component structure; zero hardcoded colour/font values; all values reference CSS variables
- Google Fonts loaded in `index.html` via `<link>` tags (Playfair Display + Source Sans 3)
- `theme-classic.css` and `base.css` imported in `main.jsx` (theme first, then base)
- `src/hooks/useLocalPreference.js` — generic localStorage read/write hook with JSON parse/stringify; handles quota errors gracefully

**Audit:** No hardcoded colour or font values exist outside `theme-classic.css`.

### Stage 4 — App Shell Layout ✅

- `src/components/AppHeader/AppHeader.jsx` — renders "Jesus Says" h1, Contents button (mobile drawer trigger), ModeSwitcher in actions slot
- `src/components/ModeSwitcher/ModeSwitcher.jsx` — segmented control ("Categories" / "Books"); reads/writes `activeMode` from Zustand; navigates to route on switch
- `src/components/Layout/Layout.jsx` — `forwardRef` component; exposes `openDrawer`/`closeDrawer` via `useImperativeHandle`; mobile: drawer overlay + sliding panel; desktop: fixed sidebar panel
- `src/hooks/useBreakpoint.js` — returns breakpoint label (`xs|sm|md|lg|xl`) based on `window.innerWidth`; updates on resize with `requestAnimationFrame` debounce; exports `useIsMobile()` helper
- `App.jsx` wired — HashRouter → AppRoutes; loads teachings on mount; builds reverse index; renders shell
- Routes configured:
  - `/#/category/:slug` → `CategoryViewer`
  - `/#/book/:bookAbbr` → `BookViewer`
  - `/#/` → redirect to `/#/category/cat-1`

**Build:** `npm run build` passes cleanly. Output: 169KB JS (gzipped: 55KB), 8KB CSS, service worker precaching all assets including `teachings.json`.

---

### Stage 5 — Data Loading & Category Mode Navigation ✅

All rendering components implemented in branch `ph1-stg5`:

- `src/components/Sidebar/Sidebar.jsx` — accordion TOC of all 30 categories; one open at a time; synced to `activeCategorySlug` in store; subcategory links call `scrollIntoView({ behavior: 'smooth' })` on target anchor; calls `onNavClick` prop to close mobile drawer on tap; Stage 7 adds book filter logic (see below)
- `src/components/CategoryViewer/CategoryViewer.jsx` — reads `:slug` route param; syncs to `activeCategorySlug` store state; renders category header, source book names (abbr → full via `ABBR_TO_FULL`), and all subcategory blocks; scrolls `.main-content` to top on category change; `data-sources` attribute on section element for filter
- `src/components/CategoryViewer/CategoryNav.jsx` — Prev/Next navigation rendered at top and bottom of CategoryViewer; on mobile: top nav hidden, bottom nav is a fixed full-width bar
- `src/components/TeachingsTable/TeachingsTable.jsx` — Teaching (58%) / Scriptures (42%) table; teaching row has `id="t-{teaching-id}"` for permalink anchors; parable badge; scripture refs linked to BLB NKJV URLs
- `src/styles/base.css` — added: `.category-viewer`, `.ref-cell`, `.teaching-text`, `.scripture-ref-group`, `scroll-margin-top` on `.subcategory-section`, button-reset styles on `.cat-nav__link`, mobile padding-bottom on `.main-content` for fixed bottom nav

**Build:** `npm run build` passes cleanly. Output: 173.5KB JS (gzipped: 57.3KB), 8.7KB CSS.

**Not yet verified (requires browser):**
- 5.12: Full catalog render — all 30 categories, 335 teachings, 642 references

---

### Stage 6 — Scroll-Spy (F-01) ✅

- `src/hooks/useScrollSpy.js` — `IntersectionObserver` targeting `.subcategory-section[id]` elements; tracks a Set of currently-visible IDs and returns the first one in DOM order (topmost); `rootMargin: '-10% 0px -75% 0px'`; resets on route change; 50ms settle delay
- `Sidebar.jsx` wired — calls `useScrollSpy()`, applies `.sidebar-nav__subcat-link--active` to matching subcategory link

**Not yet verified (requires browser):**
- 6.4: Scroll-spy desktop/mobile confirmation

---

### Stage 7 — Bible Book Browser & NT Book Filter Bar ✅

#### Stage 7A — Bible Book Browser

- `src/components/BookNav/BookNav.jsx` — sidebar TOC listing all 7 NT source books in canonical order via `NT_BOOK_ABBR_ORDER`; each book expandable to show chapters; accordion (one book open at a time); chapter links scroll to `#ch-{abbr}-{num}` anchors; active chapter highlighted via `useBookScrollSpy`; takes `onNavClick` prop to close mobile drawer on tap
- `src/components/BookViewer/BookViewer.jsx` — reads `:bookAbbr` from route param; calls `getReverseIndex()` for book data; renders book title + gold rule divider, then chapter sections; chapter sections contain a 3-column table (Teaching 45% | Category 22% | Scriptures 33%); deduplicates teachings per chapter (reverse index has one entry per verse; `Set` on `teaching.id` keeps first occurrence); each teaching row has parable badge, BLB scripture links, and a `CategoryChip` showing which category the teaching belongs to; syncs `activeBookAbbr` and `activeMode('book')` to store on route change
- `src/hooks/useScrollSpy.js` — added `useBookScrollSpy` export targeting `.book-chapter[id]` elements; same `IntersectionObserver` pattern as `useScrollSpy`
- `src/store.js` — added `activeBookAbbr: 'Matt'` and `setActiveBookAbbr` action
- `src/App.jsx` — `BookViewerStub` replaced with `<BookViewer />`; sidebar slot conditionally renders `<BookNav />` (book mode) or `<Sidebar />` (category mode) based on `activeMode` from store; `<FilterBar />` rendered between `AppHeader` and `Layout`
- `src/components/CategoryViewer/CategoryViewer.jsx` — added `setActiveMode('category')` call in `useEffect` to ensure mode stays in sync when navigating directly to a category route

#### Stage 7B — NT Book Filter Bar

- `src/components/FilterBar/FilterBar.jsx` — horizontal bar with 7 toggle pills (Matt · Mark · Luke · John · Acts · 1 Cor · Rev); `filters.books` stores **excluded** (deactivated) books — empty array = all active = no filter; toggling a pill adds/removes it from the excluded set; "Clear" button resets to `[]`; pills render highlighted when active (not excluded); visible in both Category Mode and Book Mode
- `src/components/Sidebar/Sidebar.jsx` — reads `filters.books` from store; derives active books = all 7 minus excluded; filters `categories` list to only show categories whose `sources` include at least one active book; when all 7 books are deactivated, shows "Select a book to filter" message; TOC updates in real time
- `src/styles/base.css` — added: `.filter-bar`, `.filter-bar__pills`, `.filter-bar__pill`, `.filter-bar__pill--active`, `.filter-bar__clear`, `.sidebar-nav--empty`, `.sidebar-nav__empty-msg`, `.book-viewer`, `.book-viewer__header`, `.book-viewer__title`, `.book-viewer__divider`, `.book-chapter`, `.book-chapter__title`, `.book-viewer__table` 3-column widths, `.category-chip`, `.category-chip__num`, `.category-chip__title`, `.category-chip-cell`; updated `.sidebar` `top` and `height` to account for `--filter-bar-height`; mobile: category column hidden in book viewer table
- `src/styles/themes/theme-classic.css` — added `--filter-bar-height: 52px` to `:root`

**Not yet verified (requires browser):**
- 7A.7: Confirm reverse index drives correct output: 7 books, chapters in NT order, teachings sorted by verse

---

## Unresolved Issues / Open Questions

### From the dev plan

| ID | Issue | Notes |
|---|---|---|
| R-02 | What happens when a user clicks a scripture reference? | Deferred to Phase 2. Currently links open Blue Letter Bible in a new tab. |
| R-03 | Scripture tooltips dependency | Deferred to Phase 2. |
| R-04 | Translation selector | Blocked on R-02/R-03. |

### Technical / implementation notes

1. **`teachings.json` base path** — The loader uses `/JesusSays/teachings.json`. If the GitHub Pages repo slug changes, `vite.config.js` `base` and `loader.js` fetch URL must be updated together.

2. **Live deployment not verified** — Stages 1.7 and 1.9 (confirming the app loads and `teachings.json` resolves on the live GitHub Pages URL) require merging to `main`. Moved to Phase 3 alongside PWA finalisation.

3. **`dataLoaded` gate on routes** — Routes are gated behind `dataLoaded`. During the ~200ms fetch of `teachings.json`, the user sees "Loading teachings…". Acceptable for Phase 1; Phase 2 can improve with skeleton screen.

4. **PWA icons are placeholders** — The 192×192 and 512×512 PNGs are simple navy/gold cross icons. Final artwork deferred to a later phase.

5. **`useIsMobile` breakpoint** — The mobile/desktop split is at 768px, matching `@media (max-width: 767px)`. JS and CSS are in sync.

6. **Filter bar semantics** — `filters.books` tracks **excluded** books (not included). Empty array = all active. This aligns with the store default and allows a clean "all deactivated" state for the sidebar empty message.

7. **Book Mode filter bar** — The `FilterBar` is visible in Book Mode as specified, but filtering only applies to the Category Mode sidebar. The `BookViewer` always renders all teachings for the selected book regardless of `filters.books`.

---

## Push Status

**Stages 1–4:** committed and pushed to `ph1-stg-1_4` on `jlukerdev/JesusSays`. ✅

**Stages 5–6:** committed and pushed to `ph1-stg5` on `jlukerdev/JesusSays`. ✅

**Stage 7:** committed and pushed to `ph1-stg7` on `jlukerdev/JesusSays`. ✅

---

## Stages Remaining

### Stage 8 — Phase 1 QA & Sign-Off · Not started
- Full catalog and navigation verification across all breakpoints
- Note: PWA install (8.13) and Lighthouse score (8.15) are deferred to Phase 3
- Note: Browser-verification items from Stages 4, 5, 6, 7 (4.6, 4.7, 5.12, 6.4, 7A.7) should be addressed during Stage 8 QA

### Deferred to Phase 3
- **PWA finalisation**: `vite-plugin-pwa` is wired and builds a service worker; live install verification on iOS/Android and Lighthouse PWA score deferred
- **Live deployment verification** (items 1.7, 1.9): confirms `teachings.json` resolves and app loads on GitHub Pages URL — requires merge to `main`

---

## Files Changed — Stage 7 Session (branch: ph1-stg7)

```
docs/dev_plan/ph1-progress.md                           (updated — this file)
docs/dev_plan/phase-1-dev.md                            (checkboxes 7A.1–7A.6 and 7B.1–7B.6 marked [x])
src/App.jsx                                              (BookViewerStub replaced; FilterBar + BookNav wired)
src/store.js                                             (added activeBookAbbr, setActiveBookAbbr)
src/hooks/useScrollSpy.js                               (added useBookScrollSpy export)
src/components/BookNav/BookNav.jsx                      (new)
src/components/BookViewer/BookViewer.jsx                (new)
src/components/FilterBar/FilterBar.jsx                  (new)
src/components/Sidebar/Sidebar.jsx                      (added book filter logic)
src/components/CategoryViewer/CategoryViewer.jsx        (added setActiveMode sync)
src/styles/base.css                                     (added Stage 7 component styles; updated sidebar offset)
src/styles/themes/theme-classic.css                     (added --filter-bar-height)
```

---

## Files Changed — Stage 5–6 Session (branch: ph1-stg5)

```
docs/dev_plan/ph1-progress.md                       (updated)
docs/dev_plan/phase-1-dev.md                        (checkboxes 5.1–5.11 and 6.1–6.3 marked [x])
src/App.jsx                                          (stubs replaced with Sidebar + CategoryViewer)
src/components/Sidebar/Sidebar.jsx                   (new)
src/components/CategoryViewer/CategoryViewer.jsx     (new)
src/components/CategoryViewer/CategoryNav.jsx        (new)
src/components/TeachingsTable/TeachingsTable.jsx     (new)
src/hooks/useScrollSpy.js                            (new)
src/styles/base.css                                  (added stage 5–6 component styles)
```

---

## Files Changed — Stage 1–4 Session (branch: ph1-stg-1_4)

```
.github/workflows/deploy.yml          (new)
.gitignore                             (new)
index.html                             (new)
package.json                           (new)
public/apple-touch-icon.png            (new)
public/favicon.ico                     (new)
public/icons/icon-192.png              (new)
public/icons/icon-512.png              (new)
public/teachings.json                  (new)
src/App.jsx                            (new)
src/components/AppHeader/AppHeader.jsx (new)
src/components/Layout/Layout.jsx       (new)
src/components/ModeSwitcher/ModeSwitcher.jsx (new)
src/data/loader.js                     (new)
src/data/reverseIndex.js               (new)
src/hooks/useBreakpoint.js             (new)
src/hooks/useLocalPreference.js        (new)
src/main.jsx                           (new)
src/store.js                           (new)
src/styles/base.css                    (new)
src/styles/themes/theme-classic.css    (new)
src/utils/bookOrder.js                 (new)
src/utils/clipboardCopy.js             (new)
src/utils/slugify.js                   (new)
vite.config.js                         (new)
```
