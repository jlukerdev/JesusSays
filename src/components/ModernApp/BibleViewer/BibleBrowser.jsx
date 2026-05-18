import { useState, useEffect, useCallback, useRef } from 'react'
import useStore from '../../../store.js'
import { bibleApi } from '../../../data/bibleApi.js'
import { OfflineOnlyError } from '../../../data/BibleOfflineStore.js'
import { NT_BOOKS } from '../../../utils/bookOrder.js'
import BibleContent from './BibleContent.jsx'

const NT_BOOKS_MAP = Object.fromEntries(NT_BOOKS.map(b => [b.abbr, b]))

function getPrevTarget(bookAbbr, chapterNum) {
  const book = NT_BOOKS_MAP[bookAbbr]
  if (!book) return null
  if (chapterNum > 1) return { bookAbbr, chapterNum: chapterNum - 1 }
  const idx = NT_BOOKS.findIndex(b => b.abbr === bookAbbr)
  if (idx <= 0) return null
  const prevBook = NT_BOOKS[idx - 1]
  return { bookAbbr: prevBook.abbr, chapterNum: prevBook.chapters }
}

function getNextTarget(bookAbbr, chapterNum) {
  const book = NT_BOOKS_MAP[bookAbbr]
  if (!book) return null
  if (chapterNum < book.chapters) return { bookAbbr, chapterNum: chapterNum + 1 }
  const idx = NT_BOOKS.findIndex(b => b.abbr === bookAbbr)
  if (idx >= NT_BOOKS.length - 1) return null
  const nextBook = NT_BOOKS[idx + 1]
  return { bookAbbr: nextBook.abbr, chapterNum: 1 }
}

function LoadingDots() {
  return (
    <div className="bible-loading-dots">
      <span /><span /><span />
    </div>
  )
}

function BibleNavBar({ direction, target, onNavigate }) {
  if (!target) return null
  const targetBook = NT_BOOKS_MAP[target.bookAbbr]
  const isBookJump = direction === 'prev'
    ? target.chapterNum === targetBook?.chapters
    : target.chapterNum === 1

  const label = direction === 'prev'
    ? isBookJump
      ? `← ${targetBook?.fullName} (Ch ${target.chapterNum})`
      : `← Ch ${target.chapterNum}`
    : isBookJump
      ? `→ ${targetBook?.fullName} (Ch ${target.chapterNum})`
      : `→ Ch ${target.chapterNum}`

  return (
    <div className="bible-nav-bar">
      <button
        className={`bible-nav-btn${isBookJump ? ' bible-nav-btn--book' : ''}`}
        onClick={() => onNavigate(target.bookAbbr, target.chapterNum, direction)}
      >
        {label}
      </button>
    </div>
  )
}

function ChapterSegment({ seg, prevSeg, highlightVerses }) {
  const showBookDivider = seg.bookAbbr !== prevSeg?.bookAbbr
  return (
    <div>
      {showBookDivider && (
        <div className="bible-book-divider">{seg.bookName}</div>
      )}
      <div
        className="bible-chapter-header"
        id={`bible-ch-${seg.id}`}
        data-book-abbr={seg.bookAbbr}
        data-chapter-num={seg.chapterNum}
      >
        Chapter {seg.chapterNum}
      </div>
      {seg.loadError
        ? <div className="bible-offline-warning">{seg.loadError}</div>
        : <BibleContent verses={seg.verses} highlightVerses={highlightVerses} />
      }
    </div>
  )
}

