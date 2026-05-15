import { useState, useEffect, useRef } from 'react'
import { NT_BOOKS } from '../../../utils/bookOrder.js'

const NT_BOOKS_MAP = Object.fromEntries(NT_BOOKS.map(b => [b.abbr, b]))

export default function ChapterPicker({ book, onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const chapterCount = NT_BOOKS_MAP[book]?.chapters ?? 1

  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="translation-flyout" ref={ref}>
      <button
        className="translation-flyout__trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        Ch <span className="translation-flyout__caret">▾</span>
      </button>
      {open && (
        <div className="translation-flyout__menu translation-flyout__menu--chapter" role="listbox">
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map(ch => (
            <button
              key={ch}
              role="option"
              className="translation-flyout__option"
              onClick={() => { onPick(ch); setOpen(false) }}
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
