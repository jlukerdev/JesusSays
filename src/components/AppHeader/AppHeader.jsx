import { useState } from 'react'
import { Menu, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ModeSwitcher from '../ModeSwitcher/ModeSwitcher.jsx'

export default function AppHeader({ onOpenDrawer }) {
  const navigate = useNavigate()

  return (
    <header className="app-header">
      <button
        className="btn-contents"
        onClick={onOpenDrawer}
        aria-label="Open table of contents"
      >
        <Menu size={16} />
        Contents
      </button>

      <h1 className="app-header__title">
        Jesus <span>Says</span>
      </h1>

      <div className="app-header__actions">
        <ModeSwitcher />
        <button
          className="btn-optimizer"
          onClick={() => navigate('/catalog-optimizer')}
          aria-label="Open Catalog Optimizer"
          title="Catalog Optimizer"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
