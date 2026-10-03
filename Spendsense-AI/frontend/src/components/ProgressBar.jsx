import React from 'react'

export default function ProgressBar({ value, max, showLabel = true, height = 8 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const cls = pct >= 100 ? 'progress-danger' : pct >= 80 ? 'progress-warning' : 'progress-ok'

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>{pct.toFixed(0)}% used</span>
        </div>
      )}
      <div className="progress-bar-container" style={{ height }}>
        <div className={`progress-bar ${cls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
