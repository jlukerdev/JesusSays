import { useEffect } from 'react'
import useStore from '../../store.js'
import { bibleOfflineStore } from '../../data/BibleOfflineStore.js'
import { bibleApi } from '../../data/bibleApi.js'
import { ENABLE_OFFLINE_BIBLE } from '../../featureFlags.js'

const TRANSLATIONS = ['KJV', 'NKJV', 'NIV']

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getCatalogBooks(categories) {
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
  return [...books]
}

export default function DownloadManager() {
  const categories          = useStore(s => s.categories)
  const bibleDownloadStatus = useStore(s => s.bibleDownloadStatus)
  const setBibleDownloadStatus = useStore(s => s.setBibleDownloadStatus)

  // On first render, check IDB for already-downloaded translations and sync Zustand state.
  useEffect(() => {
    if (!categories.length) return
    const bookList = getCatalogBooks(categories)
    TRANSLATIONS.forEach(async (t) => {
      if (bibleDownloadStatus[t].state !== 'idle') return
      try {
        const downloaded = await bibleOfflineStore.getDownloadedBooks(t)
        if (!downloaded.length) return
        const hasAllCatalog = bookList.every(b => downloaded.includes(b))
        const bytes = hasAllCatalog ? await bibleOfflineStore.getStorageBytes(t) : 0
        setBibleDownloadStatus(t, {
          state: hasAllCatalog ? 'complete' : 'idle',
          downloadedBooks: downloaded,
          bytes,
        })
      } catch {
        // IDB unavailable — leave state as idle
      }
    })
  }, [categories.length])  // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDownload(translation) {
    const bookList = getCatalogBooks(categories)
    setBibleDownloadStatus(translation, { state: 'downloading', progress: 0, error: null })
    try {
      const downloadedBooks = await bibleOfflineStore.getDownloadedBooks(translation)
      const needed = bookList.filter(b => !downloadedBooks.includes(b))
      if (needed.length === 0) {
        const bytes = await bibleOfflineStore.getStorageBytes(translation)
        setBibleDownloadStatus(translation, { state: 'complete', downloadedBooks: bookList, bytes, progress: 1 })
        return
      }
      await bibleOfflineStore.downloadBooks(
        translation,
        needed,
        (t, b, c) => bibleApi.fetchRawChapter(t, b, c),
        ({ done, total }) => setBibleDownloadStatus(translation, { progress: total > 0 ? done / total : 0 })
      )
      const bytes = await bibleOfflineStore.getStorageBytes(translation)
      setBibleDownloadStatus(translation, {
        state: 'complete',
        downloadedBooks: [...downloadedBooks, ...needed],
        bytes,
        progress: 1,
      })
    } catch (err) {
      setBibleDownloadStatus(translation, { state: 'error', error: err.message })
    }
  }

  async function handleDelete(translation) {
    try {
      await bibleOfflineStore.deleteTranslation(translation)
      bibleApi.clearCache(translation)
    } catch {
      // Continue even if IDB delete fails
    }
    setBibleDownloadStatus(translation, { state: 'idle', progress: 0, downloadedBooks: [], bytes: 0, error: null })
  }

  return (
    <div className="settings-menu__section">
      <div className="settings-menu__section-label">Bible Storage</div>
      {TRANSLATIONS.map(t => {
        const s = bibleDownloadStatus[t]
        const isActive = s.state === 'downloading' || s.state === 'checking'
        return (
          <div key={t} className="download-manager__row">
            <span className="download-manager__name">{t}</span>
            <span className="download-manager__info">
              {s.state === 'complete' && s.bytes > 0 && formatBytes(s.bytes)}
              {isActive && `${Math.round(s.progress * 100)}%`}
              {s.state === 'error' && <span className="download-manager__error">Error</span>}
            </span>
            {s.state === 'idle' && (
              <button className="download-manager__btn" onClick={() => handleDownload(t)}>Download</button>
            )}
            {isActive && (
              <span className="download-manager__spinner" aria-label="Downloading" />
            )}
            {s.state === 'complete' && (
              <button className="download-manager__btn download-manager__btn--delete" onClick={() => handleDelete(t)}>Delete</button>
            )}
            {s.state === 'error' && (
              <button className="download-manager__btn" onClick={() => handleDownload(t)}>Retry</button>
            )}
          </div>
        )
      })}
    </div>
  )
}

