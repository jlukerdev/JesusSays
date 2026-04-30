import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
import SubcategoryEditor from './SubcategoryEditor.jsx'

export default function CategoryEditor({
  category,
  catIndex,
  position,
  totalVisible,
  collapseGeneration,
  expandGeneration,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRestore,
  onAddSubcategory,
  allCategories,
  onUpdateSubcategory,
  onMoveSubcatUp,
  onMoveSubcatDown,
  onDeleteSubcategory,
  onRestoreSubcategory,
  onAddTeachingToSubcat,
  onMoveSubcatToCategory,
  onUpdateTeaching,
  onMoveTeachingUp,
  onMoveTeachingDown,
  onDeleteTeaching,
  onRestoreTeaching,
  onMoveTeachingToSubcat,
  onDupTeachingToSubcat,
}) {
  const isHidden = !!category._hidden
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

  // Compute visible subcat position counters
  const visibleSubcatCount = category.subcategories.filter(s => !s._hidden).length

  return (
    <div className={`opt-category${isHidden ? ' opt-item--hidden' : ''}`}>
      <div className="opt-category__header">
        <button
          className="opt-toggle-btn"
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Collapse category' : 'Expand category'}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {!isHidden && (
          <span className="opt-position-badge">
            Category {position} of {totalVisible}
          </span>
        )}
        <button
          className="opt-btn"
          onClick={onMoveUp}
          disabled={isHidden || position === 1}
          aria-label="Move category up"
        >
          <ChevronUp size={14} />
        </button>
        <button
          className="opt-btn"
          onClick={onMoveDown}
          disabled={isHidden || position === totalVisible}
          aria-label="Move category down"
        >
          <ChevronDown size={14} />
        </button>
        <input
          className="opt-title-input"
          value={category.title}
          onChange={(e) => onUpdate({ ...category, title: e.target.value })}
        />
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
        <div className="opt-category__body">
          <textarea
            className="opt-description-input"
            value={category.description ?? ''}
            onChange={(e) => onUpdate({ ...category, description: e.target.value || null })}
          />
          <button className="opt-btn" onClick={onAddSubcategory} style={{ marginTop: 'var(--space-3)' }}>
            + Add subcategory
          </button>
          {(() => {
            let visPos = 0
            return category.subcategories.map((subcat, subcatIndex) => {
              if (!subcat._hidden) visPos++
              return (
                <SubcategoryEditor
                  key={subcatIndex}
                  subcat={subcat}
                  catIndex={catIndex}
                  subcatIndex={subcatIndex}
                  position={subcat._hidden ? null : visPos}
                  totalVisible={visibleSubcatCount}
                  collapseGeneration={collapseGeneration}
                  expandGeneration={expandGeneration}
                  onUpdate={(updatedSubcat) => onUpdateSubcategory(subcatIndex, updatedSubcat)}
                  onMoveUp={() => onMoveSubcatUp(subcatIndex)}
                  onMoveDown={() => onMoveSubcatDown(subcatIndex)}
                  onDelete={() => onDeleteSubcategory(subcatIndex)}
                  onRestore={() => onRestoreSubcategory(subcatIndex)}
                  onAddTeaching={() => onAddTeachingToSubcat(subcatIndex)}
                  onMoveToCategory={(toCatIdx) => onMoveSubcatToCategory(subcatIndex, toCatIdx)}
                  allCategories={allCategories}
                  onUpdateTeaching={(teachingIdx, updated) => onUpdateTeaching(subcatIndex, teachingIdx, updated)}
                  onMoveTeachingUp={(teachingIdx) => onMoveTeachingUp(subcatIndex, teachingIdx)}
                  onMoveTeachingDown={(teachingIdx) => onMoveTeachingDown(subcatIndex, teachingIdx)}
                  onDeleteTeaching={(teachingIdx) => onDeleteTeaching(subcatIndex, teachingIdx)}
                  onRestoreTeaching={(teachingIdx) => onRestoreTeaching(subcatIndex, teachingIdx)}
                  onMoveTeachingToSubcat={(teachingIdx, toCatIdx, toSubcatIdx) => onMoveTeachingToSubcat(subcatIndex, teachingIdx, toCatIdx, toSubcatIdx)}
                  onDupTeachingToSubcat={(teachingIdx, toCatIdx, toSubcatIdx) => onDupTeachingToSubcat(subcatIndex, teachingIdx, toCatIdx, toSubcatIdx)}
                />
              )
            })
          })()}
        </div>
      )}
    </div>
  )
}
