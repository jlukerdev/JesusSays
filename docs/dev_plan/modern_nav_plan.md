# Modern Navigation Mode — Implementation Plan

## Overview

This plan covers all changes required to add a "Modern" navigation mode to the JesusSays React app. Work is divided into 14 sequential stages, each with precise file paths, field names, component names, prop names, CSS class names, and state shapes.

The Modern nav is a full-viewport takeover when `navStyle === 'modern'`. It replaces the current AppHeader + FilterBar + Layout + sidebar shell entirely. It uses its own internal client-side nav stack (no React Router) and introduces three screens: Home, Category Browser, and Teaching Detail.

---

## Stage 1: Add `navStyle` to the Zustand Store

**Files to modify:**
- `src/store.js`

Add a `navStyle` field with getter and setter alongside `fontSize` and `theme`:

```js
navStyle: 'classic',   // 'classic' | 'modern'
setNavStyle: (navStyle) => set({ navStyle }),
```

No other changes to `store.js` at this stage. Persistence via localStorage is handled in Stage 2.

---

## Stage 2: Persist `navStyle` via `useLocalPreference`

**Files to modify:**
- `src/App.jsx`

Locate where `fontSize` and `theme` are currently synced with localStorage and mirror that exact pattern for `navStyle`. Recommended approach inside `AppRoutes`:

```js
const navStyle = useStore((s) => s.navStyle)
const setNavStyle = useStore((s) => s.setNavStyle)
const [persistedNavStyle, setPersistedNavStyle] = useLocalPreference('navStyle', 'classic')

// On mount: sync persisted value into store
useEffect(() => {
  setNavStyle(persistedNavStyle)
}, [])

// On store change: persist it
useEffect(() => {
  setPersistedNavStyle(navStyle)
}, [navStyle])
```

**Decision point:** If `fontSize`/`theme` already use a different sync pattern (e.g., direct `localStorage` calls inside setters, or a hook placed elsewhere), mirror that exact pattern for `navStyle`.

Since `useLocalPreference` initializes from `localStorage` synchronously, the first render will correctly show the persisted nav mode without flash. No special loading gate is needed.

---

## Stage 3: SettingsMenu Component (Gear Dropdown)

**Files to create:**
- `src/components/SettingsMenu/SettingsMenu.jsx`
- `src/components/SettingsMenu/SettingsMenu.css`

**Files to modify:**
- `src/components/AppHeader/AppHeader.jsx`

### 3.1 SettingsMenu Component

Replaces the current `btn-optimizer` button in `AppHeader.jsx`. Self-contained popover triggered by the gear icon.

**Props:** none (reads from store internally)

**Internal state:**
```js
const [open, setOpen] = useState(false)
```

**Store subscriptions:**
```js
const navStyle = useStore((s) => s.navStyle)
const setNavStyle = useStore((s) => s.setNavStyle)
const theme = useStore((s) => s.theme)
const setTheme = useStore((s) => s.setTheme)
```

**Rendered structure:**
```jsx
<div className="settings-menu">
  <button
    className="settings-menu__trigger"
    aria-label="Open settings"
    aria-expanded={open}
    onClick={() => setOpen((o) => !o)}
  >
    <Settings size={16} />
  </button>

  {open && (
    <>
      {/* Click-outside close overlay */}
      <div className="settings-menu__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="settings-menu__panel" role="menu">

        {/* Section: Nav Style */}
        <div className="settings-menu__section">
          <div className="settings-menu__section-label">Nav Style</div>
          <div className="settings-menu__option-row">
            <button
              className={`settings-menu__option${navStyle === 'classic' ? ' settings-menu__option--active' : ''}`}
              onClick={() => { setNavStyle('classic'); setOpen(false) }}
            >Classic</button>
            <button
              className={`settings-menu__option${navStyle === 'modern' ? ' settings-menu__option--active' : ''}`}
              onClick={() => { setNavStyle('modern'); setOpen(false) }}
            >Modern</button>
          </div>
        </div>

        {/* Section: App Theme */}
        <div className="settings-menu__section">
          <div className="settings-menu__section-label">App Theme</div>
          <div className="settings-menu__option-row">
            <button
              className={`settings-menu__option${theme === 'classic' ? ' settings-menu__option--active' : ''}`}
              onClick={() => { setTheme('classic'); setOpen(false) }}
            >Classic</button>
            {/* Future themes: add additional buttons here */}
          </div>
        </div>

        {/* Divider */}
        <div className="settings-menu__divider" />

        {/* Action: Catalog Optimizer */}
        <button
          className="settings-menu__action"
          onClick={() => { navigate('/catalog-optimizer'); setOpen(false) }}
        >
          Catalog Optimizer
        </button>

      </div>
    </>
  )}
</div>
```

**Close-on-escape:** Add a `useEffect` that listens to `keydown` and calls `setOpen(false)` when key is `'Escape'` and `open === true`. Remove listener on cleanup.

**CSS classes for `SettingsMenu.css`:**
```css
.settings-menu              /* position: relative; display: inline-flex */
.settings-menu__trigger     /* icon button; matches existing btn-optimizer styles */
.settings-menu__backdrop    /* position: fixed; inset: 0; z-index: 199 */
.settings-menu__panel       /* position: absolute; top: calc(100% + var(--space-2)); right: 0; z-index: 200;
                               background: var(--color-surface); border: 1px solid var(--color-border);
                               border-radius: var(--radius-md); box-shadow: var(--shadow-tooltip);
                               min-width: 200px; padding: var(--space-3) 0 */
.settings-menu__section     /* padding: var(--space-2) var(--space-4) */
.settings-menu__section-label /* font-size: var(--text-xs); color: var(--color-muted); text-transform: uppercase;
                                 letter-spacing: 0.07em; margin-bottom: var(--space-2) */
.settings-menu__option-row  /* display: flex; gap: var(--space-2) */
.settings-menu__option      /* flex: 1; padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);
                               font-size: var(--text-sm); border: 1px solid var(--color-border);
                               background: var(--color-bg); color: var(--color-ink); cursor: pointer */
.settings-menu__option--active /* background: var(--color-authority); color: var(--color-authority-fg);
                                  border-color: var(--color-authority) */
.settings-menu__divider     /* height: 1px; background: var(--color-border); margin: var(--space-2) 0 */
.settings-menu__action      /* display: block; width: 100%; text-align: left; padding: var(--space-2) var(--space-4);
                               font-size: var(--text-sm); color: var(--color-ink); background: none; cursor: pointer */
.settings-menu__action:hover /* background: var(--color-surface-raised) */
```

### 3.2 Update AppHeader.jsx

Remove `useNavigate`, `Settings` import, and the `btn-optimizer` button. Replace with `<SettingsMenu />`:

```jsx
// Remove:
import { Menu, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Add:
import { Menu } from 'lucide-react'
import SettingsMenu from '../SettingsMenu/SettingsMenu.jsx'

// Replace btn-optimizer button with:
<SettingsMenu />
```

`ModeSwitcher` remains in the classic `AppHeader`. It is NOT shown in Modern mode (Modern mode hides the classic AppHeader entirely).

---

## Stage 4: App.jsx — Modern Mode Shell Switch

**Files to modify:**
- `src/App.jsx`

Add import and branch in `AppRoutes`. The `/catalog-optimizer` route always renders the classic shell regardless of `navStyle`.

```jsx
// Add import:
import ModernApp from './components/ModernApp/ModernApp.jsx'

// Inside AppRoutes(), add store subscription:
const navStyle = useStore((s) => s.navStyle)

// Replace the return statement:
return (
  <>
    {navStyle === 'modern' && !isOptimizer ? (
      <ModernApp />
    ) : (
      <>
        <AppHeader onOpenDrawer={handleOpenDrawer} />
        {!isOptimizer && <FilterBar />}
        <Layout ref={layoutRef} sidebar={sidebarContent}>
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
        </Layout>
      </>
    )}
  </>
)
```

