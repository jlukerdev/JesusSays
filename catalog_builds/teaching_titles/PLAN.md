# Plan: Adding "title" Property to Teachings

**Status:** Planning Phase  
**Target:** `public/teachings.json` teachings objects  
**Created:** 2026-05-09  
**Catalog Version:** 1.4 (654 teachings, 37 parables)

---

## Overview

Add a new `"title"` property to each teaching in `teachings.json`. This property will store a condensed, memorable title/label suitable for display in UI contexts (tooltips, teaching cards, lists). The title should be:

- **Concise:** 10 words maximum
- **Memorable:** Recognizable to readers familiar with the teaching
- **Semantic:** Captures the essence of the teaching's content or primary reference point

---

## Schema Change

### Current teaching object:
```jsonc
{
  "id": "1.1.1",
  "uid": "<uuid>",
  "text": "...",           // thematic summary
  "quote": "...",        // canonical scripture quotation or null
  "tags": [],            // ["parable"], etc.
  "references": [...]
}
```

### Proposed change — ADD property:
```jsonc
{
  "id": "1.1.1",
  "uid": "<uuid>",
  "text": "...",
  "quote": "...",
  "title": "...",        // NEW: condensed title (≤10 words)
  "tags": [],
  "references": [...]
}
```

---

## Title Strategy by Teaching Type

### 1. **Parables** (37 teachings, tagged `"parable"`)

**Rule:** Use the canonical recognized name of the parable.

**Source:** Consult `TAG_RULES.md` Canonical Parable Reference List (lines 51–91) for authoritative names.

**Examples:**
- 4.1.1 → "The Parable of the Mustard Seed" (or "Mustard Seed")
- 5.2.3 → "The Prodigal Son" (or "The Lost Son")
- 5.2.2 → "The Parable of the Lost Coin"
- 13.1.2 → "The Good Samaritan"
- 18.2.3 → "The Unforgiving Servant"
- 20.3.3 → "The Parable of the Talents"
- 15.3.2 → "The Pharisee and the Tax Collector"

**Format preference:** Parable titles should align with how they appear in the TAG_RULES reference table (column 2, "Parable Title"). Some omit "The Parable of" prefix if the teaching is well-known without it (e.g., "The Good Samaritan" vs. "Parable of the Good Samaritan").

**Check for:** Double-check one-off and less-familiar parables in the reference list; leverage their assigned titles.

---

### 2. **"I AM" Declarations** (Category 2.1, ~7 teachings)

**Rule:** Use the "I AM" statement as-is, or the core metaphorical completion.

**Examples:**
- "I Am the Bread of Life"
- "I Am the Light of the World"
- "I Am the Door"
- "I Am the Good Shepherd"
- "I Am the Resurrection and the Life"
- "I Am the Way, the Truth, and the Life"
- "I Am the True Vine"

**Format:** Keep the "I Am" phrasing. If shortened for length, preserve the essential predicate.

---

### 3. **"Woe to the Pharisees / Teachers of the Law"** (Category 24.1, ~8 teachings)

**Rule:** Format as "Woe to [audience]" or "Woe for [failing]".

**Examples:**
- "Woe to the Pharisees and Teachers of the Law"
- "Woe for Hypocrisy"
- "Woe for Burdening Others"
- "Woe for Neglecting Mercy and Justice"
- "Woe for Shutting Out the Kingdom"

**Format:** Concise, parallel structure. If the woe is about a specific accusation, center on it: "Woe for [what they're accused of]".

---

### 4. **Other Teachings**

**Rule:** Summarize the teaching's primary theme or instruction in 10 words or fewer. Center on the theological or ethical core, not the scripture reference.

**Strategy:**
- Identify the primary theme from the teaching's `"text"` field
- Consult the subcategory name and category name for context
- Construct a title that would fit naturally in a list or card context

