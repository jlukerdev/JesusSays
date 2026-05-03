import { Home } from 'lucide-react'

export default function CategoryTOC({ categories, currentCatId, onNavigateToCategory, onGoHome }) {
  return (
    <div className="modern-cat-toc">
      <button className="modern-cat-toc__label" onClick={onGoHome}>
        <Home size={13} /> Topics
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`modern-cat-toc__item${currentCatId === cat.id ? ' modern-cat-toc__item--active' : ''}`}
          onClick={() => onNavigateToCategory(cat.id)}
        >
          {cat.title}
        </button>
      ))}
    </div>
  )
}
