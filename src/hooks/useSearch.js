import { useMemo } from 'react'
import { search } from '../utils/search.js'

/**
 * @param {string} rawQuery
 * @param {{ categoryId?: string }} [options]
 */
export function useSearch(rawQuery, options = {}) {
  const { categoryId } = options

  const { results, phraseFilter } = useMemo(() => {
    if (!rawQuery.trim()) return { results: [], phraseFilter: null }
    return search(rawQuery, { categoryId })
  }, [rawQuery, categoryId])

  return {
    results,
    phraseFilter,
    hasResults: results.length > 0,
    isSearching: rawQuery.trim().length > 0,
  }
}
