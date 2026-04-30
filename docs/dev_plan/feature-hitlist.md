# Jesus Says — Feature & Architecture Hit-List

**Project:** Jesus Says (React PWA)
**Data source:** `teachings.json` → React application
**Phase plan:** `phase-1-dev.md`
**Status:** Phase 1 complete (Stages 1–7 done; Stage 8 QA pending). Phase 2 (Parables toggle, permalink anchors, font size control) not started. Phase 3 (PWA, print styles) deferred.

---

## Feature Hit-List

---

### F-02 · Parable-Only Toggle

**Priority:** High
**Complexity:** Low–Medium
**Data used:** `tags` array — `"parable"` value on teaching rows

**Description:**
A toggle button in the page header that filters the entire document to show only parable teachings. All 33 parables are tagged in the JSON and render with a `.parable-badge` span. This is a genuinely unique feature — no other reference tool organises Jesus's parables across all categories with full cross-references.

**Behaviour:**
- Toggle button in the site header
- When active: displays only teachings tagged as parables; shows count banner "Showing N parables across M categories"
- When inactive: all content restored, banner hidden
- Button shows active state visually
- State does not persist between sessions

---

### F-03 · NT Book Filter Bar

**Priority:** High
**Complexity:** Medium
**Data used:** `sources` array on each category object

**Description:**
A horizontal filter bar below the site header with one toggle button per NT book represented in the data: `Matt · Mark · Luke · John · Acts · 1 Cor · Rev`. Selecting a book shows only categories that draw from that book. Multiple books can be selected simultaneously.

**Behaviour:**
- Filter bar sits between site header and main content
- Default state: all books active
- Clicking a book pill toggles it; categories with that book source are shown/hidden
- Multiple books can be selected simultaneously (OR logic)
- If all books are deactivated, show message: "Select a book to filter"
- Sidebar TOC updates to reflect visible categories
- Works in combination with F-02 (Parables) — filters stack

---

### F-05 · Teaching Permalink Anchors

**Priority:** Medium
**Complexity:** Low
**Data used:** Teaching IDs (`"4.3.1"` format)

**Description:**
Each teaching row gets a unique anchor ID and a small copy-link icon that copies a deep-link URL to that exact teaching to the clipboard. Makes individual teachings shareable and citeable.

**Behaviour:**
- Each teaching row has a unique anchor ID
- A small link icon appears on row hover in the teaching text cell
- Clicking the icon copies a deep-link URL (with hash anchor) to the clipboard
- Brief "Copied" confirmation appears briefly
- Icon is not visible unless the row is hovered

---

### F-06 · Print Stylesheet

**Priority:** Medium
**Complexity:** Low
**Data used:** None — pure CSS

**Description:**
A `@media print` stylesheet that produces a clean, paginated, print-ready version of the document — suitable for exporting to PDF or printing as a study reference. No interactive chrome, no sidebar, full-width content.

**Behaviour:**
- Sidebar hidden
- Site header simplified to title only
- All categories and subcategories expanded and visible
- Parable badges retained
- Scripture links rendered as plain text (no URLs printed)
- Hover tooltips suppressed
- Page breaks inserted before each category section
- Clean, readable print layout

---

### F-08 · Font Size Control

**Priority:** Low
**Complexity:** Low
**Data used:** None — pure JS/CSS

**Description:**
A small A / A⁺ toggle in the site header that cycles through two font size states. The teaching tables are dense enough that reading comfort varies significantly by screen and user.

**Behaviour:**
- Multiple font size options in site header (specific steps defined in R-05)
- Default is a comfortable reading size for tables
- Font size change applies to all text
- State does not persist between sessions

---

### F-09 · Dual Catalog Browser — Category Mode and Bible Book Mode

**Priority:** High
**Complexity:** High
**Data used:** All fields — `categories`, `subcategories`, `teachings`, `references`, `tags`, `sources`

**Description:**
The catalog can be browsed in two fundamentally different modes, selectable from the top-level navigation. Each mode has its own TOC nav panel and its own viewer layout. A persistent mode switcher (e.g. segmented control or tab bar) is always visible so the user can move between them.

---

#### Mode 1 — Category Browser ✅ Done (Phase 1 — Stage 5)

The primary mode. Navigate the catalog by theological category.

