# Jesus Says — Navigation & Interaction Design Spec

A complete behavioral specification for an agent implementing the three-screen teaching browser. This document covers navigation flows, component behavior, and responsive rules. It does not prescribe visual design (colors, fonts, spacing).

> **Scope:** This spec describes three screens — Home, Category Browser, and Teaching Detail — plus two Bible Viewer components (a desktop side panel and a mobile bottom drawer). All navigation is client-side; there is no URL routing.

---

## Table of Contents

1. [Data Model](#1-data-model)
2. [App Structure](#2-app-structure)
3. [Navigation Model](#3-navigation-model)
4. [Screen: Home](#4-screen-home)
5. [Screen: Category Browser](#5-screen-category-browser)
6. [Screen: Teaching Detail](#6-screen-teaching-detail)
7. [Component: Global Nav Bar](#7-component-global-nav-bar)
8. [Component: Search Bar](#8-component-search-bar)
9. [Component: Prev / Next Bar](#9-component-prev--next-bar)
10. [Component: Bible Viewer Overview](#10-component-bible-viewer-overview)
11. [Component: Bible Panel (Desktop)](#11-component-bible-panel-desktop)
12. [Component: Bible Drawer (Mobile)](#12-component-bible-drawer-mobile)
13. [Responsive Breakpoints](#13-responsive-breakpoints)
14. [Client-Side State Reference](#14-client-side-state-reference)
15. [Interaction Reference](#15-interaction-reference)

---

## 1. Data Model

The application consumes a single JSON structure. All navigation and filtering logic is driven from this shape.

### 1.1 Schema

```json
{
  "categories": [
    {
      "id": 1,
      "slug": "cat-1",
      "title": "God the Father",
      "subcategories": [
        {
          "id": "1.1",
          "slug": "cat-1-1",
          "title": "The Nature of God",
          "teachings": [
            {
              "id": "1.1.1",
              "text": "If earthly fathers give good gifts, how much more will the heavenly Father give good things to those who ask",
              "quote": "If ye then, being evil, know how to give good gifts unto your children, how much more shall your Father which is in heaven give good things to them that ask him?",
              "tags": [],
              "references": [
                {
                  "label": "Matt 7:11",
                  "book": "Matthew",
                  "bookAbbr": "Matt",
                  "chapter": 7,
                  "ranges": [[11, 11]],
                  "isPrimary": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 1.2 Field Reference

| Level | Field | Type | Notes |
|---|---|---|---|
| Category | `id` | integer | Primary key used throughout all navigation logic |
| Category | `slug` | string | URL-safe identifier — reserved for future routing |
| Category | `title` | string | Display name shown on cards and in headers |
| Subcategory | `id` | string | Dot-notation: `"{catId}.{subIndex}"` |
| Subcategory | `title` | string | Shown in tab labels and the mobile dropdown |
| Teaching | `id` | string | Dot-notation: `"{catId}.{subIdx}.{tIdx}"` |
| Teaching | `text` | string | Summary sentence shown on cards and detail screens |
| Teaching | `quote` | string \| null | KJV source text; rendered as blockquote if present |
| Teaching | `tags` | string[] | Values: `"parable"`, `"promise"`, `"woe"` |
| Reference | `label` | string | Display string for chips (e.g. `"Matt 7:11"`) |
| Reference | `book` | string | Full book name |
| Reference | `bookAbbr` | string | Abbreviation used as the book filter key |
| Reference | `chapter` | integer | |
| Reference | `ranges` | `[[start, end]]` | Array of verse range pairs |
| Reference | `isPrimary` | boolean | Primary reference shown more prominently |

### 1.3 Derived Data (Computed at Runtime)

The following are not stored in the schema and must be computed when the data loads:

- **Available books per category:** The union of all unique `bookAbbr` values across every reference in every teaching in every subcategory of that category. Used to render the book filter chips in the category hero.
- **Teaching density per category:** Total teaching count across all subcategories. Used to calculate the proportional width of the density bar on category cards, expressed as a ratio relative to the maximum teaching count across all categories.

---

## 2. App Structure

The application is a single-page app with three named screens. Only one screen is visible at a time. Screen transitions use a simple fade-in animation.

```
Home  →  Category Browser  →  Teaching Detail
```

The Global Nav Bar and Search Bar are always visible regardless of which screen is active. The Bible Viewer (panel on desktop, drawer on mobile) is a persistent overlay that exists independently of the screen stack and is never destroyed on navigation.

### 2.1 Layout Regions

All screens share the same full-page layout structure, top to bottom:

```
┌──────────────────────────────────────────────────────┐
│  Global Nav Bar         (sticky, always visible)     │
├──────────────────────────────────────────────────────┤
│  Search Bar             (sticky, always below nav)   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Screen Content         (scrollable)                 │
│  Home | Category Browser | Teaching Detail           │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Bible Viewer                                        │
│  Desktop: fixed right-side panel                     │
│  Mobile:  fixed bottom drawer                        │
└──────────────────────────────────────────────────────┘
```

The Bible Viewer is independent of the screen stack and persists through all navigation events.

---

## 3. Navigation Model

### 3.1 History Stack

A client-side array (`navStack`) records each screen visit as an entry:

```js
{ screen: 'home' | 'category' | 'teaching', catId?, tabIndex?, teachingId? }
```

A pointer (`navPos`) tracks the current position in the stack.

- Every call to `showScreen()` truncates any forward history and appends a new entry.
- The back (‹) and forward (›) arrows in the nav bar move the pointer and restore the corresponding screen state.
- History arrows are shown only when there is history in that direction; hidden otherwise.

### 3.2 Screen Transition Rules

| Action | Transition | History entry |
|---|---|---|
| Tap category card | Home → Category Browser | `{ screen:'category', catId, tabIndex:0 }` |
| Tap teaching card | Category Browser → Teaching Detail | `{ screen:'teaching', teachingId }` |
| Tap back chevron (‹) | Current → previous history entry | None — pointer moves |
| Tap forward arrow (›) | Current → next history entry | None — pointer moves |
| Tap "↑ Category" | Teaching Detail → Category Browser | `{ screen:'category', catId, tabIndex }` |
| Tap "Topical Subjects" | Any → Home | `{ screen:'home' }` |
| Tap prev/next bar | Within browser or to adjacent category | New entry per rules above |
| Change subcategory tab or dropdown | Within Category Browser (no screen change) | None — tab state updated in current entry |

### 3.3 Nav Bar State Per Screen

| Screen | Back chevron | Center title | Right actions |
|---|---|---|---|
| Home | Hidden | Logo ("Jesus Says") | "Topical Subjects" |
| Category Browser | Visible | Category title | History ‹ ›, "Topical Subjects" |
| Teaching Detail | Visible | "Category Title › Subcategory Title" | History ‹ ›, "↑ Category", "Topical Subjects" |

**Notes:**
- The breadcrumb in Teaching Detail truncates with ellipsis if it exceeds available width. The full string should be available as a tooltip on hover.
- The left-side back chevron and the history back arrow in the actions area both call `historyNav(-1)`. The chevron is a large primary affordance; the history arrows are smaller and paired as a browser-style forward/back control.

---

## 4. Screen: Home

### 4.1 Zone Layout

```
┌─────────────────────────────────┐
│  Page header                    │
│  "Topical Subjects" + count     │
├─────────────────────────────────┤
│  Category Grid                  │
│  (hidden when search active)    │
├─────────────────────────────────┤
│  Search Results List            │
│  (shown when search active)     │
└─────────────────────────────────┘
```

### 4.2 Category Card Anatomy

Each card in the grid contains:

- **Category title** — `category.title`
- **Density bar** — a horizontal bar whose filled portion is proportional to the category's teaching count relative to the maximum across all categories. Visual only; not interactive.
- **Meta line** — `"N sections · N teachings"` computed from the data.

Tapping anywhere on a card navigates to the Category Browser for that category, starting at subcategory tab index 0.

### 4.3 Search Behavior on Home Screen

As the user types, the category grid is replaced by grouped search results in this order:

1. **Categories** — matches on `category.title`
2. **Subcategories** — matches on `subcategory.title` (only shown when the parent category is not already a hit)
3. **Teachings** — matches on `teaching.text`

Each result row shows: a type label (Category / Subcategory / Teaching), the matched text with the query highlighted, and a breadcrumb showing parent context. Tapping a result navigates to the appropriate screen and tab, then clears the search.

Clearing the input restores the full category grid. The result count badge updates live.

---

## 5. Screen: Category Browser

### 5.1 Zone Layout

```
┌─────────────────────────────────┐
│  Hero Header (dark bg)          │
│  Category title                 │
│  Book filter chips              │
│  Subcategory tabs (desktop)     │
│  Subcategory dropdown (mobile)  │
├─────────────────────────────────┤
│  Teaching List                  │
│  (hidden during search)         │
├─────────────────────────────────┤
│  In-Category Search Results     │
│  (shown during search)          │
├─────────────────────────────────┤
│  Prev / Next Bar (sticky btm)   │
└─────────────────────────────────┘
```

### 5.2 Hero Header

The hero header contains three elements:

**Category title** — large display text from `category.title`.

**Book filter chips** — one chip per unique `bookAbbr` present in the category's teachings, rendered in the order books first appear in the data. Behavior:
- Tapping an inactive chip activates a book filter; the teaching list re-renders filtered to that book.
- Tapping the active chip deactivates the filter and restores the full list.
- Only one chip can be active at a time.
- The active filter persists across subcategory tab switches within the same category.
- The filter resets to null when navigating to a different category.

**Subcategory selector** — on desktop, a horizontal scrollable tab row; on mobile, a styled `<select>` dropdown. Both reflect the same `currentTabIndex` state and call the same `switchTab(idx)` function. Switching tabs clears any active search.

### 5.3 Teaching Card Anatomy

Each card contains:

- **Teaching text** — `teaching.text`
- **Tag pills** — one pill per entry in `teaching.tags`. Known values and their distinct treatments:
  - `parable` — blue tint
  - `promise` — green tint
  - `woe` — amber tint
- **Scripture reference chips** — one chip per `reference`, labeled with `reference.label`. Tapping a chip opens the Bible Viewer for that reference. Tapping a chip does **not** navigate to Teaching Detail.
- **Drill-in arrow (›)** — always visible at a soft opacity, brightening on hover/focus. Signals the card body is tappable.

Tapping the card body (anywhere except a chip) navigates to Teaching Detail for that teaching.

### 5.4 Book Filter Effect on Teaching List

When a book filter is active, the teaching list shows only teachings that have at least one reference where `reference.bookAbbr` matches the active filter. If no teachings in the current subcategory match, an empty state is shown: *"No teachings from [Book] in this section."*

### 5.5 Search Behavior Within Category Browser

The search input placeholder reads `"Search in [Category Title]…"` while the Category Browser is active. Search is scoped to the current category only and matches:

1. Subcategory titles
2. Teaching text

All subcategory tabs are visually de-emphasized while search is active to signal cross-tab scope. Tapping a result clears the search, switches to the matching subcategory tab, and restores the teaching list.

### 5.6 Prev / Next Bar Behavior

See [Component: Prev / Next Bar](#9-component-prev--next-bar) for the full resolution order. Within the Category Browser, the bar navigates teachings in the current subcategory, then subcategory tabs, then adjacent categories.

---

## 6. Screen: Teaching Detail

### 6.1 Zone Layout

```
┌─────────────────────────────────┐
│  Hero Header (dark bg)          │
│  Breadcrumb + teaching text     │
├─────────────────────────────────┤
│  Quote section                  │
│  (only if quote is non-null)    │
├─────────────────────────────────┤
│  Classification section         │
│  (only if tags non-empty)       │
├─────────────────────────────────┤
│  Scripture References section   │
├─────────────────────────────────┤
│  Verse Snippets section         │
│  (hidden if no API data)        │
├─────────────────────────────────┤
│  Prev / Next Bar (sticky btm)   │
└─────────────────────────────────┘
```

### 6.2 Hero Header

- Breadcrumb label: `"Category Title › Subcategory Title"` in small uppercase label style.
- Full `teaching.text` in large display type below the breadcrumb.

### 6.3 Quote Section

Renders `teaching.quote` as a styled blockquote with a left accent border. Only rendered when `teaching.quote` is non-null and non-empty.

### 6.4 Classification Section

Renders one pill per entry in `teaching.tags` using the same tag styles as the teaching cards. Only rendered when `teaching.tags` is non-empty.

### 6.5 Scripture References Section

A list of all entries in `teaching.references`. Each row contains:

- **Dot indicator** — filled/prominent for `isPrimary: true`; muted for secondary.
- **Reference label** — `reference.label` (e.g. `"Matt 7:11"`).
- **Sub-line** — full book name (`reference.book`), chapter number, and verse range derived from `reference.ranges`. Format: `"v.N"` for single verses, `"vv.N–N"` for ranges.
- **"Open ›" affordance** — signals the row is tappable.

Tapping any reference row opens the Bible Viewer for that reference.

### 6.6 Verse Snippets Section

Reserved integration point for a Bible API. Behavior:

- When API data is available: for each reference in `teaching.references`, display the verse text with the primary target verse highlighted with a distinct background tint.
- When no API data is available: **hide this section entirely.** Do not render placeholder copy or empty states.

---

## 7. Component: Global Nav Bar

The nav bar is sticky at the top of the viewport on all screens.

### 7.1 Element Reference

| Element | Visibility | Behavior |
|---|---|---|
| Back chevron (‹) | Hidden on Home; visible on all other screens | Calls `historyNav(-1)` |
| Logo / Page title | Logo on Home; category name or breadcrumb elsewhere | Non-interactive |
| History back (‹) | Shown only when `navPos > 0` | Calls `historyNav(-1)` |
| History forward (›) | Shown only when `navPos < navStack.length - 1` | Calls `historyNav(1)` |
| "↑ Category" button | Teaching Detail screen only | Navigates to Category Browser for the current teaching's parent category, restoring the correct subcategory tab |
| "Topical Subjects" button | Always visible | Navigates to Home; clears search input and resets placeholder |

### 7.2 History Navigation

`historyNav(dir)` moves `navPos` by `dir` (+1 or -1) and calls `_doShowScreen()` with the stored entry at the new position. If the entry is for the Category Browser, it restores `catId` and `tabIndex`. If it is for Teaching Detail, it restores `teachingId`.

---

## 8. Component: Search Bar

A single text input rendered in a persistent bar immediately below the global nav bar. Always visible on all screens.

### 8.1 Context-Sensitive Behavior

| Active screen | Placeholder | Scope |
|---|---|---|
| Home | `"Search categories, topics, teachings…"` | All categories, subcategories, and teaching text |
| Category Browser | `"Search in [Category Title]…"` | Subcategory titles and teaching text within the current category only |
| Teaching Detail | `"Search in [Category Title]…"` | Same as Category Browser |

### 8.2 State Transitions

- Navigating from Home into a category: input value is cleared; placeholder updates to the category name.
- Navigating back to Home (via any route): input value is cleared; placeholder resets to the global string.
- Clearing the input on any screen: restores the default content view for that screen (category grid or teaching list).
- Switching subcategory tabs while search is active: clears the search input and restores the teaching list.

---

## 9. Component: Prev / Next Bar

A two-button bar that sticks to the bottom of the viewport. Appears on the Category Browser and Teaching Detail screens.

### 9.1 Navigation Resolution Order

For each direction (prev/next), the bar resolves the target in this priority order:

1. Previous / next **teaching** within the current subcategory (respecting any active book filter)
2. Previous / next **subcategory tab** within the current category
3. Previous / next **category** in the full category list

### 9.2 Label Behavior

Each button displays a label that names the navigation target, truncated to approximately 32 characters with an ellipsis. When there is no valid target in a direction (e.g. first teaching of first subcategory of first category), the button is rendered at reduced opacity and is non-interactive.

### 9.3 Interaction with Book Filter

When a book filter is active, teaching navigation skips teachings that do not match the active book, staying within the filtered set.

### 9.4 Resolution Table

| Context | Prev resolves to | Next resolves to |
|---|---|---|
| Teaching open, not first in subcategory | Previous teaching | Next teaching |
| Teaching open, first in subcategory | Previous subcategory tab | — (next teaching) |
| Teaching open, last in subcategory | — (prev teaching) | Next subcategory tab |
| At first/last subcategory boundary | Previous category (last tab) | Next category (first tab) |
| No teaching open (browsing list) | Previous subcategory or category | Next subcategory or category |

---

## 10. Component: Bible Viewer Overview

The Bible Viewer displays verse text for a scripture reference. It is persistent — it is never closed by screen navigation events.

### 10.1 Trigger Points

The Bible Viewer opens when a user taps any of the following:

- Scripture chips on teaching cards in the Category Browser
- Scripture chips on teaching cards in Teaching Detail
- Reference rows in the Scripture References section of Teaching Detail
- Cross-reference chips within the Bible Viewer itself (chaining)

### 10.2 Content Structure

When a reference is loaded, the viewer displays:

1. A **context label** describing the passage setting (sourced from Bible API; omitted if unavailable).
2. **Verse rows** — verse number plus verse text. The targeted verse(s) are highlighted with a distinct background tint. Surrounding context verses (typically 1–2 before and after the target) are shown at normal styling.
3. A **Parallel passages** section with cross-reference chips. Each chip is tappable and loads the chained reference in the same viewer.

### 10.3 Viewport Routing

| Viewport | Component rendered |
|---|---|
| ≥ 768px (desktop) | Bible Panel — slides in from the right edge |
| < 768px (mobile) | Bible Drawer — slides up from the bottom edge |

---

## 11. Component: Bible Panel (Desktop)

*Desktop only (≥ 768px)*

### 11.1 Layout

A fixed-position panel attached to the right edge of the viewport. The panel slides in from the right when a reference is opened. The header contains:

- Reference label (e.g. `"Matthew 4:17"`) as the title.
- Context subtitle below the title.
- A single **pin icon button** in the header actions area. No close button.

### 11.2 Pin / Unpin Behavior

| State | Panel position | Main content | Auto-close on mouse-out |
|---|---|---|---|
| Unpinned (default) | Overlays content with a drop shadow | Full width — not compressed | Yes — closes ~600ms after mouse leaves panel |
| Pinned | Shares layout space; no shadow | Compressed by panel width (right margin applied) | No — stays open indefinitely |

### 11.3 Auto-Close Logic (Unpinned)

1. A timer (~600ms) starts when the mouse leaves the panel boundary.
2. If the mouse re-enters the panel before the timer fires, the timer is cancelled.
3. When the timer fires, the panel closes and the main content margin is removed.
4. Pinned panels ignore mouse-out events entirely.

### 11.4 Updating the Panel

When a new reference is opened while the panel is already visible, the panel content is replaced in-place. The panel does not close and reopen. Scroll position within the panel resets to the top.

### 11.5 Navigation Persistence

The panel remains open when the user navigates between screens. It is only closed by the auto-close timer (unpinned) or by the user toggling the pin off and then moving the mouse away.

---

## 12. Component: Bible Drawer (Mobile)

*Mobile only (< 768px)*

### 12.1 Layout

A bottom sheet that slides up from the bottom edge of the viewport. Width is full-viewport. Height is variable, controlled by the user via the drag handle.

- **Minimum height (peek state):** ~48px — only the drag handle and reference label are visible.
- **Default open height:** ~55vh.
- **Maximum height:** ~90vh.

### 12.2 Drag Handle

A visual drag affordance at the top of the drawer. The drag handle zone must handle both touch events (`touchstart`, `touchmove`, `touchend`) and mouse events for compatibility.

**Snap behavior on release:**

| Release position | Result |
|---|---|
| Above peek threshold | Stays at dragged height |
| At or near peek threshold | Snaps to peek state (~48px) |
| Below peek threshold | Drawer closes fully; peek pill appears |

There are no intermediate snap points between peek and maximum height.

### 12.3 Drawer States

| State | Height | Content visible | Overlay |
|---|---|---|---|
| Closed | 0 (translated off-screen) | None | None |
| Peek | ~48px | Drag handle + reference label only | None |
| Open | 48px – 90vh (user-controlled) | Full header + scrollable body | None |

> **Non-blocking:** The drawer does not use a dimming overlay and does not block interaction with page content. The user can scroll the screen, tap teaching cards, and navigate normally while the drawer is open.

### 12.4 Peek Pill

When the drawer is fully closed and a reference has been viewed in the session:

- A floating pill appears at the bottom of the screen showing the last-viewed reference label.
- The pill includes an upward arrow icon signaling it can be tapped.
- Tapping the pill reopens the drawer to its default height (~55vh) with the last reference loaded.
- The pill disappears as soon as the drawer opens.
- The pill is hidden at session start (before any reference has been opened).

### 12.5 Drawer Header

- Reference label as the title.
- Context subtitle.
- A close (✕) button that fully closes the drawer (off-screen, not just to peek). When closed via the ✕ button, the peek pill appears.

In peek state, the header is hidden. Only the drag handle and the reference label are visible.

### 12.6 Navigation Persistence

The drawer is never closed by screen navigation. Navigating between Home, Category Browser, and Teaching Detail leaves the drawer in whatever state (open, peek, or closed) it is currently in.

### 12.7 Updating the Drawer

When a new reference is opened while the drawer is already visible, content is replaced in-place. The drawer height is preserved. Scroll position resets to the top of the body. If the drawer is in peek state when a new reference is loaded, it automatically expands to the default open height (~55vh).

---

## 13. Responsive Breakpoints

| Breakpoint | Width | Changes |
|---|---|---|
| Mobile | < 768px | Subcategory tabs hidden; dropdown shown. Bible Panel hidden; Bible Drawer shown. Peek pill visible. No panel auto-close behavior. |
| Desktop | ≥ 768px | Subcategory dropdown hidden; tab row shown. Bible Drawer hidden; Bible Panel shown. Peek pill hidden. Auto-close active on unpinned panel. |

### 13.1 Category Card Grid

The category grid uses a responsive auto-fill column layout: `repeat(auto-fill, minmax(160px, 1fr))`. No fixed column count — the grid fills available width naturally.

### 13.2 Main Content Width

Content has no maximum width constraint. It fills the available space, accounting for the Bible Panel's right margin when the panel is pinned on desktop.

---

## 14. Client-Side State Reference

All state is ephemeral (in-memory). Nothing is persisted to localStorage or external storage.

| Variable | Type | Description |
|---|---|---|
| `navStack` | Array | History of screen visits. Each entry: `{ screen, catId?, tabIndex?, teachingId? }` |
| `navPos` | integer | Current position in `navStack`. Starts at -1 before first navigation. |
| `currentCatId` | integer \| null | The `id` of the currently open category. |
| `currentTabIndex` | integer | Zero-based index of the active subcategory tab within the current category. |
| `currentTeaching` | object \| null | Reference to the currently open teaching object from the data. |
| `activeBookFilter` | string \| null | `bookAbbr` of the active book filter, or null if no filter is active. |
| `panelPinned` | boolean | Whether the desktop Bible Panel is pinned. Default: `false`. |
| `drawerOpen` | boolean | Whether the mobile Bible Drawer is open (including peek state). |
| `drawerCurrentRef` | string \| null | The reference label (e.g. `"Matt 4:17"`) currently loaded in the drawer. |
| `drawerH` | number | Current height in pixels of the Bible Drawer. |

---

## 15. Interaction Reference

### 15.1 Home Screen

| Element | Action | Result |
|---|---|---|
| Category card | Tap | Navigate to Category Browser for that category, tab 0 |
| Search input | Type | Replace grid with grouped search results; update result count |
| Search input | Clear | Restore category grid; reset count to total categories |
| Search result row | Tap | Navigate to corresponding screen and tab; clear search |

### 15.2 Category Browser

| Element | Action | Result |
|---|---|---|
| Book filter chip (inactive) | Tap | Activate book filter; re-render teaching list filtered to that book |
| Book filter chip (active) | Tap | Deactivate filter; restore full teaching list |
| Subcategory tab (desktop) | Tap | Switch to that subcategory; re-render list; clear search if active |
| Subcategory dropdown (mobile) | Change | Switch to selected subcategory; re-render list; clear search if active |
| Teaching card body | Tap | Navigate to Teaching Detail for that teaching |
| Scripture chip on teaching card | Tap | Open Bible Viewer for that reference; does not navigate to Teaching Detail |
| Search input | Type | Replace teaching list with in-category search results |
| In-category search result | Tap | Clear search; switch to matching tab; restore teaching list |
| Prev button | Tap | Navigate per resolution order (teaching → tab → category) |
| Next button | Tap | Navigate per resolution order (teaching → tab → category) |

### 15.3 Teaching Detail

| Element | Action | Result |
|---|---|---|
| Scripture reference row | Tap | Open Bible Viewer for that reference |
| Prev button | Tap | Navigate per resolution order |
| Next button | Tap | Navigate per resolution order |

### 15.4 Bible Panel (Desktop)

| Element | Action | Result |
|---|---|---|
| Pin icon (unpinned) | Tap | Pin panel; compress main content; disable auto-close |
| Pin icon (pinned) | Tap | Unpin panel; restore full content width; enable auto-close |
| Panel area | Mouse leave (unpinned) | Start ~600ms timer; close panel on expiry |
| Panel area | Mouse enter | Cancel any pending close timer |
| Cross-reference chip | Tap | Load new reference in panel; reset scroll to top |

### 15.5 Bible Drawer (Mobile)

| Element | Action | Result |
|---|---|---|
| Drag handle | Drag up | Increase drawer height up to 90vh maximum |
| Drag handle | Drag down to peek threshold | Snap to peek state (~48px) |
| Drag handle | Drag below dismiss threshold | Close drawer fully; show peek pill |
| Close button (✕) | Tap | Close drawer fully; show peek pill |
| Peek pill | Tap | Reopen drawer to default height (~55vh) with last reference |
| Cross-reference chip | Tap | Load new reference; preserve drawer height; reset scroll to top |
| Drawer in peek state + new reference opened | Automatic | Drawer expands to default height |

### 15.6 Global Nav Bar (All Screens)

| Element | Action | Result |
|---|---|---|
| Back chevron (‹) | Tap | Navigate to previous history entry |
| History back (‹) in actions | Tap | Navigate to previous history entry |
| History forward (›) in actions | Tap | Navigate to next history entry |
| "↑ Category" button | Tap | Navigate to Category Browser for current teaching's parent; correct tab restored |
| "Topical Subjects" button | Tap | Navigate to Home; clear search; reset placeholder |

