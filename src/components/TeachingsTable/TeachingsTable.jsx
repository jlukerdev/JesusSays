import { BLB_BOOK_SLUG } from '../../utils/bookOrder.js'

function buildBLBUrl(ref) {
  const slug = BLB_BOOK_SLUG[ref.bookAbbr]
  if (!slug) return '#'
  const chapter = ref.chapter
  const firstVerse = ref.ranges?.[0]?.[0] ?? 1
  return `https://www.blueletterbible.org/nkjv/${slug}/${chapter}/${firstVerse}/`
}

function buildRefLabel(ref) {
  if (ref.label) return ref.label
  const chapter = ref.chapter
  const [start, end] = ref.ranges?.[0] ?? [1, 1]
  const range = start === end ? `${start}` : `${start}–${end}`
  return `${ref.bookAbbr} ${chapter}:${range}`
}

function buildDataRef(ref) {
  const book = ref.book || ref.bookAbbr
  const chapter = ref.chapter
  const [start, end] = ref.ranges?.[0] ?? [1, 1]
  const range = start === end ? `${start}` : `${start}-${end}`
  return `${book} ${chapter}:${range}`
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
            data-ref={buildDataRef(ref)}
          >
            {buildRefLabel(ref)}
          </a>
        </span>
      ))}
    </div>
  )
}

export default function TeachingsTable({ teachings }) {
  return (
    <table className="teachings-table">
      <thead>
        <tr>
          <th className="col-teaching">Teaching</th>
          <th className="col-scriptures">Scriptures</th>
        </tr>
      </thead>
      <tbody>
        {teachings.map((teaching) => (
          <tr key={teaching.id} id={`t-${teaching.id.replace(/\./g, '-')}`}>
            <td className="teaching-text">
              {teaching.text}
              {teaching.tags?.includes('parable') && (
                <span className="parable-badge">Parable</span>
              )}
            </td>
            <td className="ref-cell">
              <ScriptureRefs references={teaching.references ?? []} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
