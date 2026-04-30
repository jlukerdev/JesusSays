# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Phase 1, Stages 1–7 complete.** Full Category Mode and Bible Book Mode are live. Stage 8 (QA sign-off) and live deployment to GitHub Pages are pending. Phase 2 (Parables toggle, permalink anchors, font size control) is next.

## Project Overview

**Jesus Says** is a reference web application cataloging all recorded words of Jesus Christ from the New Testament — organized across 31 thematic categories with full scripture cross-references and 100% coverage of red-letter (Words of Christ) NT verses. The dataset is the primary artifact; the UI exists to browse, filter, and permalink to teachings. For current catalog counts, see [`catalog_builds/engine/catalog_stats.md`](catalog_builds/engine/catalog_stats.md).

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

## Data Architecture

**Served from:** `public/teachings.json` (fetched at `/JesusSays/teachings.json`)

```
{
  meta: { title, subtitle, totalCategories, sources[], scope[] },
  categories: [{
    id, slug, title, sources[], description,
    subcategories: [{
      id, slug, title,
      teachings: [{
        id,          // hierarchical: "1.2.5" = cat 1, subcat 2, teaching 5
        text,        // editorial summary (1 sentence)
        quote,       // raw KJV text of Jesus's words (v2)
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

- 31 categories ordered theologically (God the Father → Seven Churches of Revelation), with The Passion Narrative inserted at cat-27 before the Resurrection block
- 42 parables tagged `"parable"` — they span all categories
- 8 NT books: Matt, Mark, Luke, John, Acts, 1Cor, 2Cor, Rev (`bookAbbr` normalized — no spaces)

## Implemented Source Files

```
src/
  main.jsx                              # Entry; imports theme-classic.css then base.css
  App.jsx                               # HashRouter, data load on mount, Layout + route wiring
  store.js                              # Zustand store
  components/
    AppHeader/AppHeader.jsx             # Sticky header; hamburger (mobile) + ModeSwitcher
    BookNav/BookNav.jsx                 # Book Mode sidebar TOC; book/chapter accordion
    BookViewer/BookViewer.jsx           # Book→chapter→verse teaching view; category chip labels
    CategoryViewer/CategoryViewer.jsx   # Category teaching view; category header, subcategory blocks
    CategoryViewer/CategoryNav.jsx      # Prev/Next category navigation; fixed bottom bar on mobile
    FilterBar/FilterBar.jsx             # NT Book filter pills bar (Matt · Mark · Luke · John · Acts · 1Cor · Rev)
    Layout/Layout.jsx                   # forwardRef; sidebar drawer (mobile) / fixed panel (desktop)
    ModeSwitcher/ModeSwitcher.jsx       # Categories / Books tab switcher
    Sidebar/Sidebar.jsx                 # Category Mode accordion TOC; book-filter aware
    TeachingsTable/TeachingsTable.jsx   # Subcategory teachings table (Teaching 58% | Scriptures 42%)
  data/
    loader.js                           # Singleton fetch; exposes loadTeachings(), getTeachingById()
    reverseIndex.js                     # Builds book→chapter→verse index; getReverseIndex()
  hooks/
    useBreakpoint.js                    # useBreakpoint() (xs/sm/md/lg/xl), useIsMobile() (<768px)
    useLocalPreference.js               # localStorage wrapper hook
    useScrollSpy.js                     # IntersectionObserver scroll-spy; useScrollSpy(), useBookScrollSpy()
  styles/
    base.css                            # Full app CSS — layout, components, responsive
    themes/theme-classic.css            # All CSS custom properties (colors, typography, spacing, layout)
  utils/
    bookOrder.js                        # NT_BOOK_ABBR_ORDER, ABBR_TO_FULL, BLB_BOOK_SLUG, sortByBookOrder()
    clipboardCopy.js                    # copyPermalink(teachingId) — writes hash URL to clipboard
    slugify.js                          # catId(), subcatId(), teachingAnchorId(), parseTeachingId()