**Navigation panel (sidebar / drawer):**
- Lists all categories with their subcategories nested beneath
- Clicking a category expands it and scrolls the viewer to that category
- Subcategory links scroll to the relevant block within the viewer
- Active category and subcategory are highlighted

**Viewer:**
- Displays one category at a time
- Shows the selected category's title, description, source books, and teaching tables
- Prev/Next nav allows linear pagination through categories
- URL updates to support deep linking and back-button navigation

**Filters in Category Mode:**
- Filter bar (F-02, F-03) operates within the current category view
- Teaching counts update dynamically as filters change

**Mobile behaviour:**
- TOC panel is a drawer, accessed via header button
- Drawer closes when a link is tapped
- Prev/Next nav adapted for mobile touch targets
- Filter bar adapted for mobile screens

---

#### Mode 2 — Bible Book Browser ✅ Done (Phase 1 — Stage 7A)

An alternative mode that reorganises the same teaching data by book of the Bible, in canonical NT order, then by chapter and verse.

**Navigation panel (sidebar / drawer):**
- Lists the 7 source books in NT canonical order
- Expanding a book shows its chapters that contain teachings
- Expanding a chapter shows individual verse ranges
- Clicking any nav item scrolls the viewer to that location
- Active book, chapter, and verse are highlighted

**Viewer:**
- Displays all teachings organised by book → chapter → verse
- Book headers provide prominent section dividers
- Chapter headers provide lighter delineation within each book
- Teaching rows are listed in verse order within each chapter
- Each teaching row includes a category label for context
- Teachings are sorted by their primary reference; cross-references do not drive placement
- Parallel passages appear once, under their primary reference location

**Category filter in Book Mode:**
- Filter panel allows filtering by category within the book/chapter structure
- Chapters and books with no visible content are suppressed
- TOC updates to reflect only visible content
- Filter state is independent between modes

**Mobile behaviour:**
- TOC panel is a drawer, accessed via header button
- Nav items have comfortable touch targets
- Category filter is accessible separately
- Sticky book and chapter headers aid navigation

**Data requirements:**
- A reverse index is derived at app load time: teaches → book/chapter/verse mapping
- This index drives the Book Browser and is computed once, not on every render
- Parable toggle (F-02) applies in both modes

---

### F-10 · Teaching Selection & Print Builder

**Priority:** Medium
**Complexity:** Medium
**Data used:** Teaching IDs, teaching text, tags, references
**Phase:** 3 (extends F-06; requires stable catalog)

**Description:**
A "build your own" print mode that lets the user hand-pick individual teachings from anywhere in the catalog — across categories, while navigating freely — and generate a clean printable page containing only the selected items. Useful for study sheets, sermon prep, or topical reference cards.

**Behaviour:**
- A "Select Teachings" toggle button activates selection mode
- When selection mode is active:
  - Each teaching row shows a checkbox
  - A floating bar appears showing count with **Print** and **Clear** buttons
  - Selections persist as the user navigates between categories
  - "Select all in this category" shortcut available
- **Print** button triggers print preview; print CSS renders only selected teachings:
  - Selected teachings grouped by category
  - Parable badges retained
  - Scripture references as plain text
  - Clean, readable layout suitable for study materials
- **Clear** button deselects all
- Selection state is session-only
- When selection mode is inactive: all UI hidden, all teachings visible

**Mobile behaviour:**
- Floating bar is full-width fixed bottom strip
- Touch targets meet 44px minimum size
- Easy tap targets for all controls

**Implementation notes:**
- Depends on F-06 (print stylesheet) being in place

---

## Feature Summary

| ID | Feature | Priority | Complexity | Phase |
|---|---|---|---|---|
| F-02 | Parable-only toggle | High | Low–Med | 2 |
| F-03 | NT Book filter bar | High | Medium | 2 |
| F-05 | Teaching permalink anchors | Medium | Low | 2 |
| F-06 | Print stylesheet | Medium | Low | 3 |
| F-08 | Font size control (4 steps) | Low | Low | 2 |
| F-09 | Dual catalog browser (Category + Book modes) | High | High | 1/2 |
| F-10 | Teaching selection & print builder | Medium | Medium | 3 |
| R-05 | Font size control — multi-step | Low | Low | 2 |
| R-06 | Consolidate filter bar | High | Low | 2 |
| R-10 | CSS theme system | High | Medium | 1/3 |

---

## Implementation Notes for Developer

