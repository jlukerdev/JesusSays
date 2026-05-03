import { useState, useEffect, useRef } from 'react'

export default function BibleDrawer({ bibleRef, open, onClose }) {
  const [drawerH, setDrawerH] = useState(0)
  const [isPeeking, setIsPeeking] = useState(false)
  const [lastRef, setLastRef] = useState(null)
  const dragStartY = useRef(null)
  const dragStartH = useRef(null)

  const PEEK_HEIGHT = 48
  const DEFAULT_HEIGHT = Math.round(window.innerHeight * 0.55)
  const MAX_HEIGHT = Math.round(window.innerHeight * 0.90)

  useEffect(() => {
    if (open && !isPeeking) {
      setDrawerH(DEFAULT_HEIGHT)
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
  )
}
