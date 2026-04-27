# Jesus Says — Feature & Architecture Hit-List

**Project:** Jesus Says (React PWA)
**Data source:** `teachings.json` → React application
**Standards ref:** `HTML-STANDARDS.md` (POC only — superseded for production by A-01, A-04, A-07)
**Phase plan:** `phase-1-dev.md`
**Status:** Phase 1 (Stages 1–6) complete · Stage 7 (F-09 Mode 2 + F-03) and Stage 8 (QA) pending · PWA/deployment deferred to Phase 3

---

## Already Specced in HTML-STANDARDS.md (Do Not Re-implement)

The following are fully defined in the standards doc and should be treated as baseline, not features:

- Sidebar scroll-spy (category-level active state)
- Scripture hover tooltips — see R-03 for current approach
- Scripture reference link behaviour — see R-02 (TBD)
- Parable badge rendering from `tags` array
- Responsive breakpoint at 768px

---

## Feature Hit-List

---

### F-01 · Subcategory Active State in Sidebar ✅ Done (Phase 1 — Stage 6)

**Priority:** High
**Complexity:** Low
**Data used:** Teaching IDs, subcategory slugs

**Description:**
Extend the existing scroll-spy to highlight the active *subcategory* link in the sidebar, not just the parent category. Currently the standards doc only tracks `section[id]` at the category level. The subcategory blocks (`cat-{N}-{M}`) also have IDs and sidebar links.

**Behaviour:**
- When a subcategory block scrolls into view, its sidebar link receives `.active` styling
- The parent category link remains `.active` simultaneously
- Both deactivate when scrolling past

**Implementation notes:**
- Implemented as `useScrollSpy` hook using `IntersectionObserver` targeting `.subcategory-section[id]` elements
- `rootMargin: '-10% 0px -75% 0px'` keeps active detection in the upper viewport
- Active subcategory link receives `.sidebar-nav__subcat-link--active`; parent category active state driven by `activeCategorySlug` in Zustand store
- `dvh`-aware: layout uses `calc(100dvh - var(--header-height))` for correct mobile chrome handling

---

### F-02 · Parable-Only Toggle

**Priority:** High
**Complexity:** Low–Medium
**Data used:** `tags` array — `"parable"` value on teaching rows

**Description:**
A toggle button in the page header that filters the entire document to show only parable teachings. All 33 parables are tagged in the JSON and render with a `.parable-badge` span. This is a genuinely unique feature — no other reference tool organises Jesus's parables across all categories with full cross-references.

**Behaviour:**
- Toggle button in the site header, right-aligned: label "Parables Only"
- When active:
  - All `<tr>` rows without a `.parable-badge` are hidden (`display: none`)
  - All subcategory blocks with no visible rows are hidden
  - All category sections with no visible subcategory blocks are hidden
  - A banner appears below the header: "Showing 33 parables across [N] categories"
  - Sidebar TOC collapses to show only categories with visible content
- When inactive: all content restored, banner hidden
- Button active state: gold background, white text

**Implementation notes:**
- Use vanilla JS — no framework needed
- Drive visibility off `.parable-badge` presence within each `<tr>`
- Button state persists only for the session (no localStorage required)

---

### F-03 · NT Book Filter Bar

**Priority:** High
**Complexity:** Medium
**Data used:** `sources` array on each category object

**Description:**
A horizontal filter bar below the site header with one toggle button per NT book represented in the data: `Matt · Mark · Luke · John · Acts · 1 Cor · Rev`. Selecting a book shows only categories that draw from that book. Multiple books can be selected simultaneously.

**Behaviour:**
- Filter bar sits between site header and main content, full width
- Default state: all books active (all content visible)
- Clicking a book pill toggles it — when a book is deactivated, categories whose `sources` array does not include it are hidden
- When multiple books are selected, a category is visible if it matches *any* selected book (OR logic)
- If all books are deactivated, show a message: "Select a book to filter"
- Sidebar TOC updates to reflect visible categories only
- Active pill: gold fill; inactive pill: outline style

**Implementation notes:**
- Each category `<section>` should carry a `data-sources` attribute populated from the `sources` array at render time (e.g. `data-sources="Matt Mark Luke John"`)
- Filter reads these attributes to show/hide sections
- Works in combination with F-02 (Parable toggle) — filters stack

---

### F-04 · Teaching Count Badges in Sidebar

