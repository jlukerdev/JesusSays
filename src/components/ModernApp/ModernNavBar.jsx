import { ChevronLeft } from 'lucide-react'
import SettingsMenu from '../SettingsMenu/SettingsMenu.jsx'

export default function ModernNavBar({
  currentScreen,
  currentCatId,
  currentTabIndex,
  categories,
  onGoHome,
}) {
  const currentCat = categories.find(c => c.id === currentCatId) ?? null
  const currentSubcat = currentCat?.subcategories?.[currentTabIndex] ?? null

  const isHome = currentScreen === 'home'

  let navContent = null
  if (currentScreen === 'category') {
    navContent = <span className="modern-nav__title">{currentCat?.title}</span>
  } else if (!isHome) {
    navContent = (
      <span className="modern-nav__breadcrumb" title={`${currentCat?.title} › ${currentSubcat?.title}`}>
        {currentCat?.title} › {currentSubcat?.title}
      </span>
    )
  }

  return (
    <nav className="modern-nav">
      <div className="modern-nav__left">
        <span className={`modern-nav__logo${!isHome ? ' modern-nav__logo--offhome' : ''}`} onClick={!isHome ? onGoHome : undefined}>
          Jesus <span>Says</span>
        </span>
        {navContent && (
          <div className="modern-nav__left-row">
            {navContent}
            <button className="modern-nav__back-to-topics" onClick={onGoHome}>
              <ChevronLeft size={14} /> Topics
            </button>
          </div>
        )}
      </div>
      <div className="modern-nav__actions">
        <SettingsMenu />
      </div>
    </nav>
  )
}
