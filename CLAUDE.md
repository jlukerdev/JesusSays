# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Pre-implementation.** The repository contains planning documents, a data catalog, and a vanilla-JS proof-of-concept HTML file. No production source code exists yet. Implementation in React/Vite is planned.

## Project Overview

**Jesus Says** is a reference web application cataloging all recorded words of Jesus Christ from the New Testament — 335+ teachings across 30 thematic categories, 117 subcategories, and ~700 scripture cross-references. The dataset is the primary artifact; the UI exists to browse, filter, and permalink to teachings.

## Planned Tech Stack (from `assets/planning_v1/feature-hitlist.md`)

- **Framework:** React 18 + Vite
- **Routing:** React Router v6 (deep-linking and permalinks per teaching)
- **State:** Zustand
- **PWA:** vite-plugin-pwa with Workbox (offline-first; `teachings.json` is cache-first)
- **Styling:** CSS custom properties (`:root` variables); CSS Modules or styled-components
- **Fonts:** Playfair Display (headings), Source Sans 3 (body) — Google Fonts

Once implemented, expected scripts:

```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
```

## Design Reference

`assets/planning_v1/poc.html` is a 65KB static HTML/vanilla-JS proof-of-concept. **It is a design spec, not a code base to port.** When implementing React components, use it for visual reference only.

## Data Architecture

**Single source of truth:** `assets/jesus_says_catalog/teachings.json` (360KB)

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
- 7 NT books referenced: Matthew, Mark, Luke, John, Acts, 1 Corinthians, Revelation
- **Data fixes pending:** `assets/jesus_says_catalog/fixes.md` lists 25 missing teachings to add

## Architecture Decisions

| Decision | Resolution |
|---|---|
| A-01 | React 18 + Vite (not Vue/Svelte) |
| A-02 | Full PWA; service worker cache-first for `teachings.json` |
| A-03 | Mobile-first; sidebar = drawer on mobile, fixed panel on desktop |
| A-04 | Blue Letter Bible links for scripture refs (format: `https://www.blueletterbible.org/...`) |
| A-05 | `localStorage` for user prefs (translation, font size, theme); `sessionStorage` for filters/scroll position |

## Feature Priorities (from `assets/planning_v1/feature-hitlist.md`)

**Phase 1 (implement first):**
- Sidebar scroll-spy active state for subcategories
- Parable-only toggle filter
- NT Book multi-select filter bar
- Teaching count badges in sidebar (reactive to active filters)

**Phase 2:** Teaching permalink anchors, print stylesheet, category focus mode, font-size control

**Phase 3 (blocked):** Scripture tooltips (R-03 unresolved), translation selector (blocked on tooltips)

## Styling Conventions

All colors and typography are defined as CSS custom properties — never hardcoded values.

Key variables:
- `--color-accent` / `--color-accent-mid` / `--color-accent-light` — gold (#9a7b34, #d4a84b, #f5eed8)
- `--color-authority` — navy #1b2a40 (headers, category numbers)
- `--color-bg` — parchment #faf9f6
- `--font-display` — Playfair Display
- `--font-body` — Source Sans 3

HTML IDs follow the JSON slugs: `cat-1`, `cat-1-1` (category, subcategory). Teaching elements anchor to their hierarchical ID (e.g., `teaching-1-2-5`).

## Key Planning Documents

- `assets/planning_v1/HTML-STANDARDS.md` — Complete HTML structure spec, component patterns, responsive breakpoints, print styles
- `assets/planning_v1/feature-hitlist.md` — Full feature spec with priorities, architecture decisions (A-01–A-05), and review notes (R-01–R-11)
- `assets/jesus_says_catalog/overview.md` — Data catalog scope, JSON schema with examples, BLB URL patterns
- `assets/jesus_says_catalog/fixes.md` — 25 missing teachings to add, validation script snippet

## Unresolved Decisions

- **R-02:** What happens when a user clicks a scripture reference? (modal, new tab, side panel, or static)
- **R-03:** Scripture tooltips via Bible Gateway widgets or a REST API? (Bible-api.com ruled out)
- **R-04:** Translation selector — blocked until R-03 resolved
- TypeScript vs. JavaScript for the production build
- Hosting/deployment target
