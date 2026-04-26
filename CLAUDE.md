# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Phase 1, Stages 1–4 complete.** React/Vite scaffold is live. Stage 5 (CategoryViewer, Sidebar TOC, BookViewer) is next.

## Project Overview

**Jesus Says** is a reference web application cataloging all recorded words of Jesus Christ from the New Testament — 335+ teachings across 30 thematic categories, 117 subcategories, and ~700 scripture cross-references. The dataset is the primary artifact; the UI exists to browse, filter, and permalink to teachings.

## Tech Stack

- **Framework:** React 18 + Vite (`@vitejs/plugin-react`)
- **Routing:** React Router v6 — `HashRouter`; routes `/category/:slug` and `/book/:bookAbbr`
- **State:** Zustand (`src/store.js`) — activeMode, activeCategorySlug, filters, fontSize, theme, data
- **PWA:** vite-plugin-pwa + Workbox; `teachings.json` is cache-first, Google Fonts are cache-first
- **Styling:** Plain CSS with custom properties; no CSS Modules or styled-components
- **Fonts:** Playfair Display (headings), Source Sans 3 (body) — Google Fonts
- **Deployment:** GitHub Pages at `/JesusSays/` base path; `vite.config.js` sets `base: '/JesusSays/'`
- **Icons:** lucide-react

```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
```

## Design Reference

`docs/arch_plan/app_planning_v1/poc.html` is a 65KB static HTML/vanilla-JS proof-of-concept. **Design spec only — do not port.** Use for visual reference when implementing components.

## Data Architecture

**Served from:** `public/teachings.json` (fetched at `/JesusSays/teachings.json`)
**Planning copy:** `docs/arch_plan/catalog_planning/teachings.json`

```
{
  meta: { title, subtitle, totalCategories, sources[], scope[] },
  categories: [{
    id, slug, title, sources[], description,
    subcategories: [{
      id, slug, title,
      teachings: [{
        id,          // hierarchical: "1.2.5" = cat 1, subcat 2, teaching 5
        text,
        tags[],      // e.g. ["parable"]
        references: [{
          label, book, bookAbbr, chapter,
          ranges: [[startVerse, endVerse]],
          isPrimary
        }]
      }]
    }]
  }]
}
```

- 30 categories ordered theologically (God the Father → Seven Churches of Revelation)
- 33 parables tagged `"parable"` — they span all categories
- 7 NT books: Matt, Mark, Luke, John, Acts, 1Cor, Rev
- **Data fixes pending:** `docs/arch_plan/catalog_planning/fixes.md` — 25 missing teachings to add

## Implemented Source Files

```
src/
  main.jsx                          # Entry; imports theme-classic.css then base.css
  App.jsx                           # HashRouter, data load on mount, Layout wiring
  store.js                          # Zustand store
  components/
    AppHeader/AppHeader.jsx         # Sticky header; hamburger (mobile) + ModeSwitcher
    Layout/Layout.jsx               # forwardRef; sidebar drawer (mobile) / fixed panel (desktop)
    ModeSwitcher/ModeSwitcher.jsx   # Categories / Books tab switcher
  data/
    loader.js                       # Singleton fetch; exposes loadTeachings(), getTeachingById()
    reverseIndex.js                 # Builds book→chapter→verse index; buildReverseIndex(), getReverseIndex()
  hooks/
    useBreakpoint.js                # useBreakpoint() (xs/sm/md/lg/xl), useIsMobile() (<768px)
    useLocalPreference.js           # localStorage wrapper hook
  styles/
    base.css                        # Full app CSS — layout, components, responsive
    themes/theme-classic.css        # All CSS custom properties (colors, typography, spacing, layout)
  utils/
    bookOrder.js                    # NT_BOOK_ABBR_ORDER, ABBR_TO_FULL, BLB_BOOK_SLUG, sortByBookOrder()
    slugify.js                      # catId(), subcatId(), teachingAnchorId(), parseTeachingId()
    clipboardCopy.js                # copyPermalink(teachingId) — writes hash URL to clipboard
```

**CSS classes already defined** (in base.css, ready for components): `.sidebar-nav`, `.sidebar-nav__cat-btn`, `.sidebar-nav__subcat-link`, `.teachings-table`, `.scripture-refs`, `.scripture-ref`, `.scripture-ref--primary`, `.category-section`, `.category-header`, `.subcategory-section`, `.cat-nav`, `.parable-badge`

## Architecture Decisions

| Decision | Resolution |
|---|---|
| A-01 | React 18 + Vite |
| A-02 | Full PWA; service worker cache-first for `teachings.json` |
| A-03 | Mobile-first; sidebar = drawer on mobile, fixed panel on desktop |
| A-04 | Blue Letter Bible links for scripture refs — use `BLB_BOOK_SLUG` from `bookOrder.js` |
| A-05 | `localStorage` for user prefs (translation, font size, theme); `sessionStorage` for filters/scroll |

## Feature Priorities

**Stage 5 — next up:**
- CategoryViewer component (renders teachings table for active category)
- Sidebar TOC component (accordion, scroll-spy active state, teaching count badges)
- BookViewer component (book→chapter→verse reverse index view)

**Phase 1 remaining:** Parable-only toggle, NT Book multi-select filter bar

**Phase 2:** Teaching permalink anchors, print stylesheet, category focus mode, font-size control

**Phase 3 (blocked):** Scripture tooltips (R-03 unresolved), translation selector (blocked on tooltips)

## Styling Conventions

All values from CSS custom properties — never hardcode colors, sizes, or spacing. All vars are in `src/styles/themes/theme-classic.css`. Key ones:
- `--color-accent/accent-mid/accent-light` — gold (#9a7b34 / #d4a84b / #f5eed8)
- `--color-authority` — navy #1b2a40
- `--color-bg` — parchment #faf9f6
- `--font-display` / `--font-body`
- `--sidebar-width: 270px` / `--header-height: 56px`

DOM IDs follow JSON slugs: `cat-1`, `cat-1-1`. Teaching anchors: `t-1-2-5` (dots → dashes, prefixed `t-`).

## Key Planning Documents

- `docs/arch_plan/app_planning_v1/HTML-STANDARDS.md` — HTML structure spec, component patterns, breakpoints, print styles
- `docs/arch_plan/app_planning_v1/feature-hitlist.md` — Full feature spec, architecture decisions (A-01–A-05), review notes (R-01–R-11)
- `docs/arch_plan/catalog_planning/overview.md` — Data catalog scope, JSON schema examples, BLB URL patterns
- `docs/arch_plan/catalog_planning/fixes.md` — 25 missing teachings to add

## Unresolved Decisions

- **R-02:** Scripture reference click behavior (modal, new tab, side panel, or static link)
- **R-03:** Scripture tooltips — Bible Gateway widgets vs REST API (Bible-api.com ruled out)
- **R-04:** Translation selector — blocked until R-03 resolved
- JavaScript (current) vs TypeScript for production build