**Priority:** Medium
**Complexity:** Low
**Data used:** Teaching count per category (derivable from JSON at render time)

**Description:**
Small numeric badges next to each category name in the sidebar TOC showing the number of teachings in that category.

**Behaviour:**
- Badge appears inline after the category title text: e.g. "The Kingdom of God `43`"
- Badge updates dynamically when F-02 or F-03 filters are active, reflecting the count of currently *visible* teachings
- Subcategory links do not show counts (too granular)

**Implementation notes:**
- Render badge as `<span class="toc-count">{N}</span>` inside each `.toc-cat` anchor
- Style: `background: var(--gold-light)`, `color: var(--gold)`, `font-size: 0.68rem`, `border-radius: 100px`, `padding: 0.1rem 0.45rem`
- On filter change, recount visible `<tr>` rows within each category section and update badge text

---

### F-05 · Teaching Permalink Anchors

**Priority:** Medium
**Complexity:** Low
**Data used:** Teaching IDs (`"4.3.1"` format)

**Description:**
Each teaching row gets a unique anchor ID and a small copy-link icon that copies a deep-link URL to that exact teaching to the clipboard. Makes individual teachings shareable and citeable.

**Behaviour:**
- Each `<tr>` in the teachings tables receives `id="t-{teaching-id}"` (e.g. `id="t-4-3-1"`)
- A small link icon (`⚓` or `#`) appears on row hover in the teaching text cell, far right
- Clicking the icon copies `{page-url}#t-4-3-1` to the clipboard
- Brief "Copied" confirmation tooltip appears for 1.5 seconds then fades
- Icon is not visible unless the row is hovered (keeps the table clean)

**Implementation notes:**
- Use `navigator.clipboard.writeText()` — no fallback needed for modern browsers
- Icon: inline SVG or unicode `#`, styled `color: var(--muted)`, hover `color: var(--gold)`
- Add `id` attributes at HTML render time using the `id` field from the JSON

---

### F-06 · Print Stylesheet

**Priority:** Medium
**Complexity:** Low
**Data used:** None — pure CSS

**Description:**
A `@media print` stylesheet that produces a clean, paginated, print-ready version of the document — suitable for exporting to PDF or printing as a study reference. No interactive chrome, no sidebar, full-width content.

**Behaviour:**
- Sidebar hidden
- Site header simplified: title only, no buttons or filter bar
- All categories and subcategories expanded and visible (no collapsed state)
- Parable badges retained (visually meaningful on paper)
- Scripture links rendered as plain text with URL stripped (text content only)
- Hover tooltips suppressed
- Page breaks inserted before each new category section
- Font sizes slightly reduced for print density
- Gold and navy colours preserved (print-friendly versions acceptable)

**Implementation notes:**
- Implement as `@media print { }` block in the main stylesheet — no separate file needed
- `a[href]::after { content: ""; }` to suppress URL printing
- `.sidebar, .filter-bar, .toc-count, .permalink-icon { display: none; }`
- `.main-content { width: 100%; padding: 0; }`
- `section.category-section { page-break-before: always; }`

---

### F-07 · Category Focus Mode

**Priority:** Low–Medium
**Complexity:** Low
**Data used:** Category section IDs

**Description:**
Clicking a category header collapses all other category sections, leaving only the selected one expanded. Reduces visual noise when studying a single topic.

**Behaviour:**
- Double-clicking a `.category-header` (or clicking a dedicated expand/focus icon) collapses all other `<section class="category-section">` elements
- Collapsed sections show only the category header bar — subcategory blocks and tables are hidden
- A "Show All" button appears in the header when focus mode is active
- Clicking the same header again, or "Show All", restores all sections
- Single click on a header does nothing extra (preserves normal anchor behaviour)
- Sidebar TOC remains fully visible in focus mode

**Implementation notes:**
- Toggle `data-collapsed="true"` attribute on non-focused sections
- CSS: `section[data-collapsed="true"] .subcat-block, section[data-collapsed="true"] .application-box, section[data-collapsed="true"] .tag { display: none; }`
- Animate height collapse with `max-height` transition for smoothness

---

### F-08 · Font Size Control

**Priority:** Low
**Complexity:** Low
**Data used:** None — pure JS/CSS

**Description:**
A small A / A⁺ toggle in the site header that cycles through two font size states. The teaching tables are dense enough that reading comfort varies significantly by screen and user.

