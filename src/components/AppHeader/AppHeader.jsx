import { Menu } from 'lucide-react'
import ModeSwitcher from '../ModeSwitcher/ModeSwitcher.jsx'
import SettingsMenu from '../SettingsMenu/SettingsMenu.jsx'

export default function AppHeader({ onOpenDrawer }) {
  return (
    <header className="app-header">
      <button
        className="btn-contents"
        onClick={onOpenDrawer}
        aria-label="Open table of contents"
      >
        <Menu size={16} />
        Contents
      </button>

      <h1 className="app-header__title">
        Jesus <span>Says</span>
      </h1>

      <div className="app-header__actions">
        <ModeSwitcher />
        <SettingsMenu />
      </div>
    </header>
  )
}
