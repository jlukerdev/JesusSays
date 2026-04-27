import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useStore from '../../store.js'

export default function CategoryNav({ isBottom = false }) {
  const categories = useStore((s) => s.categories)
  const activeCategorySlug = useStore((s) => s.activeCategorySlug)
  const setActiveCategorySlug = useStore((s) => s.setActiveCategorySlug)
  const navigate = useNavigate()

  const currentIndex = categories.findIndex((c) => c.slug === activeCategorySlug)
  const prevCat = currentIndex > 0 ? categories[currentIndex - 1] : null
  const nextCat = currentIndex < categories.length - 1 ? categories[currentIndex + 1] : null

  function handleNav(cat) {
    setActiveCategorySlug(cat.slug)
    navigate(`/category/${cat.slug}`)
    // Scroll main content area to top
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'instant' })
  }

  if (!prevCat && !nextCat) return null

  return (
    <div className={`cat-nav${isBottom ? ' cat-nav--bottom' : ' cat-nav--top'}`}>
      {prevCat ? (
        <button className="cat-nav__link" onClick={() => handleNav(prevCat)}>
          <ChevronLeft size={16} aria-hidden="true" />
          <span>
            <span className="cat-nav__label">Previous</span>
            <span className="cat-nav__title">{prevCat.title}</span>
          </span>
        </button>
      ) : (
        <span />
      )}
      {nextCat ? (
        <button className="cat-nav__link" onClick={() => handleNav(nextCat)}>
          <span>
            <span className="cat-nav__label">Next</span>
            <span className="cat-nav__title">{nextCat.title}</span>
          </span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      ) : (
        <span />
      )}
    </div>
  )
}
