import { useEffect, useRef } from 'react'

function buildHighlightSet(ranges) {
  const set = new Set()
  for (const [start, end] of (ranges ?? [])) {
    for (let v = start; v <= end; v++) set.add(v)
  }
  return set
}

export default function BibleContent({ verses, highlightVerses }) {
  const firstHighlightRef = useRef(null)
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
    <div className="bible-content">
      {verses.map(({ verse, text, sectionHead }) => {
        const highlighted = highlightSet.has(verse)
        const isFirst = highlighted && !firstHighlightAttached
        if (isFirst) firstHighlightAttached = true

        return (
          <div key={verse}>
            {sectionHead && (
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
