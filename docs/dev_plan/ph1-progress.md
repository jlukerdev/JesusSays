# Phase 1 Progress Summary

**Branch:** `ph1-stg5` (current — see Push Status below)
**Date started:** 2026-04-26
**Scope:** Stages 1–8 of `phase-1-dev.md` (Stages 1–6 complete; Stage 7 and Stage 8 pending)

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
- `src/store.js` — Zustand store with `activeMode`, `activeCategorySlug`, `filters`, `fontSize`, `theme`, and data loading state

### Stage 3 — Theme System ✅

- `src/styles/themes/theme-classic.css` — full `:root {}` block with all CSS custom properties: palette, accent/gold, authority/navy, tag colors, typography (Playfair Display + Source Sans 3), radii, shadows, layout variables
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
- `App.jsx` wired — HashRouter → AppRoutes; loads teachings on mount; builds reverse index; renders shell with stubs for `CategoryViewer` and `BookViewer`
- Routes configured:
  - `/#/category/:slug` → `CategoryViewerStub`
  - `/#/book/:bookAbbr` → `BookViewerStub`
  - `/#/` → redirect to `/#/category/cat-1`

**Build:** `npm run build` passes cleanly. Output: 169KB JS (gzipped: 55KB), 8KB CSS, service worker precaching all assets including `teachings.json`.

---

### Stage 5 — Data Loading & Category Mode Navigation ✅

All rendering components implemented in branch `ph1-stg5`:

- `src/components/Sidebar/Sidebar.jsx` — accordion TOC of all 30 categories; one open at a time; synced to `activeCategorySlug` in store; subcategory links call `scrollIntoView({ behavior: 'smooth' })` on target anchor; calls `onNavClick` prop to close mobile drawer on tap
- `src/components/CategoryViewer/CategoryViewer.jsx` — reads `:slug` route param; syncs to `activeCategorySlug` store state; renders category header, source book names (abbr → full via `ABBR_TO_FULL`), and all subcategory blocks; scrolls `.main-content` to top on category change; `data-sources` attribute on section element for Phase 2 filter
- `src/components/CategoryViewer/CategoryNav.jsx` — Prev/Next navigation rendered at top (`cat-nav--top`) and bottom (`cat-nav--bottom`) of CategoryViewer; navigates via `useNavigate` and resets scroll; on mobile: top nav hidden via CSS, bottom nav is a fixed full-width bar
- `src/components/TeachingsTable/TeachingsTable.jsx` — Teaching (58%) / Scriptures (42%) table; teaching row has `id="t-{teaching-id}"` for permalink anchors; parable badge rendered when `tags` includes `"parable"`; scripture refs sorted primary-first, linked to BLB NKJV URLs, separated by `·`; `data-ref` attribute uses full book name for tooltip API (Phase 2)
- `src/App.jsx` — stubs removed; `<Sidebar onNavClick={handleNavClick} />` and `<CategoryViewer />` wired in; `handleNavClick` calls `layoutRef.current?.closeDrawer()`
- `src/styles/base.css` — added: `.category-viewer`, `.ref-cell`, `.teaching-text`, `.scripture-ref-group`, `scroll-margin-top` on `.subcategory-section`, button-reset styles on `.cat-nav__link`, mobile padding-bottom on `.main-content` for fixed bottom nav, `.cat-nav--top { display: none }` on mobile

**Build:** `npm run build` passes cleanly. Output: 173.5KB JS (gzipped: 57.3KB), 8.7KB CSS, service worker precaching all assets.

**Not yet verified (requires browser):**
- 5.12: Full catalog render — all 30 categories, 335 teachings, 642 references confirmed by code review

---

### Stage 6 — Scroll-Spy (F-01) ✅

- `src/hooks/useScrollSpy.js` — `IntersectionObserver` targeting `.subcategory-section[id]` elements; tracks a Set of currently-visible IDs and returns the first one in DOM order (topmost); `rootMargin: '-10% 0px -75% 0px'` keeps the spy in the upper portion of the viewport; resets and re-initialises on route change via `useLocation` dependency; 50ms settle delay for DOM to update after route transition; `dvh`-aware (body uses `min-height: 100dvh`, layout uses `calc(100dvh - var(--header-height))` for the sidebar)
- `Sidebar.jsx` wired — calls `useScrollSpy()`, applies `.sidebar-nav__subcat-link--active` to matching subcategory link; category-level active from `activeCategorySlug` in store remains unaffected

**Not yet verified (requires browser):**
- 6.4: Scroll-spy desktop/mobile confirmation

---

## Unresolved Issues / Open Questions

### From the dev plan

| ID | Issue | Notes |
|---|---|---|
| R-02 | What happens when a user clicks a scripture reference? | Deferred to Phase 2. Currently links open Blue Letter Bible in same tab. |
| R-03 | Scripture tooltips dependency | Deferred to Phase 2. |
| R-04 | Translation selector | Blocked on R-02/R-03. |

### Technical / implementation notes

1. **`teachings.json` base path** — The loader uses `/JesusSays/teachings.json`. If the GitHub Pages repo slug changes, `vite.config.js` `base` and `loader.js` fetch URL must be updated together.

2. **Live deployment not verified** — Stages 1.7 and 1.9 (confirming the app loads and `teachings.json` resolves on the live GitHub Pages URL) require merging this branch to `main` to trigger the GitHub Actions workflow. Moved to Phase 3 alongside PWA finalisation.

3. **`dataLoaded` gate on routes** — The `Routes` component in `App.jsx` is gated behind `dataLoaded`. This means during the ~200ms fetch of `teachings.json`, the user sees "Loading teachings…" before any route renders. This is acceptable for Phase 1; in Phase 2, the loading state can be improved with a skeleton screen or optimistic routing.

4. **PWA icons are placeholders** — The 192×192 and 512×512 PNGs are simple navy/gold cross icons generated programmatically. Final artwork deferred to a later phase (per plan).

5. **`useIsMobile` breakpoint** — The mobile/desktop split is at 768px, matching the CSS `@media (max-width: 767px)` breakpoint. JS and CSS are in sync.

6. **Stage 4.6 / 4.7 manual verification** — Rendering at 375px and 1280px and mode switcher behaviour have not been manually browser-tested in this session (no browser available). Code review confirms the logic is correct.

---

## Push Status

**Stages 1–4:** committed and pushed to `ph1-stg-1_4` on `jlukerdev/JesusSays`. ✅

**Stages 5–6:** committed and pushed to `ph1-stg5` on `jlukerdev/JesusSays`. ✅

---

## Stages Remaining

### Stage 7 — Bible Book Browser & NT Book Filter Bar · Not started
- **Stage 7A** — Bible Book Browser (F-09 Mode 2): `BookViewer` + `BookNav` components; reverse index (`reverseIndex.js`) already built in Stage 2
- **Stage 7B** — NT Book Filter Bar (F-03): `FilterBar` component; `data-sources` attributes already on category sections from Stage 5

### Stage 8 — Phase 1 QA & Sign-Off · Not started
- Full catalog and navigation verification across all breakpoints
- Note: PWA install (8.13) and Lighthouse score (8.15) are deferred to Phase 3

### Deferred to Phase 3
- **PWA finalisation** (was Stage 7): `vite-plugin-pwa` is wired and builds a service worker; live install verification on iOS/Android and Lighthouse PWA score deferred
- **Live deployment verification** (items 1.7, 1.9): confirms `teachings.json` resolves and app loads on GitHub Pages URL — requires merge to `main`

---

## Files Changed — Stage 5–6 Session (branch: ph1-stg5)

```
docs/dev_plan/ph1-progress.md                       (updated — this file)
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