**Behaviour:**
- Two states: Normal (default, 15px base) and Large (17px base)
- Toggle button in site header, right-aligned alongside the Parables toggle (F-02)
- Label: "A" (smaller) and "A+" (larger) as two adjacent buttons
- Font size change applies to `body` font-size, which cascades through all `rem`-based sizing
- State does not persist between sessions

**Implementation notes:**
- Toggle a `.font-large` class on `<body>`
- CSS: `body.font-large { font-size: 17px; }`
- All other sizing is already in `rem` units per HTML-STANDARDS.md, so cascade is automatic

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
- Lists all 30 categories with their subcategories nested beneath each
- Only one category is expanded in the TOC at a time (accordion behaviour)
- Clicking a category expands it and scrolls the viewer to that category
- Subcategory links scroll to the relevant block within the viewer
- Active category and active subcategory are highlighted per F-01

**Viewer:**
- Displays **one category at a time** — not the full catalog
- Shows the selected category's title, description (if present), source books, and all its subcategory blocks with their teaching tables
- Prev / Next category nav links are displayed at the top and bottom of the viewer, allowing linear pagination through all 30 categories without returning to the TOC
- Prev/Next labels show the adjacent category title for orientation (e.g. `← Repentance and Conversion` / `Salvation and Eternal Life →`)
- URL updates on category change to support deep linking (e.g. `/#/category/cat-4`)

**Filters in Category Mode:**
- The filter bar (F-02, F-03, R-06) operates within the current category view — it filters the visible teaching rows and updates count badges (F-04) in real time
- Book filter pills reflect only the books represented in the currently visible category (not all 7 books globally)

**Mobile behaviour:**
- TOC panel is a slide-over drawer, opened via a "Contents" button in the header
- Drawer closes automatically when a category or subcategory link is tapped
- Prev/Next nav is a full-width fixed bottom bar on `xs`/`sm` screens — large tap targets
- Filter bar collapses to a "Filters" toggle button that opens a bottom sheet on mobile

---

#### Mode 2 — Bible Book Browser ⬜ Not started (Phase 1 — Stage 7)

An alternative mode that reorganises the same teaching data by book of the Bible, in canonical NT order, then by chapter and verse.

**Navigation panel (sidebar / drawer):**
- Lists the 7 source books in NT canonical order: Matthew · Mark · Luke · John · Acts · 1 Corinthians · Revelation
- Expanding a book shows its chapters that contain teachings (not every chapter — only those with at least one teaching entry)
- Expanding a chapter shows individual verse range anchors (one per teaching reference that falls in that chapter)
- Clicking any nav item scrolls the viewer to that location
- Active book, chapter, and verse anchor are highlighted in the TOC

**Viewer:**
- Displays the full vertical scroll of all teachings, organised by book → chapter → verse
- **Book headers** — prominent section dividers (e.g. a ruled header block with the book name and a brief description)
- **Chapter headers** — lighter delineation within each book section (e.g. `Chapter 5` in a muted typographic style)
- **Teaching rows** — within each chapter, teachings are listed in verse order (ascending by first verse of the primary reference)
- Each teaching row in this mode includes a **category label** — a minimal chip or tag showing which category the teaching belongs to (e.g. `Righteousness & Ethics`). This is the inverse of the category badge in Mode 1; it provides context since teachings are now divorced from their categorical grouping
- Cross-references (non-primary) are shown but do not drive the sort order — only the primary reference determines placement
- A teaching whose primary reference is in Matthew 5 appears under Matthew → Chapter 5, even if it has cross-references in Mark and Luke
- Parallel passages (single entry with multiple cross-refs) appear once, under the primary reference location

**Category filter in Book Mode:**
- A filter panel (separate from the book TOC) allows filtering by category — showing only teachings that belong to the selected category(s) within the book/chapter structure
- When a category filter is active, chapters and books with no remaining visible teachings are collapsed or visually suppressed
- The TOC updates to reflect only books and chapters containing visible content
- Filter state is independent between modes (switching modes does not carry filters across)

**Mobile behaviour:**
- TOC panel is a slide-over drawer with accordion book → chapter → verse nav, opened via a "Books" button in the header
- Chapter and verse nav items are large enough to tap comfortably (44px min height)
- Category filter is a separate "Categories" bottom sheet, accessible from the header or filter bar
- Book and chapter header dividers are sticky on scroll within their parent section so the user always knows where they are in the book

