# Catalog Optimizer — Implementation Plan

## 0. Implementer Protocol

Follow these rules throughout the entire implementation. They apply after every phase.

### 0.1 — Flag phases complete in this file

After finishing all steps in a phase, edit this file and append ` ✓` to that phase's heading. Example:

```
### Phase A — Route wiring and gear icon ✓
```

Do not mark a phase complete until all steps in it are done and the build is verified error-free.

### 0.2 — Maintain a running change summary

Before starting work, create `docs/dev_plan/catalog_optimizer_progress.md` with this initial content:

```markdown
# Catalog Optimizer — Implementation Progress

_Updated after each completed phase._

## Phases

| Phase | Status | Summary |
|---|---|---|
| A — Route wiring + gear icon | Pending | |
| B — Shell component | Pending | |
| C — Category/subcategory editing | Pending | |
| D — Teaching editing | Pending | |
| E — Renumber + download | Pending | |
| F — CSS/styling | Pending | |

## Change Log
```

After completing each phase, update the table row to `Complete` and append a bullet to the Change Log describing what was built. Keep entries concise (1–3 bullets per phase).

### 0.3 — Commit after each phase

After marking a phase complete and updating the progress file, create a git commit:

```
git add -A
git commit -m "catalog-optimizer: phase <X> complete — <one-line description>"
```

Do not bundle multiple phases into one commit. Each phase gets its own commit.

---

## 1. Overview

The Catalog Optimizer is a developer/editor tool embedded in the JesusSays React app at the route `/#/catalog-optimizer`. It provides a full editing interface for `teachings.json` — the primary data artifact of the application. An editor can load the JSON (from the server or a local file), reorganize and edit categories, subcategories, and teachings in a working copy isolated from the live app store, then download the modified file as a drop-in replacement.

The optimizer does not modify the running app's Zustand store. All mutations live in a local `useState` working copy inside the `CatalogOptimizer` component. IDs, slugs, and anchors are re-generated only at download time via a full renumber pass.

---

## 2. File Inventory

### New files to create

| File | Description |
|---|---|
| `src/components/CatalogOptimizer/CatalogOptimizer.jsx` | Top-level optimizer page component — owns working copy state, load/reset/download controls |
| `src/components/CatalogOptimizer/CatalogOptimizer.css` | All CSS for the optimizer UI |
| `src/components/CatalogOptimizer/CategoryEditor.jsx` | Renders one editable category row with inline title/description, reorder arrows, create/delete controls |
| `src/components/CatalogOptimizer/SubcategoryEditor.jsx` | Renders one editable subcategory row within a category |
| `src/components/CatalogOptimizer/TeachingEditor.jsx` | Renders one full teaching editor card (text, tags, references, move/duplicate/delete) |
| `src/components/CatalogOptimizer/ReferenceEditor.jsx` | Sub-component for editing a single reference entry |
| `src/components/CatalogOptimizer/TagEditor.jsx` | Chip-based add/remove tag editor |
| `src/components/CatalogOptimizer/LoadPanel.jsx` | Load-from-server / file-upload UI shown before data is loaded |
| `src/components/CatalogOptimizer/OptimizerToolbar.jsx` | Sticky top toolbar with Reset and Download buttons, load-source label |
| `src/utils/renumber.js` | Pure function `renumberCatalog(workingCopy)` — full renumber pass before download |

### Files to modify

| File | Change |
|---|---|
| `src/App.jsx` | Add `import CatalogOptimizer` and a `<Route path="/catalog-optimizer" element={<CatalogOptimizer />} />` outside of the data-loading guard (the optimizer manages its own data load) |
| `src/components/AppHeader/AppHeader.jsx` | Add a gear icon button (`Settings` from lucide-react) that navigates to `/#/catalog-optimizer`; add `btn-optimizer` CSS class |
| `src/styles/base.css` | Add `.btn-optimizer` rule matching the header's existing icon button style |

---

## 3. Implementation Steps

### Phase A — Route wiring and gear icon ✓

**A1.** In `src/App.jsx`, restructure `AppRoutes` so the optimizer route renders outside the `!dataLoaded` guard. The pattern: wrap only the existing category/book routes in the loading-guard block, and register `/catalog-optimizer` at the top level of `<Routes>` pointing to `<CatalogOptimizer />`. The `CatalogOptimizer` component must not consume the global store's `categories` — it manages its own state.

Concretely, change the `Routes` block to:

```jsx
<Routes>
  <Route path="/catalog-optimizer" element={<CatalogOptimizer />} />
  <Route path="/category/:slug" element={
    !dataLoaded ? <div className="data-loading">Loading teachings…</div> : <CategoryViewer />
  } />
  <Route path="/book/:bookAbbr" element={
    !dataLoaded ? <div className="data-loading">Loading teachings…</div> : <BookViewer />
  } />
  <Route path="/" element={<Navigate to="/category/cat-1" replace />} />
</Routes>
```

Remove the outer `{!dataLoaded ? ... : <Routes>}` wrapper so the optimizer route is always accessible.

**A2.** Add `import CatalogOptimizer from './components/CatalogOptimizer/CatalogOptimizer.jsx'` to `App.jsx`.

**A3.** In `AppHeader.jsx`:
- Add `import { Settings } from 'lucide-react'` alongside the existing `Menu` import.
- Add `import { useNavigate } from 'react-router-dom'`.
- Inside the component, call `const navigate = useNavigate()`.
- Inside `.app-header__actions` (after `<ModeSwitcher />`), add:
  ```jsx
  <button
    className="btn-optimizer"
    onClick={() => navigate('/catalog-optimizer')}
    aria-label="Open Catalog Optimizer"
    title="Catalog Optimizer"
  >
    <Settings size={16} />
  </button>
  ```

**A4.** In `src/styles/base.css`, append a `.btn-optimizer` rule:
```css
.btn-optimizer {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: var(--color-authority-fg);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
  min-height: 32px;
  min-width: 32px;
}
.btn-optimizer:hover {
  background-color: rgba(255, 255, 255, 0.15);
}
```

---

### Phase B — CatalogOptimizer shell component ✓

**B1.** Create `src/components/CatalogOptimizer/CatalogOptimizer.jsx`.

