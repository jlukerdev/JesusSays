# UI Implementation Guide: Teaching Titles

This document provides detailed, component-by-component guidance for integrating teaching titles into the Modern navigation UI.

---

## Overview

**Three integration points:**
1. **Search results** — titles displayed in teaching cards in `HomeScreen.jsx`
2. **Subcategory browser** — titles displayed in teaching list in `CategoryBrowser.jsx`
3. **Teaching detail** — titles displayed in page header in `TeachingDetail.jsx`

**Search enhancement:**
- Update search filter logic to match against `teaching.title` field
- Optional: weight title matches higher in results

---

## 1. Search Results Card (`HomeScreen.jsx`)

### Current Structure

The `HomeScreen.jsx` component renders search results as cards. Each card currently displays:
- Teaching ID (e.g., "1.1.1")
- Category/subcategory label
- Teaching text snippet
- Primary scripture reference

### Proposed Change

**Add** teaching title prominently at the top of each search result card.

### Implementation Details

**Location:** `src/components/ModernApp/HomeScreen.jsx`

**Typical card render code (pseudocode):**
```jsx
// Current (before)
<div className="teaching-card search-result">
  <div className="card-header">
    <span className="teaching-id">{teaching.id}</span>
    <span className="category-label">{category.title}</span>
  </div>
  <div className="card-body">
    <p className="teaching-text">{teaching.text}</p>
    <p className="teaching-reference">{primaryRef.label}</p>
  </div>
</div>
```

**Proposed change:**
```jsx
// After: Add teaching.title
<div className="teaching-card search-result">
  <div className="card-header">
    <h3 className="teaching-title">{teaching.title}</h3>
    <span className="teaching-id">{teaching.id}</span>
    <span className="category-label">{category.title}</span>
  </div>
  <div className="card-body">
    <p className="teaching-text">{teaching.text}</p>
    <p className="teaching-reference">{primaryRef.label}</p>
  </div>
</div>
```

**Key points:**
- Title placed above ID and category label for visual hierarchy
- Use `<h3>` semantic heading (or `<h4>` if other `<h3>` exist on page)
- Apply CSS class `teaching-title` for styling consistency

---

### Search Logic Update

**Location:** `src/components/ModernApp/HomeScreen.jsx` → search filter function

**Current search (pseudocode):**
```javascript
const filteredTeachings = teachings.filter(teaching => {
  const matchesText = teaching.text.toLowerCase().includes(query.toLowerCase());
  const matchesRef = teaching.references.some(ref =>
    ref.label.toLowerCase().includes(query.toLowerCase())
  );
  return matchesText || matchesRef;
});
```

**Updated search (add title matching):**
```javascript
const filteredTeachings = teachings.filter(teaching => {
  const query_lower = query.toLowerCase();
  
  // Match against title, text, and references
  const matchesTitle = teaching.title && 
    teaching.title.toLowerCase().includes(query_lower);
  const matchesText = teaching.text.toLowerCase().includes(query_lower);
  const matchesRef = teaching.references.some(ref =>
    ref.label.toLowerCase().includes(query_lower)
  );
  
  return matchesTitle || matchesText || matchesRef;
});
```

**Optional: Scoring for ranking (higher scores = higher in list):**
```javascript
const getSearchScore = (teaching, query) => {
  const query_lower = query.toLowerCase();
  let score = 0;
  
  // Title match: highest priority (3 points)
  if (teaching.title && teaching.title.toLowerCase().includes(query_lower)) {
    score += 3;
  }
  
  // Text match: medium priority (2 points)
  if (teaching.text.toLowerCase().includes(query_lower)) {
    score += 2;
  }
  
  // Reference match: lower priority (1 point)
  if (teaching.references.some(ref => ref.label.includes(query))) {
    score += 1;
  }
  
  return score;
};

const filteredTeachings = teachings
  .filter(teaching => getSearchScore(teaching, query) > 0)
  .sort((a, b) => getSearchScore(b, query) - getSearchScore(a, query));
```

---

### CSS Styling for Search Results

**Add to `src/styles/base.css`:**