- **Architecture:** React with component-based composition. See A-01 and A-07 for full guidance.
- **State management:** Zustand for global app state (filters, font size, selected mode, active category, etc.).
- **Hooks:** Custom hooks for scroll-spy (F-01), filters (F-02, F-03, F-04), local preferences (R-05), and breakpoint detection.
- **Filter interaction:** F-02 (Parables), F-03 (Books), and F-04 (Count badges) interact; recompute visible teaching counts when either filter changes.
- **Filters stack:** F-02 and F-03 can both be active simultaneously; AND logic applies across both.
- **Reverse index:** Build once at app load for F-09 Mode 2 (Book Browser); memoize and do not recompute per render.
- **localStorage / sessionStorage:** Permitted per A-05 for user preferences (font size, translation, theme, last category) and session state (active filters, scroll position).
- **Routing:** React Router with HashRouter (A-06). Mode 1 routes: `/#/category/:slug`. Mode 2 routes: `/#/book/:bookAbbr[/:chapter][/:verse]`.

---

## POC Review Notes

*Captured after reviewing `poc.html`. These supersede or amend earlier decisions and must be incorporated into the full build.*

---

### R-01 · App Title Change

**Type:** Design decision
**Affects:** `<title>`, `<h1>`

The main page/app title is **"Jesus Says"** — not "Christ's Teachings" or "The Teachings of Jesus Christ."

- `<h1>` in the site header: `Jesus Says`
- `<title>` tag: `Jesus Says`
- Remove the eyebrow/subtitle line above the `<h1>` entirely (the small uppercase line that reads "New Testament · All Four Gospels" or similar)

---

### R-05 · Text Size — More Steps

**Type:** Enhancement to F-08
**Priority:** Low
**Complexity:** Low

The current two-state font size toggle (A / A+) is insufficient. Replace with a multi-step control offering at least 4 size options.

**Proposed steps:**

| Label | Base font size |
|---|---|
| XS | 13px |
| S | 15px (default) |
| M | 17px |
| L | 19px |

**Behaviour:**
- Render as 4 adjacent buttons replacing the current A / A+ pair
- Active step is highlighted in gold
- Changing size applies immediately by toggling a class on `<body>` that sets `font-size` (all other sizing cascades via `rem`)
- Default is S (15px) on page load

**Implementation notes:**
- CSS classes: `.font-xs`, `.font-s`, `.font-m`, `.font-l` on `<body>`
- `:root { font-size: 13px/15px/17px/19px }` per class, with all element sizes in `rem`
- Remove existing two-button implementation entirely

---

### R-06 · Consolidate Filter Bar — Move Parables Toggle

**Type:** Layout change
**Priority:** High
**Complexity:** Low

Move the Parables Only toggle out of the site header and into the filter bar so all filter controls (books + parables) are on a single row.

**Behaviour:**
- Filter bar now contains: `Filter by Book` label · book pills · `|` divider · `Parables Only` toggle · `Clear filters` button
- "Parables Only" in the header is removed
- The header controls row retains only: font size buttons (to be expanded per R-05)
- "Clear filters" clears both the book filter and the parables toggle simultaneously

**Implementation notes:**
- Single `clearFilters()` function resets both `activeBooks` and `parablesOnly` state
- Filter bar padding and flex layout may need adjustment to accommodate the additional control
- On mobile (≤768px), filter bar wraps naturally — no special handling needed

---

### R-07 · Remove Application Tag Pills

**Type:** Design removal
**Priority:** High
**Complexity:** Low

Remove the coloured tag pills displayed under each category's application box (e.g. "Identity & Worldview", "Values & Priorities", "Spiritual Disciplines"). These were an attempt to apply thematic tones to categories and are not needed.

**Affects:**
- Remove all `.cat-tags` / `.tag` HTML from each category section
- Remove `.tag`, `.tag-blue`, `.tag-green`, `.tag-amber`, `.tag-purple`, `.tag-rose` CSS classes
- Do **not** remove the `tags` array from `teachings.json` — the `"parable"` tag on individual teaching rows is separate and must be kept

---

### R-08 · Category Number Styling — More Minimal

**Type:** Design change
**Priority:** Medium
**Complexity:** Low

The current `.cat-number` element (a 48×48px navy square with gold numeral) is too visually heavy relative to the category title. Replace with a lighter, more typographically integrated treatment.