`isOptimizer` is already computed from `location.pathname` in the existing `AppRoutes` function — reuse it.

---

## Stage 5: ModernApp — Top-Level Shell

**Files to create:**
- `src/components/ModernApp/ModernApp.jsx`
- `src/styles/modern-nav.css`

**Modify:**
- `src/main.jsx` — add import after `base.css`:
  ```js
  import './styles/modern-nav.css'
  ```

### 5.1 State shape (all `useState` — NOT Zustand — ephemeral, Modern mode only)

```js
const [navStack, setNavStack] = useState([])
const [navPos, setNavPos]     = useState(-1)
const [currentCatId, setCurrentCatId]         = useState(null)
const [currentTabIndex, setCurrentTabIndex]   = useState(0)
const [currentTeaching, setCurrentTeaching]   = useState(null)
const [activeBookFilter, setActiveBookFilter] = useState(null)
const [searchQuery, setSearchQuery]           = useState('')

// Bible Viewer
const [bibleRef, setBibleRef]     = useState(null)
const [bibleOpen, setBibleOpen]   = useState(false)
const [biblePinned, setBiblePinned] = useState(false)
```

### 5.2 Helper: findTeachingById

```js
function findTeachingById(teachingId, categories) {
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      const found = sub.teachings.find(t => t.id === teachingId)
      if (found) return found
    }
  }
  return null
}
```

### 5.3 Navigation functions

```js
function showScreen(entry) {
  // entry: { screen: 'home'|'category'|'teaching', catId?, tabIndex?, teachingId? }
  const newStack = [...navStack.slice(0, navPos + 1), entry]
  setNavStack(newStack)
  setNavPos(newStack.length - 1)
  setSearchQuery('')
  if (entry.screen === 'category') {
    if (entry.catId !== currentCatId) setActiveBookFilter(null)
    setCurrentCatId(entry.catId)
    setCurrentTabIndex(entry.tabIndex ?? 0)
    setCurrentTeaching(null)
  } else if (entry.screen === 'teaching') {
    setCurrentCatId(entry.catId)
    setCurrentTabIndex(entry.tabIndex ?? 0)
    setCurrentTeaching(findTeachingById(entry.teachingId, categories))
  } else {
    // home
    setCurrentCatId(null)
    setCurrentTabIndex(0)
    setCurrentTeaching(null)
  }
}

function historyNav(dir) {
  const newPos = navPos + dir
  if (newPos < 0 || newPos >= navStack.length) return
  const entry = navStack[newPos]
  setNavPos(newPos)
  if (entry.screen === 'category') {
    setCurrentCatId(entry.catId)
    setCurrentTabIndex(entry.tabIndex ?? 0)
    setCurrentTeaching(null)
  } else if (entry.screen === 'teaching') {
    setCurrentCatId(entry.catId)
    setCurrentTabIndex(entry.tabIndex ?? 0)
    setCurrentTeaching(findTeachingById(entry.teachingId, categories))
  } else {
    setCurrentCatId(null)
    setCurrentTabIndex(0)
    setCurrentTeaching(null)
  }
}
```

### 5.4 Derived current screen

```js
const currentScreen = navStack[navPos]?.screen ?? 'home'
```

### 5.5 Render structure

```jsx
<div className="modern-app">
  <ModernNavBar
    currentScreen={currentScreen}
    currentCatId={currentCatId}
    currentTabIndex={currentTabIndex}
    categories={categories}
    navStack={navStack}
    navPos={navPos}
    onBack={() => historyNav(-1)}
    onHistoryNav={historyNav}
    onGoHome={() => showScreen({ screen: 'home' })}
    onGoToCategory={(catId, tabIndex) => showScreen({ screen: 'category', catId, tabIndex })}
  />

  <ModernSearchBar
    currentScreen={currentScreen}
    currentCatId={currentCatId}
    categories={categories}
    searchQuery={searchQuery}
    onSearchChange={setSearchQuery}
  />

  <div className={`modern-screen-area${biblePinned && bibleOpen ? ' modern-panel-pinned' : ''}`}>
    <div className={`modern-screen modern-screen--home${currentScreen === 'home' ? ' modern-screen--active' : ''}`}>
      <HomeScreen
        categories={categories}
        searchQuery={searchQuery}
        onNavigateToCategory={(catId) => showScreen({ screen: 'category', catId, tabIndex: 0 })}
        onNavigateToTeaching={(teachingId, catId, tabIndex) =>
          showScreen({ screen: 'teaching', teachingId, catId, tabIndex })}
        onClearSearch={() => setSearchQuery('')}
      />
    </div>

    <div className={`modern-screen modern-screen--category${currentScreen === 'category' ? ' modern-screen--active' : ''}`}>
      {currentCatId !== null && (
        <CategoryBrowser
          catId={currentCatId}
          tabIndex={currentTabIndex}
          categories={categories}
          activeBookFilter={activeBookFilter}
          searchQuery={searchQuery}
          onTabChange={(idx) => {
            setCurrentTabIndex(idx)
            setNavStack(stack => stack.map((e, i) =>
              i === navPos ? { ...e, tabIndex: idx } : e
            ))
            setSearchQuery('')
          }}
          onBookFilterChange={setActiveBookFilter}
          onNavigateToTeaching={(teachingId) =>
            showScreen({ screen: 'teaching', teachingId, catId: currentCatId, tabIndex: currentTabIndex })}
          onOpenBible={(ref) => { setBibleRef(ref); setBibleOpen(true) }}
          onClearSearch={() => setSearchQuery('')}
        />
      )}
    </div>

    <div className={`modern-screen modern-screen--teaching${currentScreen === 'teaching' ? ' modern-screen--active' : ''}`}>
      {currentTeaching !== null && (
        <TeachingDetail
          teaching={currentTeaching}
          catId={currentCatId}
          tabIndex={currentTabIndex}
          categories={categories}
          onOpenBible={(ref) => { setBibleRef(ref); setBibleOpen(true) }}
        />
      )}
    </div>
  </div>

  {(currentScreen === 'category' || currentScreen === 'teaching') && (
    <PrevNextBar
      currentScreen={currentScreen}
      catId={currentCatId}
      tabIndex={currentTabIndex}
      teaching={currentTeaching}
      categories={categories}
      activeBookFilter={activeBookFilter}
      onNavigate={showScreen}
    />
  )}

  {/* Always mounted — never destroyed by navigation */}
  <BibleViewer
    bibleRef={bibleRef}
    open={bibleOpen}
    pinned={biblePinned}
    onClose={() => setBibleOpen(false)}
    onTogglePin={() => setBiblePinned(p => !p)}
    onReopen={() => setBibleOpen(true)}
  />
</div>
```

### 5.6 Base CSS (`modern-nav.css`)

```css
/* ── ModernApp shell ── */
.modern-app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--color-bg);
}

.modern-screen-area {
  flex: 1;
  position: relative;
  overflow-y: auto;
}

/* Screen fade transitions */
.modern-screen {
  display: none;
  animation: modern-fade-in 0.22s ease;
}
.modern-screen--active {
  display: block;
}
@keyframes modern-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Panel-pinned: shift main content */
.modern-screen-area.modern-panel-pinned {
  margin-right: var(--modern-panel-width);
  transition: margin-right 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

:root {
  --modern-panel-width: 380px;
  --modern-nav-height: 56px;
  --modern-search-height: 52px;
}
```

---

## Stage 6: ModernNavBar

**File to create:** `src/components/ModernApp/ModernNavBar.jsx`

