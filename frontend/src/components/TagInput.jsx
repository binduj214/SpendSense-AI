import React, { useState, useRef } from 'react'

const PRESET_TAGS = ['Food', 'Travel', 'Shopping', 'Bills', 'Emergency', 'Work', 'Personal', 'Health']

/**
 * TagInput — visual chip-based tag editor.
 * Stores tags as a comma-separated string (matches the backend `tags` column).
 *
 * Props:
 *   value    {string}  — comma-separated tags e.g. "travel,work"
 *   onChange {fn}      — called with new comma-separated string
 */
export default function TagInput({ value = '', onChange }) {
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef(null)

  // Parse current tags from the comma string
  const tags = value
    ? value.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || tags.includes(tag)) return
    onChange([...tags, tag].join(','))
    setInputVal('')
  }

  const removeTag = (tag) => {
    onChange(tags.filter(t => t !== tag).join(','))
  }

  const handleKeyDown = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault()
      addTag(inputVal)
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div>
      {/* Chip container */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
          padding: '7px 10px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)',
          cursor: 'text',
          minHeight: '40px',
          alignItems: 'center',
          transition: 'border-color 0.15s',
        }}
        onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--primary)'}
        onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        {tags.map(tag => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px 2px 9px',
              borderRadius: '12px',
              background: '#FFF3E0',
              color: '#8B6914',
              border: '1px solid #FFE0B2',
              fontSize: '12px',
              fontWeight: '600',
              lineHeight: 1.4,
            }}
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 1px', fontSize: '13px', lineHeight: 1,
                color: '#A67C1F', fontWeight: '700',
              }}
              title={`Remove #${tag}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputVal.trim()) addTag(inputVal) }}
          placeholder={tags.length === 0 ? 'Type a tag and press Enter or comma…' : ''}
          style={{
            border: 'none', outline: 'none',
            background: 'transparent',
            fontSize: '13px', color: 'var(--text-primary)',
            flexGrow: 1, minWidth: '120px',
            fontFamily: 'inherit',
            padding: '1px 2px',
          }}
        />
      </div>

      {/* Preset quick-add chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
        {PRESET_TAGS.filter(p => !tags.includes(p.toLowerCase())).map(p => (
          <button
            key={p}
            type="button"
            onClick={() => addTag(p)}
            style={{
              fontSize: '11px', padding: '2px 8px',
              borderRadius: '10px', border: '1px dashed var(--border)',
              background: 'var(--bg-main)', color: 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500',
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}
          >
            + {p}
          </button>
        ))}
      </div>
    </div>
  )
}