The component owns:
- `workingCopy` state: `null | { meta, categories[] }` — the mutable working copy (deep clone)
- `originalSnapshot` state: `null | { meta, categories[] }` — the last-loaded state for reset
- `loadSource` state: `'server' | 'file' | null`
- `loadError` state: `string | null`
- `isLoading` state: `boolean`

When `workingCopy` is `null`, render `<LoadPanel>`. Otherwise render the full editor.

**B2.** Create `src/components/CatalogOptimizer/LoadPanel.jsx`.

Renders two options:
1. A "Load from server" button — calls `fetch('/JesusSays/teachings.json')` directly (do NOT use the singleton `loadTeachings()` from `loader.js` — the optimizer needs a fresh, independent copy).
2. A drag-and-drop zone and/or `<input type="file" accept=".json">` for local file upload.

On success (either path): deep-clone the parsed JSON, set both `workingCopy` and `originalSnapshot` to the clone. Set `loadSource`.

On error: set `loadError` and display it inline.

**B3.** Create `src/components/CatalogOptimizer/OptimizerToolbar.jsx`.

Props: `{ loadSource, onReset, onDownload }`

Renders:
- A label showing what's loaded (e.g., "Loaded from server" or "Loaded from file: filename.json")
- A "Reset to original" button — calls `onReset`
- A "Download teachings.json" button — calls `onDownload`
- Sticky positioning at top of optimizer area (below the AppHeader)

**B4.** In `CatalogOptimizer.jsx`, wire `onReset`:
```js
function handleReset() {
  setWorkingCopy(JSON.parse(JSON.stringify(originalSnapshot)))
}
```

**B5.** Wire `onDownload`: call `renumberCatalog(workingCopy)`, strip hidden items, serialize to JSON, and trigger browser download via a temporary `<a>` element with `download="teachings.json"` and a Blob URL.

```js
function handleDownload() {
  const output = renumberCatalog(stripHidden(workingCopy))
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'teachings.json'
  a.click()
  URL.revokeObjectURL(url)
}
```

`stripHidden` is a helper that removes any category, subcategory, or teaching with `_hidden: true` before passing to the renumber pass.

---

### Phase C — Category and subcategory tree editing ✓

**C1.** The main body of `CatalogOptimizer.jsx` maps over `workingCopy.categories` (including hidden ones, visually marked) and renders a `<CategoryEditor>` for each.

**C2.** Create `src/components/CatalogOptimizer/CategoryEditor.jsx`.

Props:
```
{
  category,          // the category object from workingCopy
  position,          // 1-based visual position among non-hidden categories
  totalVisible,      // count of non-hidden categories
  onUpdate,          // (updatedCategory) => void
  onMoveUp,          // () => void
  onMoveDown,        // () => void
  onDelete,          // () => void — sets _hidden: true
  onRestore,         // () => void — clears _hidden
  onAddSubcategory,  // () => void
  allCategories,     // needed for subcategory move-to picker
}
```

Renders:
- Visual hidden indicator: if `category._hidden`, apply CSS class `opt-item--hidden` (strikethrough title, muted opacity). Show a "Restore" button instead of "Delete".
- Up/Down arrow buttons (from lucide-react: `ChevronUp`, `ChevronDown`). Disable Up when position === 1, Disable Down when position === totalVisible.
- Inline editable `title` field: plain `<input>` that calls `onUpdate` on change.
- Inline editable `description` field: `<textarea>`. Null-safe — if `description` is `null`, show empty, write `null` back when cleared.
- An "Add subcategory" button.
- A "Delete" button (or "Restore" if hidden).
- Visual position counter: "Category X of Y" (using visible positions only).
- Maps over `category.subcategories` and renders `<SubcategoryEditor>` for each.

**C3.** Implement category mutation handlers in `CatalogOptimizer.jsx` via immutable update pattern:

```js
function updateCategory(catIndex, updatedCat) {
  setWorkingCopy(prev => {
    const cats = [...prev.categories]
    cats[catIndex] = updatedCat
    return { ...prev, categories: cats }
  })
}

function moveCategoryUp(catIndex) {
  setWorkingCopy(prev => {
    const cats = [...prev.categories]
    let swapIdx = catIndex - 1
    while (swapIdx >= 0 && cats[swapIdx]._hidden) swapIdx--
    if (swapIdx < 0) return prev
    ;[cats[swapIdx], cats[catIndex]] = [cats[catIndex], cats[swapIdx]]
    return { ...prev, categories: cats }
  })
}

function moveCategoryDown(catIndex) {
  setWorkingCopy(prev => {
    const cats = [...prev.categories]
    let swapIdx = catIndex + 1
    while (swapIdx < cats.length && cats[swapIdx]._hidden) swapIdx++
    if (swapIdx >= cats.length) return prev
    ;[cats[catIndex], cats[swapIdx]] = [cats[swapIdx], cats[catIndex]]
    return { ...prev, categories: cats }
  })
}

function deleteCategory(catIndex) {
  setWorkingCopy(prev => {
    const cats = [...prev.categories]
    cats[catIndex] = { ...cats[catIndex], _hidden: true }
    return { ...prev, categories: cats }
  })
}

function restoreCategory(catIndex) {
  setWorkingCopy(prev => {
    const cats = [...prev.categories]
    const { _hidden, ...rest } = cats[catIndex]
    cats[catIndex] = rest
    return { ...prev, categories: cats }
  })
}

function addCategory() {
  const newCat = {
    id: '__new__',
    slug: '__new__',
    title: 'New Category',
    sources: [],
    description: null,
    subcategories: [],
    _isNew: true
  }
  setWorkingCopy(prev => ({ ...prev, categories: [...prev.categories, newCat] }))
}

function addSubcategoryToCategory(catIndex) {
  const newSubcat = {
    id: '__new__',
    slug: '__new__',
    title: 'New Subcategory',
    teachings: [],
    _isNew: true
  }
  setWorkingCopy(prev => {
    const cats = [...prev.categories]
    cats[catIndex] = {
      ...cats[catIndex],
      subcategories: [...cats[catIndex].subcategories, newSubcat]
    }
    return { ...prev, categories: cats }
  })
}
```

**C4.** Create `src/components/CatalogOptimizer/SubcategoryEditor.jsx`.

Props:
```
{
  subcat,
  catIndex,
  subcatIndex,
  position,
  totalVisible,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRestore,
  onAddTeaching,
  onMoveSubcatToCategory,   // (targetCatIndex) => void
  allCategories,
}
```