**Props:**
```ts
{
  currentScreen: 'home' | 'category' | 'teaching',
  currentCatId: number | null,
  currentTabIndex: number,
  categories: Category[],
  navStack: NavEntry[],
  navPos: number,
  onBack: () => void,
  onHistoryNav: (dir: -1 | 1) => void,
  onGoHome: () => void,
  onGoToCategory: (catId: number, tabIndex: number) => void,
}
```

**Derived values:**
```js
const currentCat = categories.find(c => c.id === currentCatId) ?? null
const currentSubcat = currentCat?.subcategories?.[currentTabIndex] ?? null
const canGoBack = navPos > 0
const canGoForward = navPos < navStack.length - 1
```

**Center title logic:**
- `home`: `<span className="modern-nav__logo">Jesus <span>Says</span></span>`
- `category`: `<span className="modern-nav__title">{currentCat?.title}</span>`
- `teaching`: `<span className="modern-nav__breadcrumb" title={...}>{currentCat?.title} › {currentSubcat?.title}</span>`

**Render structure:**
```jsx
<nav className="modern-nav">
  <button
    className={`modern-nav__back${currentScreen !== 'home' ? ' modern-nav__back--visible' : ''}`}
    onClick={onBack}
    aria-label="Go back"
    tabIndex={currentScreen === 'home' ? -1 : 0}
  >
    <ChevronLeft size={18} />
  </button>

  <div className="modern-nav__center">
    {/* render per logic above */}
  </div>

  <div className="modern-nav__actions">
    {currentScreen !== 'home' && (
      <>
        <button className="modern-nav__hist-btn" onClick={() => onHistoryNav(-1)}
          disabled={!canGoBack} aria-label="History back"><ChevronLeft size={16} /></button>
        <button className="modern-nav__hist-btn" onClick={() => onHistoryNav(1)}
          disabled={!canGoForward} aria-label="History forward"><ChevronRight size={16} /></button>
      </>
    )}
    {currentScreen === 'teaching' && (
      <button className="modern-nav__btn"
        onClick={() => onGoToCategory(currentCatId, currentTabIndex)}>↑ Category</button>
    )}
    <button className="modern-nav__btn" onClick={onGoHome}>Topical Subjects</button>
    <SettingsMenu />
  </div>
</nav>
```

**Imports needed:** `ChevronLeft`, `ChevronRight` from `lucide-react`; `SettingsMenu` from `../SettingsMenu/SettingsMenu.jsx`

**CSS classes (add to `modern-nav.css`):**
```css
.modern-nav {
  background: var(--color-authority);
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center;
  padding: 0 var(--space-4);
  height: var(--modern-nav-height);
  gap: var(--space-3); flex-shrink: 0;
}
.modern-nav__back {
  color: var(--color-accent-mid);
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.15s ease, background 0.15s ease; flex-shrink: 0;
}
.modern-nav__back--visible { opacity: 1; pointer-events: auto; }
.modern-nav__back:hover { background: rgba(255,255,255,0.1); }
.modern-nav__center { flex: 1; min-width: 0; }
.modern-nav__logo { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-authority-fg); }
.modern-nav__logo span { color: var(--color-accent-mid); }
.modern-nav__title { font-size: var(--text-base); font-weight: 700; color: var(--color-authority-fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.modern-nav__breadcrumb { font-size: var(--text-sm); color: var(--color-authority-fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.modern-nav__actions { display: flex; gap: var(--space-1); align-items: center; flex-shrink: 0; }
.modern-nav__btn {
  color: rgba(255,255,255,0.7); font-size: var(--text-xs); font-weight: 700; cursor: pointer;
  padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm);
  letter-spacing: 0.02em; transition: background 0.15s ease, color 0.15s ease; white-space: nowrap;
}
.modern-nav__btn:hover { background: rgba(255,255,255,0.1); color: white; }
.modern-nav__hist-btn {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm); color: rgba(255,255,255,0.7); transition: background 0.15s ease;
}
.modern-nav__hist-btn:hover { background: rgba(255,255,255,0.1); }
.modern-nav__hist-btn:disabled { opacity: 0.35; pointer-events: none; }
```

---

## Stage 7: ModernSearchBar

**File to create:** `src/components/ModernApp/ModernSearchBar.jsx`

**Props:**
```ts
{
  currentScreen: 'home' | 'category' | 'teaching',
  currentCatId: number | null,
  categories: Category[],
  searchQuery: string,
  onSearchChange: (query: string) => void,
}
```

**Placeholder computation:**
```js
const currentCat = categories.find(c => c.id === currentCatId) ?? null
const placeholder = currentScreen === 'home'
  ? 'Search categories, topics, teachings…'
  : `Search in ${currentCat?.title ?? ''}…`
```

**Render:**
```jsx
<div className="modern-search-bar">
  <div className="modern-search-bar__wrap">
    <Search className="modern-search-bar__icon" size={15} aria-hidden="true" />
    <input
      className="modern-search-bar__input"
      type="search"
      value={searchQuery}
      placeholder={placeholder}
      onChange={(e) => onSearchChange(e.target.value)}
      aria-label={placeholder}
    />
    {searchQuery && (
      <button className="modern-search-bar__clear"
        onClick={() => onSearchChange('')} aria-label="Clear search">×</button>
    )}
  </div>
  {/* EXTENSION POINT: future advanced search controls (fuzzy toggle, filters) go here */}
</div>
```

**CSS classes (add to `modern-nav.css`):**
```css
.modern-search-bar {
  background: var(--color-surface); border-bottom: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-4); flex-shrink: 0;
  position: sticky; top: var(--modern-nav-height); z-index: 90;
}
.modern-search-bar__wrap { position: relative; display: flex; align-items: center; }
.modern-search-bar__icon { position: absolute; left: var(--space-3); color: var(--color-muted); pointer-events: none; }
.modern-search-bar__input {
  width: 100%; padding: var(--space-2) var(--space-4) var(--space-2) calc(var(--space-3) + 22px);
  border-radius: var(--radius-md); border: 1.5px solid var(--color-border);
  font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-ink);
  background: var(--color-bg); outline: none; transition: border-color 0.15s ease;
}
.modern-search-bar__input:focus { border-color: var(--color-accent); }
.modern-search-bar__clear {
  position: absolute; right: var(--space-3); color: var(--color-muted);
  font-size: var(--text-lg); background: none; cursor: pointer; line-height: 1;
}
```

---

## Stage 8: HomeScreen

**File to create:** `src/components/ModernApp/HomeScreen.jsx`

**Props:**
```ts
{
  categories: Category[],
  searchQuery: string,
  onNavigateToCategory: (catId: number) => void,
  onNavigateToTeaching: (teachingId: string, catId: number, tabIndex: number) => void,
  onClearSearch: () => void,
}
```

### 8.1 Teaching density computation

```js
const maxTeachingCount = useMemo(() =>
  Math.max(...categories.map(cat =>
    cat.subcategories.reduce((acc, sub) => acc + sub.teachings.length, 0)
  ), 1),
[categories])

function getDensityRatio(cat) {
  const count = cat.subcategories.reduce((acc, sub) => acc + sub.teachings.length, 0)
  return count / maxTeachingCount
}
```

### 8.2 Search highlight utility (local function)

```js
function highlight(text, query) {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}
```

### 8.3 Search logic

```js
const query = searchQuery.trim().toLowerCase()
const catResults = categories.filter(c => c.title.toLowerCase().includes(query))
const subcatResults = []
const teachingResults = []

categories.forEach((cat) => {
  const catMatched = catResults.includes(cat)
  cat.subcategories.forEach((sub, subIdx) => {
    if (!catMatched && sub.title.toLowerCase().includes(query)) {
      subcatResults.push({ cat, sub, tabIndex: subIdx })
    }
    sub.teachings.forEach(t => {
      if (t.text.toLowerCase().includes(query)) {
        teachingResults.push({ cat, sub, tabIndex: subIdx, teaching: t })
      }
    })
  })
})
```

