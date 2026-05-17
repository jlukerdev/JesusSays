import { useMemo } from 'react'
import { useSearch } from '../../hooks/useSearch.js'
import { resolveResult, highlightTerms } from '../../utils/search.js'

const TEACHING_FIELDS = new Set(['title', 'text', 'quote', 'tagsStr', 'referenceLabels'])

function getMatchSnippet(text, terms, contextBefore = 50, maxLength = 160) {
  if (!text) return ''
  const lower = text.toLowerCase()
  let matchPos = -1
  for (const term of (terms ?? [])) {
    const pos = lower.indexOf(term.toLowerCase())
    if (pos !== -1 && (matchPos === -1 || pos < matchPos)) matchPos = pos
  }
  const start = matchPos === -1 ? 0 : Math.max(0, matchPos - contextBefore)
  const end = Math.min(text.length, start + maxLength)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

function groupResults(results, categories) {
  const catSet = new Set()
  const subcatSet = new Set()
  const catResults = []
  const subcatResults = []
  const teachingResults = []

  for (const result of results) {
    const { cat, sub, teaching, tabIndex } = resolveResult(result, categories)
    if (!cat || !sub || !teaching) continue

    const matchedFields = Object.values(result.match).flat()

    if (matchedFields.includes('categoryTitle') && !catSet.has(cat.id)) {
      catSet.add(cat.id)
      catResults.push({ cat, result })
    }
    if (matchedFields.includes('subcategoryTitle') && !subcatSet.has(sub.id)) {
      subcatSet.add(sub.id)
      subcatResults.push({ cat, sub, tabIndex, result })
    }
    if (matchedFields.some(f => TEACHING_FIELDS.has(f))) {
      teachingResults.push({ cat, sub, tabIndex, teaching, result })
    }
  }

  return { catResults, subcatResults, teachingResults }
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

  const { results, isSearching } = useSearch(searchQuery)

  const { catResults, subcatResults, teachingResults } = useMemo(
    () => isSearching ? groupResults(results, categories) : { catResults: [], subcatResults: [], teachingResults: [] },
    [results, categories, isSearching]
  )

  if (searchQuery.trim()) {
    const hasResults = catResults.length > 0 || subcatResults.length > 0 || teachingResults.length > 0
    return (
      <div className="modern-search-results">
        {!hasResults && (
          <div className="modern-empty-state">No results for "{searchQuery}"</div>
        )}
        {catResults.length > 0 && (
          <>
            <div className="modern-search-results__label">Themes</div>
            {catResults.map(({ cat, result }) => (
              <button
                key={cat.id}
                className="modern-search-result-row"
                onClick={() => { onNavigateToCategory(cat.id); onClearSearch() }}
              >
                <span className="modern-search-result-row__type modern-search-result-row__type--cat">Theme</span>
                <div className="modern-search-result-row__title">
                  {highlightTerms(cat.title, result.terms)}
                </div>
              </button>
            ))}
          </>
        )}
        {subcatResults.length > 0 && (
          <>
            <div className="modern-search-results__label">Topics</div>
            {subcatResults.map(({ cat, sub, tabIndex, result }) => (
              <button
                key={`${cat.id}-${sub.id}`}
                className="modern-search-result-row"
                onClick={() => { onNavigateToCategory(cat.id, tabIndex); onClearSearch() }}
              >
                <span className="modern-search-result-row__type modern-search-result-row__type--sub">Topic</span>
                <div className="modern-search-result-row__title">
                  {highlightTerms(sub.title, result.terms)}
                </div>
                <span className="modern-search-result-row__crumb">{cat.title}</span>
              </button>
            ))}
          </>
        )}
        {teachingResults.length > 0 && (
          <>
            <div className="modern-search-results__label">Teachings</div>
            {teachingResults.map(({ cat, sub, tabIndex, teaching, result }) => (
              <button
                key={teaching.id}
                className="modern-search-result-row"
                onClick={() => { onNavigateToTeaching(teaching.id, cat.id, tabIndex); onClearSearch() }}
              >
                <span className="modern-search-result-row__type modern-search-result-row__type--teaching">Teaching</span>
                <div className="modern-search-result-row__title">
                  {teaching.title
                    ? highlightTerms(teaching.title, result.terms)
                    : highlightTerms(getMatchSnippet(teaching.text, result.terms), result.terms)}
                </div>
                {teaching.title && (
                  <div className="modern-search-result-row__snippet">
                    {highlightTerms(getMatchSnippet(teaching.text, result.terms), result.terms)}
                  </div>
                )}
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