Renders:
- Inline editable `title`.
- Up/Down reorder arrows (skip hidden siblings — same pattern as categories).
- Delete/Restore.
- "Add teaching" button.
- "Move to category" picker: a `<select>` populated with non-hidden category titles, excluding the current parent. On change, calls `onMoveSubcatToCategory(targetCatIndex)`.

Move-subcategory mutation handler in `CatalogOptimizer.jsx`:

```js
function moveSubcategoryToCategory(fromCatIdx, fromSubcatIdx, toCatIdx) {
  if (fromCatIdx === toCatIdx) return
  setWorkingCopy(prev => {
    const cats = prev.categories.map(c => ({...c, subcategories: [...c.subcategories]}))
    const [subcat] = cats[fromCatIdx].subcategories.splice(fromSubcatIdx, 1)
    cats[toCatIdx].subcategories.push(subcat)
    return { ...prev, categories: cats }
  })
}
```

- Maps over `subcat.teachings` and renders `<TeachingEditor>` for each.

---

### Phase D — Teaching editing ✓

**D1.** Create `src/components/CatalogOptimizer/TeachingEditor.jsx`.

Props:
```
{
  teaching,
  catIndex,
  subcatIndex,
  teachingIndex,
  position,
  totalVisible,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRestore,
  onMoveToSubcat,      // (toCatIdx, toSubcatIdx) => void
  onDuplicateToSubcat, // (toCatIdx, toSubcatIdx) => void
  allCategories,
}
```

Renders:
- Visual hidden state.
- Position counter: "Teaching X of Y".
- Up/Down reorder arrows (skip hidden siblings).
- Editable `text` field: `<textarea>`.
- Read-only `quote` display (blockquote, not editable). If `quote` is null or empty, show muted placeholder "(no quote)".
- `<TagEditor>` for `tags[]`.
- A list of `<ReferenceEditor>` instances for each reference, plus an "Add reference" button.
- "Move to subcategory" picker — two chained `<select>` elements: first pick category, then pick subcategory. Calls `onMoveToSubcat(toCatIdx, toSubcatIdx)`. Current subcat excluded from destination.
- "Duplicate to subcategory" picker — same UI as move but calls `onDuplicateToSubcat`. Duplicating to same subcat is allowed.
- "Delete" / "Restore" button.

**D2.** Implement teaching mutation handlers in `CatalogOptimizer.jsx`:

```js
function updateTeaching(catIdx, subcatIdx, teachingIdx, updatedTeaching) {
  setWorkingCopy(prev => {
    const cats = prev.categories.map((c, ci) => {
      if (ci !== catIdx) return c
      return {
        ...c,
        subcategories: c.subcategories.map((s, si) => {
          if (si !== subcatIdx) return s
          const teachings = [...s.teachings]
          teachings[teachingIdx] = updatedTeaching
          return { ...s, teachings }
        })
      }
    })
    return { ...prev, categories: cats }
  })
}

function moveTeaching(fromCatIdx, fromSubcatIdx, fromTeachingIdx, toCatIdx, toSubcatIdx) {
  setWorkingCopy(prev => {
    const cats = prev.categories.map(c => ({
      ...c,
      subcategories: c.subcategories.map(s => ({ ...s, teachings: [...s.teachings] }))
    }))
    const [teaching] = cats[fromCatIdx].subcategories[fromSubcatIdx].teachings.splice(fromTeachingIdx, 1)
    cats[toCatIdx].subcategories[toSubcatIdx].teachings.push(teaching)
    return { ...prev, categories: cats }
  })
}

function duplicateTeaching(catIdx, subcatIdx, teachingIdx, toCatIdx, toSubcatIdx) {
  setWorkingCopy(prev => {
    const source = prev.categories[catIdx].subcategories[subcatIdx].teachings[teachingIdx]
    const copy = { ...JSON.parse(JSON.stringify(source)), id: '__new__', _isNew: true }
    const cats = prev.categories.map(c => ({
      ...c,
      subcategories: c.subcategories.map(s => ({ ...s, teachings: [...s.teachings] }))
    }))
    cats[toCatIdx].subcategories[toSubcatIdx].teachings.push(copy)
    return { ...prev, categories: cats }
  })
}

function addTeachingToSubcat(catIdx, subcatIdx) {
  const newTeaching = {
    id: '__new__',
    text: '',
    quote: '',
    tags: [],
    references: [],
    _isNew: true
  }
  setWorkingCopy(prev => {
    const cats = prev.categories.map((c, ci) => {
      if (ci !== catIdx) return c
      return {
        ...c,
        subcategories: c.subcategories.map((s, si) => {
          if (si !== subcatIdx) return s
          return { ...s, teachings: [...s.teachings, newTeaching] }
        })
      }
    })
    return { ...prev, categories: cats }
  })
}
```

**D3.** Create `src/components/CatalogOptimizer/TagEditor.jsx`.

Props: `{ tags, onChange }` where `onChange(newTagsArray)`.

Renders existing tags as chips with an "x" remove button each. Includes a text input — pressing Enter or comma adds the trimmed value as a new tag (deduplicated, lowercased). No autocomplete required.

**D4.** Create `src/components/CatalogOptimizer/ReferenceEditor.jsx`.

Props: `{ reference, onUpdate, onDelete, onMoveUp, onMoveDown }`.

Renders editable fields:
- `label` — text input (auto-generated on blur if empty: `${bookAbbr} ${chapter}:${start}–${end}`)
- `book` — text input (full book name; auto-populate from `bookAbbr` on blur if blank, using `ABBR_TO_FULL` from `bookOrder.js`)
- `bookAbbr` — a `<select>` populated from `NT_BOOK_ABBR_ORDER` (imported from `bookOrder.js`)
- `chapter` — number input (min 1)
- `ranges` — a list of verse-pair rows; each row has start/end number inputs; add/remove range buttons
- `isPrimary` — checkbox
- Up/Down arrows for reference reorder
- Delete button

For `isPrimary` enforcement: in `TeachingEditor.jsx`, when constructing the `onUpdate` for each reference:

