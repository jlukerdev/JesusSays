import { useState, useImperativeHandle, forwardRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useBreakpoint.js'

const Layout = forwardRef(function Layout({ sidebar, children }, ref) {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const isOptimizer = location.pathname === '/catalog-optimizer'

  useImperativeHandle(ref, () => ({
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false)
  }))

  return (
    <>
      {!isOptimizer && isMobile && (
        <>
          <div
            className={`drawer-overlay${drawerOpen ? ' drawer-overlay--open' : ''}`}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`sidebar-drawer${drawerOpen ? ' sidebar-drawer--open' : ''}`}
            aria-label="Table of contents"
          >
            {sidebar}
          </div>
        </>
      )}

      <div className="app-layout">
        {!isOptimizer && !isMobile && (
          <nav className="sidebar" aria-label="Table of contents">
            {sidebar}
          </nav>
        )}
        {/* FilterBar: suppress on optimizer route — use !isOptimizer check here when FilterBar is implemented */}
        <main className={`main-content${isOptimizer ? ' layout__main--full' : ''}`}>{children}</main>
      </div>
    </>
  )
})

export default Layout
