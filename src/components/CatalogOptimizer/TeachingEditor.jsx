import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
import TagEditor from './TagEditor.jsx'
import ReferenceEditor from './ReferenceEditor.jsx'

export default function TeachingEditor({
  teaching,
  catIndex,
  subcatIndex,
  teachingIndex,
  position,
  totalVisible,
  collapseGeneration,
  expandGeneration,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRestore,
  onMoveToSubcat,
  onDuplicateToSubcat,
  allCategories,
}) {
  const isHidden = !!teaching._hidden
  const [isOpen, setIsOpen] = useState(false)
  const collapseRef = useRef(collapseGeneration)
  const expandRef = useRef(expandGeneration)

  useEffect(() => {
    if (collapseGeneration === collapseRef.current) return
    collapseRef.current = collapseGeneration
    setIsOpen(false)
  }, [collapseGeneration])

  useEffect(() => {
    if (expandGeneration === expandRef.current) return
    expandRef.current = expandGeneration
    setIsOpen(true)
  }, [expandGeneration])

  // Move-to picker state
  const [moveCatIdx, setMoveCatIdx] = useState('')
  const [moveSubcatIdx, setMoveSubcatIdx] = useState('')

  // Duplicate-to picker state
  const [dupCatIdx, setDupCatIdx] = useState('')
  const [dupSubcatIdx, setDupSubcatIdx] = useState('')

  function handleRefUpdate(refIdx, updatedRef) {
    let refs = [...teaching.references]
    if (updatedRef.isPrimary) {
      refs = refs.map((r, i) => i === refIdx ? updatedRef : { ...r, isPrimary: false })
    } else {
      refs[refIdx] = updatedRef
    }
    onUpdate({ ...teaching, references: refs })
  }

  function handleRefDelete(refIdx) {
    const refs = teaching.references.filter((_, i) => i !== refIdx)
    onUpdate({ ...teaching, references: refs })
  }

  function handleRefMove(refIdx, direction) {
    const refs = [...teaching.references]
    const swapIdx = refIdx + direction
    if (swapIdx < 0 || swapIdx >= refs.length) return
    ;[refs[refIdx], refs[swapIdx]] = [refs[swapIdx], refs[refIdx]]
    onUpdate({ ...teaching, references: refs })
  }

  function handleAddReference() {
    const newRef = {
      label: '',
      book: 'Matthew',
      bookAbbr: 'Matt',
      chapter: 1,
      ranges: [[1, 1]],
      isPrimary: false,
    }
    onUpdate({ ...teaching, references: [...teaching.references, newRef] })
  }

  // Compute valid move targets
  const moveCatOptions = allCategories.filter((c, i) => !c._hidden)
  const moveSubcatOptions =
    moveCatIdx !== ''
      ? allCategories[moveCatIdx]?.subcategories.filter((s, si) => {
          if (s._hidden) return false
          // Exclude current location when same category
          if (parseInt(moveCatIdx) === catIndex && si === subcatIndex) return false
          return true
        }) || []
      : []

  const isMoveValid =
    moveCatIdx !== '' &&
    moveSubcatIdx !== '' &&
    !(parseInt(moveCatIdx) === catIndex && parseInt(moveSubcatIdx) === subcatIndex)

  // Duplicate targets — same subcat allowed
  const dupCatOptions = allCategories.filter(c => !c._hidden)
  const dupSubcatOptions =
    dupCatIdx !== ''
      ? allCategories[dupCatIdx]?.subcategories.filter(s => !s._hidden) || []
      : []

  const isDupValid = dupCatIdx !== '' && dupSubcatIdx !== ''

  return (
    <div className={`opt-teaching${isHidden ? ' opt-item--hidden' : ''}`}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <button
          className="opt-toggle-btn"
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Collapse teaching' : 'Expand teaching'}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {!isHidden && (
          <span className="opt-position-badge">
            Teaching {position} of {totalVisible}
          </span>
        )}
        {!isOpen && (
          <span className="opt-collapsed-summary">
            {(teaching.text || '(no summary)').slice(0, 120) + ((teaching.text || '').length > 120 ? '…' : '')}
          </span>
        )}
        <button
          className="opt-btn"
          onClick={onMoveUp}
          disabled={isHidden || position === 1}
          aria-label="Move teaching up"
        >
          <ChevronUp size={12} />
        </button>
        <button
          className="opt-btn"
          onClick={onMoveDown}
          disabled={isHidden || position === totalVisible}
          aria-label="Move teaching down"
        >
          <ChevronDown size={12} />
        </button>
        {isHidden ? (
          <button className="opt-btn" onClick={onRestore}>
            Restore
          </button>
        ) : (
          <button className="opt-btn opt-btn--danger" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>

      {isOpen && (
        <div className="opt-teaching__body">
          {/* Summary textarea */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
              Summary
            </label>
            <textarea
              className="opt-text-input"
              value={teaching.text}
              onChange={e => onUpdate({ ...teaching, text: e.target.value })}
            />
          </div>

          {/* Quote block — read-only */}
          <blockquote className="opt-quote">
            {teaching.quote ? teaching.quote : <em>(no quote)</em>}
          </blockquote>

          {/* Tags */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <TagEditor
              tags={teaching.tags}
              onChange={tags => onUpdate({ ...teaching, tags })}
            />
          </div>

          {/* References */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
              References
            </div>
            {teaching.references.map((ref, refIdx) => (
              <ReferenceEditor
                key={refIdx}
                reference={ref}
                refIndex={refIdx}
                totalRefs={teaching.references.length}
                onUpdate={updatedRef => handleRefUpdate(refIdx, updatedRef)}
                onDelete={() => handleRefDelete(refIdx)}
                onMoveUp={() => handleRefMove(refIdx, -1)}
                onMoveDown={() => handleRefMove(refIdx, 1)}
              />
            ))}
            <button className="opt-btn" onClick={handleAddReference}>
              + Add reference
            </button>
          </div>

          {/* Move-to picker */}
          {!isHidden && (
            <div className="opt-picker">
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-muted)' }}>Move to:</span>
              <select
                className="opt-select"
                value={moveCatIdx}
                onChange={e => { setMoveCatIdx(e.target.value); setMoveSubcatIdx('') }}
              >
                <option value="">— category —</option>
                {allCategories.map((cat, idx) => {
                  if (cat._hidden) return null
                  return <option key={idx} value={idx}>{cat.title}</option>
                })}
              </select>
              <select
                className="opt-select"
                value={moveSubcatIdx}
                onChange={e => setMoveSubcatIdx(e.target.value)}
                disabled={moveCatIdx === ''}
              >
                <option value="">— subcategory —</option>
                {moveSubcatOptions.map((s, si) => {
                  // Get real index in allCategories[moveCatIdx].subcategories
                  const realIdx = allCategories[moveCatIdx]?.subcategories.indexOf(s)
                  return <option key={si} value={realIdx}>{s.title}</option>
                })}
              </select>
              <button
                className="opt-btn opt-btn--accent"
                disabled={!isMoveValid}
                onClick={() => {
                  if (isMoveValid) {
                    onMoveToSubcat(parseInt(moveCatIdx), parseInt(moveSubcatIdx))
                    setMoveCatIdx('')
                    setMoveSubcatIdx('')
                  }
                }}
              >
                Move
              </button>
            </div>
          )}

          {/* Duplicate-to picker */}
          {!isHidden && (
            <div className="opt-picker">
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-muted)' }}>Duplicate to:</span>
              <select
                className="opt-select"
                value={dupCatIdx}
                onChange={e => { setDupCatIdx(e.target.value); setDupSubcatIdx('') }}
              >
                <option value="">— category —</option>
                {allCategories.map((cat, idx) => {
                  if (cat._hidden) return null
                  return <option key={idx} value={idx}>{cat.title}</option>
                })}
              </select>
              <select
                className="opt-select"
                value={dupSubcatIdx}
                onChange={e => setDupSubcatIdx(e.target.value)}
                disabled={dupCatIdx === ''}
              >
                <option value="">— subcategory —</option>
                {dupSubcatOptions.map((s, si) => {
                  const realIdx = allCategories[dupCatIdx]?.subcategories.indexOf(s)
                  return <option key={si} value={realIdx}>{s.title}</option>
                })}
              </select>
              <button
                className="opt-btn opt-btn--accent"
                disabled={!isDupValid}
                onClick={() => {
                  if (isDupValid) {
                    onDuplicateToSubcat(parseInt(dupCatIdx), parseInt(dupSubcatIdx))
                    setDupCatIdx('')
                    setDupSubcatIdx('')
                  }
                }}
              >
                Duplicate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