### 8.4 Render

When `searchQuery` is empty: category grid. When non-empty: grouped search results.

**Category grid:**
```jsx
<div className="modern-home">
  <div className="modern-home__header">
    <h2 className="modern-home__heading">Topical Subjects</h2>
    <span className="modern-home__count">{categories.length} categories</span>
  </div>
  <div className="modern-home__grid">
    {categories.map(cat => (
      <button key={cat.id} className="modern-cat-card"
        onClick={() => onNavigateToCategory(cat.id)}>
        <div className="modern-cat-card__name">{cat.title}</div>
        <div className="modern-cat-card__bar-wrap">
          <div className="modern-cat-card__bar-fill"
            style={{ width: `${getDensityRatio(cat) * 100}%` }} />
        </div>
        <div className="modern-cat-card__meta">
          {cat.subcategories.length} sections
          · {cat.subcategories.reduce((a, s) => a + s.teachings.length, 0)} teachings
        </div>
      </button>
    ))}
  </div>
</div>
```

**Search results:** Grouped sections (Categories, Subcategories, Teachings). Each row: type label + highlighted matched text + breadcrumb. Use `dangerouslySetInnerHTML` for highlight markup.

**CSS classes (add to `modern-nav.css`):**
```css
.modern-home { }
.modern-home__header {
  padding: var(--space-5) var(--space-4) var(--space-3);
  background: var(--color-surface); border-bottom: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: space-between;
}
.modern-home__heading { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-authority); }
.modern-home__count {
  font-size: var(--text-xs); color: var(--color-muted); background: var(--color-surface-raised);
  padding: var(--space-1) var(--space-3); border-radius: var(--radius-pill); font-weight: 700;
}
.modern-home__grid {
  padding: var(--space-3) var(--space-4);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-3);
}
.modern-cat-card {
  background: var(--color-surface); border-radius: var(--radius-lg);
  padding: var(--space-4); cursor: pointer;
  border: 1.5px solid var(--color-border); box-shadow: var(--shadow-card);
  text-align: left; transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  position: relative; overflow: hidden;
}
.modern-cat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--color-accent); transform: scaleX(0); transform-origin: left;
  transition: transform 0.22s ease;
}
.modern-cat-card:hover { border-color: var(--color-accent); box-shadow: var(--shadow-pane); transform: translateY(-1px); }
.modern-cat-card:hover::before { transform: scaleX(1); }
.modern-cat-card:active { transform: scale(0.98); }
.modern-cat-card__name { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--space-2); color: var(--color-ink); line-height: 1.35; }
.modern-cat-card__bar-wrap { height: 3px; background: var(--color-border); border-radius: 2px; margin-bottom: var(--space-2); overflow: hidden; }
.modern-cat-card__bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--color-accent), var(--color-accent-mid)); }
.modern-cat-card__meta { font-size: var(--text-xs); color: var(--color-muted); }

.modern-search-results { padding: var(--space-3) var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
.modern-search-results__label {
  font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--color-muted); padding: var(--space-2) 0 var(--space-1);
}
.modern-search-result-row {
  background: var(--color-surface); border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md); padding: var(--space-3) var(--space-4);
  text-align: left; cursor: pointer; transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-shadow: var(--shadow-card);
}
.modern-search-result-row:hover { border-color: var(--color-accent); box-shadow: var(--shadow-pane); }
.modern-search-result-row__type { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: var(--space-1); }
.modern-search-result-row__type--cat     { color: var(--color-accent); }
.modern-search-result-row__type--sub     { color: var(--color-tag-prayer); }
.modern-search-result-row__type--teaching { color: var(--color-tag-parable); }
.modern-search-result-row__title { font-size: var(--text-sm); color: var(--color-ink); line-height: 1.45; }
.modern-search-result-row__crumb { font-size: var(--text-xs); color: var(--color-muted); margin-top: var(--space-1); display: block; }
/* Search highlight */
mark { background: var(--color-accent-light); color: var(--color-accent); border-radius: 2px; padding: 0 1px; font-weight: 700; }
```

---

## Stage 9: CategoryBrowser + TeachingCard

**File to create:** `src/components/ModernApp/CategoryBrowser.jsx`

`TeachingCard` is a local function inside this file (no separate file — minimal reuse justification).

**Props:**
```ts
{
  catId: number,
  tabIndex: number,
  categories: Category[],
  activeBookFilter: string | null,
  searchQuery: string,
  onTabChange: (idx: number) => void,
  onBookFilterChange: (bookAbbr: string | null) => void,
  onNavigateToTeaching: (teachingId: string) => void,
  onOpenBible: (refObj: RefObject) => void,
  onClearSearch: () => void,
}
```

**Derived data:**
```js
const isMobile = useIsMobile()
const cat = categories.find(c => c.id === catId)
const currentSubcat = cat?.subcategories?.[tabIndex] ?? null

const allBookAbbrs = useMemo(() => {
  const seen = new Set()
  const result = []
  cat?.subcategories.forEach(sub =>
    sub.teachings.forEach(t =>
      t.references.forEach(r => {
        if (!seen.has(r.bookAbbr)) { seen.add(r.bookAbbr); result.push(r.bookAbbr) }
      })
    )
  )
  return result
}, [cat])

const visibleTeachings = useMemo(() => {
  if (!currentSubcat) return []
  if (!activeBookFilter) return currentSubcat.teachings
  return currentSubcat.teachings.filter(t =>
    t.references.some(r => r.bookAbbr === activeBookFilter)
  )
}, [currentSubcat, activeBookFilter])
```

**Render structure:**
```jsx
<div className="modern-category-browser">
  {/* Hero Header */}
  <div className="modern-cat-hero">
    <h2 className="modern-cat-hero__title">{cat?.title}</h2>

    <div className="modern-book-filter-row">
      {allBookAbbrs.map(abbr => (
        <button key={abbr}
          className={`modern-book-chip${activeBookFilter === abbr ? ' modern-book-chip--active' : ''}`}
          onClick={() => onBookFilterChange(activeBookFilter === abbr ? null : abbr)}
        >{abbr}</button>
      ))}
    </div>

    {/* Desktop: scrollable tab row */}
    {!isMobile && (
      <div className="modern-tabs-scroll">
        {cat?.subcategories.map((sub, idx) => (
          <button key={sub.id}
            className={`modern-tab-btn${tabIndex === idx ? ' modern-tab-btn--active' : ''}`}
            onClick={() => onTabChange(idx)}
          >{sub.title}</button>
        ))}
      </div>
    )}

    {/* Mobile: select dropdown */}
    {isMobile && (
      <div className="modern-subcat-dropdown-wrap">
        <select className="modern-subcat-select" value={tabIndex}
          onChange={(e) => onTabChange(parseInt(e.target.value, 10))}>
          {cat?.subcategories.map((sub, idx) => (
            <option key={sub.id} value={idx}>{sub.title}</option>
          ))}
        </select>
      </div>
    )}
  </div>

  {/* Teaching list OR in-category search results */}
  {!searchQuery ? (
    <div className="modern-teachings-list">
      {visibleTeachings.length === 0 ? (
        <div className="modern-empty-state">
          No teachings from {activeBookFilter} in this section.
        </div>
      ) : (
        visibleTeachings.map(teaching => (
          <TeachingCard
            key={teaching.id}
            teaching={teaching}
            onNavigate={() => onNavigateToTeaching(teaching.id)}
            onOpenBible={onOpenBible}
          />
        ))
      )}
    </div>
  ) : (
    <InCategorySearchResults
      cat={cat}
      tabIndex={tabIndex}
      searchQuery={searchQuery}
      onNavigate={(subcatIdx, teachingId) => {
        onTabChange(subcatIdx)
        if (teachingId) onNavigateToTeaching(teachingId)
        onClearSearch()
      }}
    />
  )}
</div>
```

