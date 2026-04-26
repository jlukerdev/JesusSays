# Phase 1 Progress Summary

**Branch:** `ph1-stg-1_4` (pushed to remote — see Push Status below)
**Date started:** 2026-04-26
**Scope:** Stages 1–4 of `phase-1-dev.md`

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

## Unresolved Issues / Open Questions

### From the dev plan

| ID | Issue | Notes |
|---|---|---|
| R-02 | What happens when a user clicks a scripture reference? | Deferred to Phase 2. Currently links open Blue Letter Bible in same tab. |
| R-03 | Scripture tooltips dependency | Deferred to Phase 2. |
| R-04 | Translation selector | Blocked on R-02/R-03. |

### Technical / implementation notes

1. **`teachings.json` base path** — The loader uses `/JesusSays/teachings.json`. If the GitHub Pages repo slug changes, `vite.config.js` `base` and `loader.js` fetch URL must be updated together.

2. **Live deployment not verified** — Stages 1.7 and 1.9 (confirming the app loads and `teachings.json` resolves on the live GitHub Pages URL) require merging this branch to `main` to trigger the GitHub Actions workflow. Deferred until PR is merged.

3. **`dataLoaded` gate on routes** — The `Routes` component in `App.jsx` is gated behind `dataLoaded`. This means during the ~200ms fetch of `teachings.json`, the user sees "Loading teachings…" before any route renders. This is acceptable for Phase 1; in Phase 2, the loading state can be improved with a skeleton screen or optimistic routing.

4. **PWA icons are placeholders** — The 192×192 and 512×512 PNGs are simple navy/gold cross icons generated programmatically. Final artwork deferred to a later phase (per plan).

5. **`useIsMobile` breakpoint** — The mobile/desktop split is at 768px, matching the CSS `@media (max-width: 767px)` breakpoint. JS and CSS are in sync.

6. **Stage 4.6 / 4.7 manual verification** — Rendering at 375px and 1280px and mode switcher behaviour have not been manually browser-tested in this session (no browser available). Code review confirms the logic is correct.

---

## Push Status

All work is **committed and pushed** to remote branch `ph1-stg-1_4` on `jlukerdev/JesusSays`. ✅

The earlier 403 Forbidden errors (proxy blocking `git-receive-pack`) were resolved and the push completed successfully from a terminal with proper GitHub push permissions.

---

## Stages Deferred to Later Sessions

- **Stage 5** — Data Loading & Category Mode Navigation (Sidebar TOC, CategoryViewer, TeachingsTable, CategoryNav)
- **Stage 6** — Scroll-Spy (`useScrollSpy` hook)
- **Stage 7** — PWA finalization and live deployment verification
- **Stage 8** — Phase 1 QA & Sign-Off

---

## Files Changed in This Session

```
.github/workflows/deploy.yml          (new)
.gitignore                             (new)
docs/dev_plan/ph1-progress.md          (new — this file)
docs/dev_plan/phase-1-dev.md           (updated checkboxes)
index.html                             (new)
package.json                           (new)
public/apple-touch-icon.png            (new)
public/favicon.ico                     (new)
public/icons/icon-192.png              (new)
public/icons/icon-512.png              (new)
public/teachings.json                  (new — copied from docs/dev_plan/)
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
