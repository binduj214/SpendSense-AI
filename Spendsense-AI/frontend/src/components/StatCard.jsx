import React from 'react'
import { formatCurrency } from '../utils/formatters'

export default function StatCard({ title, value, subtitle, icon, color = 'var(--primary)', trend }) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
            {typeof value === 'number' ? formatCurrency(value) : value}
          </div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div style={{ fontSize: '12px', marginTop: '6px', color: trend.positive ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>
              {trend.positive ? '▲' : '▼'} {trend.value}
            </div>
          )}
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: color + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: color,
        opacity: 0.6,
      }} />
    </div>
  )
}
