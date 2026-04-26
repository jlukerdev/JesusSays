# Jesus Says — Phase 1 Development Plan

**Project:** Jesus Says (React PWA)
**Phase:** 1 — App Shell + Foundational Features
**Data source:** `teachings.json`
**Spec refs:** `feature-hitlist.md`, `html-standards.md`

> Phase 1 establishes everything that must exist before feature work begins: the scaffolded project, the data pipeline, the routing skeleton, the core layout components, the theme system, and Category Mode browsing in its functional (not final) state. Nothing in a later phase should require rearchitecting what is built here.

---

## Stage 1 — Project Scaffolding

*Set up the repo, build tooling, and confirm the GitHub Pages deployment pipeline works end-to-end before any UI is written.*

- [x] **1.1** Use my existing GitHub repository — name: `JesusSays`. do all work in a new branch for phase-1 development
- [x] **1.2** Scaffold React + Vite project (`npm create vite@latest jesus-says -- --template react`)
- [x] **1.3** Configure `vite.config.js` — set `base` to match GitHub Pages deploy path (e.g. `/jesus-says/`)
- [x] **1.4** Install core dependencies:
  - `react-router-dom` (v6, HashRouter)
  - `zustand`
  - `lucide-react`
  - `vite-plugin-pwa`
- [x] **1.5** Install dev dependencies: `gh-pages` (or configure GitHub Actions workflow)
- [x] **1.6** Configure GitHub Actions workflow — trigger on push to `main`, build `dist/`, deploy to `gh-pages` branch
- [ ] **1.7** Confirm first deployment: push empty app shell, verify it loads at the GitHub Pages URL *(requires merge to main + live deploy)*
- [x] **1.8** Set up `HashRouter` in `main.jsx` — confirm no routing 404s on direct URL access
- [x] **1.9** Confirm `teachings.json` resolves correctly from the deployed base path (place in `public/` or import directly)

---

## Stage 2 — Project Structure & Architecture

*Establish the file/folder structure per A-07 (separation of concerns) before writing any component logic.*

- [x] **2.1** Create `src/` directory tree per A-07 spec:
  ```
  src/
    main.jsx
    App.jsx
    data/
    components/
    hooks/
    utils/
    styles/
      themes/
  ```
- [x] **2.2** Copy `teachings.json` into `src/data/` (or `public/` — confirm import strategy)
- [x] **2.3** Create `src/data/loader.js` — imports `teachings.json`, exports `categories` array and flat `teachings` map keyed by teaching ID
- [x] **2.4** Create `src/data/reverseIndex.js` — builds the book → chapter → verse index from `teachings.json`; exports the sorted index; memoised on first call
- [x] **2.5** Create `src/utils/bookOrder.js` — exports NT canonical order array and a sort helper for the 7 source books
- [x] **2.6** Create `src/utils/slugify.js` — exports slug/ID formatting helpers matching the `cat-{N}` and `cat-{N}-{M}` patterns from the JSON
- [x] **2.7** Create `src/utils/clipboardCopy.js` — exports `copyPermalink(teachingId)` using `navigator.clipboard.writeText()`
- [x] **2.8** Initialise Zustand store (`src/store.js`) with top-level app state shape:
  - `activeMode` (`'category' | 'book'`)
  - `activeCategorySlug`
  - `filters` (`{ books: [], parablesOnly: false }`)
  - `fontSize` (`'s'`)
  - `theme` (`'classic'`)
- [x] **2.9** Confirm no logic in `main.jsx` beyond mounting the React root and wrapping with Router + StoreProvider

---

## Stage 3 — Theme System

*Establish the CSS theme architecture (R-10, A-07) before any component styling. All visual tokens defined here; nothing hardcoded later.*

- [x] **3.1** Create `src/styles/base.css` — layout, spacing, component structure only; zero hardcoded colour, font, or shadow values
- [x] **3.2** Create `src/styles/themes/theme-classic.css` — full `:root {}` block with all CSS custom properties per R-10 spec:
  - Palette: `--color-bg`, `--color-surface`, `--color-border`, `--color-ink`, `--color-muted`
  - Accent: `--color-accent`, `--color-accent-light`, `--color-accent-mid`
  - Authority: `--color-authority`, `--color-authority-fg`
  - Typography: `--font-display` (Playfair Display), `--font-body` (Source Sans 3)
  - Radii: `--radius-sm`, `--radius-md`, `--radius-pill`
  - Shadows: `--shadow-tooltip`, `--shadow-pane`