**Examples:**
- Blessed are the poor in spirit → "Blessed Are the Poor in Spirit"
- Teaching on anxiety → "Do Not Worry About Tomorrow"
- Teaching on forgiving many times → "Forgive Seventy Times Seven"
- Teaching on the greatest commandment → "Love God and Love Your Neighbor"
- Teaching on the sign of Jonah → "The Sign of the Son of Man"
- Resurrection promise → "I Will Raise Them Up on the Last Day"
- Teaching on judgment criteria → "Whatever You Did for the Least..."

**Length check:** Reword to stay ≤10 words. Examples:
- ❌ "The Teaching on Why We Should Forgive Our Enemies Many Times Over" (11 words)
- ✅ "Forgive Your Enemies Seventy Times Seven" (6 words)

---

## Implementation Strategy

### Phase 1: Data Collection & Curation

#### Step 1a: Compile parable titles (37 teachings)
- Extract canonical names from `TAG_RULES.md` Parable Reference List (rows with `id` in column 1, title in column 2)
- Map each parable `id` → canonical `title`
- Verify all 37 parables tagged `"parable"` are covered
- Output: `parable_titles.json` (or similar lookup)

#### Step 1b: Identify I AM statements
- Run `parse-catalog.js --stats` and filter for Category 2.1 (The "I AM" Declarations)
- Manually review each teaching's `"text"` and `"references"` to extract the I AM statement
- Create lookup table: `i-am_titles.json`

#### Step 1c: Identify Woe teachings
- Filter for Category 24.1 (Denunciations of Hypocrisy / Seven Woes)
- Review each teaching's primary reference and `"text"`
- Assign woe-format titles
- Create lookup: `woe_titles.json`

#### Step 1d: Catalog remaining ~600 teachings
- Review each teaching by subcategory
- Derive concise titles from the teaching's `"text"` summary and category context
- Validate length ≤10 words
- Document in `other_teachings_titles.json` or as a CSV for auditing

**Output artifacts:**
- `parable_titles.json` — 37 entries
- `i-am_titles.json` — ~7 entries
- `woe_titles.json` — ~8 entries
- `other_teachings_titles.json` — ~600 entries (or detailed CSV)

---

### Phase 2: Script & Implementation

#### Option A: Manual JSON edit (simplest, most control)
1. Load all lookup tables
2. Manually edit `public/teachings.json` to insert `"title"` property for each teaching
3. Run `renumber.js --dry-run` to verify no ID/slug damage
4. Run `validate-catalog.js` to confirm schema integrity

**Pros:** Full control, easy QA, aligns with existing workflow.  
**Cons:** Time-intensive for 654 entries.

#### Option B: Create a new script `add-titles.js`
1. Read `public/teachings.json`
2. Load all lookup tables (parable, I AM, woe, other)
3. Iterate through teachings and insert `"title"` property
4. Write updated JSON
5. Hand off to standard validation workflow

**Pros:** Reusable, auditable, scalable.  
**Cons:** Requires careful script logic.

**Recommendation:** Use **Option B** — write `add-titles.js` with the following logic:
```
for each teaching in teachings:
  if teaching.tags includes "parable":
    title = lookup_parable_title(teaching.id)
  else if teaching.category === 2.1:
    title = lookup_i-am_title(teaching.id)
  else if teaching.category === 24.1:
    title = lookup_woe_title(teaching.id)
  else:
    title = lookup_other_title(teaching.id)
  
  teaching.title = title
```

---

### Phase 3: Validation & QA

#### Step 3a: Schema validation
```bash
node catalog_builds/engine/scripts/validate-catalog.js
```
Must exit code 0. Confirms all titles are strings, no missing required fields.

#### Step 3b: Length audit
Create a simple audit script or grep to identify any title > 10 words. Flag for revision.

#### Step 3c: Spot-check by category
- Manually review ~5 teachings per major category for title accuracy
- Confirm parables match TAG_RULES reference list
- Confirm I AM statements match John gospel phrasing
- Confirm woes follow consistent format

#### Step 3d: UI testing (post-implementation)
- Load updated JSON in dev environment
- Verify title displays correctly in teaching cards, lists, and detail views
- Check tooltip/hover behavior if title is used there
- Test on mobile and desktop breakpoints