**Data requirements:**
- At render/build time, construct a reverse index from `teachings.json`: for each teaching, extract its primary reference and map it to `{ book, chapter, verseStart, teachingId, categoryId, categoryTitle }`
- Sort this index by: book (NT canonical order) → chapter → verseStart
- This index drives the Book Browser viewer and TOC — it is derived data, not stored in `teachings.json`
- The canonical NT order for the 7 source books: Matthew (1), Mark (2), Luke (3), John (4), Acts (5), 1 Corinthians (6), Revelation (7)

**Implementation notes:**
- Mode state (Category / Book) is stored in `sessionStorage` — persists within the session, resets on new visit
- Selected category in Mode 1 and scroll position in Mode 2 are also stored in `sessionStorage` for back-navigation
- In React, the two modes are separate route branches: `/#/category/:slug` and `/#/book/:bookAbbr` (with optional `/:chapter` and `/:verseAnchor` segments)
- The mode switcher component is always rendered, outside both route branches, so it persists across navigation
- The reverse index (book → chapter → teaching) should be computed once on app load (or at build time as a derived JSON file) and memoised — do not recompute on every render
- Parable toggle (F-02) applies in both modes — in Book Mode it filters teaching rows regardless of which book/chapter they fall in

---

### F-10 · Teaching Selection & Print Builder

**Priority:** Medium
**Complexity:** Medium
**Data used:** Teaching IDs, teaching text, tags, references
**Phase:** 3 (extends F-06; requires stable catalog)

**Description:**
A "build your own" print mode that lets the user hand-pick individual teachings from anywhere in the catalog — across categories, while navigating freely — and generate a clean printable page containing only the selected items. Useful for study sheets, sermon prep, or topical reference cards.

**Behaviour:**
- A "Select Teachings" toggle button in `AppHeader` activates selection mode
- When selection mode is active:
  - Each teaching row shows a checkbox on the left edge of the row
  - A persistent floating bar appears (sticky bottom bar on mobile) showing `{N} teachings selected` with **Print** and **Clear** buttons
  - Selections persist as the user navigates between categories — checking a teaching in Category 3, navigating to Category 7, and checking more is fully supported
  - A **"Select all in this category"** shortcut appears at the top of each category section when selection mode is on
- **Print** button triggers `window.print()`; print CSS (extending F-06) renders only selected rows:
  - Selected teachings grouped by category, with the category title rendered as a heading before each group
  - Subcategory headings included only if they contain at least one selected teaching
  - Parable badges retained
  - Scripture references rendered as plain text (no links, no tooltips)
  - Page header: "Jesus Says — Selected Teachings"
  - Category chip omitted (grouping by category already provides context)
- **Clear** button deselects all; selection mode can be toggled off without clearing the selection
- Selection state is session-only — not persisted to `localStorage`
- When selection mode is inactive: checkboxes hidden, floating bar hidden, all teachings visible normally

**Mobile behaviour:**
- Floating selection bar is a full-width fixed bottom strip (same pattern as Category Prev/Next nav)
- Checkboxes are 44px min touch targets
- "Select all in category" button is full-width, easy to tap

**Implementation notes:**
- Selection state: `Set<teachingId>` stored in Zustand (`filters.selectedTeachings` or a dedicated slice)
- Print CSS extension of F-06: add a `.print-selection-active` class to `<body>` before print; CSS rule `body.print-selection-active tr:not(.teaching-selected) { display: none; }` hides unselected rows
- Floating bar uses `aria-live="polite"` so screen readers announce count changes
- The floating bar `z-index` must sit above the fixed mobile bottom nav; coordinate with existing `cat-nav--bottom` stacking context
- Depends on F-06 (print stylesheet) being in place; implement after F-06

---

## Summary Table

| ID | Feature | Priority | Complexity | Data Dependency |
|---|---|---|---|---|
| F-01 | Subcategory active state in sidebar | High | Low | Subcategory slugs / IDs |
| F-02 | Parable-only toggle | High | Low–Med | `tags` array |
| F-03 | NT Book filter bar | High | Medium | `sources` array per category |
| F-04 | Teaching count badges in sidebar | Medium | Low | Teaching count per category |
| F-05 | Teaching permalink anchors | Medium | Low | Teaching `id` field |
| F-06 | Print stylesheet | Medium | Low | None |
| F-07 | Category focus mode | Low–Med | Low | Category section IDs |
| F-08 | Font size control | Low | Low | None |
| F-09 | Dual catalog browser (Category Mode + Bible Book Mode) | High | High | Full JSON + derived reverse index |
| F-10 | Teaching selection & print builder | Medium | Medium | Teaching IDs, text, references |

