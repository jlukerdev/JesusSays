import { useRef, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppHeader from './components/AppHeader/AppHeader.jsx'
import Layout from './components/Layout/Layout.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import BookNav from './components/BookNav/BookNav.jsx'
import CategoryViewer from './components/CategoryViewer/CategoryViewer.jsx'
import BookViewer from './components/BookViewer/BookViewer.jsx'
import FilterBar from './components/FilterBar/FilterBar.jsx'
import { loadTeachings } from './data/loader.js'
import { buildReverseIndex } from './data/reverseIndex.js'
import useStore from './store.js'

function AppRoutes() {
  const layoutRef = useRef(null)
  const setData = useStore((s) => s.setData)
  const setDataError = useStore((s) => s.setDataError)
  const dataLoaded = useStore((s) => s.dataLoaded)
  const activeMode = useStore((s) => s.activeMode)

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
      <AppHeader onOpenDrawer={handleOpenDrawer} />
      <FilterBar />
      <Layout ref={layoutRef} sidebar={sidebarContent}>
        {!dataLoaded ? (
          <div className="data-loading">Loading teachings…</div>
        ) : (
          <Routes>
            <Route path="/category/:slug" element={<CategoryViewer />} />
            <Route path="/book/:bookAbbr" element={<BookViewer />} />
            <Route path="/" element={<Navigate to="/category/cat-1" replace />} />
          </Routes>
        )}
      </Layout>
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