---

## Title Quality Checklist

Before finalizing each title, verify:

- [ ] **Length:** ≤10 words
- [ ] **Clarity:** Would a non-expert recognize what teaching this is?
- [ ] **Consistency:** Follows the category's established format (parables, I AMs, woes, other)
- [ ] **Accuracy:** Reflects the teaching's primary content, not a side point
- [ ] **Memorability:** Short enough to recall; specific enough to distinguish from similar teachings
- [ ] **Capitalization:** Title case (first word + proper nouns capitalized)
- [ ] **Punctuation:** Avoid trailing periods; prefer clean titles

---

## Reference Data

### Parable Titles from TAG_RULES.md

| ID | Title (from reference table) |
|---|---|
| 4.1.1 | Mustard Seed |
| 4.1.2 | Leaven in Flour |
| 4.1.3 | Hidden Treasure / Pearl of Great Price |
| 4.1.4 | The Net (dragnet) |
| 4.1.5 | The Wedding Banquet |
| 4.1.6 | The Ten Virgins |
| 4.1.11 | The Trained Scribe (householder) |
| 4.2.1 | Seed Growing Secretly |
| 4.2.2 | The Sower |
| 4.2.3 | Wheat and Tares |
| 4.2.5 | Explanation of the Sower |
| 4.5.1 | The Two Sons |
| 4.5.2 | Workers in the Vineyard |
| 4.5.3 | The Wicked Tenants |
| 5.1.4 | The Barren Fig Tree |
| 5.2.1 | The Lost Sheep |
| 5.2.2 | The Lost Coin |
| 5.2.3 | The Lost Son (Prodigal Son) |
| 9.3.1 | New Wine in Old Wineskins |
| 10.3.2 | The Persistent Friend at Midnight |
| 10.3.3 | The Persistent Widow and Unjust Judge |
| 13.1.2 | The Good Samaritan |
| 14.6.2 | The Wise and Foolish Builders |
| 15.3.1 | The Seat of Honor / Great Banquet |
| 15.3.2 | The Pharisee and the Tax Collector |
| 15.3.3 | The Unworthy Servants |
| 18.1.3 | Two Debtors |
| 18.2.3 | The Unforgiving Servant |
| 20.2.1 | The Rich Fool |
| 20.3.3 | The Talents / Minas |
| 20.3.4 | The Dishonest Manager |
| 21.3.2 | The Good Samaritan (cross-listed) |
| 22.2.4 | The Tower Builder / King Going to War |
| 24.2.3 | The Pharisee and the Tax Collector (cross-listed) |
| 29.3.2 | The Faithful and Unfaithful Servant |
| 29.3.3 | The Ten Virgins (cross-listed) |
| 29.3.6 | The Servants with Lamps Lit |
| 29.4.1 | The Fig Tree (lesson from the fig tree) |

**Note:** Cross-listed parables (Good Samaritan, Pharisee & Tax Collector, Ten Virgins) appear in multiple categories but have identical teaching content. They should have the same title.

---

## Workflow Sequence (Implementation)

1. **Data Collection** → Compile all lookup tables
2. **Script Development** → Write `add-titles.js` (if using Option B)
3. **Test Run** → Execute with `--dry-run` to preview changes
4. **Apply** → Write updated JSON
5. **Validate** → Run `validate-catalog.js` (must exit 0)
6. **Audit** → Length check, spot-check by category
7. **UI Test** → Load in dev environment, verify display
8. **Document** → Update `catalog_stats.md` if schema version changes

---

## Success Criteria

- [ ] All 654 teachings have a `"title"` property
- [ ] All titles are ≤10 words
- [ ] Parables match TAG_RULES canonical names
- [ ] I AM statements use recognizable John gospel phrasing
- [ ] Woes follow consistent "Woe to/for" format
- [ ] Other teachings reflect their category's primary theme
- [ ] `validate-catalog.js` exits with code 0
- [ ] No structural damage to IDs, UIDs, or references
- [ ] UI displays titles correctly across all screens and breakpoints
- [ ] Teaching cards/lists show meaningful titles