export default function BibleBrowser({ bibleRef }) {
  const bibleTranslation      = useStore(s => s.bibleTranslation)
  const bibleBrowseBook       = useStore(s => s.bibleBrowseBook)
  const bibleBrowseChapter    = useStore(s => s.bibleBrowseChapter)
  const setBibleBrowseBook    = useStore(s => s.setBibleBrowseBook)
  const setBibleBrowseChapter = useStore(s => s.setBibleBrowseChapter)
  const bibleBrowseTarget     = useStore(s => s.bibleBrowseTarget)

  const [segments, setSegments]       = useState([])
  const [loadingPrev, setLoadingPrev] = useState(false)
  const [loadingNext, setLoadingNext] = useState(false)
  const prevTranslation               = useRef(bibleTranslation)
  const initialLoadDone               = useRef(false)
  const prevBibleRef                  = useRef(bibleRef) // initialize with current ref so first-render bibleRef effect skips
  const prevBrowseTarget              = useRef(bibleBrowseTarget) // initialize with current value so first-render target effect skips
  const browserRef                    = useRef(null)

  const initialBook    = bibleRef?.bookAbbr ?? bibleBrowseBook ?? 'John'
  const initialChapter = bibleRef?.chapter ?? (bibleBrowseBook ? bibleBrowseChapter : 1)
  const highlightVerses = bibleRef?.ranges ?? []

  function buildErrorSeg(bookAbbr, chapterNum, err) {
    const book = NT_BOOKS_MAP[bookAbbr]
    const isOffline = err instanceof OfflineOnlyError
    return {
      id: `${bookAbbr}-${chapterNum}`,
      bookAbbr,
      bookName: book?.fullName ?? bookAbbr,
      chapterNum,
      verses: null,
      loadError: isOffline ? err.message : 'Failed to load chapter.',
    }
  }

  async function loadAndPrepend(bookAbbr, chapterNum) {
    setLoadingPrev(true)
    try {
      const verses = await bibleApi.getChapter(bibleTranslation, bookAbbr, chapterNum)
      const book   = NT_BOOKS_MAP[bookAbbr]
      const seg    = { id: `${bookAbbr}-${chapterNum}`, bookAbbr, bookName: book?.fullName ?? bookAbbr, chapterNum, verses }
      setSegments(prev => prev.some(s => s.id === seg.id) ? prev : [seg, ...prev])
      requestAnimationFrame(() => {
        document.getElementById(`bible-ch-${seg.id}`)?.scrollIntoView({ behavior: 'instant', block: 'start' })
      })
    } catch (err) {
      const seg = buildErrorSeg(bookAbbr, chapterNum, err)
      setSegments(prev => prev.some(s => s.id === seg.id) ? prev : [seg, ...prev])
    } finally {
      setLoadingPrev(false)
    }
  }

  async function loadAndAppend(bookAbbr, chapterNum, scrollToChapter = false) {
    setLoadingNext(true)
    try {
      const verses = await bibleApi.getChapter(bibleTranslation, bookAbbr, chapterNum)
      const book   = NT_BOOKS_MAP[bookAbbr]
      const seg    = { id: `${bookAbbr}-${chapterNum}`, bookAbbr, bookName: book?.fullName ?? bookAbbr, chapterNum, verses }
      setSegments(prev => prev.some(s => s.id === seg.id) ? prev : [...prev, seg])
      if (scrollToChapter) {
        requestAnimationFrame(() => {
          document.getElementById(`bible-ch-${seg.id}`)?.scrollIntoView({ behavior: 'instant', block: 'start' })
        })
      }
    } catch (err) {
      const seg = buildErrorSeg(bookAbbr, chapterNum, err)
      setSegments(prev => prev.some(s => s.id === seg.id) ? prev : [...prev, seg])
    } finally {
      setLoadingNext(false)
    }
  }

  const navigateTo = useCallback((bookAbbr, chapterNum, direction) => {
    const id = `${bookAbbr}-${chapterNum}`
    const existing = document.getElementById(`bible-ch-${id}`)
    if (existing) {
      existing.scrollIntoView({ behavior: 'instant', block: 'start' })
      return
    }
    if (direction === 'prev') {
      loadAndPrepend(bookAbbr, chapterNum)
    } else {
      loadAndAppend(bookAbbr, chapterNum, true)
    }
  }, [bibleTranslation])

  // Initial load
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true
    if (!bibleBrowseBook) setBibleBrowseBook(initialBook)
    loadAndAppend(initialBook, initialChapter)
  }, [])

  // Navigate when bibleRef changes to a new chapter
  useEffect(() => {
    if (!bibleRef) return
    const prev = prevBibleRef.current
    if (prev?.bookAbbr === bibleRef.bookAbbr && prev?.chapter === bibleRef.chapter) return
    prevBibleRef.current = bibleRef

    const segId = `${bibleRef.bookAbbr}-${bibleRef.chapter}`
    const alreadyLoaded = segments.some(s => s.id === segId)
    if (alreadyLoaded) {
      requestAnimationFrame(() => {
        document.getElementById(`bible-ch-${segId}`)?.scrollIntoView({ behavior: 'instant', block: 'start' })
      })
    } else {
      // Reset and load the new chapter
      initialLoadDone.current = false
      setSegments([])
      setTimeout(() => {
        initialLoadDone.current = true
        loadAndAppend(bibleRef.bookAbbr, bibleRef.chapter)
      }, 0)
    }
  }, [bibleRef])

  // Navigate when picker selects a book/chapter
  useEffect(() => {
    if (!bibleBrowseTarget) return
    if (prevBrowseTarget.current?.bookAbbr === bibleBrowseTarget.bookAbbr &&
        prevBrowseTarget.current?.chapter === bibleBrowseTarget.chapter) return
    prevBrowseTarget.current = bibleBrowseTarget
    setSegments([])
    loadAndAppend(bibleBrowseTarget.bookAbbr, bibleBrowseTarget.chapter)
  }, [bibleBrowseTarget])

  // Reload when translation changes
  useEffect(() => {
    if (prevTranslation.current === bibleTranslation) return
    prevTranslation.current = bibleTranslation
    if (segments.length === 0) return
    const { bookAbbr, chapterNum } = segments[0]
    setSegments([])
    loadAndAppend(bookAbbr, chapterNum)
  }, [bibleTranslation])

  // Scroll-spy: update bibleBrowseBook and bibleBrowseChapter based on visible chapter
  useEffect(() => {
    if (!browserRef.current) return
    const scrollParent = browserRef.current.parentElement
    if (!scrollParent) return

    function updateVisible() {
      const headers = browserRef.current?.querySelectorAll('.bible-chapter-header[data-book-abbr]')
      if (!headers || headers.length === 0) return
      const parentTop = scrollParent.getBoundingClientRect().top
      let current = null
      headers.forEach(el => {
        if (el.getBoundingClientRect().top <= parentTop + 80) {
          current = el
        }
      })
      if (current) {
        setBibleBrowseBook(current.dataset.bookAbbr)
        setBibleBrowseChapter(Number(current.dataset.chapterNum))
      }
    }

    scrollParent.addEventListener('scroll', updateVisible, { passive: true })
    requestAnimationFrame(updateVisible)

    return () => scrollParent.removeEventListener('scroll', updateVisible)
  }, [segments])

  const topSeg    = segments[0]
  const bottomSeg = segments[segments.length - 1]
  const prevOfTop = topSeg ? getPrevTarget(topSeg.bookAbbr, topSeg.chapterNum) : null
  const nextOfBottom = bottomSeg ? getNextTarget(bottomSeg.bookAbbr, bottomSeg.chapterNum) : null

  return (
    <div className="bible-browser" ref={browserRef}>
      {loadingPrev
        ? <LoadingDots />
        : prevOfTop && <BibleNavBar direction="prev" target={prevOfTop} onNavigate={navigateTo} />}

      {segments.map((seg, i) => (
        <ChapterSegment
          key={seg.id}
          seg={seg}
          prevSeg={segments[i - 1] ?? null}
          highlightVerses={
            bibleRef && seg.bookAbbr === bibleRef.bookAbbr && seg.chapterNum === bibleRef.chapter
              ? highlightVerses
              : []
          }
        />
      ))}

      {loadingNext
        ? <LoadingDots />
        : nextOfBottom && <BibleNavBar direction="next" target={nextOfBottom} onNavigate={navigateTo} />}
    </div>
  )
}