**Proposed styling:**
- Remove the filled navy square entirely
- Display the category number as plain text, same Playfair Display serif as the title, in `var(--gold)` or `var(--muted)` colour
- Size: approximately 1rem, positioned inline before or above the category title
- The number and title should feel like a single typographic unit, not a number badge alongside a title

**Implementation notes:**
- The `.cat-number` div can be replaced with a `<span class="cat-num-inline">` inside `.cat-title` or as a sibling just above it
- Remove the `.cat-number` box CSS entirely (width, height, background, border-radius, flex centering)
- Suggested rendering: `<span class="cat-num-inline">4.</span> The Kingdom of God` — number and title on the same baseline

---

### R-09 · Category Source Books — Full Names

**Type:** Data display change
**Priority:** Low
**Complexity:** Low

The source books displayed in the `.cat-subtitle` line under each category title should use full book names, not abbreviations.

**Before:** `Matt · Mark · Luke · John`
**After:** `Matthew · Mark · Luke · John`

**Full name mapping:**

| Abbr | Full Name |
|---|---|
| Matt | Matthew |
| Mark | Mark |
| Luke | Luke |
| John | John |
| Acts | Acts |
| 1 Cor | 1 Corinthians |
| Rev | Revelation |

**Implementation notes:**
- At HTML render time, map the `sources` array from the JSON through this table before writing to the DOM
- The `sources` array in `teachings.json` stores abbreviations — do not change the JSON; apply the mapping only at render time
- The `.cat-subtitle` element remains italic and muted as specced

---

### R-10 · CSS Theme System — Interchangeable Themes

**Type:** Architecture requirement
**Priority:** High
**Complexity:** Medium

The HTML must be structured so that the entire visual appearance can be switched by swapping or overriding a single CSS theme file — with zero changes to the HTML markup. The current gold/navy/parchment palette becomes the default theme ("Classic"), with additional themes implementable alongside it.

**Architecture:**

All colour, font, shadow, border-radius, and spacing values that define the visual character of the document must be expressed exclusively as CSS custom properties declared in a `:root` block within a dedicated theme file (or `<style>` block). No colour values, font names, or decorative measurements may be hardcoded anywhere in the structural CSS.

**Theme file structure:**
```
themes/
  theme-classic.css     ← default (gold, navy, parchment)
  theme-minimal.css     ← example alternate
  theme-dark.css        ← example alternate
```

Each theme file contains only a `:root { }` block redefining the custom properties. The structural CSS (layout, spacing, component shapes) lives in a separate `base.css` and is never modified per theme.

**Minimum set of themeable CSS variables:**

```css
:root {
  /* Palette */
  --color-bg:           #faf9f6;   /* page background */
  --color-surface:      #ffffff;   /* sidebar, cards */
  --color-border:       #e5e0d5;   /* dividers, table borders */
  --color-ink:          #1e1e1e;   /* primary text */
  --color-muted:        #6b7280;   /* secondary text, labels */

  /* Accent */
  --color-accent:       #9a7b34;   /* links, badges, active states */
  --color-accent-light: #f5eed8;   /* accent backgrounds */
  --color-accent-mid:   #d4a84b;   /* accent borders, highlights */

  /* Authority */
  --color-authority:    #1b2a40;   /* header, table heads, cat numbers */
  --color-authority-fg: #ffffff;   /* text on authority backgrounds */

  /* Typography */
  --font-display:       'Playfair Display', serif;
  --font-body:          'Source Sans 3', sans-serif;

  /* Radii */
  --radius-sm:          4px;
  --radius-md:          8px;
  --radius-pill:        100px;

  /* Shadows */
  --shadow-tooltip:     0 8px 28px rgba(0,0,0,0.13);
  --shadow-pane:        -4px 0 24px rgba(0,0,0,0.12);
}
```

**What a theme controls:**
- Full colour palette (e.g. dark background, light text, different accent)
- Font families (e.g. swap to a sans-serif display font for a modern theme)
- Border radius scale (e.g. sharp corners for minimal, rounder for soft)
- Shadow intensity and style

**What a theme does not control:**
- Layout — column widths, padding scale, grid structure live in base CSS only
- Component structure — HTML markup is fixed and theme-agnostic

