import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { dashboardApi, aiApi } from '../services/api'
import { useApi } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import CategoryBadge from '../components/CategoryBadge'
import ProgressBar from '../components/ProgressBar'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/formatters'

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const { data, loading, error, refetch: refetchDashboard } = useApi(dashboardApi.get)
  const { refetch: refetchAI, data: aiData } = useApi(aiApi.getInsights)
  usePageTitle('Dashboard')

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchDashboard(), refetchAI()])
      setLastRefreshed(new Date())
    } finally {
      setRefreshing(false)
    }
  }, [refetchDashboard, refetchAI])

  if (loading) return <LoadingSpinner message="Loading dashboard..." />
  if (error) return <ErrorMessage error={error} onRetry={refetchDashboard} />
  if (!data) return null

  const { summary, budget, category_spending, monthly_trend, savings_goals, recent_transactions } = data
  const topRecs = aiData?.recommendations?.slice(0, 3) || []
  const anomalies = aiData?.anomalies?.anomalies?.slice(0, 2) || []

  return (
    <div>
      {/* Page header with refresh */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {lastRefreshed
              ? `Last refreshed at ${lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Your financial overview at a glance'}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh all dashboard data"
          style={{ gap: '6px', minWidth: '110px' }}
        >
          <span
            style={{
              display: 'inline-block',
              animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
              fontSize: '15px',
              lineHeight: 1,
            }}
          >
            ↻
          </span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <StatCard title="Total Income" value={summary.total_income} icon="💰" color="#2E7D32"
          subtitle={`This month: ${formatCurrency(summary.monthly_income)}`} />
        <StatCard title="Total Expenses" value={summary.total_expenses} icon="💸" color="#C62828"
          subtitle={`This month: ${formatCurrency(summary.monthly_expenses)}`} />
        <StatCard title="Net Balance" value={summary.balance} icon="💵"
          color={summary.balance >= 0 ? '#2E7D32' : '#C62828'}
          subtitle={`Monthly: ${formatCurrency(summary.monthly_balance)}`} />
        <StatCard title="Total Savings" value={summary.total_savings} icon="🏦" color="#8B6914"
          subtitle="Across all goals" />
      </div>

      {/* Budget Overview */}
      {budget.total_budget > 0 && (
        <div className="card mb-4" style={{ marginBottom: '20px' }}>
          <div className="flex-between mb-4">
            <h3 className="card-title" style={{ marginBottom: 0 }}>Monthly Budget Overview</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {formatCurrency(budget.total_spent)} / {formatCurrency(budget.total_budget)} used ({budget.utilization_percent.toFixed(0)}%)
            </div>
          </div>
          <ProgressBar value={budget.total_spent} max={budget.total_budget} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {budget.categories.map((b) => (
              <div key={b.category} style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <CategoryBadge category={b.category} />
                  <span style={{ fontSize: '12px', color: b.status === 'exceeded' ? 'var(--danger)' : b.status === 'warning' ? 'var(--warning)' : 'var(--text-muted)', fontWeight: '600' }}>
                    {b.percent.toFixed(0)}%
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                </div>
                <ProgressBar value={b.spent} max={b.limit} showLabel={false} height={5} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Spending by Category */}
        {category_spending.length > 0 && (
          <div className="card">
            <h3 className="card-title">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={category_spending} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {category_spending.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#9E9E9E'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Trend */}
        {monthly_trend.length > 0 && (
          <div className="card">
            <h3 className="card-title">Income vs Expenses Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly_trend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#66BB6A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF5350" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Savings Goals + Recent Transactions */}
      <div className="charts-grid">
        {/* Savings Goals */}
        {savings_goals.length > 0 && (
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Savings Goals</h3>
              <Link to="/savings" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                View all →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savings_goals.slice(0, 4).map((goal) => (
                <div key={goal.id}>
                  <div className="flex-between" style={{ marginBottom: '6px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>
                      {goal.name}
                      {goal.is_completed && <span className="badge badge-success" style={{ marginLeft: '6px' }}>✓ Done</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </div>
                  </div>
                  <ProgressBar value={goal.current} max={goal.target} showLabel={false} />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {goal.percent.toFixed(0)}% achieved
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {recent_transactions.length > 0 && (
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Recent Transactions</h3>
              <Link to="/transactions" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                View all →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recent_transactions.map((txn) => (
                <div key={txn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: txn.type === 'income' ? 'var(--success-light)' : 'var(--danger-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                    }}>
                      {txn.type === 'income' ? '💰' : getCategoryEmoji(txn.category)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{txn.description || txn.category}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(txn.date)}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      background: txn.type === 'income' ? 'var(--success-light)' : 'var(--danger-light)',
                      color: txn.type === 'income' ? 'var(--success)' : 'var(--danger)',
                      fontSize: '13px',
                      fontWeight: '700',
                      letterSpacing: '0.2px',
                      whiteSpace: 'nowrap',
                    }}>
                      {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Preview */}
      {(topRecs.length > 0 || anomalies.length > 0) && (
        <div className="card" style={{ marginBottom: '8px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>🤖 AI Insights</h3>
            <Link to="/ai-insights" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
              Full report →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {anomalies.map((a, i) => (
              <div key={'a' + i} className="alert alert-warning" style={{ margin: 0, fontSize: '13px' }}>
                <strong>{a.category}:</strong> {a.message}
              </div>
            ))}
            {topRecs.map((rec, i) => (
              <div key={'r' + i} className={`alert alert-${rec.severity === 'alert' ? 'danger' : rec.severity === 'warning' ? 'warning' : 'info'}`} style={{ margin: 0, fontSize: '13px' }}>
                <strong>{rec.title}:</strong> {rec.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getCategoryEmoji(category) {
  const map = {
    Food: '🍔', Shopping: '🛍️', Transport: '🚗', Bills: '📄',
    Entertainment: '🎬', Healthcare: '💊', Education: '📚', Rent: '🏠', Other: '💼'
  }
  return map[category] || '💸'
}