```css
/* Teaching title in search results and cards */
.teaching-title {
  font-size: var(--font-title-size, 1.1rem);
  font-weight: var(--font-title-weight, 600);
  color: var(--color-title-text, var(--color-authority));
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  padding: 0;
}

/* Search result card-specific title styling */
.search-result .teaching-title {
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-accent-light);
  padding-bottom: 0.5rem;
}

/* Responsive: smaller on mobile */
@media (max-width: 768px) {
  .teaching-title {
    font-size: 1rem;
  }
}
```

**Add to `src/styles/themes/theme-classic.css` (in `:root` block):**

```css
--font-title-size: 1.1rem;
--font-title-weight: 600;
--color-title-text: var(--color-authority);  /* Navy */
```

---

## 2. Subcategory Browser Card (`CategoryBrowser.jsx`)

### Current Structure

The `CategoryBrowser.jsx` component displays teachings within a selected subcategory. Currently shows:
- Subcategory tabs (if multiple)
- Teaching list (each teaching as a row/card)
- Each teaching shows: ID, text snippet, reference

### Proposed Change

**Add** teaching title to each teaching card in the list.

### Implementation Details

**Location:** `src/components/ModernApp/CategoryBrowser.jsx`

**Typical teaching list render (pseudocode):**
```jsx
// Current (before)
<div className="teachings-list">
  {teachings.map(teaching => (
    <div
      key={teaching.id}
      className="teaching-list-item"
      onClick={() => onTeachingClick(teaching)}
    >
      <span className="teaching-id">{teaching.id}</span>
      <p className="teaching-text">{teaching.text}</p>
      <p className="teaching-reference">{primaryRef.label}</p>
    </div>
  ))}
</div>
```

**Proposed change:**
```jsx
// After: Add teaching.title
<div className="teachings-list">
  {teachings.map(teaching => (
    <div
      key={teaching.id}
      className="teaching-list-item"
      onClick={() => onTeachingClick(teaching)}
    >
      <h4 className="teaching-title">{teaching.title}</h4>
      <span className="teaching-id">{teaching.id}</span>
      <p className="teaching-text">{teaching.text}</p>
      <p className="teaching-reference">{primaryRef.label}</p>
    </div>
  ))}
</div>
```

**Key points:**
- Title placed first in visual order (top of card)
- Use `<h4>` semantic heading (or appropriate level based on page structure)
- Apply CSS class `teaching-title` for consistency with search results

---

### CSS Styling for Category Browser

**Add to `src/styles/base.css`:**

```css
/* Teaching list item title */
.teaching-list-item .teaching-title {
  margin: 0 0 0.5rem 0;
  padding: 0;
}

/* Optional: highlight hover state */
.teaching-list-item:hover .teaching-title {
  color: var(--color-accent);
  transition: color 0.2s ease;
}

/* Responsive: adjust spacing on mobile */
@media (max-width: 768px) {
  .teaching-list-item .teaching-title {
    margin-bottom: 0.25rem;
  }
}
```

---

## 3. Teaching Detail View (`TeachingDetail.jsx`)

### Current Structure

The `TeachingDetail.jsx` component displays the full teaching page. Currently shows:
- Scripture references (with BLB links)
- Full teaching text
- Related teachings or sidebar content
- Prev/Next navigation buttons

### Proposed Change

**Add** teaching title prominently at the top of the page, in the header area, alongside or above the primary scripture reference.

### Implementation Details

**Location:** `src/components/ModernApp/TeachingDetail.jsx`

**Typical detail page header (pseudocode):**
```jsx
// Current (before)
<div className="teaching-detail">
  <div className="detail-header">
    <div className="scripture-reference">
      <a href={bibleLink}>{primaryRef.label}</a>
    </div>
  </div>
  <div className="detail-body">
    <div className="teaching-text">{teaching.text}</div>
    {/* ... more content ... */}
  </div>
</div>
```

