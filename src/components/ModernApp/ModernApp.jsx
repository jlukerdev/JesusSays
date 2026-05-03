import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import useStore from '../../store.js'
import ModernNavBar from './ModernNavBar.jsx'
import ModernSearchBar from './ModernSearchBar.jsx'
import CategoryTOC from './CategoryTOC.jsx'
import CategoryBrowser from './CategoryBrowser.jsx'
import TeachingDetail from './TeachingDetail.jsx'
import BibleViewer from './BibleViewer/BibleViewer.jsx'
import HomeScreen from './HomeScreen.jsx'
import { useIsMobile } from '../../hooks/useBreakpoint.js'

function findTeachingById(teachingId, categories) {
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      const found = sub.teachings.find(t => t.id === teachingId)
      if (found) return found
    }
  }
  return null
}

export default function ModernApp() {
  const categories = useStore((s) => s.categories ?? [])
  const isMobile = useIsMobile()

  const [currentCatId, setCurrentCatId] = useState(null)
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [currentTeaching, setCurrentTeaching] = useState(null)
  const [activeBookFilter, setActiveBookFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bibleRef, setBibleRef] = useState(null)
  const [bibleOpen, setBibleOpen] = useState(false)
  const [biblePinned, setBiblePinned] = useState(false)
  const [tocVisible, setTocVisible] = useState(true)

  function showScreen(entry) {
    setSearchQuery('')
    if (entry.screen === 'category') {
      if (entry.catId !== currentCatId) setActiveBookFilter(null)
      setCurrentCatId(entry.catId)
      setCurrentTabIndex(entry.tabIndex ?? 0)
      setCurrentTeaching(null)
      setTocVisible(false)
    } else if (entry.screen === 'teaching') {
      setCurrentCatId(entry.catId)
      setCurrentTabIndex(entry.tabIndex ?? 0)
      setCurrentTeaching(findTeachingById(entry.teachingId, categories))
      setTocVisible(false)
    } else {
      setCurrentCatId(null)
      setCurrentTabIndex(0)
      setCurrentTeaching(null)
      setTocVisible(true)
    }
  }

  const currentScreen = currentTeaching !== null ? 'teaching' : currentCatId !== null ? 'category' : 'home'

  return (
    <div className="modern-app">
      <ModernNavBar
        currentScreen={currentScreen}
        currentCatId={currentCatId}
        currentTabIndex={currentTabIndex}
        categories={categories}
        onGoHome={() => showScreen({ screen: 'home' })}
      />

      <div className="modern-screen-area">
        <ModernSearchBar
          disabled={currentScreen === 'teaching'}
          currentCatId={currentCatId}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q)
            if (isMobile && currentScreen === 'home') setTocVisible(!q)
          }}
        />

        <div className={`modern-two-pane${isMobile && currentScreen === 'home' && !searchQuery ? ' modern-two-pane--toc-only' : ''}`}>
          <div
            className={`modern-toc-pane${currentScreen !== 'home' ? ' modern-toc-pane--overlay' : ''}${!tocVisible ? ' modern-toc-pane--hidden' : ''}`}
            onMouseLeave={currentScreen !== 'home' ? () => setTocVisible(false) : undefined}
          >
            <CategoryTOC
              categories={categories}
              currentCatId={currentCatId}
              onNavigateToCategory={(catId) => showScreen({ screen: 'category', catId, tabIndex: 0 })}
              onGoHome={() => showScreen({ screen: 'home' })}
            />
          </div>

          <div className={`modern-content-pane${biblePinned && bibleOpen ? ' modern-panel-pinned' : ''}`}>
            {currentScreen === 'home' && (
              searchQuery ? (
                <HomeScreen
                  categories={categories}
                  searchQuery={searchQuery}
                  onNavigateToCategory={(catId, tabIndex) => showScreen({ screen: 'category', catId, tabIndex })}
                  onNavigateToTeaching={(teachingId, catId, tabIndex) =>
                    showScreen({ screen: 'teaching', teachingId, catId, tabIndex })}
                  onClearSearch={() => setSearchQuery('')}
                />
              ) : (
                !isMobile && (
                  <div className="modern-home-placeholder">
                    <BookOpen className="modern-home-placeholder__icon" aria-hidden="true" />
                    <h2 className="modern-home-placeholder__heading">Explore the Words of Jesus</h2>
                    <p className="modern-home-placeholder__body">
                      Choose a <strong>Topic</strong> to dive into a theme,
                      or use the <Search size={14} className="modern-home-placeholder__inline-icon" aria-hidden="true" /> <strong>search bar</strong> above to find teachings by keyword.
                    </p>
                  </div>
                )
              )
            )}

            {currentScreen === 'category' && currentCatId !== null && (
              <CategoryBrowser
                catId={currentCatId}
                tabIndex={currentTabIndex}
                categories={categories}
                activeBookFilter={activeBookFilter}
                searchQuery={searchQuery}
                onTabChange={(idx) => {
                  setCurrentTabIndex(idx)
                  setSearchQuery('')
                }}
                onBookFilterChange={setActiveBookFilter}
                onNavigateToTeaching={(teachingId) =>
                  showScreen({ screen: 'teaching', teachingId, catId: currentCatId, tabIndex: currentTabIndex })}
                onOpenBible={(ref) => { setBibleRef(ref); setBibleOpen(true) }}
                onClearSearch={() => setSearchQuery('')}
                onGoHome={() => showScreen({ screen: 'home' })}
                onShowToc={() => setTocVisible(v => !v)}
              />
            )}

            {currentScreen === 'teaching' && currentTeaching !== null && (
              <TeachingDetail
                teaching={currentTeaching}
                catId={currentCatId}
                tabIndex={currentTabIndex}
                categories={categories}
                onOpenBible={(ref) => { setBibleRef(ref); setBibleOpen(true) }}
                onGoToSubcat={() => showScreen({ screen: 'category', catId: currentCatId, tabIndex: currentTabIndex })}
              />
            )}
          </div>
        </div>
      </div>

      <BibleViewer
        bibleRef={bibleRef}
        open={bibleOpen}
        pinned={biblePinned}
        onClose={() => setBibleOpen(false)}
        onTogglePin={() => setBiblePinned(p => !p)}
        onReopen={() => setBibleOpen(true)}
      />
    </div>
  )
}
