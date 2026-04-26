import { NT_BOOK_ABBR_ORDER } from '../utils/bookOrder.js'

let _index = null

export function buildReverseIndex(categories) {
  if (_index) return _index

  const index = {}

  for (const category of categories) {
    for (const subcat of category.subcategories) {
      for (const teaching of subcat.teachings) {
        for (const ref of teaching.references) {
          const { bookAbbr, chapter, ranges } = ref
          if (!index[bookAbbr]) index[bookAbbr] = {}
          if (!index[bookAbbr][chapter]) index[bookAbbr][chapter] = []

          for (const [start, end] of ranges) {
            for (let v = start; v <= end; v++) {
              const entry = { verse: v, teaching, category, subcat, ref }
              index[bookAbbr][chapter].push(entry)
            }
          }
        }
      }
    }
  }

  // Sort chapters within each book numerically
  for (const book of Object.keys(index)) {
    const sorted = {}
    for (const ch of Object.keys(index[book]).sort((a, b) => Number(a) - Number(b))) {
      sorted[Number(ch)] = index[book][ch].sort((a, b) => a.verse - b.verse)
    }
    index[book] = sorted
  }

  // Sort books by canonical NT order
  const sortedIndex = {}
  for (const abbr of NT_BOOK_ABBR_ORDER) {
    if (index[abbr]) sortedIndex[abbr] = index[abbr]
  }

  _index = sortedIndex
  return _index
}

export function getReverseIndex() {
  return _index
}
