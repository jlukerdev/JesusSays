# Phase 2A — Modern Browser UI Revision

> **Coding agent:** Work through the steps in order. Mark each task `[x]` as completed before moving to the next. Do not skip steps — each step is ordered to keep the app working throughout.

---

## Original Requirements

- Revise the "modern" browser UI from Phase 2.
- Delete any CSS, components, and scripting that become orphaned as a result of changes.

**Home screen:** The current card-style Category/Topic home screen is replaced with a TOC-style list.

**Desktop layout:** Two vertical split panes. Left pane = Category TOC list. Right pane = all content (search results, teaching list, teaching detail). When no Category is selected, the right pane shows placeholder text and the search bar. Once a Category is selected, the left TOC pane slides out and hides; the right pane expands. The "Back to Topics" nav link is replaced with a hamburger icon + "View Topics" label that slides the TOC pane back in.

**Mobile layout:** Single-column TOC list, full width, formatted for touch interaction. Tapping a category navigates to the CategoryBrowser. "View Topics" navigates back to the TOC list.

**Category list styling:** Visually prominent — use font-size, font-weight (bold), and color emphasis. Show Categories only (no subcategories in the list).

**Subcategory/Teaching navigation:** Existing components reused as-is once a category is selected. No structural changes.

**Teaching Detail — search bar:** Keep the search bar visible but visually disabled (grayed out, non-interactive) instead of hidden.

**Prev/Next navigation:** Remove entirely — component, CSS, and all related logic.

---

## Confirmed Decisions

| # | Decision |
|---|---|
| D-01 | Breakpoint: use existing `useIsMobile()` hook at 768px |
| D-02 | TOC styling: font-size, font-weight bold, color emphasis; categories only |
| D-03 | "View Topics" button replaces "Back to Topics" in the same position (CategoryBrowser hero, above subcategory name) |
| D-04 | Right pane home state: placeholder text — "Select a topic to explore Jesus's teachings" |
| D-05 | Slide animation: CSS transition, ~250ms ease-in-out |
| D-06 | Search bar on TeachingDetail: visually disabled — opacity ~0.5, pointer-events: none |
| D-07 | PrevNextBar: delete entirely |

---

## Key Files

```
src/components/ModernApp/
  ModernApp.jsx             # Root — state, layout, screen switching
  HomeScreen.jsx            # Current card grid + search results; card grid replaced by CategoryTOC
  CategoryTOC.jsx           # NEW — scrollable TOC category list (left pane)
  ModernNavBar.jsx          # Sticky top bar — remove back-to-topics button
  ModernSearchBar.jsx       # Search input — add disabled prop
  CategoryBrowser.jsx       # Replace "Back to Topics" with "View Topics" button
  TeachingDetail.jsx        # No structural changes
  PrevNextBar.jsx           # DELETE
  BibleViewer/              # No changes
src/styles/modern-nav.css   # All modern CSS — additions and orphan removal here
src/hooks/useBreakpoint.js  # useIsMobile() — no changes
```

---

## Implementation Steps

### Step 1 — Delete PrevNextBar

- [ ] Delete `src/components/ModernApp/PrevNextBar.jsx`
- [ ] Remove the `PrevNextBar` import from `ModernApp.jsx`
- [ ] Remove the `<PrevNextBar ... />` render block from `ModernApp.jsx`
- [ ] Remove all PrevNextBar CSS from `modern-nav.css`: `.modern-pn-bar`, `.modern-pn-btn`, `.modern-pn-btn--disabled`, `.modern-pn-btn--right`, `.modern-pn-arrow`, `.modern-pn-name`

---

### Step 2 — Update ModernSearchBar (always visible, disabled on teaching)

