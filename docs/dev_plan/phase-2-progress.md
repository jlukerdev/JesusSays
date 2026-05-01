# Phase 2 Progress

**Plan:** [`phase-2-dev.md`](phase-2-dev.md) | **Detail:** [`modern_nav_plan.md`](modern_nav_plan.md)

---

## Phase 2A — Store Foundation

- [ ] **Stage 1** — Add `navStyle` field + `setNavStyle` setter to `src/store.js`
- [ ] **Stage 2** — Persist `navStyle` via `useLocalPreference` in `src/App.jsx`

---

## Phase 2B — Settings Menu & Mode Switch

- [ ] **Stage 3** — Create `SettingsMenu` component + CSS; update `AppHeader.jsx`
- [ ] **Stage 4** — Add Modern mode branch to `App.jsx`; import `ModernApp`

---

## Phase 2C — Modern Shell Frame

- [ ] **Stage 5** — Create `ModernApp.jsx` shell + `src/styles/modern-nav.css`; update `main.jsx`
- [ ] **Stage 6** — Create `ModernNavBar.jsx`; add nav bar CSS to `modern-nav.css`
- [ ] **Stage 7** — Create `ModernSearchBar.jsx`; add search bar CSS to `modern-nav.css`

---

## Phase 2D — Content Screens

- [ ] **Stage 8** — Create `HomeScreen.jsx`; add home + search result CSS to `modern-nav.css`
- [ ] **Stage 9** — Create `CategoryBrowser.jsx` (includes `TeachingCard` + `InCategorySearchResults` as inline functions); add CSS
- [ ] **Stage 10** — Create `TeachingDetail.jsx`; add detail CSS to `modern-nav.css`

---

## Phase 2E — Navigation & Bible Viewer

- [ ] **Stage 11** — Create `PrevNextBar.jsx`; add prev/next bar CSS to `modern-nav.css`
- [ ] **Stage 12** — Create `BibleViewer.jsx`, `BiblePanel.jsx`, `BibleDrawer.jsx`; add Bible viewer CSS to `modern-nav.css`

---

## Phase 2F — Wiring & Integration

- [ ] **Stage 13** — Verify all imports in `main.jsx`; audit component import paths; smoke-test both modes
- [ ] Classic mode regression check (mobile + desktop)
- [ ] Modern mode end-to-end check: Home → Category → Teaching → Bible Viewer
- [ ] Settings persistence check across hard reload