- [x] **3.3** Load Google Fonts (`Playfair Display`, `Source Sans 3`) via `<link>` in `index.html` — confirm they render on the deployed Pages URL
- [x] **3.4** Import `theme-classic.css` and `base.css` in `main.jsx` — confirm variables resolve in browser DevTools
- [x] **3.5** Create `src/hooks/useLocalPreference.js` — generic `localStorage` read/write hook used by font size and theme persistence (A-05)
- [x] **3.6** Audit: confirm zero hardcoded colour or font values exist anywhere outside `theme-classic.css`

---

## Stage 4 — App Shell Layout

*Build the persistent chrome that wraps both browser modes: header, mode switcher, and responsive layout containers. No catalog data rendered yet.*

- [x] **4.1** Create `src/components/AppHeader/AppHeader.jsx` — renders app title "Jesus Says" (R-01), font size control placeholder, mode switcher slot
- [x] **4.2** Create `src/components/ModeSwitcher/ModeSwitcher.jsx` — segmented control with "Categories" and "Books" options; reads/writes `activeMode` from Zustand store
- [x] **4.3** Create `src/components/Layout/Layout.jsx` — two-column layout shell (sidebar + main content area) for `md`+ breakpoints; single-column on `xs`/`sm`
- [x] **4.4** Create `src/hooks/useBreakpoint.js` — returns current breakpoint label (`xs | sm | md | lg | xl`) based on `window.innerWidth`; updates on resize
- [x] **4.5** Wire `App.jsx` — render `AppHeader`, `ModeSwitcher`, and `Layout`; set up `HashRouter` route branches:
  - `/#/category/:slug` → `CategoryViewer` (stub)
  - `/#/book/:bookAbbr` → `BookViewer` (stub)
  - Default redirect `/#/` → `/#/category/cat-1`
- [ ] **4.6** Confirm shell renders on mobile (375px) and desktop (1280px) with correct single/two-column behaviour *(requires browser; code logic confirmed)*
- [ ] **4.7** Confirm mode switcher toggles `activeMode` in the store and the correct route stub renders *(requires browser; code logic confirmed)*

---

## Stage 5 — Data Loading & Category Mode Navigation

*Load `teachings.json` into the app and render the Category Mode TOC sidebar. The viewer renders real data.*

- [ ] **5.1** Call `loader.js` once in `App.jsx` (or a top-level data context); make `categories` available app-wide via Zustand or React context — not prop-drilled
- [ ] **5.2** Create `src/components/Sidebar/Sidebar.jsx` — accordion TOC listing all 30 categories; each category expandable to show its subcategories
- [ ] **5.3** Sidebar behaviour:
  - Only one category accordion open at a time
  - Clicking a category link navigates to `/#/category/{slug}` and updates `activeCategorySlug` in store
  - Subcategory links scroll to `#cat-{N}-{M}` anchor within the viewer
  - Active category and subcategory links receive `.active` styling (gold accent)
- [ ] **5.4** On `xs`/`sm`: sidebar is hidden; a "Contents" button in `AppHeader` opens it as a slide-over drawer; drawer closes on nav link tap
- [ ] **5.5** Create `src/components/CategoryViewer/CategoryViewer.jsx` — reads `activeCategorySlug` from store (or route param), finds the matching category in `categories`, renders it
- [ ] **5.6** Create `src/components/TeachingsTable/TeachingsTable.jsx` — shared table component; renders a subcategory's teachings with two columns: Teaching (58%) | Scriptures (42%)
- [ ] **5.7** Teaching row rendering:
  - Teaching text in left cell
  - Parable badge (`<span class="parable-badge">Parable</span>`) when `tags` includes `"parable"`
  - Each teaching row: `id="t-{teaching-id}"` (dots replaced with hyphens) for permalink anchors (F-05 prep)
  - Row `id` set at render time from JSON `id` field
- [ ] **5.8** Scripture reference rendering per `teachings-notes.md`:
  - Primary reference bold (`.primary-ref`)
  - Cross-references follow on same line, separated by `·` separator
  - References are links (href to BLB URL built from `bookAbbr`, `chapter`, first verse of first range)
  - BLB URL pattern: `https://www.blueletterbible.org/nkjv/{bookSlug}/{chapter}/{verse}/`
- [ ] **5.9** Create `src/components/CategoryViewer/CategoryNav.jsx` — Prev / Next category navigation
  - Displayed at top and bottom of the CategoryViewer
  - Shows adjacent category titles (e.g. `← Repentance and Conversion` / `Salvation and Eternal Life →`)
  - On `xs`/`sm`: renders as a fixed full-width bottom bar with large tap targets
- [ ] **5.10** Category header rendering per R-08 (minimal number style) and R-09 (full book names):
  - Category number: `<span class="cat-num-inline">4.</span>` inline before title — no navy box
  - Source books: full names mapped at render time (`Matt` → `Matthew`, etc.)
