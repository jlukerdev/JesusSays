function resolveTarget(dir, { currentScreen, catId, tabIndex, teaching, categories, activeBookFilter }) {
  const catIdx = categories.findIndex(c => c.id === catId)
  const cat = categories[catIdx]
  if (!cat) return null

  if (currentScreen === 'teaching' && teaching) {
    const subcat = cat.subcategories[tabIndex]
    const filtered = activeBookFilter
      ? subcat.teachings.filter(t => t.references.some(r => r.bookAbbr === activeBookFilter))
      : subcat.teachings
    const tIdx = filtered.findIndex(t => t.id === teaching.id)
    const nextTIdx = tIdx + dir
    if (nextTIdx >= 0 && nextTIdx < filtered.length) {
      return { screen: 'teaching', teachingId: filtered[nextTIdx].id, catId, tabIndex }
    }
  }

  const nextTabIndex = tabIndex + dir
  if (nextTabIndex >= 0 && nextTabIndex < cat.subcategories.length) {
    if (currentScreen === 'teaching') {
      const adjSubcat = cat.subcategories[nextTabIndex]
      const filteredAdj = activeBookFilter
        ? adjSubcat.teachings.filter(t => t.references.some(r => r.bookAbbr === activeBookFilter))
        : adjSubcat.teachings
      const target = dir === -1 ? filteredAdj[filteredAdj.length - 1] : filteredAdj[0]
      if (target) return { screen: 'teaching', teachingId: target.id, catId, tabIndex: nextTabIndex }
    }
    return { screen: 'category', catId, tabIndex: nextTabIndex }
  }

  const nextCatIdx = catIdx + dir
  if (nextCatIdx >= 0 && nextCatIdx < categories.length) {
    const nextCat = categories[nextCatIdx]
    const nextTab = dir === -1 ? nextCat.subcategories.length - 1 : 0
    return { screen: 'category', catId: nextCat.id, tabIndex: nextTab }
  }

  return null
}

function truncateLabel(text, maxLen = 32) {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text
}

function getTargetLabel(entry, categories) {
  if (!entry) return ''
  const cat = categories.find(c => c.id === entry.catId)
  if (entry.screen === 'teaching') {
    const t = cat?.subcategories?.flatMap(s => s.teachings).find(t => t.id === entry.teachingId)
    return truncateLabel(t?.text ?? '')
  }
  return truncateLabel(cat?.subcategories?.[entry.tabIndex]?.title ?? cat?.title ?? '')
}

export default function PrevNextBar({ currentScreen, catId, tabIndex, teaching, categories, activeBookFilter, onNavigate }) {
  const props = { currentScreen, catId, tabIndex, teaching, categories, activeBookFilter }
  const prevTarget = resolveTarget(-1, props)
  const nextTarget = resolveTarget(1, props)

  return (
    <div className="modern-pn-bar">
      <button
        className={`modern-pn-btn${!prevTarget ? ' modern-pn-btn--disabled' : ''}`}
        onClick={() => prevTarget && onNavigate(prevTarget)}
        disabled={!prevTarget}
      >
        <span className="modern-pn-arrow">‹</span>
        <div>
          <span className="modern-pn-name">{getTargetLabel(prevTarget, categories)}</span>
        </div>
      </button>
      <button
        className={`modern-pn-btn modern-pn-btn--right${!nextTarget ? ' modern-pn-btn--disabled' : ''}`}
        onClick={() => nextTarget && onNavigate(nextTarget)}
        disabled={!nextTarget}
      >
        <div style={{ textAlign: 'right' }}>
          <span className="modern-pn-name">{getTargetLabel(nextTarget, categories)}</span>
        </div>
        <span className="modern-pn-arrow">›</span>
      </button>
    </div>
  )
}