**Theme switching (optional future feature):**
A theme selector may be added to the header controls in a future iteration, dynamically swapping a `<link>` tag or toggling a class on `<html>`. This is not required for the initial build — the architecture simply must not prevent it.

**Implementation notes:**
- Before the full build begins, audit every colour value, font-family, border-radius, and box-shadow in the POC stylesheet and replace each with a variable reference
- Name variables semantically — not what they look like (`--gold`) but what they represent (`--color-accent`)
- The `teachings.json` data and all JS are fully theme-agnostic; no changes required per theme
- Google Fonts `<link>` tags for alternate font families may need conditional loading if font swapping becomes a requirement — plan for this

---

## Updated Summary Table — Phased Delivery

> Phase assignments reflect development sequencing. Ph 1 = app shell + foundational browsing. Ph 2 = filters, Bible Book Mode, scripture tooltips. Ph 3 = enhancements, polish, additional themes.

### Phase 1 — App Shell & Category Browser

| ID | Item | Type | Priority | Status | Notes |
|---|---|---|---|---|---|
| A-01 | Target platform — React + Vite | Architecture | Foundational | ✅ Done | React 18 + Vite 5 scaffolded |
| A-03 | Mobile-first design | Architecture | High | ✅ Done | Mobile-first CSS; drawer on mobile, fixed panel on desktop |
| A-04 | External dependencies — no restrictions | Architecture | Foundational | ✅ Done | Constraint lifted; approved deps installed |
| A-05 | localStorage / sessionStorage permitted | Architecture | Medium | ✅ Done | Permitted for user preferences and session state |
| A-06 | Hosting — GitHub Pages | Architecture | Foundational | ⚠️ Partial | HashRouter + Vite base done; live deployment pending |
| A-07 | JS separation of concerns | Architecture | High | ✅ Done | Full component-based architecture in place |
| R-01 | App title → "Jesus Says" | Design | High | ✅ Done | Title set across site |
| R-07 | Remove application tag pills | Removal | High | ✅ Done | Tag pills absent from components |
| R-08 | Category number — minimal typographic style | Design | Medium | ✅ Done | Inline minimal styling |
| R-09 | Source books — full names | Display | Low | ✅ Done | Full book names displayed |
| R-10 | CSS theme system — Classic theme | Architecture | High | ✅ Done | Full CSS variable system in place |
| F-09 (partial) | Category Browser — Mode 1 | Feature | High | ✅ Done | Category Mode fully implemented |
| F-03 | NT Book filter bar | Feature | High | ✅ Done | Implemented in Stage 7B |
| F-09 (complete) | Bible Book Browser — Mode 2 | Feature | High | ✅ Done | Implemented in Stage 7A |

### Phase 2 — Filters & Bible Book Mode

| ID | Item | Type | Priority | Status | Notes |
|---|---|---|---|---|---|
| F-02 | Parable-only toggle | Feature | High | ⬜ Not started | In filter bar per R-06 |
| F-03 | NT Book filter bar | Feature | High | ✅ Done (Phase 1) | Implemented in Stage 7B |
| F-05 | Teaching permalink anchors | Feature | Medium | ⬜ Not started | Copy-to-clipboard deep links |
| F-09 (Mode 2) | Bible Book Browser | Feature | High | ✅ Done (Phase 1) | Implemented in Stage 7A |
| R-05 | Font size control — 4 steps | Feature | Low | ⬜ Not started | Multi-step size selector |
| R-06 | Consolidate filter bar | Layout | High | ⬜ Not started | All filters in one bar |

### Phase 3 — Polish & Enhancements

| ID | Item | Type | Priority | Status | Notes |
|---|---|---|---|---|---|
| A-02 | PWA — service worker + manifest | Architecture | High | ⬜ Not started | Service worker caching, offline support |
| F-06 | Print stylesheet | Feature | Medium | ⬜ Not started | Clean, readable print layout |
| F-10 | Teaching selection & print builder | Feature | Medium | ⬜ Not started | Custom selection printing |
| R-10 (extended) | Additional themes (Minimal, Dark) | Architecture | Low | ⬜ Not started | Alt themes using CSS variable system |

---

## Platform & Architecture Decisions

*These decisions apply to the full production React/PWA build. The HTML/CSS POC is a design artifact only.*

---

### A-01 · Target Platform — React Application

**Type:** Platform decision
**Priority:** Foundational

