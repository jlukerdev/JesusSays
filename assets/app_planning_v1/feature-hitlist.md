# Christ's Teachings — HTML Feature Hit-List

**Project:** Christ's Teachings
**Document:** `teachings.json` → HTML output
**Standards ref:** `HTML-STANDARDS.md`
**Status:** Pending implementation

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

### F-01 · Subcategory Active State in Sidebar

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
- Extend existing scroll-spy JS to also query `div.subcat-block[id]`
- Active subcategory link: `background: var(--gold-light)`, `color: var(--gold)`
- Parent category link stays active while any of its children are active

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

## Updated Summary Table

| ID | Item | Type | Priority | Notes |
|---|---|---|---|---|
| F-01 | Subcategory active state in sidebar | Feature | High | |
| F-02 | Parable-only toggle | Feature | High | Moved to filter bar per R-06 |
| F-03 | NT Book filter bar | Feature | High | |
| F-04 | Teaching count badges in sidebar | Feature | Medium | |
| F-05 | Teaching permalink anchors | Feature | Medium | |
| F-06 | Print stylesheet | Feature | Medium | |
| F-07 | Category focus mode | Feature | Low–Med | |
| F-08 | Font size control | Feature | Low | Expanded to 4 steps per R-05 |
| R-01 | App title → "Jesus Says", remove subtitle | Design | High | Affects HTML-STANDARDS.md |
| R-02 | Scripture link navigation | Design decision | High | ⚠️ TBD — approach not yet decided |
| R-03 | Scripture tooltips — Bible Gateway (under evaluation) | Decision | High | ⚠️ Online Bible API ruled out; BG widgets being evaluated |
| R-04 | Translation selector in UI | Feature | Low | ⚠️ On hold — depends on R-03 |
| R-05 | Text size — 4 steps instead of 2 | Enhancement | Low | Replaces F-08 |
| R-06 | Consolidate filters — parables to filter bar | Layout | High | |
| R-07 | Remove application tag pills | Removal | High | Keep `tags` in JSON |
| R-08 | Category number — minimal typographic style | Design | Medium | Remove navy box |
| R-09 | Source books — full names in subtitle | Display | Low | Map at render time |
| R-10 | CSS theme system — interchangeable themes | Architecture | High | Semantic variables only; no hardcoded values |
| R-11 | Bible API wrapper/adapter class | Architecture | TBD | Retain as option; relevance depends on R-03 resolution |

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
