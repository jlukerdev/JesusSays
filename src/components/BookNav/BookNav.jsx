import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NT_BOOK_ABBR_ORDER, ABBR_TO_FULL } from '../../utils/bookOrder.js'
import { getReverseIndex } from '../../data/reverseIndex.js'
import { useBookScrollSpy } from '../../hooks/useScrollSpy.js'
import useStore from '../../store.js'

export default function BookNav({ onNavClick }) {
  const reverseIndex = getReverseIndex()
  const activeBookAbbr = useStore((s) => s.activeBookAbbr)
  const setActiveBookAbbr = useStore((s) => s.setActiveBookAbbr)
  const navigate = useNavigate()
  const [openBook, setOpenBook] = useState(activeBookAbbr)
  const activeChapterId = useBookScrollSpy()

  useEffect(() => {
    setOpenBook(activeBookAbbr)
  }, [activeBookAbbr])

  function handleBookClick(abbr) {
    setOpenBook(abbr)
    setActiveBookAbbr(abbr)
    navigate(`/book/${abbr}`)
    onNavClick?.()
  }

  function handleChapterClick(e, abbr, chNum) {
    e.preventDefault()
    const el = document.getElementById(`ch-${abbr}-${chNum}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onNavClick?.()
  }

  if (!reverseIndex) return null

  return (
    <nav className="sidebar-nav" aria-label="Bible books">
      {NT_BOOK_ABBR_ORDER.filter((abbr) => reverseIndex[abbr]).map((abbr) => {
        const chapters = Object.keys(reverseIndex[abbr]).sort(
          (a, b) => Number(a) - Number(b)
        )
        const isOpen = openBook === abbr
        const isActive = activeBookAbbr === abbr

        return (
          <div key={abbr} className="sidebar-nav__category">
            <button
              className={`sidebar-nav__cat-btn${isActive ? ' sidebar-nav__cat-btn--active' : ''}`}
              onClick={() => handleBookClick(abbr)}
              aria-expanded={isOpen}
            >
              <span>{ABBR_TO_FULL[abbr]}</span>
            </button>
            {isOpen && (
              <ul className="sidebar-nav__subcats">
                {chapters.map((ch) => {
                  const chId = `ch-${abbr}-${ch}`
                  return (
                    <li key={ch}>
                      <a
                        href={`#${chId}`}
                        className={`sidebar-nav__subcat-link${
                          activeChapterId === chId
                            ? ' sidebar-nav__subcat-link--active'
                            : ''
                        }`}
                        onClick={(e) => handleChapterClick(e, abbr, ch)}
                      >
                        Chapter {ch}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
