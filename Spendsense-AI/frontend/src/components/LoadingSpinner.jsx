import React from 'react'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{message}</span>
    </div>
  )
}

export function InlineSpinner() {
  return (
    <div style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  )
}
