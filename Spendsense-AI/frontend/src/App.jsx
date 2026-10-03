import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Income from './pages/Income'
import Budgets from './pages/Budgets'
import SavingsGoals from './pages/SavingsGoals'
import Analytics from './pages/Analytics'
import AIInsights from './pages/AIInsights'
import AIAssistant from './pages/AIAssistant'

function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: '12px', color: 'var(--text-muted)'
    }}>
      <div style={{ fontSize: '64px' }}>🔍</div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '14px' }}>The page you're looking for doesn't exist.</p>
      <a href="/dashboard" className="btn btn-primary" style={{ marginTop: '8px' }}>
        Go to Dashboard
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/transactions"  element={<Transactions />} />
              <Route path="/income"        element={<Income />} />
              <Route path="/budgets"       element={<Budgets />} />
              <Route path="/savings"       element={<SavingsGoals />} />
              <Route path="/analytics"     element={<Analytics />} />
              <Route path="/ai-insights"   element={<AIInsights />} />
              <Route path="/assistant"     element={<AIAssistant />} />
              <Route path="*"              element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
