import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function OutlinePanel({ workingCopy, collapseGeneration, expandGeneration }) {
  const [openCats, setOpenCats] = useState(new Set())
  const [openSubcats, setOpenSubcats] = useState(new Set())

  const collapseRef = useRef(collapseGeneration)
  const expandRef = useRef(expandGeneration)

  useEffect(() => {
    if (collapseGeneration === collapseRef.current) return
    collapseRef.current = collapseGeneration
    setOpenCats(new Set())
    setOpenSubcats(new Set())
  }, [collapseGeneration])

  useEffect(() => {
    if (expandGeneration === expandRef.current) return
    expandRef.current = expandGeneration
    const allCats = new Set()
    const allSubcats = new Set()
    workingCopy.categories.filter(c => !c._hidden).forEach((cat, ci) => {
      allCats.add(ci)
      cat.subcategories.filter(s => !s._hidden).forEach((_, si) => {
        allSubcats.add(`${ci}-${si}`)
      })
    })
    setOpenCats(allCats)
    setOpenSubcats(allSubcats)
  }, [expandGeneration, workingCopy])

  if (!workingCopy) return null

  const visibleCategories = workingCopy.categories
    .map((cat, ci) => ({ cat, ci }))
    .filter(({ cat }) => !cat._hidden)

  return (
    <div className="opt-outline">
      <div className="opt-outline__heading">Catalog Outline</div>
      {visibleCategories.map(({ cat, ci }) => {
        const visibleSubcats = cat.subcategories
          .map((s, si) => ({ subcat: s, si }))
          .filter(({ subcat }) => !subcat._hidden)
        const teachingCount = visibleSubcats.reduce((sum, { subcat }) => {
          return sum + subcat.teachings.filter(t => !t._hidden).length
        }, 0)
        const isCatOpen = openCats.has(ci)

        return (
          <div key={ci}>
            <div
              className="opt-outline__cat"
              onClick={() => setOpenCats(prev => {
                const next = new Set(prev)
                next.has(ci) ? next.delete(ci) : next.add(ci)
                return next
              })}
            >
              {isCatOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cat.title}
              </span>
              <span className="opt-outline__count">{teachingCount}</span>
            </div>
            {isCatOpen && visibleSubcats.map(({ subcat, si }) => {
              const subcatKey = `${ci}-${si}`
              const isSubcatOpen = openSubcats.has(subcatKey)
              const visibleTeachings = subcat.teachings.filter(t => !t._hidden)
              return (
                <div key={si}>
                  <div
                    className="opt-outline__subcat"
                    onClick={() => setOpenSubcats(prev => {
                      const next = new Set(prev)
                      next.has(subcatKey) ? next.delete(subcatKey) : next.add(subcatKey)
                      return next
                    })}
                  >
                    {isSubcatOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {subcat.title}
                    </span>
                  </div>
                  {isSubcatOpen && visibleTeachings.map((teaching, ti) => {
                    const text = teaching.text || ''
                    return (
                      <div key={ti} className="opt-outline__teaching">
                        {text.length === 0
                          ? <em className="opt-outline__empty">(new teaching)</em>
                          : text}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