- [ ] **5.11** `data-sources` attribute on each category section element — space-separated abbreviations from `sources` array (needed for F-03 filter in Phase 2)
- [ ] **5.12** Confirm full catalog renders correctly: all 30 categories navigable, all 335 teachings visible, all 642 references linked

---

## Stage 6 — Scroll-Spy (F-01)

*Active state tracking in the sidebar as the user scrolls through category content.*

- [ ] **6.1** Create `src/hooks/useScrollSpy.js` — observes category and subcategory section elements via `IntersectionObserver`; returns the currently-in-view category slug and subcategory slug
- [ ] **6.2** Wire `useScrollSpy` into `Sidebar` — active category link and active subcategory link receive `.active` class; parent category remains active while any child is active
- [ ] **6.3** Account for mobile browser chrome variable height — use `dvh` units or JS-calculated root offset for intersection thresholds
- [ ] **6.4** Confirm scroll-spy works correctly on both desktop sidebar and mobile drawer

---

## Stage 7 — PWA Setup (A-02)

*Register the service worker and manifest. Must be done before launch — included in Phase 1 because it affects the build pipeline.*

- [ ] **7.1** Configure `vite-plugin-pwa` in `vite.config.js`:
  - App name: "Jesus Says"
  - `display: 'standalone'`
  - `start_url` matched to deploy base path
  - Theme colour: `#1b2a40` (navy, from `--color-authority`)
- [ ] **7.2** Add PWA icons (192px and 512px) — placeholder icons acceptable for Phase 1; final design in a later phase
- [ ] **7.3** Configure Workbox precache manifest to explicitly include `teachings.json`
- [ ] **7.4** Set caching strategies:
  - `teachings.json` — cache-first
  - App shell (HTML, CSS, JS) — cache-first with version invalidation
  - Google Fonts — stale-while-revalidate
- [ ] **7.5** Confirm service worker registers on the live GitHub Pages HTTPS origin (not just localhost)
- [ ] **7.6** Confirm app is installable on iOS Safari (Add to Home Screen) and Android Chrome (install prompt)
- [ ] **7.7** Confirm full catalog is browsable offline after first load

---

## Stage 8 — Phase 1 QA & Sign-Off

*Validation checklist before Phase 2 begins.*

- [ ] **8.1** All 30 categories navigable via sidebar TOC and Prev/Next nav
- [ ] **8.2** All 117 subcategory anchors scroll correctly within the viewer
- [ ] **8.3** All 335 teachings render with correct text, references, and parable badges (33 parables)
- [ ] **8.4** All 642 scripture reference links resolve to correct BLB URLs
- [ ] **8.5** Scroll-spy correctly tracks active category and subcategory in sidebar
- [ ] **8.6** Mobile layout correct at 375px, 430px, 768px, 1024px, 1280px
- [ ] **8.7** Sidebar drawer opens/closes correctly on mobile; nav tap closes drawer
- [ ] **8.8** Prev/Next category nav works at all breakpoints; bottom bar renders on mobile
- [ ] **8.9** Theme CSS variables resolve correctly; zero hardcoded colours in component styles
- [ ] **8.10** No inline `<script>` logic in `index.html`; all JS in module files
- [ ] **8.11** GitHub Actions deploys successfully on push to `main`
- [ ] **8.12** App loads and is fully functional on deployed GitHub Pages URL
- [ ] **8.13** PWA installs on iOS and Android; full offline browsing confirmed
- [ ] **8.14** `HashRouter` deep links work on direct URL access (no 404s)
- [ ] **8.15** Lighthouse PWA score ≥ 90 on deployed URL

---

## What Is Explicitly Deferred to Later Phases

The following are **not** in Phase 1. Do not begin implementation until Phase 1 QA is signed off.

| Item | Phase | Reason deferred |
|---|---|---|
| Filter bar — Book pills + Parables toggle (F-02, F-03, R-06) | 2 | Requires working catalog first |
| Teaching count badges in sidebar (F-04) | 2 | Depends on filter system |
| Teaching permalink copy anchors (F-05) | 2 | IDs scaffolded in Ph 1; copy UI deferred |
| Bible Book Browser — Mode 2 (F-09) | 2 | Reverse index built in Ph 1; viewer deferred |
| Scripture tooltips (R-03) | 2 | Unresolved dependency; decision needed |
| Scripture click navigation (R-02) | 2 | Unresolved — pending R-03 decision |
| Category focus mode (F-07) | 3 | Enhancement; catalog must be stable first |
| Font size control (R-05 / F-08) | 3 | Low priority; hook scaffolded in Ph 1 |
| Print stylesheet (F-06) | 3 | Non-interactive; low blocking risk |
| Translation selector (R-04) | 3+ | Blocked on R-02/R-03 resolution |
| Additional themes beyond Classic (R-10) | 3+ | Theme system in place in Ph 1; alternate themes later |
