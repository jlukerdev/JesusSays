import { useEffect } from 'react'
import useStore from '../../../store.js'
import { useIsMobile } from '../../../hooks/useBreakpoint.js'
import BiblePanel from './BiblePanel.jsx'
import BibleDrawer from './BibleDrawer.jsx'
import { bibleApi } from '../../../data/bibleApi.js'
import { bibleOfflineStore } from '../../../data/BibleOfflineStore.js'
import { ENABLE_OFFLINE_BIBLE } from '../../../featureFlags.js'

export default function BibleViewer({ bibleRef, open, pinned, onClose, onTogglePin, onReopen, onWidthChange }) {
  const isMobile = useIsMobile()
  const categories          = useStore(s => s.categories)
  const bibleTranslation    = useStore(s => s.bibleTranslation)
  const bibleDownloadStatus = useStore(s => s.bibleDownloadStatus)
  const setBibleDownloadStatus = useStore(s => s.setBibleDownloadStatus)

  useEffect(() => {
    if (!ENABLE_OFFLINE_BIBLE || !open || !categories.length) return
    const { state } = bibleDownloadStatus[bibleTranslation]
    if (state === 'downloading' || state === 'complete' || state === 'checking') return
    triggerCatalogDownload(bibleTranslation)
  }, [open, bibleTranslation, categories.length])  // eslint-disable-line react-hooks/exhaustive-deps

  async function triggerCatalogDownload(translation) {
    setBibleDownloadStatus(translation, { state: 'checking' })

    const catalogBooks = new Set()
    for (const cat of categories) {
      for (const subcat of cat.subcategories ?? []) {
        for (const teaching of subcat.teachings ?? []) {
          for (const ref of teaching.references ?? []) {
            if (ref.bookAbbr) catalogBooks.add(ref.bookAbbr)
          }
        }
      }
    }
    const bookList = [...catalogBooks]

    try {
      const downloadedBooks = await bibleOfflineStore.getDownloadedBooks(translation)
      const needed = bookList.filter(b => !downloadedBooks.includes(b))

      if (needed.length === 0) {
        setBibleDownloadStatus(translation, { state: 'complete', downloadedBooks: bookList, progress: 1 })
        return
      }

      setBibleDownloadStatus(translation, { state: 'downloading', progress: 0 })

      await bibleOfflineStore.downloadBooks(
        translation,
        needed,
        (t, b, c) => bibleApi.fetchRawChapter(t, b, c),
        ({ done, total }) => {
          setBibleDownloadStatus(translation, { progress: total > 0 ? done / total : 0 })
        }
      )

      setBibleDownloadStatus(translation, {
        state: 'complete',
        downloadedBooks: [...downloadedBooks, ...needed],
        progress: 1,
      })
    } catch (err) {
      setBibleDownloadStatus(translation, { state: 'error', error: err.message })
    }
  }

  return isMobile
    ? <BibleDrawer bibleRef={bibleRef} open={open} onClose={onClose} onReopen={onReopen} />
    : <BiblePanel  bibleRef={bibleRef} open={open} pinned={pinned} onClose={onClose} onTogglePin={onTogglePin} onWidthChange={onWidthChange} />
}
