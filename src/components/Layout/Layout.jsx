import { useState, useImperativeHandle, forwardRef } from 'react'
import { useIsMobile } from '../../hooks/useBreakpoint.js'

const Layout = forwardRef(function Layout({ sidebar, children }, ref) {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false)
  }))

  return (
    <>
      {isMobile && (
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
        {!isMobile && (
          <nav className="sidebar" aria-label="Table of contents">
            {sidebar}
          </nav>
        )}
        <main className="main-content">{children}</main>
      </div>
    </>
  )
})

export default Layout
