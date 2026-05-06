import { createElement } from 'react'
import MiniSearch from 'minisearch'

const FIELDS = ['text', 'quote', 'categoryTitle', 'subcategoryTitle', 'tagsStr', 'referenceLabels']

const MINISEARCH_CONFIG = {
  idField: 'docId',
  fields: FIELDS,
  storeFields: ['categoryId', 'subcategoryId', ...FIELDS],
  tokenize: (text) =>
    text
      .replace(/['']/g, "'")
      .replace(/[—–]/g, ' ')
      .toLowerCase()
      .split(/[^a-z0-9']+/)
      .filter(Boolean),
  processTerm: (term) =>
    term.replace(/'s$/, 's').replace(/^'+|'+$/g, '') || null,
}

const DEFAULT_SEARCH_OPTIONS = {
  boost: {
    categoryTitle: 3,
    subcategoryTitle: 2,
    tagsStr: 1.5,
    referenceLabels: 1.5,
    text: 1,
    quote: 1,
  },
  // Fuzzy disabled on short terms: 0.2 * 4 chars rounds to 1 edit, 
  // Require 5+ chars before allowing typos.
  fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
  prefix: true,
  combineWith: 'AND',
}

let _miniSearch = null

export function buildSearchIndex(categories, { force = false } = {}) {
  if (_miniSearch && !force) return _miniSearch

  const documents = []
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      for (const teaching of sub.teachings) {
        documents.push({
          docId: teaching.id,
          categoryId: cat.id,
          subcategoryId: sub.id,
          text: teaching.text ?? '',
          quote: teaching.quote ?? '',
          tagsStr: teaching.tags.join(' '),
          referenceLabels: teaching.references.map(r => r.label).join(' '),
          categoryTitle: cat.title,
          subcategoryTitle: sub.title,
        })
      }
    }
  }

  _miniSearch = new MiniSearch(MINISEARCH_CONFIG)
  _miniSearch.addAll(documents)
  return _miniSearch
}

export function getSearchIndex() {
  return _miniSearch
}

/**
 * @param {string} rawQuery
 * @param {{ categoryId?: string }} [options]
 * @returns {{ results: object[], phraseFilter: string|null }}
 */
export function search(rawQuery, options = {}) {
  if (!_miniSearch || !rawQuery.trim()) return { results: [], phraseFilter: null }

  const { categoryId } = options

  const phraseMatch = rawQuery.match(/^"(.+)"$/)
  const phraseFilter = phraseMatch && phraseMatch[1].trim()
    ? phraseMatch[1].toLowerCase()
    : null
  const queryText = phraseFilter ?? rawQuery.trim()

  const filter = categoryId
    ? (result) => result.categoryId === categoryId
    : undefined

  const isPhraseSearch = Boolean(phraseFilter)

  let results = _miniSearch.search(queryText, {
    ...DEFAULT_SEARCH_OPTIONS,
    filter,
    fuzzy: isPhraseSearch ? false : DEFAULT_SEARCH_OPTIONS.fuzzy,
    prefix: isPhraseSearch ? false : DEFAULT_SEARCH_OPTIONS.prefix,
  })

  // Fall back to OR when AND yields nothing (non-phrase queries only)
  if (results.length === 0 && !isPhraseSearch) {
    results = _miniSearch.search(queryText, {
      ...DEFAULT_SEARCH_OPTIONS,
      filter,
      combineWith: 'OR',
    })
  }

  if (phraseFilter) {
    results = results.filter(r => {
      const haystack = FIELDS.map(f => r[f] ?? '').join(' ').toLowerCase()
      return haystack.includes(phraseFilter)
    })
  }

  return { results, phraseFilter }
}

/**
 * Maps a MiniSearch result back to { cat, sub, teaching, tabIndex }.
 * Pass a single-element array [cat] when scoped to one category.
 */
export function resolveResult(result, categories) {
  const cat = categories.find(c => c.id === result.categoryId)
  if (!cat) return {}
  const tabIndex = cat.subcategories.findIndex(s => s.id === result.subcategoryId)
  const sub = tabIndex >= 0 ? cat.subcategories[tabIndex] : null
  if (!sub) return { cat }
  const teaching = sub.teachings.find(t => t.id === result.id)
  return { cat, sub, teaching, tabIndex }
}

/**
 * Highlights all matched terms in text, returning an array of React nodes
 * (string segments interleaved with <mark> elements). Use result.terms from MiniSearch.
 */
export function highlightTerms(text, terms) {
  if (!terms || terms.length === 0) return text
  const pattern = terms
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  return text.split(regex).map((part, i) =>
    i % 2 === 1 ? createElement('mark', { key: i }, part) : part
  )
}
