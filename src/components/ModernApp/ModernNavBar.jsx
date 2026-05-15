import { BookOpen } from 'lucide-react'
import SettingsMenu from '../SettingsMenu/SettingsMenu.jsx'

export default function ModernNavBar({
  currentScreen,
  onGoHome,
  onOpenBibleViewer,
}) {
  const isHome = currentScreen === 'home'

  return (
    <nav className="modern-nav">
      <div className="modern-nav__left">
        <span className={`modern-nav__logo${!isHome ? ' modern-nav__logo--offhome' : ''}`} onClick={!isHome ? onGoHome : undefined}>
          Jesus <span>Says</span>
        </span>
      </div>
      <div className="modern-nav__actions">
        <button
          className="modern-nav__bible-btn"
          aria-label="Open Bible viewer"
          onClick={onOpenBibleViewer}
        >
          <BookOpen size={20} />
        </button>
        <SettingsMenu />
      </div>
    </nav>
  )
}
