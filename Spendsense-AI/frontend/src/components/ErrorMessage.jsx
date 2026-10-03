import React from 'react'

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null
  return (
    <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
      <span>⚠️</span>
      <div style={{ flex: 1 }}>
        <div>{error}</div>
        {onRetry && (
          <button className="btn btn-sm btn-secondary" onClick={onRetry} style={{ marginTop: '8px' }}>
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