```js
function handleRefUpdate(refIdx, updatedRef) {
  let refs = [...teaching.references]
  if (updatedRef.isPrimary) {
    refs = refs.map((r, i) => i === refIdx ? updatedRef : { ...r, isPrimary: false })
  } else {
    refs[refIdx] = updatedRef
  }
  onUpdate({ ...teaching, references: refs })
}
```

---

### Phase E — Renumber pass and download ✓

**E1.** Create `src/utils/renumber.js`.

Exports two functions:
- `stripHidden(catalog)` — removes all `_hidden` items
- `renumberCatalog(catalog)` — runs the full renumber pass (see Section 4)

**E2.** `stripHidden` implementation:

```js
export function stripHidden(catalog) {
  const categories = catalog.categories
    .filter(c => !c._hidden)
    .map(c => ({
      ...c,
      subcategories: c.subcategories
        .filter(s => !s._hidden)
        .map(s => ({
          ...s,
          teachings: s.teachings.filter(t => !t._hidden)
        }))
    }))
  return { ...catalog, categories }
}
```

**E3.** The download sequence in `CatalogOptimizer.jsx`:
1. Call `stripHidden(workingCopy)` to produce a clean copy.
2. Call `renumberCatalog(cleaned)` to produce a fully renumbered output.
3. The renumber pass removes `_hidden` and `_isNew` fields and updates `meta.totalCategories`.
4. Serialize with `JSON.stringify(output, null, 2)`.
5. Trigger browser download.

---

### Phase F — CSS/styling ✓

**F1.** Create `src/components/CatalogOptimizer/CatalogOptimizer.css` and import it at the top of `CatalogOptimizer.jsx`.

Key CSS rules to define:

```css
/* Page layout */
.catalog-optimizer {
  min-height: 100dvh;
  background-color: var(--color-bg);
}

/* Toolbar */
.opt-toolbar {
  position: sticky;
  top: var(--header-height);
  z-index: 80;
  background-color: var(--color-authority);
  color: var(--color-authority-fg);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-accent);
}

.opt-toolbar__label {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.7);
  flex: 1;
}

.opt-toolbar__btn {
  background: rgba(255,255,255,0.12);
  border: none;
  color: var(--color-authority-fg);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.opt-toolbar__btn:hover { background: rgba(255,255,255,0.22); }
.opt-toolbar__btn--primary { background-color: var(--color-accent); }
.opt-toolbar__btn--primary:hover { background-color: var(--color-accent-mid); }

/* Body / content area */
.opt-body {
  padding: var(--space-6) var(--space-8);
  max-width: 960px;
  margin: 0 auto;
}

/* Category card */
.opt-category {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.opt-category__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface-raised);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.opt-category__body { padding: var(--space-4); }

.opt-position-badge {
  font-size: var(--text-xs);
  color: var(--color-muted);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 1px var(--space-2);
  white-space: nowrap;
}

/* Subcategory */
.opt-subcat {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  background-color: var(--color-bg);
}

.opt-subcat__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface-raised);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

/* Teaching card */
.opt-teaching {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface);
}

/* Hidden item */
.opt-item--hidden { opacity: 0.45; }
.opt-item--hidden .opt-title-input {
  text-decoration: line-through;
  color: var(--color-muted);
}

/* Inline inputs */
.opt-title-input {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-authority);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  width: 100%;
  padding: 2px var(--space-2);
  transition: border-color 0.15s;
}
.opt-title-input:hover,
.opt-title-input:focus {
  border-color: var(--color-accent);
  outline: none;
  background: var(--color-surface);
}

.opt-description-input {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  width: 100%;
  padding: var(--space-2);
  min-height: 60px;
  resize: vertical;
  margin-top: var(--space-2);
}

.opt-text-input {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  width: 100%;
  padding: var(--space-2);
  min-height: 56px;
  resize: vertical;
}

/* Quote block */
.opt-quote {
  font-style: italic;
  color: var(--color-muted);
  font-size: var(--text-sm);
  border-left: 3px solid var(--color-accent-mid);
  padding: var(--space-2) var(--space-3);
  margin: var(--space-2) 0;
  background: var(--color-surface-raised);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

/* Tags */
.opt-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  align-items: center;
  margin-top: var(--space-2);
}
.opt-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-pill);
  padding: 1px var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-accent);
  font-weight: 600;
}
.opt-tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-accent);
  padding: 0;
  line-height: 1;
  font-size: 12px;
}
.opt-tag-add-input {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  padding: 1px var(--space-2);
  outline: none;
  width: 100px;
  font-family: var(--font-body);
}

/* Reference editor */
.opt-ref {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-2);
  background: var(--color-surface-raised);
}
.opt-ref-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin-bottom: var(--space-1);
}
.opt-ref-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.opt-field {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  background: var(--color-surface);
  color: var(--color-ink);
}

/* Reorder and action buttons */
.opt-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-1);
  cursor: pointer;
  color: var(--color-muted);
  display: inline-flex;
  align-items: center;
  font-size: var(--text-xs);
  transition: color 0.1s, border-color 0.1s;
}
.opt-btn:hover { color: var(--color-ink); border-color: var(--color-accent); }
.opt-btn:disabled { opacity: 0.3; cursor: default; }
.opt-btn--danger:hover { color: #c0392b; border-color: #c0392b; }
.opt-btn--accent { color: var(--color-accent); border-color: var(--color-accent); }

/* Move/duplicate pickers */
.opt-picker {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  flex-wrap: wrap;
  margin-top: var(--space-2);
}
.opt-select {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-2);
  background: var(--color-surface);
  color: var(--color-ink);
}

/* Load panel */
.opt-load-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  min-height: 60vh;
  text-align: center;
}
.opt-load-panel h2 {
  font-family: var(--font-display);
  color: var(--color-authority);
  font-size: var(--text-2xl);
}
.opt-load-options {
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
  justify-content: center;
}
.opt-load-card {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  min-width: 200px;
  cursor: pointer;
  transition: border-color 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}
.opt-load-card:hover { border-color: var(--color-accent); }
.opt-load-card--drag-over {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}
.opt-error { color: #c0392b; font-size: var(--text-sm); }

/* Responsive */
@media (max-width: 767px) {
  .opt-body { padding: var(--space-4); }
  .opt-category__header { flex-wrap: wrap; }
}
```

**F2.** Import `CatalogOptimizer.css` at the top of `CatalogOptimizer.jsx`:
```js
import './CatalogOptimizer.css'
```