---

## Implementation Notes for Developer

- All JS must be **vanilla** — no jQuery, no frameworks. Per HTML-STANDARDS.md.
- All JS is **inline at the bottom of `<body>`**.
- No `localStorage` or `sessionStorage` — state is session-only.
- F-02, F-03, and F-04 interact: when either filter changes, teaching counts (F-04) must recalculate.
- F-02 and F-03 filters **stack** — both can be active simultaneously.
- The `data-sources` attribute on each category `<section>` (needed for F-03) should be written at HTML render time from the JSON, not computed in the browser.
- Teaching `id` attributes (needed for F-05) should be written at HTML render time using the `id` field from `teachings.json`.
- The existing scroll-spy in HTML-STANDARDS.md targets `section[id]` — F-01 extends this to also target `div.subcat-block[id]`.

---

## POC Review Notes

*Captured after reviewing `poc.html`. These supersede or amend earlier decisions and must be incorporated into the full build.*

---

### R-01 · App Title Change

**Type:** Design decision
**Affects:** `<title>`, `<h1>`, HTML-STANDARDS.md

The main page/app title is **"Jesus Says"** — not "Christ's Teachings" or "The Teachings of Jesus Christ."

- `<h1>` in the site header: `Jesus Says`
- `<title>` tag: `Jesus Says`
- Remove the eyebrow/subtitle line above the `<h1>` entirely (the small uppercase line that reads "New Testament · All Four Gospels" or similar)
- Update HTML-STANDARDS.md to reflect the new title before the full build

---

### R-02 · Scripture Link Navigation — TBD

**Type:** Design decision — unresolved
**Priority:** High
**Status:** ⚠️ Pending decision

The behaviour when a user clicks a scripture reference link has not been finalised. Options under consideration include — but are not limited to — opening a side pane, opening a modal, navigating to a new route, or opening an external site in a new tab. No implementation work should begin on this feature until the navigation pattern is decided.

**Context:**
- The original iFrame approach (embedding Blue Letter Bible) was ruled out
- An API-driven in-app reader was considered but the online Bible API approach has also been ruled out (see R-03)
- Bible Gateway tooltip libraries are being evaluated (see R-03) and may inform what click behaviour makes most sense

**Decision needed before implementation:**
What happens when a user clicks a scripture reference link?

**Options to evaluate:**
- Open Bible Gateway (or another site) in a new browser tab
- Open a Bible Gateway-powered modal or popup (if their embed/widget supports it)
- No click navigation — tooltip on hover is sufficient; link is decorative only
- Other approach TBD

**When resolved:** Update this item with the chosen approach and full implementation spec.

---

### R-03 · Scripture Tooltips — Bible Gateway (Under Evaluation)

**Type:** Decision — partially resolved
**Priority:** High
**Status:** ⚠️ Under evaluation — online Bible API approach ruled out

The previously proposed online Bible API approaches (bible-api.com, Hello AO) have been ruled out. Bible Gateway tooltip/widget libraries are now the primary candidate for scripture hover tooltips.

**What is known:**
- Bible Gateway provides embeddable tooltip and popup widgets for scripture references
- These are widely used on third-party Bible study sites
- They handle the verse text display, translation selection, and styling within their own widget layer

**What needs to be confirmed before implementation:**
- Exact embed/integration method (script tag, widget API, React wrapper)
- Whether NKJV is available through their widget (it is available on Bible Gateway itself)
- Licensing or attribution requirements for third-party embed use
- Whether the widget style can be customised to match the "Jesus Says" theme (R-10)
- Whether the widget conflicts with the React component lifecycle

