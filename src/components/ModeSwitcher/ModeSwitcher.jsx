import { useNavigate } from 'react-router-dom'
import useStore from '../../store.js'

const MODES = [
  { key: 'category', label: 'Categories', path: '/category/cat-1' },
  { key: 'book', label: 'Books', path: '/book/Matt' }
]

export default function ModeSwitcher() {
  const activeMode = useStore((s) => s.activeMode)
  const setActiveMode = useStore((s) => s.setActiveMode)
  const navigate = useNavigate()

  function handleSwitch(mode) {
    setActiveMode(mode.key)
    navigate(mode.path)
  }

  return (
    <div className="mode-switcher" role="tablist" aria-label="Browse mode">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          role="tab"
          aria-selected={activeMode === mode.key}
          className={`mode-switcher__btn${activeMode === mode.key ? ' mode-switcher__btn--active' : ''}`}
          onClick={() => handleSwitch(mode)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
