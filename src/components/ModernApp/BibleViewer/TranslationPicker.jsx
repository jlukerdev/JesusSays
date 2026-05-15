import { useState, useEffect, useRef } from 'react'
import useStore from '../../../store.js'

export default function TranslationPicker() {
  const bibleTranslation    = useStore(s => s.bibleTranslation)
  const setBibleTranslation = useStore(s => s.setBibleTranslation)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const options = ['KJV', 'NKJV', 'NIV']

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
        {bibleTranslation} <span className="translation-flyout__caret">▾</span>
      </button>
      {open && (
        <div className="translation-flyout__menu" role="listbox">
          {options.map(t => (
            <button
              key={t}
              role="option"
              aria-selected={bibleTranslation === t}
              className={`translation-flyout__option${bibleTranslation === t ? ' translation-flyout__option--active' : ''}`}
              onClick={() => { setBibleTranslation(t); setOpen(false) }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