**Proposed change — Option A: Title above reference**
```jsx
// After: Title in prominent header position
<div className="teaching-detail">
  <div className="detail-header">
    <h1 className="teaching-title">{teaching.title}</h1>
    <div className="scripture-reference">
      <a href={bibleLink}>{primaryRef.label}</a>
    </div>
  </div>
  <div className="detail-body">
    <div className="teaching-text">{teaching.text}</div>
    {/* ... more content ... */}
  </div>
</div>
```

**Proposed change — Option B: Title beside reference**
```jsx
// Alternative: Title inline with reference for compact header
<div className="teaching-detail">
  <div className="detail-header">
    <h1 className="teaching-title">
      {teaching.title}
      <span className="scripture-reference-inline">
        <a href={bibleLink}>{primaryRef.label}</a>
      </span>
    </h1>
  </div>
  <div className="detail-body">
    <div className="teaching-text">{teaching.text}</div>
    {/* ... more content ... */}
  </div>
</div>
```

**Recommendation:** Use **Option A** (title above reference) for clearer visual hierarchy and easier scanning on mobile.

**Key points:**
- Use `<h1>` semantic heading (this is the main page title)
- Apply CSS class `teaching-title` for consistency
- Ensure title is clearly visually distinct from teaching text
- Title should remain visible when scrolling (sticky header consideration)

---

### CSS Styling for Teaching Detail

**Add to `src/styles/base.css`:**

```css
/* Detail page title */
.teaching-detail .detail-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-accent-light);
}

.teaching-detail .teaching-title {
  font-size: 1.75rem;      /* Larger than search/browser titles */
  line-height: 1.3;
  margin-bottom: 0.75rem;
  color: var(--color-authority);
}

/* Scripture reference in detail header */
.teaching-detail .scripture-reference {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--color-accent-mid);
}

.teaching-detail .scripture-reference a {
  color: var(--color-accent-mid);
  text-decoration: none;
  transition: color 0.2s ease;
}

.teaching-detail .scripture-reference a:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

/* Responsive: adjust heading size on mobile */
@media (max-width: 768px) {
  .teaching-detail .teaching-title {
    font-size: 1.4rem;
  }
  
  .teaching-detail .scripture-reference {
    font-size: 0.95rem;
  }
}
```

---

## 4. Search Logic Integration (Detailed)

### File Structure

**Location:** `src/components/ModernApp/HomeScreen.jsx`

The search logic typically lives in one of these places:
1. Directly in `HomeScreen.jsx` component
2. In a separate utility file (e.g., `src/utils/search.js` or `src/utils/searchTeachings.js`)

**Recommended approach:** Extract search logic to a utility function for reusability and testing.

### New Utility Function (Optional)

**File:** `src/utils/searchTeachings.js`

```javascript
/**
 * Search teachings by query string.
 * Matches against title, text, and scripture references.
 * 
 * @param {Array} teachings - Array of teaching objects
 * @param {string} query - Search query string
 * @param {boolean} rankByRelevance - If true, sort results by relevance (title > text > ref)
 * @returns {Array} Filtered and optionally sorted array of teachings
 */
export function searchTeachings(teachings, query, rankByRelevance = true) {
  if (!query || query.trim() === '') {
    return teachings;
  }

  const query_lower = query.toLowerCase().trim();

  // Score function for ranking
  const getScore = (teaching) => {
    let score = 0;

    // Title match: highest priority (factor 3)
    if (teaching.title && teaching.title.toLowerCase().includes(query_lower)) {
      // Exact word match in title gets extra boost
      const titleWords = teaching.title.toLowerCase().split(/\s+/);
      if (titleWords.some(word => word.startsWith(query_lower))) {
        score += 5; // Exact prefix match
      } else {
        score += 3; // Substring match
      }
    }

    // Text match: medium priority (factor 2)
    if (teaching.text.toLowerCase().includes(query_lower)) {
      score += 2;
    }

    // Reference match: lower priority (factor 1)
    if (teaching.references && teaching.references.some(ref =>
      ref.label.toLowerCase().includes(query_lower)
    )) {
      score += 1;
    }

    return score;
  };

  // Filter teachings that match
  const filtered = teachings.filter(teaching => getScore(teaching) > 0);

  // Sort by relevance if requested
  if (rankByRelevance) {
    filtered.sort((a, b) => getScore(b) - getScore(a));
  }

  return filtered;
}

/**
 * Highlight matched query text in a string (for optional UI enhancement)
 */
export function highlightMatch(text, query) {
  if (!query || !text) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

### Integration in HomeScreen.jsx

**Usage:**
```jsx
import { searchTeachings } from '../utils/searchTeachings.js';

