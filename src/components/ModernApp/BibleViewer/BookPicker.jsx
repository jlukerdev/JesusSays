import { useState, useEffect, useRef } from 'react'
import { NT_BOOKS } from '../../../utils/bookOrder.js'

export default function BookPicker({ activeBook, onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

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
        {activeBook} <span className="translation-flyout__caret">▾</span>
      </button>
      {open && (
        <div className="translation-flyout__menu translation-flyout__menu--book" role="listbox">
          {NT_BOOKS.map(b => (
            <button
              key={b.abbr}
              role="option"
              aria-selected={activeBook === b.abbr}
              className={`translation-flyout__option${activeBook === b.abbr ? ' translation-flyout__option--active' : ''}`}
              onClick={() => { onPick(b.abbr); setOpen(false) }}
            >
              {b.abbr}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
