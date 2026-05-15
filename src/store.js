import { create } from 'zustand'

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
  setDataError: (err) => set({ dataError: err, dataLoaded: false })
}))

export default useStore
