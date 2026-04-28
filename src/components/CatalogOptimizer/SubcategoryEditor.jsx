import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
import TeachingEditor from './TeachingEditor.jsx'

export default function SubcategoryEditor({
  subcat,
  catIndex,
  subcatIndex,
  position,
  totalVisible,
  collapseGeneration,
  expandGeneration,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRestore,
  onAddTeaching,
  onMoveToCategory,
  allCategories,
  onUpdateTeaching,
  onMoveTeachingUp,
  onMoveTeachingDown,
  onDeleteTeaching,
  onRestoreTeaching,
  onMoveTeachingToSubcat,
  onDupTeachingToSubcat,
}) {
  const isHidden = !!subcat._hidden
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

  // Compute visible teaching count for position badges
  const visibleTeachingCount = subcat.teachings.filter(t => !t._hidden).length

  return (
    <div className={`opt-subcat${isHidden ? ' opt-item--hidden' : ''}`}>
      <div className="opt-subcat__header">
        <button
          className="opt-toggle-btn"
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Collapse subcategory' : 'Expand subcategory'}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {!isHidden && (
          <span className="opt-position-badge">
            Subcat {position} of {totalVisible}
          </span>
        )}
        <button
          className="opt-btn"
          onClick={onMoveUp}
          disabled={isHidden || position === 1}
          aria-label="Move subcategory up"
        >
          <ChevronUp size={14} />
        </button>
        <button
          className="opt-btn"
          onClick={onMoveDown}
          disabled={isHidden || position === totalVisible}
          aria-label="Move subcategory down"
        >
          <ChevronDown size={14} />
        </button>
        <input
          className="opt-title-input"
          value={subcat.title}
          onChange={(e) => onUpdate({ ...subcat, title: e.target.value })}
        />
        {!isHidden && (
          <select
            className="opt-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value !== '') {
                onMoveToCategory(parseInt(e.target.value, 10))
                e.target.value = ''
              }
            }}
          >
            <option value="" disabled>Move to…</option>
            {allCategories.map((cat, idx) => {
              if (idx === catIndex || cat._hidden) return null
              return (
                <option key={idx} value={idx}>
                  {cat.title}
                </option>
              )
            })}
          </select>
        )}
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
        <div className="opt-subcat__body">
          <button className="opt-btn" onClick={onAddTeaching}>
            + Add teaching
          </button>
          {(() => {
            let visPos = 0
            return subcat.teachings.map((teaching, teachingIndex) => {
              if (!teaching._hidden) visPos++
              return (
                <TeachingEditor
                  key={teachingIndex}
                  teaching={teaching}
                  catIndex={catIndex}
                  subcatIndex={subcatIndex}
                  teachingIndex={teachingIndex}
                  position={teaching._hidden ? null : visPos}
                  totalVisible={visibleTeachingCount}
                  collapseGeneration={collapseGeneration}
                  expandGeneration={expandGeneration}
                  onUpdate={(updated) => onUpdateTeaching(teachingIndex, updated)}
                  onMoveUp={() => onMoveTeachingUp(teachingIndex)}
                  onMoveDown={() => onMoveTeachingDown(teachingIndex)}
                  onDelete={() => onDeleteTeaching(teachingIndex)}
                  onRestore={() => onRestoreTeaching(teachingIndex)}
                  onMoveToSubcat={(toCatIdx, toSubcatIdx) => onMoveTeachingToSubcat(teachingIndex, toCatIdx, toSubcatIdx)}
                  onDuplicateToSubcat={(toCatIdx, toSubcatIdx) => onDupTeachingToSubcat(teachingIndex, toCatIdx, toSubcatIdx)}
                  allCategories={allCategories}
                />
              )
            })
          })()}
        </div>
      )}
    </div>
  )
}
