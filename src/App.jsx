import { useRef, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppHeader from './components/AppHeader/AppHeader.jsx'
import Layout from './components/Layout/Layout.jsx'
import { loadTeachings } from './data/loader.js'
import { buildReverseIndex } from './data/reverseIndex.js'
import useStore from './store.js'

function CategoryViewerStub() {
  return (
    <div className="stub-view">
      <h2>Category Mode</h2>
      <p>Category viewer — coming in Stage 5</p>
    </div>
  )
}

function BookViewerStub() {
  return (
    <div className="stub-view">
      <h2>Book Mode</h2>
      <p>Book viewer — coming in a later phase</p>
    </div>
  )
}

function SidebarStub({ onClose }) {
  return (
    <div style={{ padding: '1rem', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
      <p>Sidebar — coming in Stage 5</p>
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

  return (
    <>
      <AppHeader onOpenDrawer={handleOpenDrawer} />
      <Layout ref={layoutRef} sidebar={<SidebarStub />}>
        {!dataLoaded ? (
          <div className="data-loading">Loading teachings…</div>
        ) : (
          <Routes>
            <Route path="/category/:slug" element={<CategoryViewerStub />} />
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
