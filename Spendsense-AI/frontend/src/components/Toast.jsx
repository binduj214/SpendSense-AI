import React, { useState, useCallback, createContext, useContext, useEffect } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        zIndex: 9999, maxWidth: '360px',
      }}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const colors = {
    success: { bg: '#E8F5E9', border: '#A5D6A7', text: '#1B5E20', icon: '✅' },
    error:   { bg: '#FFEBEE', border: '#EF9A9A', text: '#B71C1C', icon: '❌' },
    warning: { bg: '#FFF8E1', border: '#FFE082', text: '#E65100', icon: '⚠️' },
    info:    { bg: '#E3F2FD', border: '#90CAF9', text: '#0D47A1', icon: 'ℹ️' },
  }
  const c = colors[toast.type] || colors.success

  return (
    <div onClick={() => onRemove(toast.id)} style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '10px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.3s ease, opacity 0.3s ease',
      fontSize: '13px',
      color: c.text,
      lineHeight: 1.5,
    }}>
      <span style={{ flexShrink: 0, fontSize: '16px' }}>{c.icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <span style={{ flexShrink: 0, opacity: 0.5, fontSize: '16px', lineHeight: 1 }}>×</span>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
