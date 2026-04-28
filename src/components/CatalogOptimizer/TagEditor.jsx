import { useState } from 'react'

export default function TagEditor({ tags, onChange }) {
  const [inputValue, setInputValue] = useState('')

  function commitTag(raw) {
    const newTag = raw.trim().toLowerCase()
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag])
    }
    setInputValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitTag(inputValue)
    } else if (e.key === ',') {
      e.preventDefault()
      commitTag(inputValue)
    }
  }

  return (
    <div className="opt-tags">
      {tags.map((tag, idx) => (
        <span key={idx} className="opt-tag-chip">
          {tag}
          <button
            className="opt-tag-remove"
            onClick={() => onChange(tags.filter((_, i) => i !== idx))}
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="opt-tag-add-input"
        placeholder="add tag…"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