export function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeachings, setFilteredTeachings] = useState([]);

  // Update filtered results whenever query changes
  useEffect(() => {
    const results = searchTeachings(allTeachings, searchQuery);
    setFilteredTeachings(results);
  }, [searchQuery, allTeachings]);

  return (
    <div className="home-screen">
      <ModernSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search teachings by title, content, or scripture..."
      />
      
      <div className="search-results">
        {filteredTeachings.length > 0 ? (
          <div className="results-list">
            {filteredTeachings.map(teaching => (
              <TeachingCard
                key={teaching.id}
                teaching={teaching}
                onClick={() => onSelectTeaching(teaching)}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            No teachings found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Component File Checklist

**Files to modify:**

| File | Change | Priority |
|---|---|---|
| `src/components/ModernApp/HomeScreen.jsx` | Add title to search results; integrate search utility | 🔴 High |
| `src/components/ModernApp/CategoryBrowser.jsx` | Add title to teaching list items | 🔴 High |
| `src/components/ModernApp/TeachingDetail.jsx` | Add title to page header | 🔴 High |
| `src/styles/base.css` | Add `.teaching-title` and related classes | 🔴 High |
| `src/styles/themes/theme-classic.css` | Add CSS custom properties for title styling | 🟡 Medium |
| `src/utils/searchTeachings.js` | Create new search utility (optional) | 🟡 Medium |
| `src/components/ModernApp/ModernSearchBar.jsx` | Update placeholder text (optional) | 🟢 Low |

---

## 6. Testing Strategy

### Manual Testing Checklist

- [ ] **Search functionality:**
  - Type parable title ("Prodigal", "Sower", "Good Samaritan") → verify results match
  - Type I AM statement ("Bread of Life", "Good Shepherd") → verify results match
  - Type partial title → verify substring matching works
  - Type mixed case → verify case-insensitive matching
  - Search returns title matches with expected ranking

- [ ] **Search results display:**
  - Title appears in each search result card
  - Title is styled consistently (font size, weight, color)
  - Title doesn't overflow on mobile
  - Title is clickable (inherits click handler from card)
  - Multiple search results show different titles correctly

- [ ] **Category browser display:**
  - Navigate to a category → select a subcategory
  - Teaching list shows titles for all teachings
  - Title appears above ID and text snippet
  - Titles are consistent with search results titles
  - No layout issues on mobile

- [ ] **Teaching detail display:**
  - Click a teaching from search or browser
  - Detail page loads and shows title prominently
  - Title appears above or alongside scripture reference
  - Title styling is appropriate for page header
  - Scrolling page doesn't hide title (or sticky header works)

- [ ] **Responsive design:**
  - All three views (search, browser, detail) tested on:
    - Mobile (< 480px, ~375px iPhone width)
    - Tablet (480–768px)
    - Desktop (> 768px)
  - Text wrapping is appropriate
  - Font sizes are readable
  - No horizontal overflow

- [ ] **Edge cases:**
  - Teaching with 10-word title (max length) → no overflow
  - Teaching with special characters in title (apostrophes, hyphens) → renders correctly
  - Parables with multiple names (e.g., "Hidden Treasure / Pearl") → display as-is
  - Empty search query → shows all teachings (or default view)

### Automated Testing (Optional)

```javascript
// Example unit test for search utility
describe('searchTeachings', () => {
  const mockTeachings = [
    {
      id: '5.2.3',
      title: 'The Prodigal Son',
      text: 'Teaching about a father...',
      references: [{ label: 'Luke 15:11-32' }]
    },
    {
      id: '4.2.2',
      title: 'The Parable of the Sower',
      text: 'Teaching about seeds...',
      references: [{ label: 'Matt 13:1-23' }]
    }
  ];

  test('matches by title', () => {
    const results = searchTeachings(mockTeachings, 'Prodigal');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('5.2.3');
  });

  test('matches by text content', () => {
    const results = searchTeachings(mockTeachings, 'seeds');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('4.2.2');
  });

  test('matches by scripture reference', () => {
    const results = searchTeachings(mockTeachings, 'Matt');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('4.2.2');
  });

  test('ranks title matches highest', () => {
    const allTeachings = [
      ...mockTeachings,
      {
        id: '20.3.3',
        title: 'The Talents',
        text: 'Teaching about the Prodigal Son parable',
        references: [{ label: 'Matt 25:14-30' }]
      }
    ];
    const results = searchTeachings(allTeachings, 'Prodigal', true);
    expect(results[0].id).toBe('5.2.3'); // Title match comes first
    expect(results[1].id).toBe('20.3.3'); // Text match comes second
  });
});
```

---

## 7. Accessibility Considerations

### WCAG Compliance

- [ ] **Color contrast:** Title color (navy `--color-authority`) meets WCAG AA minimum (4.5:1) against background
- [ ] **Semantic markup:** Use `<h1>`, `<h3>`, or `<h4>` instead of `<div>` or `<span>`
- [ ] **Readable font size:** Title font sizes (1rem–1.75rem) are readable at arm's length on all devices
- [ ] **Line height:** Adequate line height (1.3–1.4) for readability
- [ ] **Focus indicators:** Clickable teaching cards have visible focus states for keyboard navigation

### Testing with Tools

- **Color contrast:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Accessibility audit:** Use browser DevTools Lighthouse audit (tab: Accessibility)
- **Screen reader:** Test with NVDA (Windows) or VoiceOver (Mac)

---

## 8. Performance Considerations

### Search Performance

For 654 teachings, the search function should execute in **< 50ms**:

```javascript
// Efficient search with early exit
const getScore = (teaching) => {
  const query_lower = query.toLowerCase();
  
  // Check title first (most relevant)
  if (teaching.title?.toLowerCase().includes(query_lower)) {
    return 3; // Early exit if title matches
  }
  
  // Check text
  if (teaching.text?.toLowerCase().includes(query_lower)) {
    return 2;
  }
  
  // Check references
  if (teaching.references?.some(ref => ref.label.includes(query))) {
    return 1;
  }
  
  return 0;
};
```

### Rendering Performance

- Use `React.memo()` for `TeachingCard` component to avoid unnecessary re-renders
- Virtualize long lists (if search returns 100+ results) using `react-window` or similar
- Debounce search input to avoid recalculating results on every keystroke:

```javascript
const [searchQuery, setSearchQuery] = useState('');

// Debounce search query changes
const debouncedQuery = useDebounce(searchQuery, 300);

useEffect(() => {
  const results = searchTeachings(allTeachings, debouncedQuery);
  setFilteredTeachings(results);
}, [debouncedQuery, allTeachings]);
```

---

## 9. Browser Compatibility

Test on:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Chrome (Android 10+)
- ✅ Mobile Safari (iOS 14+)

No special polyfills needed for title display or search logic.

---

## 10. Success Criteria (Summary)

**UI Implementation complete when:**

- [ ] Teaching titles visible in search results cards
- [ ] Teaching titles visible in category browser list
- [ ] Teaching titles visible in detail page header
- [ ] Search matches against title field
- [ ] Title matches ranked high in search results
- [ ] All styling is consistent across three contexts
- [ ] Responsive design works on mobile and desktop
- [ ] No accessibility issues (WCAG AA)
- [ ] All manual and automated tests pass
- [ ] No console errors or performance issues
- [ ] Feature ready for production build

---

## Next Steps

1. Review this guide and PLAN.md with the user
2. Confirm component file paths in current codebase
3. Begin Phase 1 (data curation) in parallel
4. Implement Phase 2 (data integration) when data is ready
5. When data is live, implement Phase 4 (UI) following this guide
6. Test thoroughly before committing
