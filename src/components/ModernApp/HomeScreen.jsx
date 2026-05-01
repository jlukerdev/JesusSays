import { useMemo } from 'react'

function highlight(text, query) {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

export default function HomeScreen({ categories, searchQuery, onNavigateToCategory, onNavigateToTeaching, onClearSearch }) {
  const maxTeachingCount = useMemo(() =>
    Math.max(...categories.map(cat =>
      cat.subcategories.reduce((acc, sub) => acc + sub.teachings.length, 0)
    ), 1),
  [categories])

  function getDensityRatio(cat) {
    const count = cat.subcategories.reduce((acc, sub) => acc + sub.teachings.length, 0)
    return count / maxTeachingCount
  }

  const query = searchQuery.trim().toLowerCase()
  const catResults = query ? categories.filter(c => c.title.toLowerCase().includes(query)) : []
  const subcatResults = []
  const teachingResults = []

  if (query) {
    categories.forEach((cat) => {
      const catMatched = catResults.includes(cat)
      cat.subcategories.forEach((sub, subIdx) => {
        if (!catMatched && sub.title.toLowerCase().includes(query)) {
          subcatResults.push({ cat, sub, tabIndex: subIdx })
        }
        sub.teachings.forEach(t => {
          if (t.text.toLowerCase().includes(query)) {
            teachingResults.push({ cat, sub, tabIndex: subIdx, teaching: t })
          }
        })
      })
    })
  }

  if (searchQuery) {
    const hasResults = catResults.length > 0 || subcatResults.length > 0 || teachingResults.length > 0
    return (
      <div className="modern-search-results">
        {!hasResults && (
          <div className="modern-empty-state">No results for "{searchQuery}"</div>
        )}
        {catResults.length > 0 && (
          <>
            <div className="modern-search-results__label">Categories</div>
            {catResults.map(cat => (
              <button
                key={cat.id}
                className="modern-search-result-row"
                onClick={() => { onNavigateToCategory(cat.id); onClearSearch() }}
              >
                <span className="modern-search-result-row__type modern-search-result-row__type--cat">Category</span>
                <div
                  className="modern-search-result-row__title"
                  dangerouslySetInnerHTML={{ __html: highlight(cat.title, query) }}
                />
              </button>
            ))}
          </>
        )}
        {subcatResults.length > 0 && (
          <>
            <div className="modern-search-results__label">Subcategories</div>
            {subcatResults.map(({ cat, sub, tabIndex }) => (
              <button
                key={`${cat.id}-${sub.id}`}
                className="modern-search-result-row"
                onClick={() => { onNavigateToCategory(cat.id, tabIndex); onClearSearch() }}
              >
                <span className="modern-search-result-row__type modern-search-result-row__type--sub">Section</span>
                <div
                  className="modern-search-result-row__title"
                  dangerouslySetInnerHTML={{ __html: highlight(sub.title, query) }}
                />
                <span className="modern-search-result-row__crumb">{cat.title}</span>
              </button>
            ))}
          </>
        )}
        {teachingResults.length > 0 && (
          <>
            <div className="modern-search-results__label">Teachings</div>
            {teachingResults.map(({ cat, sub, tabIndex, teaching }) => (
              <button
                key={teaching.id}
                className="modern-search-result-row"
                onClick={() => { onNavigateToTeaching(teaching.id, cat.id, tabIndex); onClearSearch() }}
              >
                <span className="modern-search-result-row__type modern-search-result-row__type--teaching">Teaching</span>
                <div
                  className="modern-search-result-row__title"
                  dangerouslySetInnerHTML={{ __html: highlight(teaching.text.slice(0, 120) + (teaching.text.length > 120 ? '…' : ''), query) }}
                />
                <span className="modern-search-result-row__crumb">{cat.title} › {sub.title}</span>
              </button>
            ))}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="modern-home">
      <div className="modern-home__header">
        <h2 className="modern-home__heading">Topical Subjects</h2>
        <span className="modern-home__count">{categories.length} categories</span>
      </div>
      <div className="modern-home__grid">
        {categories.map(cat => (
          <button key={cat.id} className="modern-cat-card" onClick={() => onNavigateToCategory(cat.id)}>
            <div className="modern-cat-card__name">{cat.title}</div>
            <div className="modern-cat-card__bar-wrap">
              <div className="modern-cat-card__bar-fill" style={{ width: `${getDensityRatio(cat) * 100}%` }} />
            </div>
            <div className="modern-cat-card__meta">
              {cat.subcategories.length} sections · {cat.subcategories.reduce((a, s) => a + s.teachings.length, 0)} teachings
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