**TeachingCard (local function):**
```jsx
function TeachingCard({ teaching, onNavigate, onOpenBible }) {
  return (
    <div className="modern-teaching-card" onClick={onNavigate}>
      {teaching.tags.length > 0 && (
        <div className="modern-teaching-card__tags">
          {teaching.tags.map(tag => (
            <span key={tag} className={`modern-tag modern-tag--${tag}`}>{tag}</span>
          ))}
        </div>
      )}
      <div className="modern-teaching-card__body">
        <p className="modern-teaching-card__text">{teaching.text}</p>
        <div className="modern-teaching-card__footer">
          <div className="modern-chips-row">
            {teaching.references.map(ref => (
              <button key={ref.label} className="modern-scripture-chip"
                onClick={(e) => { e.stopPropagation(); onOpenBible(ref) }}
              >{ref.label}</button>
            ))}
          </div>
          <span className="modern-teaching-card__arrow" aria-hidden="true">›</span>
        </div>
      </div>
    </div>
  )
}
```

**InCategorySearchResults (local function):**
- Search `cat.subcategories` for subcategory title and teaching text matches
- Group results: Subcategories then Teachings
- Each row: type label + highlighted matched text + breadcrumb
- Tap: clears search, switches tab, optionally navigates to teaching

**CSS classes (add to `modern-nav.css`):**
```css
.modern-category-browser { }
.modern-cat-hero { background: var(--color-authority); padding: var(--space-5) var(--space-4) 0; color: var(--color-authority-fg); }
.modern-cat-hero__title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 500; margin-bottom: var(--space-1); }

.modern-book-filter-row { display: flex; flex-wrap: wrap; gap: var(--space-2); padding: var(--space-2) 0 var(--space-4); }
.modern-book-chip {
  font-size: var(--text-xs); font-weight: 700;
  padding: var(--space-1) var(--space-3); border-radius: var(--radius-pill);
  border: 1.5px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.5);
  cursor: pointer; transition: all 0.15s ease; letter-spacing: 0.04em;
}
.modern-book-chip:hover { border-color: rgba(255,255,255,0.5); color: rgba(255,255,255,0.85); }
.modern-book-chip--active { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-authority); }

.modern-tabs-scroll { overflow-x: auto; scrollbar-width: none; display: flex; background: var(--color-authority); }
.modern-tabs-scroll::-webkit-scrollbar { display: none; }
.modern-tab-btn {
  flex-shrink: 0; padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm); font-weight: 700; color: rgba(255,255,255,0.5); cursor: pointer;
  border-bottom: 2px solid transparent; transition: all 0.15s ease; white-space: nowrap;
}
.modern-tab-btn:hover { color: rgba(255,255,255,0.8); }
.modern-tab-btn--active { color: var(--color-accent-mid); border-bottom-color: var(--color-accent); }

.modern-subcat-dropdown-wrap { padding: var(--space-3) 0 var(--space-4); background: var(--color-authority); }
.modern-subcat-select {
  width: 100%; appearance: none; -webkit-appearance: none;
  background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-md); color: white;
  font-family: var(--font-body); font-size: var(--text-sm); font-weight: 700;
  padding: var(--space-3) var(--space-8) var(--space-3) var(--space-4);
  cursor: pointer; outline: none; transition: border-color 0.15s ease;
}
.modern-subcat-select:focus { border-color: var(--color-accent); }
.modern-subcat-select option { background: var(--color-authority); color: white; }

.modern-teachings-list { padding: var(--space-3) var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
.modern-empty-state { text-align: center; padding: var(--space-10) var(--space-4); color: var(--color-muted); font-size: var(--text-sm); }

.modern-teaching-card {
  background: var(--color-surface); border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4); border: 1.5px solid var(--color-border);
  box-shadow: var(--shadow-card); cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  display: flex; flex-direction: column; gap: var(--space-2);
}
.modern-teaching-card:hover { border-color: var(--color-accent); box-shadow: var(--shadow-pane); }
.modern-teaching-card:active { transform: scale(0.99); }
.modern-teaching-card__tags { display: flex; flex-wrap: wrap; gap: var(--space-1); }
.modern-teaching-card__text { font-size: var(--text-sm); line-height: 1.55; color: var(--color-ink); }
.modern-teaching-card__footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
.modern-chips-row { display: flex; flex-wrap: wrap; gap: var(--space-1); align-items: center; }
.modern-teaching-card__arrow { font-size: var(--text-lg); color: var(--color-accent); opacity: 0.5; flex-shrink: 0; transition: opacity 0.15s ease, transform 0.15s ease; }
.modern-teaching-card:hover .modern-teaching-card__arrow { opacity: 1; transform: translateX(2px); }

.modern-scripture-chip {
  font-size: var(--text-xs); font-weight: 700; color: var(--color-accent);
  background: var(--color-accent-light); padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill); border: 1px solid rgba(154,123,52,0.2);
  transition: all 0.15s ease; cursor: pointer;
}
.modern-scripture-chip:hover { background: var(--color-accent); color: white; }

.modern-tag { font-size: var(--text-xs); font-weight: 700; padding: var(--space-1) var(--space-2); border-radius: var(--radius-pill); }
.modern-tag--parable { color: var(--color-tag-prayer);   background: var(--color-tag-prayer-bg); }
.modern-tag--promise  { color: var(--color-tag-parable); background: var(--color-tag-parable-bg); }
.modern-tag--woe      { color: #7B3F00; background: #FFF0E0; }
```

---

## Stage 10: TeachingDetail

**File to create:** `src/components/ModernApp/TeachingDetail.jsx`

**Props:**
```ts
{
  teaching: Teaching,
  catId: number,
  tabIndex: number,
  categories: Category[],
  onOpenBible: (refObj: RefObject) => void,
}
```

**Derived data:**
```js
const cat = categories.find(c => c.id === catId)
const subcat = cat?.subcategories?.[tabIndex] ?? null

function formatRanges(ranges) {
  if (!ranges || ranges.length === 0) return ''
  return ranges.map(r => r[0] === r[1] ? `v.${r[0]}` : `vv.${r[0]}–${r[1]}`).join(', ')
}
```

**Render structure:**
```jsx
<div className="modern-teaching-detail">
  {/* Hero Header */}
  <div className="modern-detail-hero">
    <div className="modern-detail-hero__breadcrumb">{cat?.title} › {subcat?.title}</div>
    <p className="modern-detail-hero__text">{teaching.text}</p>
  </div>

  <div className="modern-detail-body">
    {/* Tag chips — only if non-empty */}
    {teaching.tags.length > 0 && (
      <div className="modern-detail-tags">
        {teaching.tags.map(tag => (
          <span key={tag} className={`modern-tag modern-tag--${tag}`}>{tag}</span>
        ))}
      </div>
    )}

    {/* Scripture References */}
    <div className="modern-detail-section">
      <div className="modern-detail-section__head">Scripture References</div>
      <div className="modern-detail-section__body">
        {teaching.references.map(ref => (
          <div key={ref.label} className="modern-ref-row"
            role="button" tabIndex={0}
            onClick={() => onOpenBible(ref)}
            onKeyDown={(e) => e.key === 'Enter' && onOpenBible(ref)}
          >
            <div className={`modern-ref-dot${ref.isPrimary ? ' modern-ref-dot--primary' : ''}`} />
            <div className="modern-ref-info">
              <div className="modern-ref-label">{ref.label}</div>
              <div className="modern-ref-subline">{ref.book} · {formatRanges(ref.ranges)}</div>
            </div>
            <span className="modern-ref-open">Open ›</span>
          </div>
        ))}
      </div>
    </div>

    {/* Verse Snippets: hidden entirely until Bible API is available */}
    {/* EXTENSION POINT: when Bible API data is present, render verse text rows here */}
  </div>
</div>
```

