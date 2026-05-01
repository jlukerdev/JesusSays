import { useState } from 'react'
import useStore from '../../store.js'
import ModernNavBar from './ModernNavBar.jsx'
import ModernSearchBar from './ModernSearchBar.jsx'
import HomeScreen from './HomeScreen.jsx'
import CategoryBrowser from './CategoryBrowser.jsx'
import TeachingDetail from './TeachingDetail.jsx'
import PrevNextBar from './PrevNextBar.jsx'
import BibleViewer from './BibleViewer/BibleViewer.jsx'

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

  const [currentCatId, setCurrentCatId] = useState(null)
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [currentTeaching, setCurrentTeaching] = useState(null)
  const [activeBookFilter, setActiveBookFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bibleRef, setBibleRef] = useState(null)
  const [bibleOpen, setBibleOpen] = useState(false)
  const [biblePinned, setBiblePinned] = useState(false)

  function showScreen(entry) {
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
      setCurrentCatId(null)
      setCurrentTabIndex(0)
      setCurrentTeaching(null)
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

      {currentScreen !== 'teaching' && (
        <ModernSearchBar
          currentScreen={currentScreen}
          currentCatId={currentCatId}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

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
                setSearchQuery('')
              }}
              onBookFilterChange={setActiveBookFilter}
              onNavigateToTeaching={(teachingId) =>
                showScreen({ screen: 'teaching', teachingId, catId: currentCatId, tabIndex: currentTabIndex })}
              onOpenBible={(ref) => { setBibleRef(ref); setBibleOpen(true) }}
              onClearSearch={() => setSearchQuery('')}
              onGoHome={() => showScreen({ screen: 'home' })}
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
              onGoToSubcat={() => showScreen({ screen: 'category', catId: currentCatId, tabIndex: currentTabIndex })}
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
