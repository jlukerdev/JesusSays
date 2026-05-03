import { Search } from 'lucide-react'

export default function ModernSearchBar({ disabled, currentCatId, categories, searchQuery, onSearchChange }) {
  const currentCat = categories.find(c => c.id === currentCatId) ?? null
  const placeholder = currentCatId
    ? `Search in ${currentCat?.title ?? ''}…`
    : 'Search categories, topics, teachings…'

  return (
    <div className={`modern-search-bar${disabled ? ' modern-search-bar--disabled' : ''}`}>
      <div className="modern-search-bar__wrap">
        <Search className="modern-search-bar__icon" size={15} aria-hidden="true" />
        <input
          className="modern-search-bar__input"
          type="search"
          value={searchQuery}
          placeholder={placeholder}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={placeholder}
          disabled={disabled}
        />
        {searchQuery && !disabled && (
          <button className="modern-search-bar__clear" onClick={() => onSearchChange('')} aria-label="Clear search">×</button>
        )}
      </div>
    </div>
  )
}
