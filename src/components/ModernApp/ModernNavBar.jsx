import SettingsMenu from '../SettingsMenu/SettingsMenu.jsx'

export default function ModernNavBar({
  currentScreen,
  onGoHome,
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
        <SettingsMenu />
      </div>
    </nav>
  )
}