The final application will be built in **React**. The HTML/CSS POC is a design and spec artifact only — it is not the production codebase. All feature and design decisions in this document should be interpreted with a React implementation in mind.

**Implications:**
- Component-based architecture: each major UI element (Sidebar, CategorySection, SubcategoryBlock, TeachingsTable, FilterBar, ScriptureTooltip, ScriptureSidePane, ThemeProvider) should be designed as a discrete React component
- State management: app-level state (active filters, selected translation, font size, focus mode, theme) should be handled via React context or a lightweight state manager (Zustand recommended over Redux for this scope)
- The `teachings.json` file is the data source — it will be imported directly as a static asset or fetched at runtime; no backend is required
- Teaching IDs, category slugs, and subcategory slugs from the JSON become React component keys and routing anchors
- The scroll-spy, filter logic, and all interactive behaviour become React hooks or components
- The POC constraint of "vanilla JS only, no frameworks" is **superseded** for the production build

**Recommended stack:**
- React 18+
- Vite (build tool)
- React Router (for deep-linking / permalink support — F-05)
- Zustand (lightweight global state)
- CSS Modules or styled-components for scoped theming (aligned with R-10)

---

### A-02 · Progressive Web App (PWA)

**Type:** Platform requirement
**Priority:** High

The final application must meet PWA standards, enabling installation on mobile and desktop devices, offline access, and native-app-like behaviour.

**Minimum PWA requirements:**

- `manifest.json` with app name ("Jesus Says"), icons (192px, 512px), theme colour, display mode (`standalone`), and start URL
- Service worker with a caching strategy appropriate for a static-data app
- HTTPS deployment (required for service worker registration)
- Installable on iOS (Safari Add to Home Screen) and Android (Chrome install prompt)

**Caching strategy:**
- `teachings.json` — cache-first (data never changes at runtime)
- App shell (HTML, CSS, JS bundles) — cache-first with version-based invalidation
- Google Fonts — stale-while-revalidate

**Offline behaviour:**
- Full browsing of all categories, subcategories, and teachings available offline (all data is bundled)
- All filters and UI interactions work fully offline

**Implementation notes:**
- Use **Vite PWA plugin** (`vite-plugin-pwa`) with Workbox under the hood — handles service worker generation, manifest injection, and asset precaching automatically
- Define a `workbox` config to explicitly include `teachings.json` in the precache manifest
- PWA icons should use the "Jesus Says" app identity — design TBD
- Test on real iOS Safari and Android Chrome before release; emulators are insufficient for PWA install flow testing

---

### A-03 · Mobile-First Design

**Type:** Design requirement
**Priority:** High

All UI components must be designed mobile-first — the base stylesheet targets small screens, with responsive breakpoints layering on larger layouts. The current POC inverts this (desktop layout with a `max-width: 768px` override) and must be corrected in the production build.

**Breakpoint system (suggested):**

| Breakpoint | Width | Layout |
|---|---|---|
| `xs` (default) | < 480px | Single column, no sidebar, stacked filters |
| `sm` | 480px–767px | Single column, bottom sheet navigation |
| `md` | 768px–1023px | Sidebar appears (collapsible), filter bar visible |
| `lg` | 1024px–1279px | Full sidebar, all features visible |
| `xl` | 1280px+ | Wider content area, optional expanded sidebar |

**Mobile-specific UI considerations:**

- **Sidebar / TOC:** On `xs`/`sm`, the sidebar is hidden by default and accessible via a header button that opens it as a drawer
- **Filter bar:** On `xs`, filters stack into a collapsible panel
- **Teaching tables:** On `xs`, layout reflows as needed for readability
- **Touch targets:** All interactive elements (book pills, sidebar links, scripture links, control buttons) must meet the 44×44px minimum touch target size
- **Scroll-spy:** Must account for mobile browser chrome (variable viewport height on iOS) — use `dvh` units or JS-calculated offsets

**Implementation notes:**
- In React, use a custom `useBreakpoint()` hook to expose current breakpoint to components that need conditional rendering
- Avoid relying solely on CSS media queries for layout logic that also drives JS behaviour (e.g. whether the sidebar is a panel or drawer)
- Test on real devices — minimum: iPhone SE (small screen), iPhone 14 Pro, Samsung Galaxy S-series, iPad

---

### A-04 · External Dependencies — No Restrictions

**Type:** Constraint removal
**Priority:** Foundational

