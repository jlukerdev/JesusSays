import { useState, useEffect, useRef } from 'react'
import { NT_BOOKS, CATALOG_CHAPTERS } from '../../../utils/bookOrder.js'
import { RESTRICT_TO_CATALOG } from '../../../featureFlags.js'

const NT_BOOKS_MAP = Object.fromEntries(NT_BOOKS.map(b => [b.abbr, b]))

function getAvailableChapters(book) {
  if (RESTRICT_TO_CATALOG && CATALOG_CHAPTERS[book]) return CATALOG_CHAPTERS[book]
  const count = NT_BOOKS_MAP[book]?.chapters ?? 1
  return Array.from({ length: count }, (_, i) => i + 1)
}

export default function ChapterPicker({ book, onPick, activeChapter }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const availableChapters = getAvailableChapters(book)

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
        {activeChapter ? `Ch ${activeChapter}` : 'Ch'} <span className="translation-flyout__caret">▾</span>
      </button>
      {open && (
        <div className="translation-flyout__menu translation-flyout__menu--chapter" role="listbox">
          {availableChapters.map(ch => (
            <button
              key={ch}
              role="option"
              className={`translation-flyout__option${activeChapter === ch ? ' translation-flyout__option--active' : ''}`}
              aria-selected={activeChapter === ch}
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
