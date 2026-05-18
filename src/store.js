import { create } from 'zustand'

const TRANSLATIONS = ['KJV', 'NKJV', 'NIV']

function initialDownloadStatus() {
  return Object.fromEntries(
    TRANSLATIONS.map(t => [t, { state: 'idle', progress: 0, downloadedBooks: [], bytes: 0, error: null }])
  )
}

const useStore = create((set) => ({
  showAbout: false,
  setShowAbout: (v) => set({ showAbout: v }),

  bibleFontSize: parseInt(localStorage.getItem('bibleFontSize') ?? '14', 10),
  setBibleFontSize: (size) => {
    localStorage.setItem('bibleFontSize', size)
    set({ bibleFontSize: size })
  },

  bibleTranslation: localStorage.getItem('bibleTranslation') ?? 'KJV',
  bibleBrowseBook: null,
  bibleBrowseChapter: 1,
  setBibleTranslation: (translation) => {
    localStorage.setItem('bibleTranslation', translation)
    set({ bibleTranslation: translation })
  },
  setBibleBrowseBook: (bookAbbr) => set({ bibleBrowseBook: bookAbbr }),
  setBibleBrowseChapter: (chapter) => set({ bibleBrowseChapter: chapter }),

  bibleBrowseTarget: null,
  setBibleBrowseTarget: (target) => set({ bibleBrowseTarget: target }),

  // Data loaded from teachings.json
  categories: [],
  meta: null,
  dataLoaded: false,
  dataError: null,
  setData: ({ categories, meta }) =>
    set({ categories, meta, dataLoaded: true, dataError: null }),
  setDataError: (err) => set({ dataError: err, dataLoaded: false }),

  // Per-translation offline download status
  // state: 'idle' | 'checking' | 'downloading' | 'complete' | 'error'
  bibleDownloadStatus: initialDownloadStatus(),
  setBibleDownloadStatus: (translation, patch) =>
    set(state => ({
      bibleDownloadStatus: {
        ...state.bibleDownloadStatus,
        [translation]: { ...state.bibleDownloadStatus[translation], ...patch }
      }
    })),
}))

export default useStore
