import React from 'react'
import { aiApi } from '../services/api'
import { useApi } from '../hooks/useApi'
import { usePageTitle } from '../hooks/usePageTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import CategoryBadge from '../components/CategoryBadge'
import { formatCurrency } from '../utils/formatters'

export default function AIInsights() {
  usePageTitle('AI Insights')
  const { data: insights, loading: insightsLoading, error: insightsError, refetch: refetchInsights } = useApi(aiApi.getInsights)
  const { data: predictions, loading: predLoading, error: predError, refetch: refetchPred } = useApi(aiApi.getPredictions)

  const loading = insightsLoading || predLoading
  const error = insightsError || predError

  if (loading) return <LoadingSpinner message="Generating AI insights..." />
  if (error) return <ErrorMessage error={error} onRetry={() => { refetchInsights(); refetchPred() }} />

  const { patterns, anomalies, recommendations } = insights || {}
  const hasData = patterns?.total_analyzed > 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Insights</h1>
        <p className="page-subtitle">Intelligent analysis of your financial patterns</p>
      </div>

      {!hasData && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <div className="empty-state-title">AI needs more data</div>
            <div className="empty-state-text">Add transactions to start receiving AI-powered insights and recommendations.</div>
          </div>
        </div>
      )}

      {hasData && (
        <>
          {/* Recommendations */}
          {recommendations?.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 className="card-title">💡 AI Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recommendations.map((rec, i) => (
                  <div key={i} className={`alert alert-${rec.severity === 'alert' ? 'danger' : rec.severity === 'warning' ? 'warning' : 'info'}`}
                    style={{ marginBottom: 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>{rec.title}</div>
                      <div style={{ fontSize: '13px', opacity: 0.9 }}>{rec.message}</div>
                      {rec.potential_savings > 0 && (
                        <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: '600', opacity: 0.85 }}>
                          💰 Potential savings: {formatCurrency(rec.potential_savings)}/month
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomaly Detection */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 className="card-title">🔍 Anomaly Detection</h3>
            {anomalies?.summary && (
              <div className={`alert ${anomalies.anomalies?.length > 0 ? 'alert-warning' : 'alert-success'}`} style={{ marginBottom: '16px' }}>
                {anomalies.summary}
              </div>
            )}
            {anomalies?.anomalies?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {anomalies.anomalies.map((a, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-main)',
                    border: `1px solid ${a.severity === 'high' ? '#FFCDD2' : '#FFE0B2'}`,
                    borderRadius: '8px',
                    padding: '14px',
                  }}>
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <CategoryBadge category={a.category} />
                      <span className={`badge ${a.severity === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                        {a.severity === 'high' ? '⚠️ High' : '📊 Medium'}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>{a.message}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Current</div>
                        <div style={{ fontWeight: '700', color: 'var(--danger)' }}>{formatCurrency(a.current_amount)}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Historical Avg</div>
                        <div style={{ fontWeight: '600' }}>{formatCurrency(a.historical_average)}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Change</div>
                        <div style={{ fontWeight: '700', color: 'var(--warning)' }}>+{a.percentage_change}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No unusual spending patterns detected. 🎉</div>
            )}
          </div>

          {/* Expense Predictions */}
          {predictions && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h3 className="card-title" style={{ marginBottom: 0 }}>🔮 Predicted Upcoming Expenses</h3>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                  {formatCurrency(predictions.total_predicted)}
                </div>
              </div>
              {predictions.note && (
                <div className="alert alert-info" style={{ marginBottom: '16px', fontSize: '12px' }}>
                  ℹ️ {predictions.note}
                </div>
              )}
              {predictions.predictions?.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Frequency</th>
                        <th>Confidence</th>
                        <th className="text-right">Predicted Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.predictions.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '500' }}>{p.description}</td>
                          <td><CategoryBadge category={p.category} /></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'capitalize' }}>{p.frequency}</td>
                          <td>
                            <span className={`badge ${p.confidence === 'high' ? 'badge-success' : p.confidence === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                              {p.confidence}
                            </span>
                          </td>
                          <td className="text-right" style={{ fontWeight: '700' }}>{formatCurrency(p.predicted_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Add more recurring transactions to see predictions.</div>
              )}
            </div>
          )}

          {/* Spending Patterns Summary */}
          {patterns?.frequent_categories?.length > 0 && (
            <div className="card">
              <h3 className="card-title">📊 Spending Patterns</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {patterns.frequent_categories.map((cat) => (
                  <div key={cat.category} style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '14px' }}>
                    <CategoryBadge category={cat.category} />
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{formatCurrency(cat.total)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.count} transactions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