- [ ] Add a `disabled` prop (boolean) to `ModernSearchBar`
- [ ] When `disabled === true`, apply class `modern-search-bar--disabled` to the root wrapper
- [ ] Remove the `currentScreen` prop (no longer needed for show/hide logic)
- [ ] In `modern-nav.css`, add `.modern-search-bar--disabled .modern-search-bar__wrap { opacity: 0.5; pointer-events: none; }`
- [ ] In `ModernApp.jsx`, change the conditional render of `<ModernSearchBar>` to always render it, passing `disabled={currentScreen === 'teaching'}`

---

### Step 3 — Create CategoryTOC component (new file, not wired yet)

- [ ] Create `src/components/ModernApp/CategoryTOC.jsx`
  - Props: `categories`, `currentCatId`, `onNavigateToCategory`
  - Renders a scrollable list of category names only (no subcategories)
  - Active category gets `modern-cat-toc__item--active` class
- [ ] Add CSS to `modern-nav.css`:
  - `.modern-cat-toc` — scrollable list wrapper, `padding: var(--space-2) 0`
  - `.modern-cat-toc__label` — "Topics" header label, styled like `.modern-subcat-toc__header`
  - `.modern-cat-toc__item` — full-width button, reset styles, `padding: var(--space-2) var(--space-4)`, `font-size: var(--text-sm)`, `font-weight: 600`, `color: var(--color-ink)`, `border-left: 3px solid transparent`, hover background lift
  - `.modern-cat-toc__item--active` — `border-left-color: var(--color-accent); background: var(--color-accent-light); color: var(--color-authority); font-weight: 700`

---

### Step 4 — Add tocVisible state to ModernApp and wire onShowToc

- [ ] Add state: `const [tocVisible, setTocVisible] = useState(true)` in `ModernApp.jsx`
- [ ] When navigating to a category screen: call `setTocVisible(false)`
- [ ] When navigating to the home screen: call `setTocVisible(true)`
- [ ] When navigating to a teaching screen: leave `tocVisible` unchanged (already false from category nav)
- [ ] Pass `onShowToc={() => setTocVisible(true)}` as a prop to `CategoryBrowser`

---

### Step 5 — Replace "Back to Topics" with "View Topics" in CategoryBrowser

- [ ] Add `onShowToc` to `CategoryBrowser` prop signature
- [ ] Import `useIsMobile` from `src/hooks/useBreakpoint.js` (if not already imported)
- [ ] Import `Menu` icon from `lucide-react`
- [ ] Replace the existing `.modern-cat-back-nav` button with a new "View Topics" button:
  - Class: `modern-view-topics-btn`
  - Renders: `<Menu />` icon + "View Topics" label
  - On click: `isMobile ? onGoHome() : onShowToc()`
- [ ] Add CSS in `modern-nav.css`: `.modern-view-topics-btn` — same base layout as `.modern-cat-back-nav` (flex, gap, cursor pointer, reset button styles), plus icon alignment
- [ ] Remove old `.modern-cat-back-nav` and `.modern-cat-back-nav:hover` CSS rules

---

### Step 6 — Restructure ModernApp to two-pane layout (main structural change)

- [ ] Replace the `modern-screen-area` content with a `modern-two-pane` flex-row container:
  ```
  <div className="modern-two-pane">
    <div className={`modern-toc-pane${!tocVisible ? ' modern-toc-pane--hidden' : ''}`}>
      <CategoryTOC ... />
    </div>
    <div className={`modern-content-pane${bibleOpen && biblePinned ? ' modern-panel-pinned' : ''}`}>
      <ModernSearchBar disabled={currentScreen === 'teaching'} ... />
      {/* home placeholder | CategoryBrowser | TeachingDetail */}
    </div>
  </div>
  ```
- [ ] Move `<ModernSearchBar>` from its current top-level position into the `modern-content-pane`
- [ ] Move the `modern-panel-pinned` modifier from `modern-screen-area` to `modern-content-pane`
- [ ] Update the CSS selector for `modern-panel-pinned` margin-right in `modern-nav.css` to target `.modern-content-pane.modern-panel-pinned`
- [ ] In the right pane, render based on `currentScreen`:
  - `home`: `<div className="modern-home-placeholder">Select a topic to explore Jesus's teachings</div>` (show search results below it when `searchQuery` is non-empty)
  - `category`: `<CategoryBrowser ... />`
  - `teaching`: `<TeachingDetail ... />`