---

### Phase G — Collapsible editor levels ✓

**G1. Overview.**

All three editor levels (CategoryEditor, SubcategoryEditor, TeachingEditor) become individually collapsible. Categories and subcategories are collapsed by default; teachings are also collapsed by default. Each item manages its own `isOpen` state locally via `useState` — collapse state is not lifted to the parent. Two toolbar buttons ("Expand all" / "Collapse all") provide bulk control via a generation-counter mechanism.

**G2. Generation counter mechanism in `CatalogOptimizer.jsx`.**

Add two new state variables:

```js
const [collapseGeneration, setCollapseGeneration] = useState(0)
const [expandGeneration, setExpandGeneration]     = useState(0)
```

Add two handlers:

```js
function handleCollapseAll() { setCollapseGeneration(g => g + 1) }
function handleExpandAll()   { setExpandGeneration(g => g + 1) }
```

Pass both counters and both handlers to `<OptimizerToolbar>`:

```jsx
<OptimizerToolbar
  loadSource={loadSource}
  onReset={handleReset}
  onDownload={handleDownload}
  collapseGeneration={collapseGeneration}
  expandGeneration={expandGeneration}
  onCollapseAll={handleCollapseAll}
  onExpandAll={handleExpandAll}
/>
```

Pass `collapseGeneration` and `expandGeneration` as props to every `<CategoryEditor>` in the map. CategoryEditor threads them down to SubcategoryEditor, which threads them down to TeachingEditor.

**G3. Update `OptimizerToolbar.jsx`.**

Add props: `collapseGeneration`, `expandGeneration`, `onCollapseAll`, `onExpandAll`.

Inside the toolbar JSX, render two small buttons alongside the existing Reset and Download buttons:

```jsx
<button className="opt-toolbar__btn" onClick={onCollapseAll}>Collapse all</button>
<button className="opt-toolbar__btn" onClick={onExpandAll}>Expand all</button>
```

The `collapseGeneration` and `expandGeneration` props are accepted here for API completeness but are not used directly in the toolbar — they are passed by `CatalogOptimizer` to the editor tree separately.

**G4. Update `CategoryEditor.jsx`.**

Add props: `collapseGeneration`, `expandGeneration`.

Add local state:

```js
const [isOpen, setIsOpen] = useState(false)
```

Add a `useEffect` that resets `isOpen` when either generation counter changes:

```js
useEffect(() => { setIsOpen(false) }, [collapseGeneration])
useEffect(() => { setIsOpen(true)  }, [expandGeneration])
```

In the category header row, add a chevron toggle button as the **first element**, before the position badge:

```jsx
<button
  className="opt-toggle-btn"
  onClick={() => setIsOpen(o => !o)}
  aria-label={isOpen ? 'Collapse category' : 'Expand category'}
>
  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
</button>
```

Import `ChevronRight` and `ChevronDown` from `lucide-react` (alongside the existing `ChevronUp` / `ChevronDown` already used for reorder — note: if `ChevronDown` is already imported for reorder, reuse it; add `ChevronRight` as a new import).

Conditionally render the category body (description textarea and subcategory list) only when `isOpen`:

```jsx
{isOpen && (
  <div className="opt-category__body">
    {/* description textarea */}
    {/* subcategory list */}
  </div>
)}
```

Pass `collapseGeneration` and `expandGeneration` through to each `<SubcategoryEditor>`.

**G5. Update `SubcategoryEditor.jsx`.**

Add props: `collapseGeneration`, `expandGeneration`.

Add local state and effects (same pattern as CategoryEditor, default `false`):

```js
const [isOpen, setIsOpen] = useState(false)
useEffect(() => { setIsOpen(false) }, [collapseGeneration])
useEffect(() => { setIsOpen(true)  }, [expandGeneration])
```

Add the chevron toggle button as the first element in the subcat header row. Conditionally render the teaching list (and "Add teaching" button) only when `isOpen`:

```jsx
{isOpen && (
  <div className="opt-subcat__body">
    {/* "Add teaching" button */}
    {/* teaching list */}
  </div>
)}
```

Pass `collapseGeneration` and `expandGeneration` through to each `<TeachingEditor>`.

**G6. Update `TeachingEditor.jsx`.**

Add props: `collapseGeneration`, `expandGeneration`.

Add local state and effects (default `false`):

```js
const [isOpen, setIsOpen] = useState(false)
useEffect(() => { setIsOpen(false) }, [collapseGeneration])
useEffect(() => { setIsOpen(true)  }, [expandGeneration])
```

Add the chevron toggle button as the first element in the teaching header row.

When `isOpen` is `false`, render a collapsed summary line instead of the full editor body:

```jsx
{!isOpen && (
  <span className="opt-collapsed-summary">
    {(teaching.text || '').slice(0, 120) + ((teaching.text || '').length > 120 ? '…' : '')}
  </span>
)}
```

When `isOpen` is `true`, render the full editor body (text textarea, quote blockquote, TagEditor, ReferenceEditor list, move/duplicate pickers) as before. The teaching header row (position badge, reorder arrows, delete/restore) remains visible in both states.

**G7. Add CSS rules to `CatalogOptimizer.css`.**

Append the following rules:

```css
/* Collapse toggle button */
.opt-toggle-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--color-muted);
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-sm);
  transition: color 0.1s;
  flex-shrink: 0;
}
.opt-toggle-btn:hover { color: var(--color-ink); }

/* Collapsed teaching summary line */
.opt-collapsed-summary {
  font-size: var(--text-sm);
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 600px;
  flex: 1;
}
```

---

### Phase H — Optimizer shell cleanup ✓

Two independent UI fixes applied in this phase. Each can be implemented and verified separately.

#### H1 — Hide sidebar while on the optimizer route

**H1.1.** In `src/components/Layout/Layout.jsx`, import `useLocation` from `react-router-dom`:

```js
import { useLocation } from 'react-router-dom'
```

Inside the component body, derive a flag:

```js
const location = useLocation()
const isOptimizer = location.pathname === '/catalog-optimizer'
```

Conditionally suppress the sidebar panel. The exact conditional depends on the current Layout structure, but the pattern is:

```jsx
{!isOptimizer && (
  /* sidebar panel JSX */
)}
```

