# Phase 2 — Modern Navigation Mode

## Overview

Phase 2 adds a "Modern" navigation mode as a full-viewport alternative to the classic shell. Users can toggle between modes via a new SettingsMenu; the choice persists across sessions. The Modern mode introduces three screens (Home, Category Browser, Teaching Detail), an internal nav stack, and a Bible Viewer panel/drawer.

**Technical detail lives in:** [`docs/dev_plan/modern_nav_plan.md`](modern_nav_plan.md)  
**Progress is tracked in:** [`docs/dev_plan/phase-2-progress.md`](phase-2-progress.md)

---

## Phase 2A — Store Foundation
_Stages 1–2 | No UI change_

Add `navStyle` to the Zustand store and wire it to `localStorage` via the existing `useLocalPreference` pattern. Classic mode is unaffected. This is the only prerequisite for all subsequent stages.

**Goal:** `navStyle` persists across page reloads; toggling it in devtools produces no visible change yet.

---

## Phase 2B — Settings Menu & Mode Switch
_Stages 3–4 | First visible change_

Replace the `btn-optimizer` button in `AppHeader` with a new `SettingsMenu` gear dropdown that exposes Nav Style and App Theme toggles. Wire `App.jsx` to render `<ModernApp />` when `navStyle === 'modern'`, falling back to the classic shell for the `/catalog-optimizer` route.

**Goal:** Toggling to Modern mode in the Settings menu renders a blank placeholder; Classic mode is fully unchanged.

---

## Phase 2C — Modern Shell Frame
_Stages 5–7 | Modern shell becomes navigable_

Build the `ModernApp` top-level shell with its internal nav stack state, screen-switching logic, and base CSS. Add `ModernNavBar` (sticky header with back/history controls) and `ModernSearchBar` (sticky below the nav). Screen content areas are empty at this stage.

**Goal:** Modern shell renders with correct nav bar and search bar; back/forward history state advances correctly; screen transitions animate.

---

## Phase 2D — Content Screens
_Stages 8–10 | Core browsing surfaces_

Implement the three content screens in dependency order:

- **HomeScreen** — category grid with density bars; global search with grouped results and highlight
- **CategoryBrowser** — category hero header, book filter chips, subcategory tabs (desktop) / select (mobile), teaching card list, in-category search
- **TeachingDetail** — teaching text hero, tag chips, scripture reference rows with Open links

**Goal:** Full browse flow works end-to-end: Home → Category → Teaching Detail.

---

## Phase 2E — Navigation & Bible Viewer
_Stages 11–12 | Persistence and secondary panel_

Add `PrevNextBar` for sequential navigation across teachings and subcategories (respects active book filter). Add `BibleViewer` — a desktop side panel with auto-close/pin behavior and a mobile bottom drawer with drag-to-dismiss and peek-pill restoration.

**Goal:** Prev/Next traversal works across the full catalog; tapping a scripture chip opens the Bible Viewer; the placeholder content area is in place for a future API.

---

## Phase 2F — Wiring & Integration
_Stage 13 | Final integration check_

Verify all CSS imports are in `main.jsx`, all component imports are correctly pathed, and no stale imports remain in modified files. Smoke-test both modes across mobile and desktop breakpoints.

**Goal:** No console errors; Classic and Modern modes both fully functional; Settings menu persists choice across hard reloads.

---

## Implementation Notes

- Stages within each phase are sequential; phases are also sequential.
- Classic mode must remain fully functional at every commit.
- CSS custom properties only — no hardcoded colors or sizes.
- BibleViewer content areas are placeholders; Bible API integration is out of scope for Phase 2.
- See `modern_nav_plan.md` Decision Points section before implementing Stages 2, 3, 4, and 12.
