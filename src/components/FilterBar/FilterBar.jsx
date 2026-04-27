import { NT_BOOK_ABBR_ORDER } from '../../utils/bookOrder.js'
import useStore from '../../store.js'

const PILL_LABELS = {
  Matt: 'Matt',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  '1Cor': '1 Cor',
  Rev: 'Rev'
}

export default function FilterBar() {
  const filters = useStore((s) => s.filters)
  const setFilters = useStore((s) => s.setFilters)

  // filters.books = excluded (deactivated) books; empty array = all active = no filter
  const excludedBooks = filters.books ?? []

  function toggleBook(abbr) {
    const isExcluded = excludedBooks.includes(abbr)
    const updated = isExcluded
      ? excludedBooks.filter((b) => b !== abbr)
      : [...excludedBooks, abbr]
    setFilters({ ...filters, books: updated })
  }

  function handleClear() {
    setFilters({ ...filters, books: [] })
  }

  return (
    <div className="filter-bar" role="group" aria-label="Filter by Bible book">
      <div className="filter-bar__pills">
        {NT_BOOK_ABBR_ORDER.map((abbr) => {
          const isActive = !excludedBooks.includes(abbr)
          return (
            <button
              key={abbr}
              className={`filter-bar__pill${isActive ? ' filter-bar__pill--active' : ''}`}
              onClick={() => toggleBook(abbr)}
              aria-pressed={isActive}
            >
              {PILL_LABELS[abbr]}
            </button>
          )
        })}
      </div>
      {excludedBooks.length > 0 && (
        <button className="filter-bar__clear" onClick={handleClear}>
          Clear
        </button>
      )}
    </div>
  )
}