---

## Open Questions for User Review

1. **Parable title format:** Should we use short form ("The Sower") or long form ("The Parable of the Sower")? Recommendation: short form where possible, align with TAG_RULES table.

2. **Cross-listed parables:** Do all instances of a cross-listed parable (e.g., Good Samaritan at 13.1.2 and 21.3.2) use the same title, or can they differ contextually? Recommendation: same title.

3. **I AM statements with nuance:** Some I AM teachings have extended discourse (e.g., John 10 shepherd discourse). Should the title be just "I Am the Good Shepherd" or include context like "I Am the Good Shepherd (vs. the Hireling)"? Recommendation: keep it simple; context is in the `"text"` field.

4. **Priority order:** Should we tackle parables first as a quick win (37 teachings), then I AMs, woes, and finally the long tail? Or prefer a different order? Recommendation: parables first (highest confidence), then I AMs, then woes, then other.

5. **Script vs. manual:** Preference for Option A (manual edit) or Option B (create `add-titles.js` script)? Recommendation: Option B for auditability and future reuse.

---

## Estimated Effort

| Phase | Task | Est. Hours | Notes |
|---|---|---|---|
| 1a | Extract parable titles | 0.5 | Low complexity; direct from TAG_RULES |
| 1b | Extract I AM statements | 1 | Requires reading John passages |
| 1c | Assign woe titles | 1 | Requires reading Matt 23 context |
| 1d | Catalog other ~600 titles | 8–12 | High effort; manual review per category |
| 2 | Script development + testing | 2 | Assuming Option B; Option A = 0 |
| 3 | Validation + QA | 2 | Schema check, length audit, spot-check, UI test |
| **Total** | | **14.5–18.5** | Roughly 2–3 days depending on detail level |

---

---

## Phase 4: UI Implementation & Display (NEW)

Once the `"title"` property is added to all teachings in `teachings.json`, integrate title display and search across the Modern navigation UI.

### 4.1: Display Title in Search Results

**Location:** `ModernApp/HomeScreen.jsx` → search results card render

**Requirements:**
- When user types in search bar, results are filtered and displayed as teaching cards
- Each card currently shows: teaching text snippet, primary reference
- **Add:** Teaching title prominently displayed (above or below teaching ID/reference)

**Implementation:**
- Modify search results render in `HomeScreen.jsx` to include `teaching.title`
- Suggested placement: above the text snippet, below any category/subcategory label
- Style: Larger font than text snippet; visually distinct (e.g., bold, different color)

**Component chain:**
1. `ModernSearchBar.jsx` → captures user input
2. `HomeScreen.jsx` → filters teachings by query (text, reference, etc.)
3. Teaching card render → display title

---

### 4.2: Display Title in Subcategory Browser

**Location:** `ModernApp/CategoryBrowser.jsx` → teaching list cards

**Requirements:**
- When user browses a category → sees subcategory tabs → sees list of teachings in subcategory
- Each teaching in the list is displayed as a card/row
- **Add:** Teaching title displayed prominently in each card

**Implementation:**
- Modify `CategoryBrowser.jsx` teaching list render to include `teaching.title`
- Suggested placement: Primary label/title of the card (above teaching text snippet)
- Style: Consistent with search results card styling

**Component chain:**
1. `ModernApp/ModernApp.jsx` → manages category state
2. `CategoryBrowser.jsx` → renders subcategory tabs and teaching list
3. Teaching card render → display title

---

### 4.3: Display Title in Teaching Detail View

**Location:** `ModernApp/TeachingDetail.jsx` → detail page header/title area

**Requirements:**
- When user clicks a teaching to view full details, the detail page loads
- Currently shows: scripture references, full text, related content
- **Add:** Teaching title displayed prominently at the top of the detail view

**Implementation:**
- Modify `TeachingDetail.jsx` to display `teaching.title` in the page header area
- Suggested placement: Above or alongside the scripture reference (e.g., "Title | Matt 5:3-12")
- Style: Large, prominent heading; visually distinct from other text