When `isOptimizer` is true, the main content area must expand to full width. If the Layout applies a CSS class or inline style that offsets or constrains the main area based on the sidebar being present (e.g., a `margin-left` equal to `--sidebar-width`, or a class like `layout--sidebar-open`), suppress that offset when `isOptimizer` is true. For example:

```jsx
<main
  className={`layout__main${isOptimizer ? ' layout__main--full' : ''}`}
>
```

Add a corresponding CSS rule in `src/styles/base.css` if needed:

```css
.layout__main--full {
  margin-left: 0 !important;
  width: 100% !important;
}
```

Alternatively, if the sidebar offset is controlled by a CSS variable or a wrapper class, apply the equivalent override.

**H1.2. FilterBar suppression.**

If a FilterBar component is rendered in `App.jsx` or `Layout.jsx`, apply the same `isOptimizer` check to suppress it on the optimizer route:

```jsx
{!isOptimizer && <FilterBar />}
```

If FilterBar is not yet implemented at the time this phase is executed, add a comment in Layout.jsx noting where to add the suppression check when FilterBar is built:

```jsx
{/* FilterBar: suppress on optimizer route — use !isOptimizer check here when FilterBar is implemented */}
```

#### H2 — Minimal optimizer toolbar styling

**H2.1.** In `src/components/CatalogOptimizer/CatalogOptimizer.css`, replace the `.opt-toolbar` block with:

```css
.opt-toolbar {
  position: sticky;
  top: var(--header-height);
  z-index: 80;
  background-color: var(--color-surface-raised);
  color: var(--color-ink);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
```

Key changes from the Phase F original:
- `background-color`: `var(--color-authority)` (dark navy) → `var(--color-surface-raised)` (light)
- `color`: `var(--color-authority-fg)` → `var(--color-ink)`
- `border-bottom`: `2px solid var(--color-accent)` (gold) → `1px solid var(--color-border)` (neutral)

**H2.2.** Replace the `.opt-toolbar__label` rule with:

```css
.opt-toolbar__label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  flex: 1;
}
```

Change: `color: rgba(255,255,255,0.7)` → `color: var(--color-muted)`.

**H2.3.** Replace the `.opt-toolbar__btn` and `.opt-toolbar__btn--primary` rules with:

```css
.opt-toolbar__btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.opt-toolbar__btn:hover {
  border-color: var(--color-accent);
}
.opt-toolbar__btn--primary {
  background-color: var(--color-accent);
  color: var(--color-authority);
  border-color: var(--color-accent);
}
.opt-toolbar__btn--primary:hover {
  background-color: var(--color-accent-mid);
  border-color: var(--color-accent-mid);
}
```

Key changes from Phase F original:
- Default button: was dark/translucent on navy (`rgba(255,255,255,0.12)`, no border); now neutral surface with border on light background.
- Primary button: retains gold background (`var(--color-accent)`) but sets `color: var(--color-authority)` (dark text on gold, which is already correct contrast) and explicit `border-color`.

---

### Phase I — Collapse defaults fix and Restart button ✓

**I1.** Fixed mount-time bug in `CategoryEditor`, `SubcategoryEditor`, and `TeachingEditor` where both `useEffect` hooks (collapseGeneration and expandGeneration) fired on mount, causing `isOpen` to be set `true` on initial render. Fix: guard each effect with a `useRef` that tracks the last-seen generation value; skip the effect if the value hasn't changed from the ref.

**I2.** Added "Restart" button to `OptimizerToolbar`. Clicking it resets all working copy state in `CatalogOptimizer` (`workingCopy`, `originalSnapshot`, `loadSource`, `fileName`, `loadError`, `isLoading`) to their initial null/false values, returning the user to the `<LoadPanel>` without a page refresh.

---

### Phase J — Outline panel and toolbar tweaks ✓

**J1.** Reduce top padding on `.opt-body` from `var(--space-6) var(--space-8)` to `var(--space-3) var(--space-8)`. This reduces the gap between the toolbar and the first category card.

**J2.** Replace the single-column `opt-body` layout with a two-panel split. In `CatalogOptimizer.jsx`, wrap the `<OptimizerToolbar>` + `<div className="opt-body">` structure as follows:

```jsx
<>
  <OptimizerToolbar ... />
  <div className="opt-split">
    <aside className="opt-outline-panel">
      <OutlinePanel workingCopy={workingCopy} />
    </aside>
    <div className="opt-editor-panel">
      <div className="opt-body">
        {/* existing Add category button + CategoryEditor map */}
      </div>
    </div>
  </div>
</>
```

Import `OutlinePanel` from `./OutlinePanel.jsx`.

**J3.** Create `src/components/CatalogOptimizer/OutlinePanel.jsx`. Props: `{ workingCopy }`. Purely derived from `workingCopy` — no local data state. Filters `_hidden` items at all three levels. Renders:

- `<div className="opt-outline">` wrapper
- `<div className="opt-outline__heading">Catalog Outline</div>`
- For each non-hidden category: `<div className="opt-outline__cat">` with title and teaching count `<span className="opt-outline__count">`
- For each non-hidden subcategory: `<div className="opt-outline__subcat">` with title
- For each non-hidden teaching: `<div className="opt-outline__teaching">` with `text` truncated to 80 chars; if empty, `<em className="opt-outline__empty">(new teaching)</em>`

**J4.** Append CSS rules to `CatalogOptimizer.css` for `.opt-split`, `.opt-outline-panel`, `.opt-editor-panel`, `.opt-outline`, `.opt-outline__heading`, `.opt-outline__cat`, `.opt-outline__count`, `.opt-outline__subcat`, `.opt-outline__teaching`, `.opt-outline__empty`, and a `@media (max-width: 900px)` rule hiding the outline panel on small screens.

**J5.** Update `.opt-body` in `CatalogOptimizer.css` to remove `max-width: 960px; margin: 0 auto;` (the editor panel now handles width containment). New rule:

```css
.opt-body {
  padding: var(--space-3) var(--space-6);
}
```

---

### Phase K — Toolbar overlap fix and outline enhancements ✓

**K1 — Diagnose and fix the sticky toolbar overlap.**

