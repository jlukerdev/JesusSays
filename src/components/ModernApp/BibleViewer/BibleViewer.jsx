import { useEffect } from 'react'
import useStore from '../../../store.js'
import { useIsMobile } from '../../../hooks/useBreakpoint.js'
import BiblePanel from './BiblePanel.jsx'
import BibleDrawer from './BibleDrawer.jsx'
import { bibleApi } from '../../../data/bibleApi.js'
import { bibleOfflineStore } from '../../../data/BibleOfflineStore.js'
import { ENABLE_OFFLINE_BIBLE, RESTRICT_TO_CATALOG } from '../../../featureFlags.js'
import { CATALOG_CHAPTERS, NT_BOOKS } from '../../../utils/bookOrder.js'

function buildCatalogChaptersMap(categories) {
  if (RESTRICT_TO_CATALOG) return { ...CATALOG_CHAPTERS }
  const books = new Set()
  for (const cat of categories) {
    for (const subcat of cat.subcategories ?? []) {
      for (const teaching of subcat.teachings ?? []) {
        for (const ref of teaching.references ?? []) {
          if (ref.bookAbbr) books.add(ref.bookAbbr)
        }
      }
    }
  }
  return Object.fromEntries([...books].map(abbr => {
    const book = NT_BOOKS.find(b => b.abbr === abbr)
    return [abbr, Array.from({ length: book?.chapters ?? 0 }, (_, i) => i + 1)]
  }))
}

export default function BibleViewer({ bibleRef, open, pinned, onClose, onTogglePin, onReopen, onWidthChange }) {
  const isMobile = useIsMobile()
  const categories          = useStore(s => s.categories)
  const bibleTranslation    = useStore(s => s.bibleTranslation)
  const bibleDownloadStatus = useStore(s => s.bibleDownloadStatus)
  const setBibleDownloadStatus = useStore(s => s.setBibleDownloadStatus)

  useEffect(() => {
    if (!ENABLE_OFFLINE_BIBLE || !open || !categories.length) return
    const { state } = bibleDownloadStatus[bibleTranslation]
    if (state === 'downloading' || state === 'complete' || state === 'checking' || state === 'error') return
    triggerCatalogDownload(bibleTranslation)
  }, [open, bibleTranslation, categories.length])  // eslint-disable-line react-hooks/exhaustive-deps

  async function triggerCatalogDownload(translation) {
    setBibleDownloadStatus(translation, { state: 'checking' })

    const chaptersMap = buildCatalogChaptersMap(categories)
    const bookList = Object.keys(chaptersMap)

    try {
      const downloadedBooks = await bibleOfflineStore.getDownloadedBooks(translation)
      const neededMap = Object.fromEntries(
        Object.entries(chaptersMap).filter(([abbr]) => !downloadedBooks.includes(abbr))
      )

      if (Object.keys(neededMap).length === 0) {
        setBibleDownloadStatus(translation, { state: 'complete', downloadedBooks: bookList, progress: 1 })
        return
      }

      setBibleDownloadStatus(translation, { state: 'downloading', progress: 0 })

      await bibleOfflineStore.downloadBooks(
        translation,
        neededMap,
        (t, b, c) => bibleApi.fetchRawChapter(t, b, c),
        ({ done, total }) => {
          setBibleDownloadStatus(translation, { progress: total > 0 ? done / total : 0 })
        }
      )

      const bytes = await bibleOfflineStore.getStorageBytes(translation)
      setBibleDownloadStatus(translation, {
        state: 'complete',
        downloadedBooks: [...downloadedBooks, ...Object.keys(neededMap)],
        progress: 1,
        bytes,
      })
    } catch (err) {
      setBibleDownloadStatus(translation, { state: 'error', error: err.message })
    }
  }

  return isMobile
    ? <BibleDrawer bibleRef={bibleRef} open={open} onClose={onClose} onReopen={onReopen} />
    : <BiblePanel  bibleRef={bibleRef} open={open} pinned={pinned} onClose={onClose} onTogglePin={onTogglePin} onWidthChange={onWidthChange} />
}
