import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store.js'
import { ENABLE_ABOUT_PAGE } from '../../featureFlags.js'
import './SettingsMenu.css'

export default function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef(null)
  const navigate = useNavigate()

  const setShowAbout = useStore((s) => s.setShowAbout)
  const bibleFontSize = useStore((s) => s.bibleFontSize)
  const setBibleFontSize = useStore((s) => s.setBibleFontSize)

  const MIN_BIBLE_FONT = 11
  const MAX_BIBLE_FONT = 22

  function handleOpen() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPanelPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setOpen((o) => !o)
  }

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
      <button ref={triggerRef} className="settings-menu__trigger" aria-label="Open settings" aria-expanded={open} onClick={handleOpen}>
        <Settings size={20} />
      </button>
      {open && createPortal(
        <>
          <div className="settings-menu__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="settings-menu__panel" role="menu" style={{ top: panelPos.top, right: panelPos.right }}>
            {/* App Theme section hidden until more themes are available */}
            {/* <div className="settings-menu__section">
              <div className="settings-menu__section-label">App Theme</div>
              <div className="settings-menu__option-row">
                <button className={`settings-menu__option${theme === 'classic' ? ' settings-menu__option--active' : ''}`} onClick={() => { setTheme('classic'); setOpen(false) }}>Classic</button>
              </div>
            </div> */}
            <div className="settings-menu__section">
              <div className="settings-menu__section-label">Bible Text Size</div>
              <div className="settings-menu__size-row">
                <button
                  className="settings-menu__size-btn"
                  aria-label="Decrease bible text size"
                  disabled={bibleFontSize <= MIN_BIBLE_FONT}
                  onClick={() => setBibleFontSize(Math.max(MIN_BIBLE_FONT, bibleFontSize - 1))}
                >−</button>
                <button
                  className="settings-menu__size-btn"
                  aria-label="Increase bible text size"
                  disabled={bibleFontSize >= MAX_BIBLE_FONT}
                  onClick={() => setBibleFontSize(Math.min(MAX_BIBLE_FONT, bibleFontSize + 1))}
                >+</button>
                <span className="settings-menu__size-label">{bibleFontSize}px</span>
              </div>
            </div>
            {import.meta.env.DEV && (
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
        </>,
        document.body
      )}
    </div>
  )
}
