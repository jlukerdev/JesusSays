import { useState, useEffect, useRef } from 'react'
import useStore from '../../../store.js'
import TranslationPicker from './TranslationPicker.jsx'
import BookPicker from './BookPicker.jsx'
import ChapterPicker from './ChapterPicker.jsx'
import BibleBrowser from './BibleBrowser.jsx'
import BibleDownloadBanner from './BibleDownloadBanner.jsx'
import '../../../styles/bible-viewer.css'

export default function BibleDrawer({ bibleRef, open, onClose }) {
  const [drawerH, setDrawerH] = useState(0)
  const [isPeeking, setIsPeeking] = useState(false)
  const [lastRef, setLastRef] = useState(null)
  const dragStartY = useRef(null)
  const dragStartH = useRef(null)

  const bibleBrowseBook    = useStore(s => s.bibleBrowseBook)
  const bibleBrowseChapter = useStore(s => s.bibleBrowseChapter)
  const setBibleBrowseTarget = useStore(s => s.setBibleBrowseTarget)

  const [pickerBook, setPickerBook] = useState(
    bibleRef?.bookAbbr ?? bibleBrowseBook ?? 'John'
  )

  // Mount BibleBrowser lazily so it doesn't fire API calls / scrollIntoView while drawer is closed
  const [everOpened, setEverOpened] = useState(false)
  useEffect(() => { if (open) setEverOpened(true) }, [open])

  const PEEK_HEIGHT    = 48
  const DEFAULT_HEIGHT = Math.round(window.innerHeight * 0.55)
  const MAX_HEIGHT     = Math.round(window.innerHeight * 0.90)

  // Reset height only when transitioning from closed → open
  useEffect(() => {
    if (open && !isPeeking) {
      setDrawerH(prev => prev > PEEK_HEIGHT + 20 ? prev : DEFAULT_HEIGHT)
    }
  }, [open])

  // When bibleRef changes while open: unpeek if peeking, always update lastRef
  useEffect(() => {
    if (!bibleRef) return
    setLastRef(bibleRef)
    if (isPeeking) {
      setIsPeeking(false)
      setDrawerH(DEFAULT_HEIGHT)
    }
  }, [bibleRef])

  // Sync picker book when scroll position changes the active book
  useEffect(() => {
    if (bibleBrowseBook) setPickerBook(bibleBrowseBook)
  }, [bibleBrowseBook])

  // Use lastRef as fallback so content stays visible when drawer is peeking
  const activeRef = bibleRef ?? lastRef

  function handleBookPick(abbr) {
    setPickerBook(abbr)
    setBibleBrowseTarget({ bookAbbr: abbr, chapter: 1 })
  }

  function handleChapterPick(chapter) {
    setBibleBrowseTarget({ bookAbbr: pickerBook, chapter })
  }

  function onDragStart(clientY) {
    dragStartY.current = clientY
    dragStartH.current = drawerH
  }

  function onDragMove(clientY) {
    const delta = dragStartY.current - clientY
    setDrawerH(Math.min(MAX_HEIGHT, Math.max(0, dragStartH.current + delta)))
  }

  function onDragEnd() {
    if (drawerH <= PEEK_HEIGHT + 20) {
      setDrawerH(PEEK_HEIGHT); setIsPeeking(true)
    } else if (isPeeking) {
      setIsPeeking(false)
    }
  }

  function handleClose() {
    setDrawerH(0); setIsPeeking(false); onClose()
  }

  return (
    <div
      className={`modern-bible-drawer${open || isPeeking ? ' modern-bible-drawer--open' : ''}`}
      style={{ height: `${drawerH}px` }}
    >
      <div className="modern-drawer-handle-zone"
        onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
        onTouchEnd={onDragEnd}
        onMouseDown={(e) => {
          onDragStart(e.clientY)
          const onMove = (ev) => onDragMove(ev.clientY)
          const onUp = () => {
            onDragEnd()
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
          }
          window.addEventListener('mousemove', onMove)
          window.addEventListener('mouseup', onUp)
        }}
      >
        <div className="modern-drawer-handle" />
        {isPeeking && <div className="modern-drawer-handle-label">{activeRef?.label ?? 'Scripture'}</div>}
      </div>

      {!isPeeking && (
        <div className="modern-drawer-contents">
          <div className="modern-drawer-header">
            <div className="modern-drawer-ref-block">
              <div className="modern-drawer-ref-row">
                <div className="modern-drawer-ref">{bibleBrowseBook ? `${bibleBrowseBook} ${bibleBrowseChapter}` : '—'}</div>
              </div>
              <div className="bible-picker-row">
                <TranslationPicker />
                <BookPicker activeBook={pickerBook} onPick={handleBookPick} />
                <ChapterPicker book={pickerBook} onPick={handleChapterPick} activeChapter={bibleBrowseChapter} />
              </div>
            </div>
            <button className="modern-drawer-close" onClick={handleClose} aria-label="Close">✕</button>
          </div>
          <div className="modern-drawer-body">
            <BibleDownloadBanner />
            {everOpened && <BibleBrowser bibleRef={activeRef} />}
          </div>
        </div>
      )}
    </div>
  )
}
