import { useMemo } from 'react'
import { Menu } from 'lucide-react'
import { useIsMobile } from '../../hooks/useBreakpoint.js'
import { NT_BOOK_ABBR_ORDER } from '../../utils/bookOrder.js'
import { useSearch } from '../../hooks/useSearch.js'
import { resolveResult, highlightTerms } from '../../utils/search.js'

function TeachingCard({ teaching, onNavigate, onOpenBible }) {
  return (
    <div className="modern-teaching-card" onClick={onNavigate}>
      <div className="modern-teaching-card__main">
        <p className="modern-teaching-card__text">{teaching.text}</p>
        <div className="modern-teaching-card__chips">
          {teaching.tags.map(tag => (
            <span key={tag} className={`modern-tag modern-tag--${tag}`}>{tag}</span>
          ))}
          {teaching.references.map(ref => (
            <button key={ref.label} className="modern-scripture-chip"
              onClick={(e) => { e.stopPropagation(); onOpenBible(ref) }}
            >{ref.label}</button>
          ))}
        </div>
      </div>
      <span className="modern-teaching-card__arrow" aria-hidden="true">›</span>
    </div>
  )
}

function InCategorySearchResults({ cat, searchQuery, onNavigate }) {
  const { results, isSearching } = useSearch(searchQuery, { categoryId: cat?.id })

  const subcatResults = []
  const teachingResults = []
  const subcatSet = new Set()

  if (isSearching) {
    for (const result of results) {
      const { sub, teaching, tabIndex: subIdx } = resolveResult(result, [cat])
      if (!sub || !teaching) continue

      const matchedFields = Object.values(result.match).flat()
      if (matchedFields.includes('subcategoryTitle') && !subcatSet.has(sub.id)) {
        subcatSet.add(sub.id)
        subcatResults.push({ sub, subIdx, result })
      } else {
        teachingResults.push({ sub, subIdx, teaching, result })
      }
    }
  }

  const hasResults = subcatResults.length > 0 || teachingResults.length > 0

  return (
    <div className="modern-search-results">
      {!hasResults && (
        <div className="modern-empty-state">No results for "{searchQuery}"</div>
      )}
      {subcatResults.length > 0 && (
        <>
          <div className="modern-search-results__label">Sections</div>
          {subcatResults.map(({ sub, subIdx, result }) => (
            <button
              key={sub.id}
              className="modern-search-result-row"
              onClick={() => onNavigate(subIdx, null)}
            >
              <span className="modern-search-result-row__type modern-search-result-row__type--sub">Section</span>
              <div
                className="modern-search-result-row__title"
                dangerouslySetInnerHTML={{ __html: highlightTerms(sub.title, result.terms) }}
              />
            </button>
          ))}
        </>
      )}
      {teachingResults.length > 0 && (
        <>
          <div className="modern-search-results__label">Teachings</div>
          {teachingResults.map(({ sub, subIdx, teaching, result }) => (
            <button
              key={teaching.id}
              className="modern-search-result-row"
              onClick={() => onNavigate(subIdx, teaching.id)}
            >
              <span className="modern-search-result-row__type modern-search-result-row__type--teaching">Teaching</span>
              <div
                className="modern-search-result-row__title"
                dangerouslySetInnerHTML={{ __html: highlightTerms(teaching.text.slice(0, 120) + (teaching.text.length > 120 ? '…' : ''), result.terms) }}
              />
              <span className="modern-search-result-row__crumb">{sub.title}</span>
            </button>
          ))}
        </>
      )}
    </div>
  )
}

export default function CategoryBrowser({
  catId,
  tabIndex,
  categories,
  activeBookFilter,
  searchQuery,
  onTabChange,
  onBookFilterChange,
  onNavigateToTeaching,
  onOpenBible,
  onClearSearch,
  onGoHome,
  onShowToc,
}) {
  const isMobile = useIsMobile()
  const cat = categories.find(c => c.id === catId)
  const currentSubcat = cat?.subcategories?.[tabIndex] ?? null

  const allBookAbbrs = useMemo(() => {
    const seen = new Set()
    const result = []
    cat?.subcategories.forEach(sub =>
      sub.teachings.forEach(t =>
        t.references.forEach(r => {
          if (!seen.has(r.bookAbbr)) { seen.add(r.bookAbbr); result.push(r.bookAbbr) }
        })
      )
    )
    return result.sort((a, b) => NT_BOOK_ABBR_ORDER.indexOf(a) - NT_BOOK_ABBR_ORDER.indexOf(b))
  }, [cat])

  const visibleTeachings = useMemo(() => {
    if (!currentSubcat) return []
    if (!activeBookFilter) return currentSubcat.teachings
    return currentSubcat.teachings.filter(t =>
      t.references.some(r => r.bookAbbr === activeBookFilter)
    )
  }, [currentSubcat, activeBookFilter])

  return (
    <div className="modern-category-browser">
      <div className="modern-cat-hero">
        <button className="modern-view-topics-btn" onClick={isMobile ? onGoHome : onShowToc}>
          <Menu size={16} /> View Topics
        </button>
        <h2 className="modern-cat-hero__title">{cat?.title}</h2>

        <div className="modern-book-filter-row">
          {allBookAbbrs.map(abbr => (
            <button key={abbr}
              className={`modern-book-chip${activeBookFilter === abbr ? ' modern-book-chip--active' : ''}`}
              onClick={() => onBookFilterChange(activeBookFilter === abbr ? null : abbr)}
            >{abbr}</button>
          ))}
        </div>

        {isMobile && (
          <div className="modern-subcat-dropdown-wrap">
            <select className="modern-subcat-select" value={tabIndex}
              onChange={(e) => onTabChange(parseInt(e.target.value, 10))}>
              {cat?.subcategories.map((sub, idx) => (
                <option key={sub.id} value={idx}>{sub.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!searchQuery ? (
        <div className="modern-browser-body">
          {!isMobile && (
            <nav className="modern-subcat-toc">
              <div className="modern-subcat-toc__header">Discourses</div>
              <div className="modern-subcat-toc__inner">
                {cat?.subcategories.map((sub, idx) => (
                  <button
                    key={sub.id}
                    className={`modern-subcat-toc__item${tabIndex === idx ? ' modern-subcat-toc__item--active' : ''}`}
                    onClick={() => onTabChange(idx)}
                  >
                    <span className="modern-subcat-toc__name">{sub.title}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}

          <div className="modern-teachings-list">
            {visibleTeachings.length === 0 ? (
              <div className="modern-empty-state">
                No teachings from {activeBookFilter} in this section.
              </div>
            ) : (
              visibleTeachings.map(teaching => (
                <TeachingCard
                  key={teaching.id}
                  teaching={teaching}
                  onNavigate={() => onNavigateToTeaching(teaching.id)}
                  onOpenBible={onOpenBible}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <InCategorySearchResults
          cat={cat}
          searchQuery={searchQuery}
          onNavigate={(subcatIdx, teachingId) => {
            onTabChange(subcatIdx)
            if (teachingId) onNavigateToTeaching(teachingId)
            onClearSearch()
          }}
        />
      )}
    </div>
  )
}