The POC restriction to "vanilla JS only, no external frameworks" is **fully lifted** for the production React build. Any library, framework, or dependency that genuinely enhances the application is permitted and encouraged.

**Recommended / approved dependencies (non-exhaustive):**

| Category | Library | Purpose |
|---|---|---|
| Framework | React 18 | Core UI framework |
| Build | Vite | Dev server, bundler |
| PWA | vite-plugin-pwa | Service worker + manifest |
| Routing | React Router v6 | Deep links, permalink navigation |
| State | Zustand | Lightweight global state |
| Styling | Plain CSS with variables | Theme system via custom properties |
| Icons | Lucide React | Clean, consistent icon set |
| Fonts | Google Fonts | Playfair Display, Source Sans 3 |
| PWA utils | Workbox (via vite-plugin-pwa) | Caching strategies |

**Notes:**
- jQuery is permitted but not recommended given the React target — jQuery and React's virtual DOM conflict in practice. If jQuery is used, it must operate only on elements outside of React's render tree.
- Any dependency added must have an active maintenance record and a permissive licence (MIT, Apache 2.0, or ISC preferred)
- Bundle size should be considered — prefer tree-shakeable libraries

---

### A-05 · localStorage and Cookies — Permitted for UX

**Type:** Constraint removal + feature guidance
**Priority:** Medium

The previous restriction on `localStorage` and `sessionStorage` is **lifted**. Both `localStorage` and cookies may be used to persist user preferences across sessions.

**Approved persistence use cases:**

| Preference | Storage type | Notes |
|---|---|---|
| Selected Bible translation (R-04) | `localStorage` | Persist across sessions |
| Font size selection (R-05) | `localStorage` | Restore on next visit |
| Selected theme (R-10) | `localStorage` | Restore on next visit |
| Last scroll position / active category | `sessionStorage` | Restore within same session only |
| Active book filters | `sessionStorage` | Reset on new session — filter state is contextual |
| Parable toggle state | `sessionStorage` | Reset on new session |

**Implementation notes:**
- In React, wrap persistence logic in a custom hook (e.g. `useLocalPreference(key, defaultValue)`) that reads from `localStorage` on mount and writes on change — avoids scattered storage calls
- Always provide a sensible default if the stored value is missing or corrupted
- Do not store sensitive data — all persisted values are UI preferences only
- Cookie use is permitted but `localStorage` is preferred for client-side preferences; cookies are more appropriate if server-side rendering or cross-subdomain access is ever introduced

---

### A-06 · Hosting — GitHub Pages

**Type:** Architecture requirement
**Priority:** Foundational

The application must be deployable and fully functional when hosted on **GitHub Pages** (`https://{username}.github.io/{repo}/` or a custom domain via CNAME).

**Constraints this imposes:**

- **Static files only** — GitHub Pages serves static assets; no server-side rendering, no Node.js runtime, no serverless functions. All data must be bundled or fetched client-side.
- **No dynamic routing without hash-based URLs or a 404 redirect hack** — React Router's `BrowserRouter` uses the History API and will produce 404s on direct URL access or refresh on GitHub Pages. Use `HashRouter` instead, or implement the standard `404.html → index.html` redirect workaround. `HashRouter` is the simpler and more reliable choice for this scope.
- **Base URL** — if deployed to a subdirectory (e.g. `/jesus-says/`), Vite must be configured with `base: '/jesus-says/'` in `vite.config.js`. All asset paths and the PWA manifest `start_url` must account for this base.
- **`teachings.json` as a static asset** — the data file must be bundled with the app or placed in the `public/` directory so it is copied to the dist root. Import it directly in React or fetch it from a relative URL. No backend serving required.
- **PWA service worker** — service workers are permitted on GitHub Pages as long as the site is served over HTTPS (which GitHub Pages enforces). The `vite-plugin-pwa` approach (A-02) is fully compatible.
- **Deployment** — use the `gh-pages` npm package or a GitHub Actions workflow (`peaceiris/actions-gh5pages` or the official `actions/deploy-pages`) to publish the `dist/` output to the `gh-pages` branch. A GitHub Actions workflow is preferred for automation on push to `main`.

**Features with GitHub Pages implications — surface now:**

