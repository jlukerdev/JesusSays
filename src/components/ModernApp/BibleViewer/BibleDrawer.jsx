import { useState, useEffect, useRef } from 'react'

export default function BibleDrawer({ bibleRef, open, onClose, onReopen }) {
  const [drawerH, setDrawerH] = useState(0)
  const [isPeeking, setIsPeeking] = useState(false)
  const [showPeekPill, setShowPeekPill] = useState(false)
  const [lastRef, setLastRef] = useState(null)
  const dragStartY = useRef(null)
  const dragStartH = useRef(null)

  const PEEK_HEIGHT = 48
  const DEFAULT_HEIGHT = Math.round(window.innerHeight * 0.55)
  const MAX_HEIGHT = Math.round(window.innerHeight * 0.90)
  const DISMISS_THRESHOLD = 24

  useEffect(() => {
    if (open && !isPeeking) {
      setDrawerH(DEFAULT_HEIGHT)
      setShowPeekPill(false)
      if (bibleRef) setLastRef(bibleRef)
    }
  }, [open, bibleRef])

  useEffect(() => {
    if (bibleRef && isPeeking) {
      setIsPeeking(false)
      setDrawerH(DEFAULT_HEIGHT)
    }
    if (bibleRef) setLastRef(bibleRef)
  }, [bibleRef])

  function onDragStart(clientY) {
    dragStartY.current = clientY
    dragStartH.current = drawerH
  }

  function onDragMove(clientY) {
    const delta = dragStartY.current - clientY
    setDrawerH(Math.min(MAX_HEIGHT, Math.max(0, dragStartH.current + delta)))
  }

  function onDragEnd() {
    if (drawerH <= DISMISS_THRESHOLD) {
      setDrawerH(0); setIsPeeking(false); onClose(); setShowPeekPill(true)
    } else if (drawerH <= PEEK_HEIGHT + 20) {
      setDrawerH(PEEK_HEIGHT); setIsPeeking(true)
    }
  }

  function handleClose() {
    setDrawerH(0); setIsPeeking(false); onClose(); setShowPeekPill(!!lastRef)
  }

  function handlePeekPillTap() {
    setDrawerH(DEFAULT_HEIGHT); setIsPeeking(false); setShowPeekPill(false); onReopen()
  }

  return (
    <>
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
          {isPeeking && <div className="modern-drawer-handle-label">{lastRef?.label ?? 'Scripture'}</div>}
        </div>

        {!isPeeking && (
          <div className="modern-drawer-contents">
            <div className="modern-drawer-header">
              <div className="modern-drawer-ref-block">
                <div className="modern-drawer-ref">{bibleRef?.label ?? '—'}</div>
                <div className="modern-drawer-context">{bibleRef?.book}</div>
              </div>
              <button className="modern-drawer-close" onClick={handleClose} aria-label="Close">✕</button>
            </div>
            <div className="modern-drawer-body">
              <div className="modern-panel-placeholder">
                Bible text will appear here when the scripture API is connected.
              </div>
            </div>
          </div>
        )}
      </div>

      {showPeekPill && (
        <button className="modern-bible-peek-pill" onClick={handlePeekPillTap}>
          <div className="modern-bible-peek-pill__dot" />
          <span>{lastRef?.label ?? 'Open Scripture'}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 8L6 4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </>
  )
}
