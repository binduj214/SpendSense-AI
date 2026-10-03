import React, { useState } from 'react'
import { incomeApi } from '../services/api'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Modal from '../components/Modal'
import { formatCurrency, formatDate, INCOME_SOURCES, getCurrentDate } from '../utils/formatters'

const EMPTY_FORM = { amount: '', source: 'Salary', date: getCurrentDate(), description: '' }

export default function Income() {
  const { addToast } = useToast()
  usePageTitle('Income')
  const { data: income, loading, error, refetch } = useApi(incomeApi.getAll)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const createMut = useMutation((data) => incomeApi.create(data))
  const updateMut = useMutation((id, data) => incomeApi.update(id, data))
  const deleteMut = useMutation((id) => incomeApi.delete(id))

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(''); setShowModal(true) }
  const openEdit = (rec) => {
    setForm({ amount: rec.amount, source: rec.source, date: rec.date, description: rec.description || '' })
    setEditingId(rec.id); setFormError(''); setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record?')) return
    const res = await deleteMut.mutate(id)
    if (res.success) { addToast('Income record deleted', 'success'); refetch() }
    else addToast(res.error || 'Failed to delete', 'error')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.amount || parseFloat(form.amount) <= 0) { setFormError('Amount must be greater than 0'); return }
    const payload = { ...form, amount: parseFloat(form.amount) }
    const res = editingId ? await updateMut.mutate(editingId, payload) : await createMut.mutate(payload)
    if (res.success) {
      setShowModal(false)
      addToast(editingId ? 'Income updated!' : 'Income added!', 'success')
      refetch()
    }
    else setFormError(res.error)
  }

  const totalIncome = income ? income.reduce((s, i) => s + i.amount, 0) : 0
  const sourceGroups = income ? income.reduce((acc, i) => {
    acc[i.source] = (acc[i.source] || 0) + i.amount; return acc
  }, {}) : {}

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Income</h1>
          <p className="page-subtitle">Track all your income sources</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Income</button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Income</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)' }}>{formatCurrency(totalIncome)}</div>
        </div>
        {Object.entries(sourceGroups).slice(0, 3).map(([source, amount]) => (
          <div key={source} className="card">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>{source}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(amount)}</div>
          </div>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {!loading && income && (
        <div className="card">
          {income.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💰</div>
              <div className="empty-state-title">No income records yet</div>
              <div className="empty-state-text">Add your first income record to start tracking</div>
              <button className="btn btn-primary mt-3" onClick={openAdd}>Add Income</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th className="text-right">Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {income.map((rec) => (
                    <tr key={rec.id}>
                      <td>
                        <span className="badge badge-success">{rec.source}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{rec.description || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(rec.date)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          background: 'var(--success-light)',
                          color: 'var(--success)',
                          fontSize: '13px',
                          fontWeight: '700',
                          letterSpacing: '0.2px',
                        }}>
                          +{formatCurrency(rec.amount)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn-icon" onClick={() => openEdit(rec)}>✏️</button>
                          <button className="btn-icon" onClick={() => handleDelete(rec.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit}>
          {formError && <div className="alert alert-danger" style={{ marginBottom: '12px' }}>{formError}</div>}
          <div className="form-group">
            <label className="form-label">Amount (₹) *</label>
            <input className="form-input" type="number" min="0.01" step="0.01"
              value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Source *</label>
            <select className="form-select" value={form.source} onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}>
              {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" type="text" placeholder="e.g. Monthly salary - TechCorp"
              value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createMut.loading || updateMut.loading}>
              {createMut.loading || updateMut.loading ? 'Saving...' : editingId ? 'Update' : 'Add Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