**References to investigate:**
- [Bible Gateway Widget documentation](https://www.biblegateway.com/usage/linking/bible-popup-widget/)
- Any npm packages wrapping Bible Gateway embed functionality

**Relationship to R-02:**
The tooltip approach (R-03) and the click navigation approach (R-02) are separate concerns and should be evaluated independently. It is possible tooltips use Bible Gateway while click navigation uses a different mechanism, or vice versa.

**When resolved:** Replace this item with a full implementation spec including the embed method, required script tags, and any React integration notes.

**Note — R-11 (Bible API Wrapper):**
The wrapper class architecture specified in R-11 assumed a REST Bible API as the data source. If Bible Gateway tooltips handle verse display entirely client-side via their own widget, R-11 may not be needed for tooltips. However, the wrapper pattern remains a good idea if any programmatic Bible data access is needed elsewhere in the app. Retain R-11 as an architectural option, status TBD.

---

### R-04 · Translation Selector in UI

**Type:** New feature
**Priority:** Low (blocked)
**Status:** ⚠️ On hold — depends on R-03 resolution
**Depends on:** R-03

Once the scripture tooltip and link approach is finalised (R-02, R-03), a translation selector may be added to the UI allowing users to choose their preferred Bible translation for display. Scope and placement to be defined once the underlying tooltip/widget mechanism is confirmed.

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
- Remove the Application Tag Taxonomy section from HTML-STANDARDS.md (Section 11)
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
| A-01 | Target platform — React + Vite | Architecture | Foundational | ✅ Done | React 18 + Vite 5 scaffolded (Stage 1) |
| A-03 | Mobile-first design | Architecture | High | ✅ Done | Mobile-first CSS; drawer on mobile, fixed panel on desktop (Stage 4) |
| A-04 | External dependencies — no restrictions | Architecture | Foundational | ✅ Done | Vanilla-only constraint lifted; all approved deps installed |
| A-05 | localStorage / sessionStorage permitted | Architecture | Medium | ✅ Done | `useLocalPreference` hook implemented (Stage 3) |
| A-06 | Hosting — GitHub Pages | Architecture | Foundational | ⚠️ Partial | HashRouter + Vite base + GH Actions done; live deployment unverified (pending merge to main) |
| A-07 | JS separation of concerns | Architecture | High | ✅ Done | Full src/ tree per spec; no inline logic (Stage 2) |
| R-01 | App title → "Jesus Says" | Design | High | ✅ Done | `<h1>` and `<title>` set (Stage 4) |
| R-07 | Remove application tag pills | Removal | High | ✅ Done | Not implemented; tag pills absent from all components |
| R-08 | Category number — minimal typographic style | Design | Medium | ✅ Done | `<span class="cat-num-inline">` inline before title; no navy box (Stage 5) |
| R-09 | Source books — full names | Display | Low | ✅ Done | Abbr → full name via `ABBR_TO_FULL` map at render time (Stage 5) |
| R-10 | CSS theme system — Classic theme | Architecture | High | ✅ Done | Full CSS variable system in `theme-classic.css`; zero hardcoded values (Stage 3) |
| F-01 | Subcategory active state in sidebar (scroll-spy) | Feature | High | ✅ Done | `useScrollSpy` hook + IntersectionObserver wired to Sidebar (Stage 6) |
| F-09 (partial) | Category Browser — Mode 1 | Feature | High | ✅ Done | Mode 1 (Category Browser): CategoryViewer, Sidebar TOC, CategoryNav, TeachingsTable implemented (Stage 5) |
| F-03 | NT Book filter bar | Feature | High | ⬜ Stage 7 | `data-sources` attr already on category sections (Stage 5.11); filter UI + Zustand wiring here |
| F-09 (complete) | Bible Book Browser — Mode 2 | Feature | High | ⬜ Stage 7 | `reverseIndex.js` built (Stage 2.4); BookViewer + BookNav components here |

### Phase 2 — Filters, Bible Book Mode & Scripture Integration

| ID | Item | Type | Priority | Status | Notes |
|---|---|---|---|---|---|
| F-02 | Parable-only toggle | Feature | High | ⬜ Not started | Moved to filter bar per R-06 |
| F-04 | Teaching count badges (filter-aware) | Feature | Medium | ⬜ Not started | Depends on F-02/F-03 being in place |
| F-05 | Teaching permalink anchors | Feature | Medium | ⬜ Not started | `id="t-{teaching-id}"` on all rows scaffolded in Ph 1 (Stage 5.7); copy UI here |
| R-02 | Scripture link click navigation | Decision/Feature | High | ⚠️ Unresolved | Decision must be made before Ph 2 starts |
| R-03 | Scripture tooltips — Bible Gateway | Decision/Feature | High | ⚠️ Under evaluation | Must be resolved for Ph 2 |
| R-06 | Consolidate filter bar (parables into filter bar) | Layout | High | ⬜ Not started | Implement alongside F-02/F-03 |
| R-09 | Source books — full names | Display | Low | ✅ Done in Ph 1 | Landed in Stage 5 — moved up from Ph 2 |
| R-11 | Bible API wrapper/adapter class | Architecture | TBD | ⬜ Not started | Depends on R-03 resolution |

### Phase 3 — Enhancements, Polish & Extended Features

| ID | Item | Type | Priority | Status | Notes |
|---|---|---|---|---|---|
| A-02 | PWA — service worker + manifest | Architecture | High | ⬜ Not started | Moved from Ph 1; vite-plugin-pwa wired + placeholder icons exist; live install + Lighthouse verification deferred |
| F-06 | Print stylesheet | Feature | Medium | ⬜ Not started | Pure CSS; low risk; no blockers |
| F-10 | Teaching selection & print builder | Feature | Medium | ⬜ Not started | Extends F-06; implement after print stylesheet is in place |
| F-07 | Category focus mode | Feature | Low–Med | ⬜ Not started | Enhancement; catalog must be stable |
| F-08 / R-05 | Font size control — 4 steps | Feature | Low | ⬜ Not started | `useLocalPreference` hook scaffolded in Ph 1; UI here |
| R-04 | Translation selector in UI | Feature | Low | ⚠️ Blocked | Blocked on R-02/R-03 resolution |
| R-10 (extended) | Additional themes (Minimal, Dark) | Architecture | Low | ⬜ Not started | Theme system in place in Ph 1; new themes here |

---

## Platform & Architecture Decisions

*These decisions supersede or amend constraints in HTML-STANDARDS.md and apply to the full production build. The POC is exempt — these govern the React/PWA app.*

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
- The scroll-spy, filter logic, tooltip system, and scripture link behaviour (R-02, R-03) all become React hooks or components — not vanilla JS inline scripts
- HTML-STANDARDS.md constraints around "vanilla JS only" and "no frameworks" are **superseded** for the production build

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
- Bible API responses (scripture verse text) — network-first with cache fallback, since API availability varies
- Google Fonts — stale-while-revalidate

**Offline behaviour:**
- Full browsing of all 30 categories, subcategories, and teachings available offline (all data is local)
- Scripture tooltips and any external scripture navigation (R-02, R-03) will show a graceful "offline" message when the network is unavailable
- Filters, focus mode, and all UI interactions work fully offline

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

- **Sidebar / TOC:** On `xs`/`sm`, the sidebar is hidden by default and accessible via a hamburger or "Contents" button that opens it as a bottom sheet or slide-over drawer — not a left panel
- **Filter bar:** On `xs`, filters stack into a collapsible panel (e.g. "Filters ▾" toggle) rather than a horizontal pill row
- **Scripture navigation (R-02):** Behaviour on mobile TBD alongside desktop — to be specced once the navigation pattern is decided
- **Teaching tables:** On `xs`, the two-column table (Teaching / Scriptures) may need to reflow to a single column with scriptures appearing below the teaching text as a secondary block
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

The HTML-STANDARDS.md restriction to "vanilla JS only, no external frameworks" is **fully lifted** for the production React build. Any library, framework, or dependency that genuinely enhances the application is permitted and encouraged.

**Recommended / approved dependencies (non-exhaustive):**

| Category | Library | Purpose |
|---|---|---|
| Framework | React 18 | Core UI framework |
| Build | Vite | Dev server, bundler |
| PWA | vite-plugin-pwa | Service worker + manifest |
| Routing | React Router v6 | Deep links, permalink navigation |
| State | Zustand | Lightweight global state |
| Styling | Tailwind CSS | Utility-first CSS, pairs well with theming via CSS variables |
| Animation | Framer Motion | Scroll animations, panel transitions, filter reveals |
| Icons | Lucide React | Clean, consistent icon set — no design overhead |
| Bible API / Tooltips | TBD (per R-02, R-03) | Scripture display — approach under evaluation |
| Fonts | Google Fonts (via link or Fontsource npm) | Playfair Display, Source Sans 3 |
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
- This structure supersedes the HTML-STANDARDS.md directive for "all JS inline at the bottom of `<body>`" — that constraint applied to the POC only and is fully lifted for the React build (per A-01, A-04)
- Each hook and utility should be independently testable — pure functions where possible
- `loader.js` and `reverseIndex.js` run once on app initialisation; their outputs are passed down via React context or Zustand store, not recomputed per render
- Avoid barrel `index.js` files that re-export everything — import directly from the source module to keep dependency graphs legible
