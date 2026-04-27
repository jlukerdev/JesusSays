import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store.js'
import { useScrollSpy } from '../../hooks/useScrollSpy.js'
import { NT_BOOK_ABBR_ORDER } from '../../utils/bookOrder.js'

function getCatNum(catSlug) {
  return catSlug.split('-')[1]
}

function getSubcatNum(subcatSlug) {
  const parts = subcatSlug.split('-')
  return parts[parts.length - 1]
}

export default function Sidebar({ onNavClick }) {
  const categories = useStore((s) => s.categories)
  const activeCategorySlug = useStore((s) => s.activeCategorySlug)
  const setActiveCategorySlug = useStore((s) => s.setActiveCategorySlug)
  const filters = useStore((s) => s.filters)
  const navigate = useNavigate()
  const activeSubcatId = useScrollSpy()
  const [openCatSlug, setOpenCatSlug] = useState(activeCategorySlug)

  useEffect(() => {
    setOpenCatSlug(activeCategorySlug)
  }, [activeCategorySlug])

  // filters.books = excluded books; empty = all active = no filter
  const excludedBooks = filters.books ?? []
  const activeBooks = NT_BOOK_ABBR_ORDER.filter((b) => !excludedBooks.includes(b))
  const allExcluded = activeBooks.length === 0

  const visibleCategories = allExcluded
    ? []
    : excludedBooks.length === 0
    ? categories
    : categories.filter((cat) =>
        (cat.sources ?? []).some((s) => activeBooks.includes(s))
      )

  function handleCategoryClick(cat) {
    setOpenCatSlug(cat.slug)
    setActiveCategorySlug(cat.slug)
    navigate(`/category/${cat.slug}`)
    onNavClick?.()
  }

  function handleSubcatClick(e, subcatSlug) {
    e.preventDefault()
    const el = document.getElementById(subcatSlug)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onNavClick?.()
  }

  if (!categories.length) return null

  if (allExcluded) {
    return (
      <div className="sidebar-nav sidebar-nav--empty">
        <p className="sidebar-nav__empty-msg">Select a book to filter</p>
      </div>
    )
  }

  return (
    <nav className="sidebar-nav" aria-label="Table of contents">
      {visibleCategories.map((cat) => {
        const isOpen = openCatSlug === cat.slug
        const isActive = activeCategorySlug === cat.slug
        return (
          <div key={cat.slug} className="sidebar-nav__category">
            <button
              className={`sidebar-nav__cat-btn${isActive ? ' sidebar-nav__cat-btn--active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
              aria-expanded={isOpen}
            >
              <span className="sidebar-nav__cat-num">{getCatNum(cat.slug)}.</span>
              <span>{cat.title}</span>
            </button>
            {isOpen && (
              <ul className="sidebar-nav__subcats">
                {cat.subcategories.map((sub) => (
                  <li key={sub.slug}>
                    <a
                      href={`#${sub.slug}`}
                      className={`sidebar-nav__subcat-link${
                        activeSubcatId === sub.slug
                          ? ' sidebar-nav__subcat-link--active'
                          : ''
                      }`}
                      onClick={(e) => handleSubcatClick(e, sub.slug)}
                    >
                      {getCatNum(cat.slug)}.{getSubcatNum(sub.slug)} {sub.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