Root cause: `.main-content` has `overflow-y: auto`, making it the scroll container. `position: sticky` elements inside it are sticky relative to `.main-content`'s scroll viewport, not the browser viewport. The AppHeader is `position: sticky` on the outer layout (outside `.main-content`), so `.main-content` already starts below the AppHeader. Setting `.opt-toolbar` to `top: var(--header-height)` (56px) pushes it 56px below the top of `.main-content`, creating a visible gap. Fix: change to `top: 0`.

In `CatalogOptimizer.css`, change `.opt-toolbar`:
- `top: var(--header-height)` → `top: 0`

**K2 — Widen the outline panel.**

In `CatalogOptimizer.css`:
- Change `.opt-outline-panel` `width` from `260px` to `460px`.
- Change the responsive hide breakpoint from `@media (max-width: 900px)` to `@media (max-width: 1100px)`.

**K3 — Outline teaching text: single line with ellipsis.**

In `CatalogOptimizer.css`, update `.opt-outline__teaching` to add `white-space: nowrap`, `overflow: hidden`, and `text-overflow: ellipsis`. Remove the JS `text.slice(0, 80)` truncation in `OutlinePanel.jsx` — render the full `text` string and let CSS handle it.

**K4 — Thin separator lines between teachings.**

In `CatalogOptimizer.css`, add `border-bottom: 1px solid var(--color-border)` to `.opt-outline__teaching`, increase padding to `3px ... 3px`, and add `.opt-outline__teaching:last-child { border-bottom: none; }`.

**K5 — Outline mirrors editor expand/collapse state.**

Pass `collapseGeneration` and `expandGeneration` from `CatalogOptimizer.jsx` to `<OutlinePanel>`. Rewrite `OutlinePanel.jsx` with interactive expand/collapse:
- State: `openCats` (Set of cat indices) and `openSubcats` (Set of `"ci-si"` keys), both initially empty (collapsed).
- `useRef` guards on generation counter effects (same pattern as editor components).
- Category rows are clickable toggles (ChevronRight/ChevronDown from lucide-react).
- Subcat rows only shown when parent cat is open; also clickable toggles.
- Teaching rows only shown when parent subcat is open.
- CSS: update `.opt-outline__cat` and `.opt-outline__subcat` with `cursor: pointer`, `user-select: none`, hover background, `display: flex`, and `align-items: center`.

---

## 4. Renumber Algorithm

The renumber pass assigns fresh positional IDs to all items in their current visual order. It runs on the output of `stripHidden()` (no hidden items present at this point).

```
function renumberCatalog(catalog):
  result = deep clone of catalog
  result.meta.totalCategories = result.categories.length

  for catPos = 1 to result.categories.length:
    cat = result.categories[catPos - 1]
    cat.id = catPos                                          // integer
    cat.slug = "cat-" + catPos                              // e.g., "cat-3"
    delete cat._hidden
    delete cat._isNew

    for subcatPos = 1 to cat.subcategories.length:
      subcat = cat.subcategories[subcatPos - 1]
      subcat.id = catPos + "." + subcatPos                  // e.g., "3.2"
      subcat.slug = "cat-" + catPos + "-" + subcatPos       // e.g., "cat-3-2"
      delete subcat._hidden
      delete subcat._isNew

      for teachingPos = 1 to subcat.teachings.length:
        teaching = subcat.teachings[teachingPos - 1]
        teaching.id = catPos + "." + subcatPos + "." + teachingPos  // e.g., "3.2.7"
        delete teaching._hidden
        delete teaching._isNew
        // references are book/chapter/verse data — not positional, no renumbering needed

  return result
```

Note: `cat.sources` is preserved as-is. `meta.totalCategories` is updated to the final category count.

---

## 5. Data Model for Working Copy

The working copy is a plain JS object matching the `teachings.json` schema, with these internal-only additions:

### Internal-only fields (stripped before download)

| Field | Applied to | Meaning |
|---|---|---|
| `_hidden: true` | category, subcategory, teaching | Soft-deleted; excluded from download |
| `_isNew: true` | category, subcategory, teaching | Created this session; gets a real ID on renumber |

### ID semantics during editing

- **Original items**: retain their original `id`/`slug` values during editing. These become stale once reordering occurs — that is intentional. The renumber pass assigns correct values at download.
- **New items**: use `id: '__new__'`, `slug: '__new__'` as placeholder sentinels. Renumber pass replaces them.
- **Display positions**: computed on-the-fly by filtering out `_hidden` items and counting. Pass as `position` and `totalVisible` props — never derive from the ID during editing.

### Working copy isolation

Stored in `CatalogOptimizer`'s local `useState`. Does NOT interact with the Zustand store. The app's live data is unaffected by any optimizer action.

---

## 6. Component Tree

```
CatalogOptimizer
├── (if workingCopy === null)
│   └── LoadPanel
│       ├── "Load from server" button
│       └── file input + drag-drop zone
│
└── (if workingCopy !== null)
    ├── OptimizerToolbar
    │   ├── load-source label
    │   ├── Reset button
    │   └── Download button
    │
    └── div.opt-body
        ├── "Add category" button (top level)
        │
        └── workingCopy.categories.map → CategoryEditor (one per cat, including hidden)
            ├── category header row
            │   ├── opt-position-badge ("Category X of Y", visible only)
            │   ├── ChevronUp / ChevronDown buttons
            │   ├── opt-title-input (category title)
            │   ├── Delete / Restore button
            │   └── (if hidden) opt-item--hidden applied to wrapper
            │
            ├── opt-description-input (category description)
            │
            ├── "Add subcategory" button
            │
            └── category.subcategories.map → SubcategoryEditor
                ├── subcat header row
                │   ├── opt-position-badge ("Subcat X of Y")
                │   ├── ChevronUp / ChevronDown
                │   ├── opt-title-input (subcat title)
                │   ├── "Move to category" select
                │   └── Delete / Restore button
                │
                ├── "Add teaching" button
                │
                └── subcat.teachings.map → TeachingEditor
                    ├── teaching header row
                    │   ├── opt-position-badge ("Teaching X of Y")
                    │   ├── ChevronUp / ChevronDown
                    │   └── Delete / Restore button
                    │
                    ├── opt-text-input (teaching.text)
                    │
                    ├── blockquote.opt-quote (teaching.quote, read-only)
                    │
                    ├── TagEditor
                    │   ├── tag chips with remove buttons
                    │   └── add-tag input
                    │
                    ├── "References" section
                    │   ├── teaching.references.map → ReferenceEditor
                    │   │   ├── label input
                    │   │   ├── bookAbbr select (from NT_BOOK_ABBR_ORDER)
                    │   │   ├── book input (auto-filled from ABBR_TO_FULL)
                    │   │   ├── chapter number input
                    │   │   ├── ranges list (verse-pair rows with start/end inputs)
                    │   │   ├── isPrimary checkbox
                    │   │   ├── ChevronUp / ChevronDown
                    │   │   └── Delete button
                    │   └── "Add reference" button
                    │
                    ├── "Move to" picker
                    │   ├── category select
                    │   └── subcategory select (dependent on category choice)
                    │
                    └── "Duplicate to" picker
                        ├── category select
                        └── subcategory select
```

