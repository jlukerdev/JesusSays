import { useRef, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppHeader from './components/AppHeader/AppHeader.jsx'
import Layout from './components/Layout/Layout.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import CategoryViewer from './components/CategoryViewer/CategoryViewer.jsx'
import { loadTeachings } from './data/loader.js'
import { buildReverseIndex } from './data/reverseIndex.js'
import useStore from './store.js'

function BookViewerStub() {
  return (
    <div className="stub-view">
      <h2>Book Mode</h2>
      <p>Book viewer — coming in a later phase</p>
    </div>
  )
}

function AppRoutes() {
  const layoutRef = useRef(null)
  const setData = useStore((s) => s.setData)
  const setDataError = useStore((s) => s.setDataError)
  const dataLoaded = useStore((s) => s.dataLoaded)

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

  return (
    <>
      <AppHeader onOpenDrawer={handleOpenDrawer} />
      <Layout ref={layoutRef} sidebar={<Sidebar onNavClick={handleNavClick} />}>
        {!dataLoaded ? (
          <div className="data-loading">Loading teachings…</div>
        ) : (
          <Routes>
            <Route path="/category/:slug" element={<CategoryViewer />} />
            <Route path="/book/:bookAbbr" element={<BookViewerStub />} />
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
