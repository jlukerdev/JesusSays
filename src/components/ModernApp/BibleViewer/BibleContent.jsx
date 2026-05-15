import { useEffect, useRef } from 'react'
import useStore from '../../../store.js'

function buildHighlightSet(ranges) {
  const set = new Set()
  for (const [start, end] of (ranges ?? [])) {
    for (let v = start; v <= end; v++) set.add(v)
  }
  return set
}

export default function BibleContent({ verses, highlightVerses, hideSectionHeads = false }) {
  const firstHighlightRef = useRef(null)
  const bibleFontSize = useStore(s => s.bibleFontSize)
  const highlightSet = buildHighlightSet(highlightVerses)

  useEffect(() => {
    if (!firstHighlightRef.current) return
    const el = firstHighlightRef.current
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'instant', block: 'center' })
    })
  }, [verses])

  if (!verses?.length) return null

  let firstHighlightAttached = false

  return (
    <div className="bible-content" style={{ fontSize: `${bibleFontSize}px` }}>
      {verses.map(({ verse, text, sectionHead }) => {
        const highlighted = highlightSet.has(verse)
        const isFirst = highlighted && !firstHighlightAttached
        if (isFirst) firstHighlightAttached = true

        return (
          <div key={verse}>
            {sectionHead && !hideSectionHeads && (
              <div className="bible-section-head">{sectionHead}</div>
            )}
            <div
              className={`bible-verse${highlighted ? ' bible-verse--highlight' : ''}`}
              ref={isFirst ? firstHighlightRef : null}
            >
              <sup className="bible-verse__num">{verse}</sup>
              {/* Content from controlled api.bible parsing; only <i> and <span class="wj"> tags reach here */}
              <span dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
