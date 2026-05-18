# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jesus Says** is a reference web application cataloging all recorded words of Jesus Christ from the New Testament — organized across 31 thematic categories with full scripture cross-references and 100% coverage of red-letter (Words of Christ) NT verses. The dataset is the primary artifact; the UI exists to browse, filter, and permalink to teachings. For current catalog counts, see [`catalog_builds/engine/catalog_stats.md`](catalog_builds/engine/catalog_stats.md).

## Tech Stack

- **Framework:** React 18 + Vite (`@vitejs/plugin-react`)
- **Routing:** React Router v6 — `HashRouter`; navigation is fully internal state (no route changes)
- **State:** Zustand (`src/store.js`) — showAbout, bibleFontSize, bibleTranslation, bibleBrowseBook/Chapter, dataLoaded, dataError, categories, meta
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

**Catalog:** `public/teachings.json` (fetched at `/JesusSays/teachings.json`)

**Bible text:** Fetched on-demand from [api.bible](https://api.bible) (American Bible Society). Three translations supported: KJV, NKJV, NIV. Requires `VITE_BIBLE_API_KEY` env var. See `src/data/ApiBibleClient.js`, `BibleService.js`, `bibleApi.js`.

## Implemented Source Files

```
src/
  main.jsx                              # Entry; imports themes/theme.css, base.css, modern-nav.css
  App.jsx                               # HashRouter, data load, renders ModernApp
  store.js                              # Zustand store — Bible state, catalog data, about panel visibility
  featureFlags.js                       # Feature flag constants (e.g. ENABLE_ABOUT_PAGE)
  components/
    # ── Navigation ───────────────────────────────────────────────────────────
    ModernApp/ModernApp.jsx             # Root; owns all screen state
    ModernApp/ModernNavBar.jsx          # Sticky top bar with back/home navigation
    ModernApp/ModernSearchBar.jsx       # Search input shown on home and category screens
    ModernApp/HomeScreen.jsx            # Landing: category grid + search results
    ModernApp/CategoryBrowser.jsx       # Subcategory tab view with teachings list
    ModernApp/CategoryTOC.jsx           # Jump-to-subcategory table of contents panel
    ModernApp/TeachingDetail.jsx        # Full teaching detail view
    ModernApp/BibleViewer/BibleViewer.jsx    # Inline Bible reference panel (drawer + pinned modes)
    ModernApp/BibleViewer/BiblePanel.jsx     # Panel content for BibleViewer
    ModernApp/BibleViewer/BibleDrawer.jsx    # Drawer wrapper for BibleViewer
    ModernApp/BibleViewer/BibleBrowser.jsx   # Book/chapter navigation within the panel
    ModernApp/BibleViewer/BibleContent.jsx   # Renders parsed api.bible verse HTML
    ModernApp/BibleViewer/TranslationPicker.jsx  # KJV / NKJV / NIV picker
    ModernApp/BibleViewer/BookPicker.jsx     # NT book selector
    ModernApp/BibleViewer/ChapterPicker.jsx  # Chapter selector for chosen book
    # ── Shared ───────────────────────────────────────────────────────────────
    AboutPanel/AboutPanel.jsx           # About panel shell (feature-flagged)
    AboutPanel/AboutContent.jsx         # App info, creator bio content
    AboutPanel/VersionView.jsx          # Displays app version details
    SettingsMenu/SettingsMenu.jsx       # User settings (font size, Bible translation, theme)
    # ── Catalog Optimizer (feature-flagged admin tool) ────────────────────────
    CatalogOptimizer/CatalogOptimizer.jsx    # Root optimizer shell
    CatalogOptimizer/LoadPanel.jsx           # Loads teachings.json for editing
    CatalogOptimizer/OptimizerToolbar.jsx    # Toolbar actions
    CatalogOptimizer/OutlinePanel.jsx        # Category/subcategory outline tree
    CatalogOptimizer/CategoryEditor.jsx      # Edit category metadata
    CatalogOptimizer/SubcategoryEditor.jsx   # Edit subcategory metadata
    CatalogOptimizer/TeachingEditor.jsx      # Edit individual teaching fields
    CatalogOptimizer/ReferenceEditor.jsx     # Edit scripture references
    CatalogOptimizer/TagEditor.jsx           # Edit teaching tags
  data/
    loader.js                           # Singleton fetch; exposes loadTeachings(), getTeachingById()
    reverseIndex.js                     # Builds book→chapter→verse index; getReverseIndex()
    ApiBibleClient.js                   # api.bible REST client; fetches chapters and passages by translation
    BibleService.js                     # Abstract base class defining the Bible API adapter contract
    bibleApi.js                         # Concrete adapter; wires ApiBibleClient to BibleService interface
  hooks/
    useBreakpoint.js                    # useBreakpoint() (xs/sm/md/lg/xl), useIsMobile() (<768px)
    useLocalPreference.js               # localStorage wrapper hook
    useSearch.js                        # MiniSearch-powered teaching search hook
  styles/
    base.css                            # Full app CSS — layout, components, responsive
    modern-nav.css                      # Navigation, screen layout, and transition styles
    bible-viewer.css                    # Bible viewer panel and drawer styles
    themes/theme.css                    # All CSS custom properties (colors, typography, spacing, layout)
  utils/
    bookOrder.js                        # NT_BOOK_ABBR_ORDER, ABBR_TO_FULL, BLB_BOOK_SLUG, sortByBookOrder()
    clipboardCopy.js                    # copyPermalink(teachingId) — writes hash URL to clipboard
    renumber.js                         # Client-side ID renumbering utility (used by Catalog Optimizer)
    search.js                           # MiniSearch index builder and query function
    slugify.js                          # catId(), subcatId(), teachingAnchorId(), parseTeachingId()
```

## Architecture Decisions

| Decision | Resolution |
|---|---|
| A-01 | React 18 + Vite |
| A-02 | Full PWA; service worker cache-first for `teachings.json` |
| A-03 | Mobile-first single-page flow: home → category browser → teaching detail |
| A-04 | Blue Letter Bible links for scripture refs — use `BLB_BOOK_SLUG` from `bookOrder.js` |
| A-05 | `localStorage` for user prefs (translation, font size, theme); `sessionStorage` for filters/scroll |

## Styling Conventions

All values from CSS custom properties — never hardcode colors, sizes, or spacing. All vars are in `src/styles/themes/theme.css`. Key ones:
- `--color-accent/accent-mid/accent-light` — gold (#9a7b34 / #d4a84b / #f5eed8)
- `--color-authority` — navy #1b2a40
- `--color-bg` — parchment #faf9f6
- `--font-display` / `--font-body`
- `--header-height: 56px`

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
| `catalog_builds/engine/scripts/README.md` | Script usage, options, and sample output |

**CLI scripts** (run from project root):
```bash
node catalog_builds/engine/scripts/parse-catalog.js --stats      # totals
node catalog_builds/engine/scripts/validate-catalog.js           # lint
node catalog_builds/engine/scripts/audit-catalog.js              # quality audit
node catalog_builds/engine/scripts/classify.js --ref "Matt 13:31" # placement check
node catalog_builds/engine/scripts/renumber.js                   # fix IDs and write
node catalog_builds/engine/scripts/sort-teachings.js             # resorts teachings in each subcategory based on primary-ref Book > Chapter > Verse
```

For current catalog stats, see [`catalog_builds/engine/catalog_stats.md`](catalog_builds/engine/catalog_stats.md).

## Key Planning Documents

- `docs/dev_plan/feature-hitlist.md` — Full feature spec, architecture decisions (A-01–A-07), review notes (R-01–R-11), phase status tables
- `docs/dev_plan/phase-1-dev.md` — Phase 1 development plan (Stages 1–8)
- `docs/dev_plan/ph1-progress.md` — Phase 1 progress tracking (Stages 1–7 detailed)
