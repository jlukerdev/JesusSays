import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ABBR_TO_FULL, BLB_BOOK_SLUG } from '../../utils/bookOrder.js'
import { getReverseIndex } from '../../data/reverseIndex.js'
import useStore from '../../store.js'

function buildBLBUrl(ref) {
  const slug = BLB_BOOK_SLUG[ref.bookAbbr]
  if (!slug) return '#'
  const firstVerse = ref.ranges?.[0]?.[0] ?? 1
  return `https://www.blueletterbible.org/nkjv/${slug}/${ref.chapter}/${firstVerse}/`
}

function buildRefLabel(ref) {
  if (ref.label) return ref.label
  const [start, end] = ref.ranges?.[0] ?? [1, 1]
  const range = start === end ? `${start}` : `${start}–${end}`
  return `${ref.bookAbbr} ${ref.chapter}:${range}`
}

function ScriptureRefs({ references }) {
  const sorted = [...references].sort((a) => (a.isPrimary ? -1 : 1))
  return (
    <div className="scripture-refs">
      {sorted.map((ref, i) => (
        <span key={ref.label || `ref-${i}`} className="scripture-ref-group">
          {i > 0 && <span className="scripture-ref-sep">·</span>}
          <a
            href={buildBLBUrl(ref)}
            target="_blank"
            rel="noopener noreferrer"
            className={`scripture-ref${ref.isPrimary ? ' scripture-ref--primary' : ''}`}
          >
            {buildRefLabel(ref)}
          </a>
        </span>
      ))}
    </div>
  )
}

function CategoryChip({ category }) {
  return (
    <span className="category-chip" title={category.title}>
      <span className="category-chip__num">{category.id}.</span>
      <span className="category-chip__title">{category.title}</span>
    </span>
  )
}

function ChapterSection({ bookAbbr, chNum, entries }) {
  const seen = new Set()
  const uniqueEntries = []
  for (const entry of entries) {
    if (!seen.has(entry.teaching.id)) {
      seen.add(entry.teaching.id)
      uniqueEntries.push(entry)
    }
  }

  return (
    <div className="book-chapter" id={`ch-${bookAbbr}-${chNum}`}>
      <h3 className="book-chapter__title">Chapter {chNum}</h3>
      <table className="teachings-table book-viewer__table">
        <thead>
          <tr>
            <th className="col-teaching">Teaching</th>
            <th className="col-category">Category</th>
            <th className="col-scriptures">Scriptures</th>
          </tr>
        </thead>
        <tbody>
          {uniqueEntries.map(({ teaching, category }) => (
            <tr key={teaching.id} id={`t-${teaching.id.replace(/\./g, '-')}`}>
              <td className="teaching-text">
                {teaching.text}
                {teaching.tags?.includes('parable') && (
                  <span className="parable-badge">Parable</span>
                )}
              </td>
              <td className="category-chip-cell">
                <CategoryChip category={category} />
              </td>
              <td className="ref-cell">
                <ScriptureRefs references={teaching.references ?? []} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function BookViewer() {
  const { bookAbbr } = useParams()
  const reverseIndex = getReverseIndex()
  const setActiveBookAbbr = useStore((s) => s.setActiveBookAbbr)
  const setActiveMode = useStore((s) => s.setActiveMode)

  useEffect(() => {
    if (bookAbbr) {
      setActiveBookAbbr(bookAbbr)
      setActiveMode('book')
    }
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'instant' })
  }, [bookAbbr, setActiveBookAbbr, setActiveMode])

  if (!reverseIndex) {
    return <div className="data-loading">Loading…</div>
  }

  const bookData = reverseIndex[bookAbbr]
  if (!bookData) {
    return <div className="data-error">Book not found: {bookAbbr}</div>
  }

  const fullName = ABBR_TO_FULL[bookAbbr] ?? bookAbbr
  const chapters = Object.keys(bookData).sort((a, b) => Number(a) - Number(b))

  return (
    <div className="book-viewer" id={`book-${bookAbbr}`}>
      <div className="book-viewer__header">
        <h2 className="book-viewer__title">{fullName}</h2>
        <hr className="book-viewer__divider" />
      </div>
      {chapters.map((chNum) => (
        <ChapterSection
          key={chNum}
          bookAbbr={bookAbbr}
          chNum={chNum}
          entries={bookData[chNum]}
        />
      ))}
    </div>
  )
}
