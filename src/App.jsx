import { useRef, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AppHeader from './components/AppHeader/AppHeader.jsx'
import Layout from './components/Layout/Layout.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import BookNav from './components/BookNav/BookNav.jsx'
import CategoryViewer from './components/CategoryViewer/CategoryViewer.jsx'
import BookViewer from './components/BookViewer/BookViewer.jsx'
import FilterBar from './components/FilterBar/FilterBar.jsx'
import CatalogOptimizer from './components/CatalogOptimizer/CatalogOptimizer.jsx'
import { loadTeachings } from './data/loader.js'
import { buildReverseIndex } from './data/reverseIndex.js'
import useStore from './store.js'
import { useLocalPreference } from './hooks/useLocalPreference.js'
import ModernApp from './components/ModernApp/ModernApp.jsx'
import { ENABLE_CLASSIC_NAV, ENABLE_CATALOG_OPTIMIZER, ENABLE_ABOUT_PAGE } from './featureFlags.js'

function AppRoutes() {
  const layoutRef = useRef(null)
  const setData = useStore((s) => s.setData)
  const setDataError = useStore((s) => s.setDataError)
  const dataLoaded = useStore((s) => s.dataLoaded)
  const activeMode = useStore((s) => s.activeMode)
  const location = useLocation()
  const isOptimizer = ENABLE_CATALOG_OPTIMIZER && location.pathname === '/catalog-optimizer'

  const navStyle = useStore((s) => s.navStyle)
  const setNavStyle = useStore((s) => s.setNavStyle)
  const [persistedNavStyle, setPersistedNavStyle] = useLocalPreference('navStyle', 'modern')

  const setShowAbout = useStore((s) => s.setShowAbout)
  const [viewedVersion] = useLocalPreference('aboutViewedVersion', null)

  useEffect(() => {
    setNavStyle(persistedNavStyle)
  }, [])

  useEffect(() => {
    setPersistedNavStyle(navStyle)
  }, [navStyle])

  useEffect(() => {
    if (ENABLE_ABOUT_PAGE && viewedVersion !== __APP_VERSION__) {
      setShowAbout(true)
    }
  }, [])

  useEffect(() => {
    loadTeachings()
      .then(({ categories, meta }) => {
        buildReverseIndex(categories)
        setData({ categories, meta })
      })
      .catch((err) => setDataError(err.message))
  }, [])

  function handleOpenDrawer() {
    layoutRef.current?.openDrawer()
  }

  function handleNavClick() {
    layoutRef.current?.closeDrawer()
  }

  const sidebarContent =
    activeMode === 'book' ? (
      <BookNav onNavClick={handleNavClick} />
    ) : (
      <Sidebar onNavClick={handleNavClick} />
    )

  return (
    <>
      {(!ENABLE_CLASSIC_NAV || navStyle === 'modern') && !isOptimizer ? (
        <ModernApp />
      ) : (
        <>
          <AppHeader onOpenDrawer={handleOpenDrawer} />
          {!isOptimizer && <FilterBar />}
          <Layout ref={layoutRef} sidebar={sidebarContent}>
            <Routes>
              {ENABLE_CATALOG_OPTIMIZER && <Route path="/catalog-optimizer" element={<CatalogOptimizer />} />}
              <Route path="/category/:slug" element={
                !dataLoaded ? <div className="data-loading">Loading teachings…</div> : <CategoryViewer />
              } />
              <Route path="/book/:bookAbbr" element={
                !dataLoaded ? <div className="data-loading">Loading teachings…</div> : <BookViewer />
              } />
              <Route path="/" element={<Navigate to="/category/cat-1" replace />} />
            </Routes>
          </Layout>
        </>
      )}
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