**Component chain:**
1. User navigates to `TeachingDetail.jsx` (via click from search/browser or direct route)
2. `TeachingDetail.jsx` loads and displays teaching data
3. Render title in header section alongside scripture reference

---

### 4.4: Update Search Functionality to Include Titles

**Location:** `ModernApp/HomeScreen.jsx` → search logic

**Requirements:**
- Current search: filters teachings by text content and scripture references
- **Add:** Search also matches against teaching `title` field
- User types query → matches teaching title → returns results

**Implementation:**
- Modify search filter logic in `HomeScreen.jsx` (or a utility function)
- Search query matches against:
  - `teaching.title` (new)
  - `teaching.text` (existing)
  - `teaching.quote` (existing, if applicable)
  - `teaching.references[].label` (existing)
- Scoring/ranking: Consider whether title matches should be weighted higher (e.g., "The Prodigal Son" search returns the parable first)

**Suggestion:** Title matches could be higher priority in search results:
```javascript
// Pseudocode
const titleMatch = teaching.title.toLowerCase().includes(query.toLowerCase());
const textMatch = teaching.text.toLowerCase().includes(query.toLowerCase());
const refMatch = teaching.references.some(r => r.label.includes(query));

// Higher weight for title matches
const score = titleMatch ? 3 : textMatch ? 2 : refMatch ? 1 : 0;
```

---

### 4.5: Components Affected (Summary)

| Component | Change | Priority |
|---|---|---|
| `ModernSearchBar.jsx` | No change (already filters) | — |
| `HomeScreen.jsx` | Display title in search results; update search logic to include titles | 🔴 High |
| `CategoryBrowser.jsx` | Display title in teaching list cards | 🔴 High |
| `TeachingDetail.jsx` | Display title in page header | 🔴 High |
| `ModernNavBar.jsx` | No change (unless title shown in breadcrumb) | 🟢 Low |
| `PrevNextBar.jsx` | Optional: show title in prev/next teaching labels | 🟡 Medium |
| CSS (`base.css`) | Optional: new CSS classes for title styling | 🟡 Medium |

---

### 4.6: Styling Considerations

**Title styling should:**
- Use CSS custom properties (e.g., `--color-title-text`, `--font-title-size`)
- Be responsive (larger on desktop, readable on mobile)
- Maintain visual hierarchy (title > text snippet > reference)
- Align with existing Modern nav color scheme (check `theme-classic.css`)
- Consider contrast/accessibility (WCAG AA minimum)

**Suggested additions to `src/styles/themes/theme-classic.css`:**
```css
--font-title-size: 1.1rem;        /* Larger than body, smaller than category heading */
--font-title-weight: 600;         /* Semi-bold for prominence */
--color-title-text: var(--color-authority); /* Navy, matching emphasis text */
--color-title-accent: var(--color-accent);  /* Gold, for highlights */
```

---

### 4.7: Testing Checklist