| Feature / Item | Issue | Resolution |
|---|---|---|
| React Router deep links (F-05 permalinks) | `BrowserRouter` causes 404 on direct URL access | Use `HashRouter`; permalinks become `/#/t-4-3-1` style |
| Bible Gateway tooltip widget (R-03) | External script loaded from BibleGateway CDN — no CORS issue, works on static host | No blocker; confirm widget script URL is HTTPS |
| Scripture click navigation (R-02) | If opening external site in new tab, no issue. If using a modal with fetched verse data, any API called must support CORS from a GitHub Pages origin | Confirm CORS headers on any Bible API used |
| PWA `start_url` in `manifest.json` | Must match the deployed base URL path | Set `start_url` to `/` (custom domain) or `/{repo}/` (subdirectory deploy) |
| Google Fonts | Loaded via `<link>` from Google CDN — works fine on static host | No blocker |
| `localStorage` / `sessionStorage` (A-05) | Fully supported in GitHub Pages context | No blocker |

**Deployment checklist (to be completed before launch):**
- [x] `vite.config.js` has correct `base` setting for deploy path (`/JesusSays/`)
- [x] `HashRouter` in use (or 404 redirect workaround confirmed working)
- [ ] `manifest.json` `start_url` matches live URL *(requires live deploy verification)*
- [ ] Service worker registers correctly on the live HTTPS origin *(requires live deploy)*
- [ ] `teachings.json` resolves correctly from the deployed base path *(requires merge to main)*
- [x] GitHub Actions workflow pushes `dist/` to `gh-pages` branch on merge to `main`

---

### A-07 · JavaScript Architecture — Separation of Concerns

**Type:** Architecture requirement
**Priority:** High

Inline JavaScript in HTML files must be kept to an absolute minimum. All application logic is split across discrete JS module files, each with a single, well-defined responsibility. The HTML file(s) should contain no business logic — only the bootstrapping `<script type="module">` tag(s) needed to load the app entry point.

**Principles:**

- **No inline `<script>` blocks** containing logic — event listeners, DOM manipulation, filter functions, scroll-spy, tooltip init, and all other behaviour live in imported JS files, not in the HTML
- **One concern per file** — each module handles one area of responsibility and exports only what other modules need
- **Entry point only in HTML** — the sole permitted inline or embedded script reference is `<script type="module" src="/src/main.jsx"></script>` (or equivalent Vite entry point). All other scripts are imported from there.
- **ES modules throughout** — use `import` / `export` syntax; no global variables, no `window.*` pollution

**Suggested module structure (React build):**

```
src/
  main.jsx                  ← App entry point; mounts React root
  App.jsx                   ← Top-level component; routing, mode switcher
  data/
    teachings.json          ← Static data asset
    loader.js               ← Imports and exposes teachings data; builds reverse index
    reverseIndex.js         ← Derives book → chapter → verse index from teachings data
  components/
    Sidebar/                ← TOC nav panel (Category Mode)
    BookNav/                ← TOC nav panel (Book Mode)
    CategoryViewer/         ← Category Mode viewer
    BookViewer/             ← Book Mode viewer
    FilterBar/              ← Book pills + Parables toggle + Clear
    TeachingsTable/         ← Shared table component
    ScriptureLink/          ← Reference chip with tooltip
    ModeSwitcher/           ← Category / Book toggle control
  hooks/
    useScrollSpy.js         ← Scroll position → active section tracking
    useFilters.js           ← Filter state (books, parables, categories)
    useBreakpoint.js        ← Responsive breakpoint detection
    useLocalPreference.js   ← localStorage read/write wrapper
  utils/
    bookOrder.js            ← NT canonical book order constants and helpers
    slugify.js              ← ID/slug generation utilities
    clipboardCopy.js        ← Permalink copy helper (F-05)
  styles/
    base.css                ← Layout, spacing, component structure — no hardcoded colours
    themes/
      theme-classic.css     ← Default gold/navy/parchment theme (R-10)
```

**Implementation notes:**
- This structure supersedes the POC directive for "all JS inline at the bottom of `<body>`" — that constraint applied to the POC only and is fully lifted for the React build (per A-01, A-04)
- Each hook and utility should be independently testable — pure functions where possible
- `loader.js` and `reverseIndex.js` run once on app initialisation; their outputs are passed down via React context or Zustand store, not recomputed per render
- Avoid barrel `index.js` files that re-export everything — import directly from the source module to keep dependency graphs legible
