import { ChevronLeft } from 'lucide-react'

export default function TeachingDetail({ teaching, catId, tabIndex, categories, onOpenBible, onGoToSubcat }) {
  const cat = categories.find(c => c.id === catId)
  const subcat = cat?.subcategories?.[tabIndex] ?? null

  function formatRanges(ranges) {
    if (!ranges || ranges.length === 0) return ''
    return ranges.map(r => r[0] === r[1] ? `v.${r[0]}` : `vv.${r[0]}–${r[1]}`).join(', ')
  }

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

        {/* Card: Summary text */}
        <div className="modern-detail-section">
          <div className="modern-detail-section__head modern-detail-section__head--with-chips">
            <span>Teaching</span>
            {teaching.tags.length > 0 && (
              <div className="modern-detail-head-chips">
                {teaching.tags.map(tag => (
                  <span key={tag} className={`modern-tag modern-tag--${tag}`}>{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="modern-detail-section__body modern-detail-section__body--padded">
            <p className="modern-detail-summary-text">{teaching.text}</p>
          </div>
        </div>

        {/* Scripture References */}
        <div className="modern-detail-section">
          <div className="modern-detail-section__head">Scripture References</div>
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
                    <div className="modern-ref-subline">{ref.book} · {formatRanges(ref.ranges)}</div>
                  </div>
                  <span className="modern-ref-open">Open ›</span>
                </div>
                {/* VERSE SNIPPET SHELL — replace content when Bible API is connected */}
                <div className="modern-verse-snippet">
                  <span className="modern-verse-snippet__placeholder">Verse text coming soon…</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