NOTE: `teaching.quote` is intentionally NOT rendered.

**CSS classes (add to `modern-nav.css`):**
```css
.modern-teaching-detail { background: var(--color-bg); min-height: calc(100dvh - 108px); }
.modern-detail-hero { background: var(--color-authority); padding: var(--space-5) var(--space-4) var(--space-6); color: var(--color-authority-fg); }
.modern-detail-hero__breadcrumb {
  font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--color-accent-mid); margin-bottom: var(--space-2);
}
.modern-detail-hero__text { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 400; line-height: 1.5; color: var(--color-authority-fg); }
.modern-detail-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }
.modern-detail-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.modern-detail-section { background: var(--color-surface); border-radius: var(--radius-md); border: 1.5px solid var(--color-border); overflow: hidden; }
.modern-detail-section__head {
  padding: var(--space-2) var(--space-4); border-bottom: 1px solid var(--color-border);
  font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--color-muted); background: var(--color-surface-raised);
}
.modern-detail-section__body { padding: 0 var(--space-4); }
.modern-ref-row {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border); cursor: pointer;
}
.modern-ref-row:last-child { border-bottom: none; }
.modern-ref-row:hover .modern-ref-label { color: var(--color-accent-mid); }
.modern-ref-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); flex-shrink: 0; }
.modern-ref-dot--primary { background: var(--color-accent); }
.modern-ref-info { flex: 1; min-width: 0; }
.modern-ref-label { font-size: var(--text-sm); font-weight: 700; color: var(--color-accent); transition: color 0.15s ease; }
.modern-ref-subline { font-size: var(--text-xs); color: var(--color-muted); margin-top: 2px; }
.modern-ref-open {
  font-size: var(--text-xs); font-weight: 700; color: var(--color-accent);
  background: var(--color-accent-light); padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill); border: 1px solid rgba(154,123,52,0.2); flex-shrink: 0;
}
.modern-ref-row:hover .modern-ref-open { background: var(--color-accent); color: white; }
```

---

## Stage 11: PrevNextBar

**File to create:** `src/components/ModernApp/PrevNextBar.jsx`

**Props:**
```ts
{
  currentScreen: 'category' | 'teaching',
  catId: number,
  tabIndex: number,
  teaching: Teaching | null,
  categories: Category[],
  activeBookFilter: string | null,
  onNavigate: (entry: NavEntry) => void,
}
```

**Resolution function:**
```js
function resolveTarget(dir, { currentScreen, catId, tabIndex, teaching, categories, activeBookFilter }) {
  const catIdx = categories.findIndex(c => c.id === catId)
  const cat = categories[catIdx]
  if (!cat) return null

  if (currentScreen === 'teaching' && teaching) {
    const subcat = cat.subcategories[tabIndex]
    const filtered = activeBookFilter
      ? subcat.teachings.filter(t => t.references.some(r => r.bookAbbr === activeBookFilter))
      : subcat.teachings
    const tIdx = filtered.findIndex(t => t.id === teaching.id)
    const nextTIdx = tIdx + dir
    if (nextTIdx >= 0 && nextTIdx < filtered.length) {
      return { screen: 'teaching', teachingId: filtered[nextTIdx].id, catId, tabIndex }
    }
  }

  const nextTabIndex = tabIndex + dir
  if (nextTabIndex >= 0 && nextTabIndex < cat.subcategories.length) {
    if (currentScreen === 'teaching') {
      const adjSubcat = cat.subcategories[nextTabIndex]
      const filteredAdj = activeBookFilter
        ? adjSubcat.teachings.filter(t => t.references.some(r => r.bookAbbr === activeBookFilter))
        : adjSubcat.teachings
      const target = dir === -1 ? filteredAdj[filteredAdj.length - 1] : filteredAdj[0]
      if (target) return { screen: 'teaching', teachingId: target.id, catId, tabIndex: nextTabIndex }
    }
    return { screen: 'category', catId, tabIndex: nextTabIndex }
  }

  const nextCatIdx = catIdx + dir
  if (nextCatIdx >= 0 && nextCatIdx < categories.length) {
    const nextCat = categories[nextCatIdx]
    const nextTab = dir === -1 ? nextCat.subcategories.length - 1 : 0
    return { screen: 'category', catId: nextCat.id, tabIndex: nextTab }
  }

  return null
}
```

**Label helpers:**
```js
function truncateLabel(text, maxLen = 32) {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text
}
function getTargetLabel(entry, categories) {
  if (!entry) return ''
  const cat = categories.find(c => c.id === entry.catId)
  if (entry.screen === 'teaching') {
    const t = cat?.subcategories?.flatMap(s => s.teachings).find(t => t.id === entry.teachingId)
    return truncateLabel(t?.text ?? '')
  }
  return truncateLabel(cat?.subcategories?.[entry.tabIndex]?.title ?? cat?.title ?? '')
}
```

**Render:**
```jsx
const prevTarget = resolveTarget(-1, props)
const nextTarget = resolveTarget(1, props)

<div className="modern-pn-bar">
  <button
    className={`modern-pn-btn${!prevTarget ? ' modern-pn-btn--disabled' : ''}`}
    onClick={() => prevTarget && onNavigate(prevTarget)}
    disabled={!prevTarget}
  >
    <span className="modern-pn-arrow">‹</span>
    <div>
      <span className="modern-pn-label">Previous</span>
      <span className="modern-pn-name">{getTargetLabel(prevTarget, categories)}</span>
    </div>
  </button>
  <button
    className={`modern-pn-btn modern-pn-btn--right${!nextTarget ? ' modern-pn-btn--disabled' : ''}`}
    onClick={() => nextTarget && onNavigate(nextTarget)}
    disabled={!nextTarget}
  >
    <div style={{ textAlign: 'right' }}>
      <span className="modern-pn-label">Next</span>
      <span className="modern-pn-name">{getTargetLabel(nextTarget, categories)}</span>
    </div>
    <span className="modern-pn-arrow">›</span>
  </button>
</div>
```

**CSS classes (add to `modern-nav.css`):**
```css
.modern-pn-bar {
  background: var(--color-surface); border-top: 1px solid var(--color-border);
  display: flex; position: sticky; bottom: 0; z-index: 80; flex-shrink: 0;
}
.modern-pn-btn {
  flex: 1; display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-4); font-size: var(--text-sm); font-weight: 700;
  color: var(--color-muted); cursor: pointer; transition: background 0.15s ease, color 0.15s ease;
}
.modern-pn-btn:first-child { border-right: 1px solid var(--color-border); }
.modern-pn-btn:hover:not(.modern-pn-btn--disabled) { background: var(--color-surface-raised); color: var(--color-ink); }
.modern-pn-btn--right { justify-content: flex-end; }
.modern-pn-btn--disabled { opacity: 0.4; pointer-events: none; }
.modern-pn-arrow { font-size: var(--text-xl); color: var(--color-accent); }
.modern-pn-label { font-size: var(--text-xs); color: var(--color-muted); display: block; font-weight: 400; }
.modern-pn-name { font-size: var(--text-xs); display: block; }
```

---

## Stage 12: BibleViewer (Shell — Desktop Panel + Mobile Drawer)

