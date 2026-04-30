import { useState, useRef } from 'react'

export default function LoadPanel({ onLoad, isLoading, loadError }) {
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)
  const fileInputRef = useRef(null)

  function validateAndLoad(data, source, fileName) {
    if (!data || !Array.isArray(data.categories) || typeof data.meta !== 'object' || data.meta === null) {
      setLocalError('File does not appear to be a valid teachings.json')
      return
    }
    const clone = JSON.parse(JSON.stringify(data))
    onLoad({ data: clone, source, fileName })
  }

  async function handleLoadFromServer() {
    setLocalError(null)
    setLocalLoading(true)
    try {
      const res = await fetch('/JesusSays/teachings.json')
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      validateAndLoad(data, 'server', null)
    } catch (err) {
      setLocalError(err.message || 'Failed to load from server')
    } finally {
      setLocalLoading(false)
    }
  }

  function readFile(file) {
    if (!file) return
    setLocalError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        validateAndLoad(data, 'file', file.name)
      } catch {
        setLocalError('Invalid JSON file — could not parse')
      }
    }
    reader.readAsText(file)
  }

  function handleFileChange(e) {
    readFile(e.target.files[0])
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length === 0) return
    readFile(e.dataTransfer.files[0])
  }

  const displayError = localError || loadError

  return (
    <div className="opt-load-panel">
      <h2>Catalog Optimizer</h2>
      <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
        Load a teachings.json to begin editing.
      </p>
      <div className="opt-load-options">
        <div
          className="opt-load-card"
          onClick={handleLoadFromServer}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleLoadFromServer()}
        >
          <span style={{ fontSize: '2rem' }}>🌐</span>
          <strong>Load from server</strong>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            Fetch the live /JesusSays/teachings.json
          </span>
          {localLoading && <span style={{ fontSize: 'var(--text-xs)' }}>Loading…</span>}
        </div>

        <div
          className={`opt-load-card${dragOver ? ' opt-load-card--drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <span style={{ fontSize: '2rem' }}>📂</span>
          <strong>Upload local file</strong>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            Drag &amp; drop or click to select a .json file
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      {displayError && <p className="opt-error">{displayError}</p>}
    </div>
  )
}
