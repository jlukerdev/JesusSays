import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore from '../../store.js'
import { useLocalPreference } from '../../hooks/useLocalPreference.js'
import { ENABLE_ABOUT_PAGE } from '../../featureFlags.js'
import AboutContent from './AboutContent.jsx'
import VersionView from './VersionView.jsx'

// __APP_VERSION__ is replaced at build time by vite.config.js define
export default function AboutPanel() {
  const showAbout = useStore((s) => s.showAbout)
  const setShowAbout = useStore((s) => s.setShowAbout)
  const [, setViewedVersion] = useLocalPreference('aboutViewedVersion', null)
  const [activeView, setActiveView] = useState('about')
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (showAbout) setActiveView('about')
  }, [showAbout])

  useEffect(() => {
    if (!showAbout) return
    function onKeyDown(e) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showAbout])

  function handleClose() {
    setViewedVersion(__APP_VERSION__)
    setClosing(true)
    setTimeout(() => {
      setShowAbout(false)
      setClosing(false)
    }, 320)
  }

  if (!ENABLE_ABOUT_PAGE || !showAbout) return null

  return (
    <div
      className={`about-overlay${closing ? ' about-overlay--closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="About Jesus Says"
    >
      <div className="about-overlay__backdrop" onClick={handleClose} aria-hidden="true" />
      <div className={`about-panel${closing ? ' about-panel--closing' : ''}`}>
        <button
          className="about-panel__close"
          onClick={handleClose}
          aria-label="Close about panel"
        >
          <X size={18} />
        </button>
        <div className="about-panel__scroll">
          {activeView === 'about' ? (
            <AboutContent onShowVersion={() => setActiveView('version')} />
          ) : (
            <VersionView onBack={() => setActiveView('about')} />
          )}
        </div>
      </div>
    </div>
  )
}
