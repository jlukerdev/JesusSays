import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store.js'
import { ENABLE_CLASSIC_NAV, ENABLE_CATALOG_OPTIMIZER, ENABLE_ABOUT_PAGE } from '../../featureFlags.js'
import './SettingsMenu.css'

export default function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const navStyle = useStore((s) => s.navStyle)
  const setNavStyle = useStore((s) => s.setNavStyle)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const setShowAbout = useStore((s) => s.setShowAbout)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="settings-menu">
      <button className="settings-menu__trigger" aria-label="Open settings" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Settings size={20} />
      </button>
      {open && (
        <>
          <div className="settings-menu__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="settings-menu__panel" role="menu">
            {ENABLE_CLASSIC_NAV && (
              <div className="settings-menu__section">
                <div className="settings-menu__section-label">Nav Style</div>
                <div className="settings-menu__option-row">
                  <button className={`settings-menu__option${navStyle === 'classic' ? ' settings-menu__option--active' : ''}`} onClick={() => { setNavStyle('classic'); setOpen(false) }}>Classic</button>
                  <button className={`settings-menu__option${navStyle === 'modern' ? ' settings-menu__option--active' : ''}`} onClick={() => { setNavStyle('modern'); setOpen(false) }}>Modern</button>
                </div>
              </div>
            )}
            <div className="settings-menu__section">
              <div className="settings-menu__section-label">App Theme</div>
              <div className="settings-menu__option-row">
                <button className={`settings-menu__option${theme === 'classic' ? ' settings-menu__option--active' : ''}`} onClick={() => { setTheme('classic'); setOpen(false) }}>Classic</button>
              </div>
            </div>
            {ENABLE_CATALOG_OPTIMIZER && (
              <>
                <div className="settings-menu__divider" />
                <button className="settings-menu__action" onClick={() => { navigate('/catalog-optimizer'); setOpen(false) }}>Catalog Optimizer</button>
              </>
            )}
            {ENABLE_ABOUT_PAGE && (
              <>
                <div className="settings-menu__divider" />
                <button className="settings-menu__action" onClick={() => { setShowAbout(true); setOpen(false) }}>About</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
