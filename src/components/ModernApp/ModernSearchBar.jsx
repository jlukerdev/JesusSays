import { ArrowLeft, Search } from 'lucide-react'

export default function ModernSearchBar({
  disabled,
  currentCatId,
  categories,
  searchQuery,
  onSearchChange,
  lastSearchQuery,
  onBackToResults,
}) {
  const currentCat = categories.find(c => c.id === currentCatId) ?? null
  const placeholder = currentCatId
    ? `Search in ${currentCat?.title ?? ''}…`
    : 'Search topics and teachings…'

  return (
    <div className={`modern-search-bar${disabled ? ' modern-search-bar--disabled' : ''}`}>
      {lastSearchQuery && (
        <button
          type="button"
          className="modern-search-bar__back-to-results"
          onClick={onBackToResults}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Back to results for &ldquo;{lastSearchQuery}&rdquo;</span>
        </button>
      )}
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