---

## 7. Edge Cases and Constraints

### Loading

- **Fetch failure**: Display `loadError` message in `LoadPanel`. Allow retry without page refresh.
- **Invalid JSON file**: Wrap `JSON.parse` in try/catch; show "Invalid JSON file — could not parse".
- **Schema mismatch on file upload**: Validate that parsed object has `categories` as an array and `meta` as an object. If not, show "File does not appear to be a valid teachings.json".
- **Drag over non-file**: Ignore `dragover`/`drop` events if `event.dataTransfer.files.length === 0`.

### Position counters

- Visible position counters exclude `_hidden` items.
- Up/Down arrows must also skip hidden siblings when finding swap targets. Find the nearest non-hidden sibling's array index and swap with it (not the adjacent array index):

```js
function moveCategoryUp(catIndex) {
  setWorkingCopy(prev => {
    const cats = [...prev.categories]
    let swapIdx = catIndex - 1
    while (swapIdx >= 0 && cats[swapIdx]._hidden) swapIdx--
    if (swapIdx < 0) return prev
    ;[cats[swapIdx], cats[catIndex]] = [cats[catIndex], cats[swapIdx]]
    return { ...prev, categories: cats }
  })
}
```

Apply the same skip-hidden pattern for subcategory and teaching reorder handlers.

### Last item deletion

- If the only non-hidden teaching in a subcategory is soft-deleted: the subcategory remains with all teachings hidden. This is valid. Do not auto-delete empty subcategories.
- Same applies upward — empty subcategories and categories are valid working-copy states.
- On download, a category with `subcategories: []` or a subcategory with `teachings: []` is schema-valid and will appear in the output.

### Move/duplicate picker — same location prevention

- "Move to subcategory": disable the "Move" button if target category + subcategory matches the teaching's current location.
- "Duplicate to subcategory": duplicating into the same subcategory is allowed (produces an independent copy appended to that subcategory's teachings array).

### Subcategory move — cross-category only

- The "Move to category" picker on `SubcategoryEditor` should exclude the current parent category, since in-category reordering is handled by Up/Down arrows.

### isPrimary enforcement

- At most one reference per teaching should be `isPrimary: true`.
- When adding a new reference, default `isPrimary: false`.
- When user checks a reference as primary, uncheck all others in that teaching (see `handleRefUpdate` in Phase D4).
- If the only reference is deleted, no references have `isPrimary: true` — this is acceptable.

### New teaching `quote` field

- New teachings start with `quote: ''` (empty string, not null). The optimizer renders "(no quote)" placeholder for empty/null quotes. On download, `quote: ''` is preserved as-is — this is schema-valid.

### `label` auto-generation in ReferenceEditor

- When `label` is blank on blur, auto-generate: `${bookAbbr} ${chapter}:${start}–${end}` (or `${chapter}:${start}` if start === end and only one range).
- Use `ABBR_TO_FULL` from `bookOrder.js` to auto-fill `book` when `bookAbbr` changes.

### `meta.totalCategories` on download

- The renumber pass sets `meta.totalCategories` to `result.categories.length` (after stripping hidden).

### AppHeader visibility on optimizer route

- The optimizer renders inside the normal app shell, so `AppHeader` (and potentially `FilterBar`) remain visible. The optimizer's sticky toolbar sits at `top: var(--header-height)`.
- If `FilterBar` is rendered below the AppHeader, the implementer may optionally hide it on the optimizer route by checking `useLocation().pathname` inside `FilterBar.jsx` — but this is optional and not required for MVP.

### Mobile responsiveness

- On small screens (`max-width: 767px`), flex rows wrap to column. Up/Down arrows and Delete/Restore remain as icon-only buttons. All text inputs go full-width.
- The optimizer is primarily a desktop tool but must not be visually broken on mobile.

### Drag-and-drop on LoadPanel

- Attach `onDragOver`, `onDragLeave`, `onDrop` to the drop zone div.
- `onDragOver`: call `e.preventDefault()`, set `dragOver` state to true for visual feedback.
- `onDragLeave`: set `dragOver` state to false.
- `onDrop`: call `e.preventDefault()`, read `e.dataTransfer.files[0]`, use `FileReader.readAsText()` to parse it.

---

## 8. Critical Files for Implementation

| File | Role |
|---|---|
| `src/App.jsx` | Add route and import |
| `src/components/AppHeader/AppHeader.jsx` | Add gear icon button |
| `src/styles/base.css` | Add `.btn-optimizer` rule |
| `src/utils/renumber.js` | New — renumber pass + stripHidden |
| `src/utils/bookOrder.js` | Read-only — import `NT_BOOK_ABBR_ORDER`, `ABBR_TO_FULL` for ReferenceEditor |
| `src/components/CatalogOptimizer/CatalogOptimizer.jsx` | New — root component + all mutation handlers |
| `src/components/CatalogOptimizer/CatalogOptimizer.css` | New — all optimizer styles |
| `src/components/CatalogOptimizer/LoadPanel.jsx` | New |
| `src/components/CatalogOptimizer/OptimizerToolbar.jsx` | New |
| `src/components/CatalogOptimizer/CategoryEditor.jsx` | New |
| `src/components/CatalogOptimizer/SubcategoryEditor.jsx` | New |
| `src/components/CatalogOptimizer/TeachingEditor.jsx` | New |
| `src/components/CatalogOptimizer/TagEditor.jsx` | New |
| `src/components/CatalogOptimizer/ReferenceEditor.jsx` | New |
