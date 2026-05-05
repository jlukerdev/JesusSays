import { create } from 'zustand'

const useStore = create((set) => ({
  activeMode: 'category',
  activeCategorySlug: 'cat-1',
  activeBookAbbr: 'Matt',
  filters: {
    books: [],
    parablesOnly: false
  },
  fontSize: 's',
  theme: 'classic',
  navStyle: 'classic',
  showAbout: false,

  setActiveMode: (mode) => set({ activeMode: mode }),
  setActiveCategorySlug: (slug) => set({ activeCategorySlug: slug }),
  setActiveBookAbbr: (abbr) => set({ activeBookAbbr: abbr }),
  setFilters: (filters) => set({ filters }),
  setFontSize: (fontSize) => set({ fontSize }),
  setTheme: (theme) => set({ theme }),
  setNavStyle: (navStyle) => set({ navStyle }),
  setShowAbout: (v) => set({ showAbout: v }),

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
