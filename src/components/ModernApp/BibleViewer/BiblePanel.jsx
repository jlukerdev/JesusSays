import { useRef, useEffect } from 'react'

export default function BiblePanel({ bibleRef, open, pinned, onClose, onTogglePin }) {
  const closeTimerRef = useRef(null)

  function onPanelMouseLeave() {
    if (pinned) return
    closeTimerRef.current = setTimeout(() => onClose(), 600)
  }

  function onPanelMouseEnter() {
    clearTimeout(closeTimerRef.current)
  }

  useEffect(() => () => clearTimeout(closeTimerRef.current), [])

  return (
    <div
      className={`modern-bible-panel${open ? ' modern-bible-panel--open' : ''}${pinned ? ' modern-bible-panel--pinned' : ''}`}
      onMouseEnter={onPanelMouseEnter}
      onMouseLeave={onPanelMouseLeave}
    >
      <div className="modern-panel-header">
        <div className="modern-panel-ref-block">
          <div className="modern-panel-ref">{bibleRef?.label ?? '—'}</div>
          <div className="modern-panel-context">{bibleRef?.book}</div>
        </div>
        <div className="modern-panel-actions">
          <button
            className={`modern-panel-pin-btn${pinned ? ' modern-panel-pin-btn--pinned' : ''}`}
            onClick={onTogglePin}
            aria-label={pinned ? 'Unpin panel' : 'Pin panel'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="7" y1="8" x2="7" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M4 7.5C4 5.5 3.5 3.5 5 2.5H9C10.5 3.5 10 5.5 10 7.5H4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
              <line x1="3" y1="7.5" x2="11" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="modern-panel-body">
        <div className="modern-panel-placeholder">
          Bible text will appear here when the scripture API is connected.
        </div>
      </div>
    </div>
  )
}