**Files to create:**
- `src/components/ModernApp/BibleViewer/BibleViewer.jsx`
- `src/components/ModernApp/BibleViewer/BiblePanel.jsx`
- `src/components/ModernApp/BibleViewer/BibleDrawer.jsx`

### 12.1 BibleViewer.jsx (dispatcher)

```jsx
import { useIsMobile } from '../../../hooks/useBreakpoint.js'
import BiblePanel from './BiblePanel.jsx'
import BibleDrawer from './BibleDrawer.jsx'

export default function BibleViewer({ bibleRef, open, pinned, onClose, onTogglePin, onReopen }) {
  const isMobile = useIsMobile()
  return isMobile
    ? <BibleDrawer bibleRef={bibleRef} open={open} onClose={onClose} onReopen={onReopen} />
    : <BiblePanel  bibleRef={bibleRef} open={open} pinned={pinned} onClose={onClose} onTogglePin={onTogglePin} />
}
```

### 12.2 BiblePanel.jsx (desktop ≥ 768px)

**Props:** `{ bibleRef, open, pinned, onClose, onTogglePin }`

**Internal state:**
```js
const closeTimerRef = useRef(null)
```

**Auto-close (unpinned only):**
```js
function onPanelMouseLeave() {
  if (pinned) return
  closeTimerRef.current = setTimeout(() => onClose(), 600)
}
function onPanelMouseEnter() {
  clearTimeout(closeTimerRef.current)
}
useEffect(() => () => clearTimeout(closeTimerRef.current), [])
```

**Render:**
```jsx
<div
  className={`modern-bible-panel${open ? ' modern-bible-panel--open' : ''}${pinned ? ' modern-bible-panel--pinned' : ''}`}
  onMouseEnter={onPanelMouseEnter}
  onMouseLeave={onPanelMouseLeave}
>
  <div className="modern-panel-header">
    <div className="modern-panel-ref-block">
      <div className="modern-panel-ref">{bibleRef?.label ?? '—'}</div>
      <div className="modern-panel-context">{bibleRef?.book}</div>
    </div>
    <div className="modern-panel-actions">
      <button
        className={`modern-panel-pin-btn${pinned ? ' modern-panel-pin-btn--pinned' : ''}`}
        onClick={onTogglePin}
        aria-label={pinned ? 'Unpin panel' : 'Pin panel'}
      >
        {/* Pin SVG icon */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="7" y1="8" x2="7" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M4 7.5C4 5.5 3.5 3.5 5 2.5H9C10.5 3.5 10 5.5 10 7.5H4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
          <line x1="3" y1="7.5" x2="11" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  </div>
  <div className="modern-panel-body">
    <div className="modern-panel-placeholder">
      Bible text will appear here when the scripture API is connected.
    </div>
    {/* EXTENSION POINT: replace placeholder with verse rows when Bible API is available */}
    {/* EXTENSION POINT: cross-reference chips area */}
  </div>
</div>
```

### 12.3 BibleDrawer.jsx (mobile < 768px)

**Props:** `{ bibleRef, open, onClose, onReopen }`

**Internal state:**
```js
const [drawerH, setDrawerH]           = useState(0)
const [isPeeking, setIsPeeking]       = useState(false)
const [showPeekPill, setShowPeekPill] = useState(false)
const [lastRef, setLastRef]           = useState(null)
const dragStartY  = useRef(null)
const dragStartH  = useRef(null)

const PEEK_HEIGHT      = 48
const DEFAULT_HEIGHT   = Math.round(window.innerHeight * 0.55)
const MAX_HEIGHT       = Math.round(window.innerHeight * 0.90)
const DISMISS_THRESHOLD = 24
```

**Open/close effects:**
```js
useEffect(() => {
  if (open && !isPeeking) {
    setDrawerH(DEFAULT_HEIGHT)
    setShowPeekPill(false)
    if (bibleRef) setLastRef(bibleRef)
  }
}, [open, bibleRef])

// Expand from peek when new ref arrives
useEffect(() => {
  if (bibleRef && isPeeking) {
    setIsPeeking(false)
    setDrawerH(DEFAULT_HEIGHT)
  }
  if (bibleRef) setLastRef(bibleRef)
}, [bibleRef])
```

**Drag handlers:**
```js
function onDragStart(clientY) {
  dragStartY.current = clientY
  dragStartH.current = drawerH
}
function onDragMove(clientY) {
  const delta = dragStartY.current - clientY
  setDrawerH(Math.min(MAX_HEIGHT, Math.max(0, dragStartH.current + delta)))
}
function onDragEnd() {
  if (drawerH <= DISMISS_THRESHOLD) {
    setDrawerH(0); setIsPeeking(false); onClose(); setShowPeekPill(true)
  } else if (drawerH <= PEEK_HEIGHT + 20) {
    setDrawerH(PEEK_HEIGHT); setIsPeeking(true)
  }
}
function handleClose() {
  setDrawerH(0); setIsPeeking(false); onClose(); setShowPeekPill(!!lastRef)
}
function handlePeekPillTap() {
  setDrawerH(DEFAULT_HEIGHT); setIsPeeking(false); setShowPeekPill(false); onReopen()
}
```

**Mouse drag:** In the handle zone's `onMouseDown`, add `mousemove` and `mouseup` listeners to `window`. Clean up in the `mouseup` handler (not on unmount — only after drag ends).

**Render:**
```jsx
<>
  <div
    className={`modern-bible-drawer${open || isPeeking ? ' modern-bible-drawer--open' : ''}`}
    style={{ height: `${drawerH}px` }}
  >
    <div className="modern-drawer-handle-zone"
      onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
      onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
      onTouchEnd={onDragEnd}
      onMouseDown={(e) => {
        onDragStart(e.clientY)
        const onMove = (ev) => onDragMove(ev.clientY)
        const onUp   = () => { onDragEnd(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
      }}
    >
      <div className="modern-drawer-handle" />
      {isPeeking && <div className="modern-drawer-handle-label">{lastRef?.label ?? 'Scripture'}</div>}
    </div>

    {!isPeeking && (
      <div className="modern-drawer-contents">
        <div className="modern-drawer-header">
          <div className="modern-drawer-ref-block">
            <div className="modern-drawer-ref">{bibleRef?.label ?? '—'}</div>
            <div className="modern-drawer-context">{bibleRef?.book}</div>
          </div>
          <button className="modern-drawer-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>
        <div className="modern-drawer-body">
          <div className="modern-panel-placeholder">
            Bible text will appear here when the scripture API is connected.
          </div>
          {/* EXTENSION POINT: Bible API verse content */}
        </div>
      </div>
    )}
  </div>

  {showPeekPill && (
    <button className="modern-bible-peek-pill" onClick={handlePeekPillTap}>
      <div className="modern-bible-peek-pill__dot" />
      <span>{lastRef?.label ?? 'Open Scripture'}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 8L6 4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )}
</>
```