#### Unit/Component Testing
- [ ] Search results card renders title correctly
- [ ] Subcategory browser teaching list shows title
- [ ] Teaching detail page displays title in header
- [ ] Title is truncated gracefully if too long (shouldn't happen; max 10 words)
- [ ] Title text is properly escaped (no XSS vulnerability)

#### Integration Testing
- [ ] Search query matches against title + text + reference
- [ ] Title matches appear in search results
- [ ] Clicking teaching card in search results navigates to detail view with title
- [ ] Browsing category → subcategory → teaching maintains title display
- [ ] Title displays correctly for all teaching types (parables, I AMs, woes, other)

#### UI/UX Testing
- [ ] Title is visually prominent in all three contexts
- [ ] Title doesn't break layout on mobile (no overflow, text wrapping OK)
- [ ] Title styling is consistent across search/browser/detail
- [ ] Responsive: desktop and mobile (< 768px breakpoint) both work
- [ ] Color contrast meets WCAG AA (check with accessibility tool)
- [ ] Font size is readable on all devices

#### Edge Cases
- [ ] Teaching with very long title (9–10 words) renders without layout issues
- [ ] Teaching with title containing special characters (apostrophes, hyphens) renders correctly
- [ ] Search for partial title (e.g., "Prodigal" for "The Prodigal Son") works
- [ ] Case-insensitive search (e.g., "the good samaritan" matches "The Good Samaritan")

---

### 4.8: Implementation Workflow

**Step 1: Prepare**
- [ ] Verify `teachings.json` has `"title"` property on all 654 teachings
- [ ] Run `validate-catalog.js` to confirm schema integrity

**Step 2: Update Search Logic**
- [ ] Open `ModernApp/HomeScreen.jsx`
- [ ] Locate search filter function (likely filtering `teachings` array by query)
- [ ] Add `teaching.title` to the match criteria
- [ ] Consider ranking/scoring for title matches
- [ ] Test search with known parable titles (e.g., "Prodigal", "Sower")

**Step 3: Update Search Results Display**
- [ ] Modify search results card render in `HomeScreen.jsx`
- [ ] Insert `teaching.title` display (above text snippet recommended)
- [ ] Apply styling (bold, larger font, distinct color)

**Step 4: Update Category Browser**
- [ ] Open `ModernApp/CategoryBrowser.jsx`
- [ ] Locate teaching list render (subcategory tab content)
- [ ] Add `teaching.title` to each teaching card
- [ ] Apply consistent styling

**Step 5: Update Teaching Detail View**
- [ ] Open `ModernApp/TeachingDetail.jsx`
- [ ] Locate page header/title area
- [ ] Add `teaching.title` display (alongside or above scripture reference)
- [ ] Apply prominent header styling

**Step 6: CSS (Optional)**
- [ ] If new styling needed, add classes to `src/styles/base.css`
- [ ] Define new custom properties in `src/styles/themes/theme-classic.css` if appropriate
- [ ] Ensure responsive breakpoints are covered

**Step 7: Testing**
- [ ] Start dev server: `npm run dev`
- [ ] Test search: type parable names, I AM statements, woes, other teachings
- [ ] Test browse: navigate category → subcategory → verify titles show
- [ ] Test detail: click teaching → verify title shows in header
- [ ] Test responsive: resize window, test on mobile breakpoint
- [ ] Check accessibility: use color contrast checker

**Step 8: Build & Verify**
- [ ] Run `npm run build`
- [ ] Run `npm run preview`
- [ ] Test production build in preview environment
- [ ] Verify no console errors or warnings

---

### 4.9: Success Criteria

- [ ] All 654 teachings display their title in search results
- [ ] All 654 teachings display their title in subcategory browser
- [ ] All 654 teachings display their title in detail view
- [ ] Search function matches and returns results for title queries
- [ ] Title display is consistent across all three contexts (styling, layout)
- [ ] All tests pass (unit, integration, UI/UX, edge cases)
- [ ] No new console errors or accessibility issues
- [ ] Production build (`npm run build`) succeeds without warnings
- [ ] Feature works on mobile and desktop

---

### 4.10: Post-Implementation Tasks

After UI changes are live:

- [ ] Create GitHub commit with clear message (e.g., "feat: add teaching titles to search results, category browser, and detail view")
- [ ] Manually verify across multiple browsers/devices if applicable
- [ ] Gather user feedback on title clarity and usefulness
- [ ] Monitor search logs to identify any unexpected query patterns
- [ ] Consider future enhancements (e.g., highlighting matched title in search results, title-based filtering)

---

## Next Steps

1. **User Review:** Confirm strategy and options for Phases 1–4; answer outstanding questions
2. **Data Curation (Phase 1):** Compile lookup tables for parables, I AMs, woes, other teachings
3. **Data Implementation (Phase 2):** Create script or manually edit `public/teachings.json`
4. **Data Validation (Phase 3):** Run standard validation workflow, confirm exit code 0
5. **UI Implementation (Phase 4):** Update components, add title display, update search logic
6. **Testing & QA:** Comprehensive testing across all screens and functionality
7. **Documentation:** Update version history, commit changes, gather feedback
