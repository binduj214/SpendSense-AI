import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts'
import { analyticsApi } from '../services/api'
import { useApi } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { formatCurrency, CATEGORY_COLORS } from '../utils/formatters'

export default function Analytics() {
  const { data, loading, error, refetch } = useApi(analyticsApi.get)
  usePageTitle('Analytics')

  if (loading) return <LoadingSpinner message="Analyzing your spending..." />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />
  if (!data) return null

  const { patterns, monthly_comparison } = data

  if (!patterns.total_analyzed || patterns.total_analyzed === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📈</div>
            <div className="empty-state-title">Not enough data yet</div>
            <div className="empty-state-text">Add more transactions to see analytics and spending patterns.</div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare monthly comparison chart data
  const comparisonData = monthly_comparison.months?.map(month => {
    const row = { month: month.slice(5) }
    const monthData = monthly_comparison.data?.[month] || {}
    Object.entries(monthData).forEach(([cat, amt]) => { row[cat] = amt })
    return row
  }) || []

  const allCategories = [...new Set(comparisonData.flatMap(d => Object.keys(d).filter(k => k !== 'month')))]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Deep insights into your spending patterns</p>
      </div>

      {/* Pattern Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Transactions Analyzed</div>
          <div style={{ fontSize: '26px', fontWeight: '700' }}>{patterns.total_analyzed}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Expenses</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--danger)' }}>{formatCurrency(patterns.total_expenses || 0)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Avg Monthly Spend</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(patterns.average_monthly_spending)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Top Category</div>
          <div style={{ fontSize: '22px', fontWeight: '700' }}>{patterns.highest_category || '—'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{formatCurrency(patterns.highest_category_amount || 0)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Category Breakdown Pie */}
        {patterns.category_breakdown?.length > 0 && (
          <div className="card">
            <h3 className="card-title">Spending Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={patterns.category_breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={85} label={({ category, percentage }) => `${category} ${percentage}%`} labelLine={false}>
                  {patterns.category_breakdown.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#9E9E9E'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Trend */}
        {patterns.monthly_trends && Object.keys(patterns.monthly_trends).length > 0 && (
          <div className="card">
            <h3 className="card-title">Monthly Spending Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={Object.entries(patterns.monthly_trends).map(([m, v]) => ({ month: m.slice(5), amount: v }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 4 }} name="Spending" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Category Comparison */}
      {comparisonData.length > 0 && allCategories.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-title">Category Spending Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              {allCategories.map(cat => (
                <Bar key={cat} dataKey={cat} name={cat} fill={CATEGORY_COLORS[cat] || '#9E9E9E'} stackId="a" />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Details Table */}
      {patterns.category_breakdown?.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-title">Category Breakdown</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {patterns.category_breakdown.map(cat => (
                  <tr key={cat.category}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: CATEGORY_COLORS[cat.category] || '#9E9E9E', flexShrink: 0 }} />
                        {cat.category}
                      </div>
                    </td>
                    <td className="text-right" style={{ fontWeight: '600' }}>{formatCurrency(cat.amount)}</td>
                    <td className="text-right" style={{ color: 'var(--text-muted)' }}>{cat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Insights from pattern analysis */}
      {patterns.insights?.length > 0 && (
        <div className="card">
          <h3 className="card-title">Spending Insights</h3>
          {patterns.insights.map((insight, i) => (
            <div key={i} className="alert alert-info" style={{ marginBottom: '8px' }}>
              💡 {insight}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
