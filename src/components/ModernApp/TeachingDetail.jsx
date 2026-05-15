import { useEffect, useState } from 'react'
import { ChevronLeft, BookOpen } from 'lucide-react'
import useStore from '../../store.js'
import { bibleApi } from '../../data/bibleApi.js'
import BibleContent from './BibleViewer/BibleContent.jsx'

function buildVerseSet(ranges) {
  const set = new Set()
  for (const [s, e] of ranges) {
    for (let v = s; v <= e; v++) set.add(v)
  }
  return set
}

function VerseSnippet({ scriptureRef }) {
  const bibleTranslation = useStore(s => s.bibleTranslation)
  const [verses, setVerses] = useState(null)
  const [error, setError]   = useState(false)

  const rangesKey = scriptureRef.ranges.map(r => r.join('-')).join(',')
  useEffect(() => {
    setVerses(null)
    setError(false)
    bibleApi.getChapter(bibleTranslation, scriptureRef.bookAbbr, scriptureRef.chapter)
      .then(allVerses => {
        const keep = buildVerseSet(scriptureRef.ranges)
        setVerses(allVerses.filter(v => keep.has(v.verse)))
      })
      .catch(() => setError(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bibleTranslation, scriptureRef.bookAbbr, scriptureRef.chapter, rangesKey])

  if (error) return (
    <div className="modern-verse-snippet">
      <span className="modern-verse-snippet__placeholder">Could not load verse.</span>
    </div>
  )

  if (!verses) return (
    <div className="modern-verse-snippet">
      <span className="modern-verse-snippet__placeholder">Loading…</span>
    </div>
  )

  return (
    <div className="modern-verse-snippet">
      <BibleContent verses={verses} highlightVerses={[]} hideSectionHeads />
    </div>
  )
}

export default function TeachingDetail({ teaching, catId, tabIndex, categories, onOpenBible, onGoToSubcat }) {
  const bibleTranslation = useStore(s => s.bibleTranslation)
  const cat = categories.find(c => c.id === catId)
  const subcat = cat?.subcategories?.[tabIndex] ?? null

  return (
    <div className="modern-teaching-detail">
      <div className="modern-detail-topbar">
        <button className="modern-detail-back-nav" onClick={onGoToSubcat}>
          <ChevronLeft size={14} /> Back to {subcat?.title}
        </button>
      </div>

      <div className="modern-detail-body">
        {/* Plain breadcrumb location */}
        <div className="modern-detail-location">
          <span className="modern-detail-location__cat">{cat?.title}</span>
          <span className="modern-detail-location__sep"> › </span>
          <span className="modern-detail-location__sub">{subcat?.title}</span>
        </div>

        {/* Teaching title + text */}
        {teaching.title && (
          <h1 className="modern-detail-title">{teaching.title}</h1>
        )}
        <p className="modern-detail-summary-text">{teaching.text}</p>
        {teaching.tags.length > 0 && (
          <div className="modern-detail-head-chips">
            {teaching.tags.map(tag => (
              <span key={tag} className={`modern-tag modern-tag--${tag}`}>{tag}</span>
            ))}
          </div>
        )}

        {/* Scripture References */}
        <div className="modern-detail-section">
          <div className="modern-detail-section__head">Scripture References · {bibleTranslation}</div>
          <div className="modern-detail-section__body">
            {teaching.references.map(ref => (
              <div key={ref.label} className="modern-ref-block">
                <div className="modern-ref-row"
                  role="button" tabIndex={0}
                  onClick={() => onOpenBible(ref)}
                  onKeyDown={(e) => e.key === 'Enter' && onOpenBible(ref)}
                >
                  <div className={`modern-ref-dot${ref.isPrimary ? ' modern-ref-dot--primary' : ''}`} />
                  <div className="modern-ref-info">
                    <div className="modern-ref-label">{ref.label}</div>
                  </div>
                  <span className="modern-ref-open"><BookOpen size={14} /></span>
                </div>
                <VerseSnippet scriptureRef={ref} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
