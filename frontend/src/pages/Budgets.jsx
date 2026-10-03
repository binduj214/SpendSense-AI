import React, { useState, useCallback } from 'react'
import { budgetApi } from '../services/api'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Modal from '../components/Modal'
import ProgressBar from '../components/ProgressBar'
import CategoryBadge from '../components/CategoryBadge'
import { formatCurrency, CATEGORIES, getCurrentMonth, formatMonth } from '../utils/formatters'

const EMPTY_FORM = { category: 'Food', monthly_limit: '', month: getCurrentMonth() }

export default function Budgets() {
  const { addToast } = useToast()
  usePageTitle('Budgets')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [copying, setCopying] = useState(false)
  const fetchUtilization = useCallback(() => budgetApi.getUtilization(selectedMonth), [selectedMonth])
  const { data: utilization, loading, error, refetch } = useApi(fetchUtilization)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const createMut = useMutation((data) => budgetApi.create(data))
  const updateMut = useMutation((id, data) => budgetApi.update(id, data))
  const deleteMut = useMutation((id) => budgetApi.delete(id))

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, month: selectedMonth })
    setEditingId(null)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (b) => {
    setForm({ category: b.category, monthly_limit: b.monthly_limit, month: b.month || selectedMonth })
    setEditingId(b.id)
    setFormError('')
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    const res = await deleteMut.mutate(id)
    if (res.success) { addToast('Budget deleted', 'success'); refetch() }
    else addToast(res.error || 'Failed to delete', 'error')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.monthly_limit || parseFloat(form.monthly_limit) <= 0) {
      setFormError('Budget limit must be greater than 0')
      return
    }
    const payload = { ...form, monthly_limit: parseFloat(form.monthly_limit) }
    const res = editingId
      ? await updateMut.mutate(editingId, payload)
      : await createMut.mutate(payload)
    if (res.success) {
      setShowModal(false)
      addToast(editingId ? 'Budget updated!' : 'Budget created!', 'success')
      refetch()
    } else {
      setFormError(res.error)
    }
  }

  const handleCopyToNextMonth = async () => {
    if (!utilization || utilization.length === 0) {
      addToast('No budgets in this month to copy.', 'warning')
      return
    }
    const [y, m] = selectedMonth.split('-').map(Number)
    const nextMonth = m === 12
      ? `${y + 1}-01`
      : `${y}-${String(m + 1).padStart(2, '0')}`
    if (!window.confirm(
      `Copy ${utilization.length} budget(s) from ${formatMonth(selectedMonth)} to ${formatMonth(nextMonth)}?`
    )) return

    setCopying(true)
    try {
      const result = await budgetApi.copyToNextMonth(selectedMonth)
      addToast(result.message, result.copied > 0 ? 'success' : 'info')
    } catch (err) {
      addToast(err.message || 'Failed to copy budgets.', 'error')
    } finally {
      setCopying(false)
    }
  }

  const totalBudget = utilization ? utilization.reduce((s, b) => s + b.monthly_limit, 0) : 0
  const totalSpent = utilization ? utilization.reduce((s, b) => s + b.spent, 0) : 0
  const exceeded = utilization ? utilization.filter(b => b.status === 'exceeded').length : 0

  return (
    <div>
      {/* Page header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set and monitor your monthly spending limits</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: '160px' }}
          />
          {/* Copy to Next Month button — only shown when budgets exist */}
          {utilization && utilization.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={handleCopyToNextMonth}
              disabled={copying}
              title="Duplicate these budgets into next month"
              style={{ whiteSpace: 'nowrap' }}
            >
              {copying ? '⏳ Copying…' : '📋 Copy to Next Month'}
            </button>
          )}
          <button className="btn btn-primary" onClick={openAdd}>+ Add Budget</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Budget</div>
          <div style={{ fontSize: '26px', fontWeight: '700' }}>{formatCurrency(totalBudget)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Spent</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: totalSpent > totalBudget ? 'var(--danger)' : 'var(--primary)' }}>
            {formatCurrency(totalSpent)}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Remaining</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--success)' }}>
            {formatCurrency(Math.max(0, totalBudget - totalSpent))}
          </div>
        </div>
        {exceeded > 0 && (
          <div className="card" style={{ border: '1px solid #FFCDD2' }}>
            <div style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Over Budget</div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--danger)' }}>{exceeded} categories</div>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {!loading && utilization && (
        utilization.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-title">No budgets set for {formatMonth(selectedMonth)}</div>
              <div className="empty-state-text">Create category budgets to track your spending limits</div>
              <button className="btn btn-primary mt-3" onClick={openAdd}>Set Budget</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {utilization.map((b) => (
              <div
                key={b.id}
                className="card"
                style={{ borderLeft: `4px solid ${b.status === 'exceeded' ? 'var(--danger)' : b.status === 'warning' ? 'var(--warning)' : 'var(--primary)'}` }}
              >
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <CategoryBadge category={b.category} />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn-icon" title="Edit" onClick={() => openEdit(b)}>✏️</button>
                    <button className="btn-icon" title="Delete" onClick={() => handleDelete(b.id)}>🗑️</button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(b.spent)}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', alignSelf: 'flex-end' }}>
                    / {formatCurrency(b.monthly_limit)}
                  </span>
                </div>
                <ProgressBar value={b.spent} max={b.monthly_limit} showLabel={false} />
                <div className="flex-between mt-2" style={{ fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{b.utilization_percent.toFixed(0)}% used</span>
                  {b.status === 'exceeded' ? (
                    <span style={{ color: 'var(--danger)', fontWeight: '600' }}>
                      Over by {formatCurrency(b.spent - b.monthly_limit)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--success)' }}>{formatCurrency(b.remaining)} left</span>
                  )}
                </div>
                {b.status === 'exceeded' && (
                  <div className="alert alert-danger" style={{ margin: '8px 0 0', padding: '6px 10px', fontSize: '12px' }}>
                    Budget exceeded! Reduce {b.category.toLowerCase()} spending.
                  </div>
                )}
                {b.status === 'warning' && (
                  <div className="alert alert-warning" style={{ margin: '8px 0 0', padding: '6px 10px', fontSize: '12px' }}>
                    80%+ budget used. Spend carefully!
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Budget' : 'Add Budget'}>
        <form onSubmit={handleSubmit}>
          {formError && <div className="alert alert-danger" style={{ marginBottom: '12px' }}>{formError}</div>}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.filter(c => c !== 'Other').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Limit (₹) *</label>
            <input
              className="form-input"
              type="number"
              min="1"
              step="100"
              value={form.monthly_limit}
              onChange={(e) => setForm(f => ({ ...f, monthly_limit: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Month *</label>
            <input
              className="form-input"
              type="month"
              value={form.month}
              onChange={(e) => setForm(f => ({ ...f, month: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createMut.loading || updateMut.loading}>
              {createMut.loading || updateMut.loading ? 'Saving...' : editingId ? 'Update' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