```

## Architecture Decisions

| Decision | Resolution |
|---|---|
| A-01 | React 18 + Vite |
| A-02 | Full PWA; service worker cache-first for `teachings.json` |
| A-03 | Mobile-first; sidebar = drawer on mobile, fixed panel on desktop |
| A-04 | Blue Letter Bible links for scripture refs — use `BLB_BOOK_SLUG` from `bookOrder.js` |
| A-05 | `localStorage` for user prefs (translation, font size, theme); `sessionStorage` for filters/scroll |

## Feature Priorities

**Phase 1 — complete (Stage 8 QA pending):**
- All browsing modes implemented: Category Mode and Bible Book Mode
- NT Book filter bar (FilterBar) wired to sidebar TOC
- Scroll-spy active state in both sidebar views
- Prev/Next category nav
- Mobile drawer layout

**Phase 2 — next:**
- F-02: Parable-only toggle (in filter bar per R-06)
- F-05: Teaching permalink anchors (copy-to-clipboard, IDs already in DOM)
- R-05/F-08: Font size control (4-step: XS/S/M/L)
- R-06: Consolidate filter bar (books + parables on one bar)

**Phase 3 (deferred):** Print stylesheet, PWA install verification, additional themes, translation selector (blocked on R-03)

## Styling Conventions

All values from CSS custom properties — never hardcode colors, sizes, or spacing. All vars are in `src/styles/themes/theme-classic.css`. Key ones:
- `--color-accent/accent-mid/accent-light` — gold (#9a7b34 / #d4a84b / #f5eed8)
- `--color-authority` — navy #1b2a40
- `--color-bg` — parchment #faf9f6
- `--font-display` / `--font-body`
- `--sidebar-width: 270px` / `--header-height: 56px`

DOM IDs follow JSON slugs: `cat-1`, `cat-1-1`. Teaching anchors: `t-1-2-5` (dots → dashes, prefixed `t-`).

## Catalog Engine

All interaction with `public/teachings.json` — classification, validation, auditing, adding teachings, and restructuring — is governed by the **Catalog Engine** at `catalog_builds/engine/`.

**Load the skill before any catalog operation:**
`catalog_builds/engine/skills/catalog-engine/SKILL.md`

| File | Purpose |
|---|---|
| `catalog_builds/engine/CLASSIFICATION_RULES.md` | Thematic rules for all categories and subcategories |
| `catalog_builds/engine/TAXONOMY_STANDARDS.md` | Standards for creating new cats/subcats; required fields; validation gate |
| `catalog_builds/engine/TAG_RULES.md` | Parable tag definition + canonical 42-parable reference list |
| `catalog_builds/engine/BASELINE.md` | Initial catalog state; known issues (41 Cat-31 ID errors, accepted findings) |
| `catalog_builds/engine/scripts/README.md` | Script usage, options, and sample output |

**CLI scripts** (run from project root):
```bash
node catalog_builds/engine/scripts/parse-catalog.js --stats      # totals
node catalog_builds/engine/scripts/validate-catalog.js           # lint
node catalog_builds/engine/scripts/audit-catalog.js              # quality audit
node catalog_builds/engine/scripts/classify.js --ref "Matt 13:31" # placement check
node catalog_builds/engine/scripts/renumber.js                   # fix IDs and write
```

For current catalog stats, see [`catalog_builds/engine/catalog_stats.md`](catalog_builds/engine/catalog_stats.md).

## Key Planning Documents

- `docs/dev_plan/feature-hitlist.md` — Full feature spec, architecture decisions (A-01–A-07), review notes (R-01–R-11), phase status tables
- `docs/dev_plan/phase-1-dev.md` — Phase 1 development plan (Stages 1–8)
- `docs/dev_plan/ph1-progress.md` — Phase 1 progress tracking (Stages 1–7 detailed)
