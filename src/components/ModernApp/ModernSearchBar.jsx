import { Search } from 'lucide-react'

export default function ModernSearchBar({ currentScreen, currentCatId, categories, searchQuery, onSearchChange }) {
  const currentCat = categories.find(c => c.id === currentCatId) ?? null
  const placeholder = currentScreen === 'home'
    ? 'Search categories, topics, teachings…'
    : `Search in ${currentCat?.title ?? ''}…`

  return (
    <div className="modern-search-bar">
      <div className="modern-search-bar__wrap">
        <Search className="modern-search-bar__icon" size={15} aria-hidden="true" />
        <input
          className="modern-search-bar__input"
          type="search"
          value={searchQuery}
          placeholder={placeholder}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={placeholder}
        />
        {searchQuery && (
          <button className="modern-search-bar__clear" onClick={() => onSearchChange('')} aria-label="Clear search">×</button>
        )}
      </div>
    </div>
  )
}
