import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store.js'
import { useScrollSpy } from '../../hooks/useScrollSpy.js'

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
  const navigate = useNavigate()
  const activeSubcatId = useScrollSpy()
  const [openCatSlug, setOpenCatSlug] = useState(activeCategorySlug)

  useEffect(() => {
    setOpenCatSlug(activeCategorySlug)
  }, [activeCategorySlug])

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

  return (
    <nav className="sidebar-nav" aria-label="Table of contents">
      {categories.map((cat) => {
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
                      className={`sidebar-nav__subcat-link${activeSubcatId === sub.slug ? ' sidebar-nav__subcat-link--active' : ''}`}
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
