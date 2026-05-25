import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import useStore from '../../../store.js'
import { CATALOG_CHAPTERS } from '../../../utils/bookOrder.js'
import { RESTRICT_TO_CATALOG } from '../../../featureFlags.js'
import TranslationPicker from './TranslationPicker.jsx'
import BookPicker from './BookPicker.jsx'
import ChapterPicker from './ChapterPicker.jsx'
import BibleBrowser from './BibleBrowser.jsx'
import BibleDownloadBanner from './BibleDownloadBanner.jsx'
import '../../../styles/bible-viewer.css'

const PANEL_MIN_WIDTH = 380
const PANEL_STORAGE_KEY = 'biblePanelWidth'

export default function BiblePanel({ bibleRef, open, pinned, onClose, onTogglePin, onWidthChange }) {
  const closeTimerRef = useRef(null)
  const dragStartX = useRef(null)
  const dragStartW = useRef(null)
  const currentDragW = useRef(null)
  const bibleBrowseBook    = useStore(s => s.bibleBrowseBook)
  const bibleBrowseChapter = useStore(s => s.bibleBrowseChapter)
  const setBibleBrowseTarget = useStore(s => s.setBibleBrowseTarget)

  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem(PANEL_STORAGE_KEY), 10)
    return isNaN(saved) ? PANEL_MIN_WIDTH : Math.max(saved, PANEL_MIN_WIDTH)
  })

  const [pickerBook, setPickerBook] = useState(
    bibleRef?.bookAbbr ?? bibleBrowseBook ?? 'John'
  )

  // Mount BibleBrowser lazily and only after the open transition settles (300ms).
  // This prevents mid-transition DOM mutations inside the panel from causing layout jank.
  const [everOpened, setEverOpened] = useState(open) // true immediately if panel starts pinned-open
  const panelOpenedAt = useRef(null)   // timestamp of the most recent closed→open transition
  const wasOpenRef    = useRef(open)   // tracks previous open value without causing re-renders

  useLayoutEffect(() => {
    // Record the moment the panel transitions from closed → open (not on initial mount).
    // useLayoutEffect runs before child useEffects, so BibleBrowser can read this in its effects.
    if (open && !wasOpenRef.current) {
      panelOpenedAt.current = Date.now()
    }
    wasOpenRef.current = open
  }, [open])

  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => setEverOpened(true), 320)
    return () => clearTimeout(id)
  }, [open])

  // Sync picker book when scroll position changes the active book
  useEffect(() => {
    if (bibleBrowseBook) setPickerBook(bibleBrowseBook)
  }, [bibleBrowseBook])

  function handleBookPick(abbr) {
    setPickerBook(abbr)
    const firstChapter = RESTRICT_TO_CATALOG ? (CATALOG_CHAPTERS[abbr]?.[0] ?? 1) : 1
    setBibleBrowseTarget({ bookAbbr: abbr, chapter: firstChapter })
  }

  function handleChapterPick(chapter) {
    setBibleBrowseTarget({ bookAbbr: pickerBook, chapter })
  }

  function onPanelMouseLeave() {
    if (pinned) return
    closeTimerRef.current = setTimeout(() => onClose(), 600)
  }

  function onPanelMouseEnter() {
    clearTimeout(closeTimerRef.current)
  }

  useEffect(() => () => clearTimeout(closeTimerRef.current), [])

  function onDragStart(clientX) {
    dragStartX.current = clientX
    dragStartW.current = panelWidth
    currentDragW.current = panelWidth
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  function onDragMove(clientX) {
    const newW = Math.max(PANEL_MIN_WIDTH, dragStartW.current + (dragStartX.current - clientX))
    currentDragW.current = newW
    setPanelWidth(newW)
    onWidthChange?.(newW, true)
  }

  function onDragEnd() {
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    const w = currentDragW.current ?? panelWidth
    localStorage.setItem(PANEL_STORAGE_KEY, String(w))
    onWidthChange?.(w, false)
  }

  return (
    <div
      className={`modern-bible-panel${open ? ' modern-bible-panel--open' : ''}${pinned ? ' modern-bible-panel--pinned' : ''}`}
      style={{ width: `${panelWidth}px` }}
      onMouseEnter={onPanelMouseEnter}
      onMouseLeave={onPanelMouseLeave}
    >
      {pinned && (
        <div
          className="modern-panel-drag-handle"
          onMouseDown={(e) => {
            e.preventDefault()
            onDragStart(e.clientX)
            const onMove = (ev) => onDragMove(ev.clientX)
            const onUp = () => {
              onDragEnd()
              window.removeEventListener('mousemove', onMove)
              window.removeEventListener('mouseup', onUp)
            }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
        >
          <div className="modern-panel-drag-handle__bar" />
        </div>
      )}
      <div className="modern-panel-header">
        <div className="modern-panel-ref-block">
          <div className="modern-panel-ref-row">
            <div className="modern-panel-ref">{bibleBrowseBook ? `${bibleBrowseBook} ${bibleBrowseChapter}` : '—'}</div>
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
          <div className="bible-picker-row">
            <TranslationPicker />
            <BookPicker activeBook={pickerBook} onPick={handleBookPick} />
            <ChapterPicker book={pickerBook} onPick={handleChapterPick} activeChapter={bibleBrowseChapter} />
          </div>
        </div>
      </div>
      <div className="modern-panel-body">
        <BibleDownloadBanner />
        {everOpened && <BibleBrowser bibleRef={bibleRef} panelOpenedAt={panelOpenedAt} />}
      </div>
    </div>
  )
}