- [ ] Import and render `CategoryTOC` in the left pane, passing `categories`, `currentCatId`, and an `onNavigateToCategory` handler that navigates to the category screen and sets `tocVisible = false`
- [ ] Add CSS to `modern-nav.css`:
  - `.modern-two-pane` — `display: flex; flex: 1; min-height: 0; overflow: hidden`
  - `.modern-toc-pane` — `width: 240px; flex-shrink: 0; overflow-y: auto; border-right: 1px solid var(--color-border); transition: width 250ms ease-in-out, opacity 250ms ease-in-out`
  - `.modern-toc-pane--hidden` — `width: 0; opacity: 0; pointer-events: none; overflow: hidden`
  - `.modern-content-pane` — `flex: 1; min-width: 0; overflow-y: auto; display: flex; flex-direction: column`
  - `.modern-home-placeholder` — centered muted text, `padding-top: var(--space-10)`, `color: var(--color-muted)`, `font-size: var(--text-sm)`, `text-align: center`
  - Mobile overrides at `@media (max-width: 767px)`:
    - `.modern-two-pane` → `flex-direction: column`
    - `.modern-toc-pane` → `width: 100%; border-right: none; border-bottom: 1px solid var(--color-border); transition: none`
    - `.modern-toc-pane--hidden` → `display: none`
    - `.modern-content-pane` → `width: 100%`

---

### Step 7 — Simplify ModernNavBar (remove back-to-topics pill)

- [ ] Remove the `back-to-topics` button render block from `ModernNavBar.jsx`
- [ ] Remove the `onGoHome` prop from `ModernNavBar` if it was only used by that button (keep it if the logo click still uses it)
- [ ] Remove CSS from `modern-nav.css`: `.modern-nav__back-to-topics`, `.modern-nav__back-to-topics:hover`, `.modern-nav__left-row` (if this wrapper div is also removed)

---

### Step 8 — Remove orphan CSS

Remove all of the following from `modern-nav.css` (confirm each is no longer referenced before deleting):

- [ ] `.modern-home` and `.modern-home__grid` — card grid container (HomeScreen cards removed)
- [ ] `.modern-cat-card`, `.modern-cat-card::before`, `.modern-cat-card__name`, `.modern-cat-card__bar-wrap`, `.modern-cat-card__bar-fill`, `.modern-cat-card__meta` — all card styles
- [ ] Responsive grid media queries for `.modern-home__grid` (breakpoints at 520px, 900px, 1280px)
- [ ] `@keyframes modern-fade-in` and `.modern-screen`, `.modern-screen--active`, `.modern-screen--home.modern-screen--active` — if the screen-slot pattern is fully replaced by the two-pane layout (verify TeachingDetail path before removing)
- [ ] Any remaining orphan classes from removed components (grep for classes no longer in JSX)

---

### Step 9 — Verify and test

- [ ] **Mobile — TOC flow:** TOC list shows on load → tap category → TOC hides, CategoryBrowser fills screen → "View Topics" button navigates back to TOC
- [ ] **Desktop — two-pane:** Left TOC pane visible on home → select category → pane slides out (250ms) → CategoryBrowser in right pane → "View Topics" slides pane back in without losing category content
- [ ] **Search bar:** Visible but grayed out (opacity, no interaction) on TeachingDetail; fully functional on home and category screens
- [ ] **Bible panel:** `modern-panel-pinned` margin-right still applies correctly when Bible panel is pinned (now on `modern-content-pane`)
- [ ] **No console errors** from removed PrevNextBar, removed props, or missing CSS classes
- [ ] **No orphan CSS classes** — grep `modern-nav.css` for any class names no longer referenced in JSX
