import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',             label: 'Dashboard',    emoji: '📊', end: true },
  { path: '/transactions', label: 'Transactions', emoji: '💳' },
  { path: '/income',       label: 'Income',       emoji: '💰' },
  { path: '/budgets',      label: 'Budgets',      emoji: '🎯' },
  { path: '/savings',      label: 'Savings Goals',emoji: '🏦' },
  { path: '/analytics',    label: 'Analytics',    emoji: '📈' },
  { path: '/ai-insights',  label: 'AI Insights',  emoji: '🤖' },
  { path: '/assistant',    label: 'AI Assistant', emoji: '💬' },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(o => !o)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">₹</div>
          <div>
            <div className="sidebar-logo-title">SpendSense AI</div>
            <div className="sidebar-logo-sub">Spend Wisely, Save Confidently</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, label, emoji, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                'sidebar-nav-item' + (isActive ? ' active' : '')
              }
            >
              <span className="nav-emoji" aria-hidden="true">{emoji}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-version">SpendSense AI v1.0</div>
          <div className="sidebar-tagline">All AI features run locally</div>
        </div>
      </aside>

      <style>{`
        /* ── Sidebar base ─────────────────── */
        .sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 240px;
          background: var(--bg-sidebar);
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow-y: auto;
          overflow-x: hidden;
          transition: transform 0.25s ease;
        }

        /* ── Logo ────────────────────────── */
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 6px;
          flex-shrink: 0;
        }
        .sidebar-logo-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #8B6914, #C49A2A);
          display: flex; align-items: center; justify-content: center;
          font-size: 19px; color: white; font-weight: 800;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(139,105,20,0.5);
        }
        .sidebar-logo-title {
          color: #ffffff;
          font-size: 14px; font-weight: 700;
          line-height: 1.2; letter-spacing: 0.1px;
        }
        .sidebar-logo-sub {
          color: rgba(181,154,114,0.65);
          font-size: 10px; margin-top: 2px; line-height: 1.3;
        }

        /* ── Nav ─────────────────────────── */
        .sidebar-nav {
          flex: 1;
          padding: 4px 10px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          color: rgba(181,154,114,0.72);
          text-decoration: none;
          font-size: 13.5px; font-weight: 500;
          border-left: 3px solid transparent;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .sidebar-nav-item:hover {
          background: rgba(255,255,255,0.07);
          color: #F5E9D0;
        }
        .sidebar-nav-item.active {
          background: rgba(255,255,255,0.1);
          color: #ffffff;
          border-left-color: #C49A2A;
          font-weight: 600;
        }
        .nav-emoji {
          font-size: 16px;
          flex-shrink: 0;
          width: 20px;
          text-align: center;
        }

        /* ── Footer ──────────────────────── */
        .sidebar-footer {
          padding: 14px 16px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sidebar-version  { color: rgba(181,154,114,0.55); font-size: 11px; font-weight: 600; }
        .sidebar-tagline  { color: rgba(181,154,114,0.3); font-size: 10px; margin-top: 2px; }

        /* ── Mobile toggle button ─────────── */
        .mobile-menu-btn {
          display: none;
          position: fixed; top: 14px; left: 14px;
          z-index: 200;
          background: var(--bg-sidebar);
          border: none; border-radius: 8px;
          padding: 8px 11px;
          cursor: pointer;
          font-size: 18px; color: #F5E9D0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          line-height: 1;
        }

        /* ── Backdrop ─────────────────────── */
        .sidebar-backdrop {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 99;
          backdrop-filter: blur(1px);
        }

        /* ── Responsive ───────────────────── */
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.sidebar-open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.3); }
          .mobile-menu-btn { display: flex; }
          .sidebar-backdrop { display: block; }
        }
      `}</style>
    </>
  )
}