**CSS classes (add to `modern-nav.css`):**
```css
/* Panel — desktop */
.modern-bible-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: var(--modern-panel-width);
  background: var(--color-surface); border-left: 1px solid var(--color-border);
  display: flex; flex-direction: column; z-index: 150;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.32,0.72,0,1);
  box-shadow: -6px 0 28px rgba(27,42,64,0.13);
}
.modern-bible-panel--open    { transform: translateX(0); }
.modern-bible-panel--pinned  { box-shadow: none; }
.modern-panel-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  display: flex; align-items: flex-start; gap: var(--space-2);
  flex-shrink: 0; background: var(--color-surface);
}
.modern-panel-ref-block { flex: 1; min-width: 0; }
.modern-panel-ref { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 500; color: var(--color-ink); margin-bottom: 2px; }
.modern-panel-context { font-size: var(--text-xs); color: var(--color-muted); }
.modern-panel-actions { display: flex; gap: var(--space-1); flex-shrink: 0; align-items: center; }
.modern-panel-pin-btn {
  width: 28px; height: 28px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--color-muted);
  border: 1px solid transparent; transition: all 0.15s ease;
}
.modern-panel-pin-btn:hover { background: var(--color-surface-raised); color: var(--color-ink); border-color: var(--color-border); }
.modern-panel-pin-btn--pinned { color: var(--color-accent); background: var(--color-accent-light); border-color: rgba(154,123,52,0.3); }
.modern-panel-body { overflow-y: auto; padding: var(--space-4); flex: 1; }
.modern-panel-placeholder { text-align: center; padding: var(--space-8) var(--space-4); font-size: var(--text-sm); color: var(--color-muted); }

/* Drawer — mobile */
.modern-bible-drawer {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  z-index: 149; display: flex; flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.32,0.72,0,1);
  overflow: hidden; max-height: 90vh; min-height: 48px;
  touch-action: none;
}
.modern-bible-drawer--open { transform: translateY(0); }
.modern-drawer-handle-zone {
  padding: var(--space-2) 0 var(--space-1);
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  cursor: ns-resize; flex-shrink: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.modern-drawer-handle { width: 36px; height: 4px; border-radius: 2px; background: var(--color-border); }
.modern-drawer-handle-label { font-size: var(--text-xs); color: var(--color-muted); font-weight: 700; letter-spacing: 0.04em; }
.modern-drawer-contents { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.modern-drawer-header {
  padding: 0 var(--space-4) var(--space-3); border-bottom: 1px solid var(--color-border);
  display: flex; align-items: flex-start; gap: var(--space-2); flex-shrink: 0;
}
.modern-drawer-ref-block { flex: 1; }
.modern-drawer-ref { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 500; color: var(--color-ink); margin-bottom: 2px; }
.modern-drawer-context { font-size: var(--text-xs); color: var(--color-muted); }
.modern-drawer-close {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--color-surface-raised);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: var(--text-sm); color: var(--color-muted);
  flex-shrink: 0; border: 1px solid var(--color-border);
}
.modern-drawer-body { overflow-y: auto; padding: var(--space-4); flex: 1; }

/* Peek pill */
.modern-bible-peek-pill {
  position: fixed; bottom: var(--space-4); left: 50%; transform: translateX(-50%);
  background: var(--color-authority); color: var(--color-accent-mid);
  font-size: var(--text-xs); font-weight: 700;
  padding: var(--space-2) var(--space-4) var(--space-2) var(--space-3);
  border-radius: 24px; display: flex; align-items: center; gap: var(--space-2);
  box-shadow: var(--shadow-tooltip); cursor: pointer; z-index: 147;
  transition: transform 0.2s ease; white-space: nowrap;
}
.modern-bible-peek-pill:hover { transform: translateX(-50%) translateY(-2px); }
.modern-bible-peek-pill__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-accent); flex-shrink: 0; }

/* Responsive: Panel desktop only; Drawer + pill mobile only */
@media (max-width: 767px) {
  .modern-bible-panel { display: none !important; }
  .modern-screen-area.modern-panel-pinned { margin-right: 0 !important; }
}
@media (min-width: 768px) {
  .modern-bible-drawer { display: none !important; }
  .modern-bible-peek-pill { display: none !important; }
}
```

---

## Stage 13: Import Wiring

**`src/main.jsx`** — add after existing CSS imports:
```js
import './styles/modern-nav.css'
```

**`src/components/ModernApp/ModernApp.jsx`** — top imports:
```js
import { useState, useMemo } from 'react'
import useStore from '../../store.js'
import { useIsMobile } from '../../hooks/useBreakpoint.js'
import ModernNavBar from './ModernNavBar.jsx'
import ModernSearchBar from './ModernSearchBar.jsx'
import HomeScreen from './HomeScreen.jsx'
import CategoryBrowser from './CategoryBrowser.jsx'
import TeachingDetail from './TeachingDetail.jsx'
import PrevNextBar from './PrevNextBar.jsx'
import BibleViewer from './BibleViewer/BibleViewer.jsx'
```

**`src/components/SettingsMenu/SettingsMenu.jsx`** — top imports:
```js
import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store.js'
import './SettingsMenu.css'
```

---

## Implementation Order Summary

| Stage | What | New Files | Modified Files |
|-------|------|-----------|----------------|
| 1 | `navStyle` store field | — | `src/store.js` |
| 2 | `navStyle` localStorage persistence | — | `src/App.jsx` |
| 3 | SettingsMenu component | `src/components/SettingsMenu/SettingsMenu.jsx`, `.css` | `src/components/AppHeader/AppHeader.jsx` |
| 4 | App.jsx modern branch | — | `src/App.jsx` |
| 5 | ModernApp shell + CSS | `src/components/ModernApp/ModernApp.jsx`, `src/styles/modern-nav.css` | `src/main.jsx` |
| 6 | ModernNavBar | `src/components/ModernApp/ModernNavBar.jsx` | — |
| 7 | ModernSearchBar | `src/components/ModernApp/ModernSearchBar.jsx` | — |
| 8 | HomeScreen | `src/components/ModernApp/HomeScreen.jsx` | — |
| 9 | CategoryBrowser + TeachingCard (inline) | `src/components/ModernApp/CategoryBrowser.jsx` | — |
| 10 | TeachingDetail | `src/components/ModernApp/TeachingDetail.jsx` | — |
| 11 | PrevNextBar | `src/components/ModernApp/PrevNextBar.jsx` | — |
| 12 | BibleViewer shell | `src/components/ModernApp/BibleViewer/BibleViewer.jsx`, `BiblePanel.jsx`, `BibleDrawer.jsx` | — |
| 13 | Import wiring | — | `src/main.jsx` |

Stages 1–4 can be verified immediately: Classic paths are unaffected, and toggling `navStyle` in the store (via devtools or a test) switches to the Modern shell. Stages 5–12 build the visual surface iteratively; each stage adds a new component that can be tested in isolation before the next is wired.

---

## Decision Points for Implementer

1. **`navStyle` localStorage sync pattern:** Locate where `fontSize` and `theme` are currently synced (check if `useLocalPreference` is wired in `AppRoutes`, a settings component, or the store setters) and mirror that pattern exactly.

2. **SettingsMenu panel overflow:** The panel uses `position: absolute; right: 0` relative to its container. If the container is rendered inside a flex container with `overflow: hidden`, the panel may be clipped. Verify this works in the existing header layout and add `overflow: visible` or restructure if needed.

3. **TeachingCard and InCategorySearchResults as inline functions:** Declared as named functions inside `CategoryBrowser.jsx`. This is the recommended approach given minimal reuse outside that file. If future screens need TeachingCard, extract it to `src/components/ModernApp/TeachingCard.jsx` at that time.

4. **BibleDrawer `onReopen` vs. local state:** The current design passes `onReopen` from `ModernApp` to `BibleDrawer` so tapping the peek pill can set `bibleOpen = true` in the parent. An alternative is to let `BibleDrawer` manage `internalOpen` fully and only notify the parent of close events. Either approach works; the `onReopen` prop approach is simpler to trace.

5. **BibleDrawer `window.innerHeight`:** Used in constants. If the window is resized, `DEFAULT_HEIGHT` and `MAX_HEIGHT` are stale. This is acceptable for the initial implementation. Add a `resize` listener later if this becomes a problem.

6. **`navStyle` read timing:** `useLocalPreference` initializes from `localStorage` synchronously in its `useState` initializer, so the first render will use the persisted value. No flash or loading gate is needed.
