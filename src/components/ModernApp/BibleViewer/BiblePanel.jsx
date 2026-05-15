import { useRef, useEffect, useState } from 'react'
import useStore from '../../../store.js'
import TranslationPicker from './TranslationPicker.jsx'
import BookPicker from './BookPicker.jsx'
import ChapterPicker from './ChapterPicker.jsx'
import BibleBrowser from './BibleBrowser.jsx'
import '../../../styles/bible-viewer.css'

export default function BiblePanel({ bibleRef, open, pinned, onClose, onTogglePin }) {
  const closeTimerRef = useRef(null)
  const bibleBrowseBook = useStore(s => s.bibleBrowseBook)
  const setBibleBrowseTarget = useStore(s => s.setBibleBrowseTarget)

  const [pickerBook, setPickerBook] = useState(
    bibleRef?.bookAbbr ?? bibleBrowseBook ?? 'John'
  )

  // Mount BibleBrowser lazily so it doesn't fire API calls / scrollIntoView while panel is hidden
  const [everOpened, setEverOpened] = useState(false)
  useEffect(() => { if (open) setEverOpened(true) }, [open])

  // Sync picker book when teaching navigation changes the active book
  useEffect(() => {
    if (bibleRef?.bookAbbr) setPickerBook(bibleRef.bookAbbr)
  }, [bibleRef?.bookAbbr])

  function handleBookPick(abbr) {
    setPickerBook(abbr)
    setBibleBrowseTarget({ bookAbbr: abbr, chapter: 1 })
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

  return (
    <div
      className={`modern-bible-panel${open ? ' modern-bible-panel--open' : ''}${pinned ? ' modern-bible-panel--pinned' : ''}`}
      onMouseEnter={onPanelMouseEnter}
      onMouseLeave={onPanelMouseLeave}
    >
      <div className="modern-panel-header">
        <div className="modern-panel-ref-block">
          <div className="modern-panel-ref-row">
            <div className="modern-panel-ref">{bibleRef?.label ?? '—'}</div>
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
            <ChapterPicker book={pickerBook} onPick={handleChapterPick} />
          </div>
        </div>
      </div>
      <div className="modern-panel-body">
        {everOpened && <BibleBrowser bibleRef={bibleRef} />}
      </div>
    </div>
  )
}
