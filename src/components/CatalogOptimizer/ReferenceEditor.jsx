import { ChevronUp, ChevronDown } from 'lucide-react'
import { NT_BOOK_ABBR_ORDER, ABBR_TO_FULL } from '../../utils/bookOrder.js'

export default function ReferenceEditor({
  reference,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  refIndex,
  totalRefs,
}) {
  function updateRange(ri, which, val) {
    const ranges = reference.ranges.map((r, i) =>
      i === ri
        ? which === 0
          ? [parseInt(val) || 1, r[1]]
          : [r[0], parseInt(val) || 1]
        : r
    )
    onUpdate({ ...reference, ranges })
  }

  const firstRange = reference.ranges[0] || [1, 1]
  const [start, end] = firstRange

  function handleLabelBlur(e) {
    if (e.target.value.trim() === '') {
      const label =
        start === end
          ? `${reference.bookAbbr} ${reference.chapter}:${start}`
          : `${reference.bookAbbr} ${reference.chapter}:${start}–${end}`
      onUpdate({ ...reference, label })
    }
  }

  return (
    <div className="opt-ref">
      {/* Row 1 */}
      <div className="opt-ref-row">
        <button
          className="opt-btn"
          onClick={onMoveUp}
          disabled={refIndex === 0}
          aria-label="Move reference up"
        >
          <ChevronUp size={12} />
        </button>
        <button
          className="opt-btn"
          onClick={onMoveDown}
          disabled={refIndex === totalRefs - 1}
          aria-label="Move reference down"
        >
          <ChevronDown size={12} />
        </button>
        <span className="opt-ref-label">Ref {refIndex + 1}</span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)' }}>
          <input
            type="checkbox"
            checked={!!reference.isPrimary}
            onChange={e => onUpdate({ ...reference, isPrimary: e.target.checked })}
          />
          Primary
        </label>
        <button className="opt-btn opt-btn--danger" onClick={onDelete} aria-label="Delete reference">
          Delete
        </button>
      </div>

      {/* Row 2 */}
      <div className="opt-ref-row">
        <span className="opt-ref-label">Label</span>
        <input
          className="opt-field"
          value={reference.label}
          onChange={e => onUpdate({ ...reference, label: e.target.value })}
          onBlur={handleLabelBlur}
          style={{ flex: 1, minWidth: 120 }}
        />
        <span className="opt-ref-label">Book</span>
        <select
          className="opt-field"
          value={reference.bookAbbr}
          onChange={e => {
            const val = e.target.value
            onUpdate({ ...reference, bookAbbr: val, book: ABBR_TO_FULL[val] || val })
          }}
        >
          {NT_BOOK_ABBR_ORDER.map(abbr => (
            <option key={abbr} value={abbr}>{abbr}</option>
          ))}
        </select>
        <span className="opt-ref-label">Ch</span>
        <input
          type="number"
          min="1"
          className="opt-field"
          style={{ width: 60 }}
          value={reference.chapter}
          onChange={e => onUpdate({ ...reference, chapter: parseInt(e.target.value) || 1 })}
        />
      </div>

      {/* Row 3 — Ranges */}
      <div className="opt-ref-row">
        <span className="opt-ref-label">Verses</span>
        {reference.ranges.map((range, ri) => (
          <span key={ri} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              min="1"
              className="opt-field"
              style={{ width: 50 }}
              value={range[0]}
              onChange={e => updateRange(ri, 0, e.target.value)}
            />
            <span>–</span>
            <input
              type="number"
              min="1"
              className="opt-field"
              style={{ width: 50 }}
              value={range[1]}
              onChange={e => updateRange(ri, 1, e.target.value)}
            />
            {reference.ranges.length > 1 && (
              <button
                className="opt-btn opt-btn--danger"
                onClick={() => onUpdate({ ...reference, ranges: reference.ranges.filter((_, i) => i !== ri) })}
                aria-label="Remove range"
              >
                ×
              </button>
            )}
          </span>
        ))}
        <button
          className="opt-btn"
          onClick={() => onUpdate({ ...reference, ranges: [...reference.ranges, [1, 1]] })}
          aria-label="Add range"
        >
          +
        </button>
      </div>
    </div>
  )
}
