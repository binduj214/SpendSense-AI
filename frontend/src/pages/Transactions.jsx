import React, { useState, useCallback } from 'react'
import { transactionApi } from '../services/api'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import CategoryBadge from '../components/CategoryBadge'
import Modal from '../components/Modal'
import TagInput from '../components/TagInput'
import { formatCurrency, formatDate, CATEGORIES, PAYMENT_METHODS, getCurrentDate } from '../utils/formatters'

const EMPTY_FORM = {
  amount: '', category: 'Food', description: '', date: getCurrentDate(),
  payment_method: 'UPI', type: 'expense', notes: '', tags: ''
}

export default function Transactions() {
  const { addToast } = useToast()
  usePageTitle('Transactions')
  const [filters, setFilters] = useState({
    category: '', search: '', type: '',
    start_date: '', end_date: '',
    sort_by: 'date', sort_order: 'desc'
  })
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [categorizing, setCategorizing] = useState(false)

  // Build query params — drop empty strings
  const queryParams = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '')
  )
  const fetchFn = useCallback(
    () => transactionApi.getAll(queryParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(queryParams)]
  )
  const { data: transactions, loading, error, refetch } = useApi(fetchFn)

  const createMut = useMutation((data) => transactionApi.create(data))
  const updateMut = useMutation((id, data) => transactionApi.update(id, data))
  const deleteMut = useMutation((id) => transactionApi.delete(id))

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, date: getCurrentDate() })
    setEditingId(null)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (txn) => {
    setForm({
      amount: txn.amount,
      category: txn.category,
      description: txn.description || '',
      date: txn.date,
      payment_method: txn.payment_method || 'UPI',
      type: txn.type,
      notes: txn.notes || '',
      tags: txn.tags || '',
    })
    setEditingId(txn.id)
    setFormError('')
    setShowModal(true)
  }

  // Auto-categorize when description loses focus
  const handleDescriptionBlur = async () => {
    if (!form.description || form.description.length < 3) return
    setCategorizing(true)
    try {
      const result = await transactionApi.categorize(form.description)
      if (result.suggested_category && result.suggested_category !== 'Other') {
        setForm(f => ({ ...f, category: result.suggested_category }))
      }
    } catch {
      // silent — categorization is best-effort
    } finally {
      setCategorizing(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    const res = await deleteMut.mutate(id)
    if (res.success) {
      addToast('Transaction deleted successfully', 'success')
      refetch()
    } else {
      addToast(res.error || 'Failed to delete transaction', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setFormError('Amount must be greater than 0')
      return
    }
    if (!form.date) { setFormError('Date is required'); return }

    const payload = { ...form, amount: parseFloat(form.amount) }
    let res
    if (editingId) {
      res = await updateMut.mutate(editingId, payload)
    } else {
      res = await createMut.mutate(payload)
    }
    if (res.success) {
      setShowModal(false)
      addToast(
        editingId ? 'Transaction updated!' : 'Transaction added!',
        'success'
      )
      refetch()
    } else {
      setFormError(res.error)
    }
  }

  const isMutating = createMut.loading || updateMut.loading
  const totalShown = transactions?.length || 0
  const totalAmount = transactions
    ? transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    : 0

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            {totalShown > 0
              ? `${totalShown} transactions · ${formatCurrency(totalAmount)} in expenses`
              : 'Manage and track all your transactions'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Transaction</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', alignItems: 'end' }}>
          <div>
            <div className="form-label">Search</div>
            <input
              className="form-input"
              placeholder="Description..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div>
            <div className="form-label">Category</div>
            <select className="form-select" value={filters.category}
              onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="form-label">Type</div>
            <select className="form-select" value={filters.type}
              onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <div className="form-label">From Date</div>
            <input className="form-input" type="date" value={filters.start_date}
              onChange={(e) => setFilters(f => ({ ...f, start_date: e.target.value }))} />
          </div>
          <div>
            <div className="form-label">To Date</div>
            <input className="form-input" type="date" value={filters.end_date}
              onChange={(e) => setFilters(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          <div>
            <div className="form-label">Sort</div>
            <select className="form-select" value={filters.sort_order}
              onChange={(e) => setFilters(f => ({ ...f, sort_order: e.target.value }))}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
          {(filters.search || filters.category || filters.type || filters.start_date || filters.end_date) && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-end' }}
              onClick={() => setFilters({ category: '', search: '', type: '', start_date: '', end_date: '', sort_by: 'date', sort_order: 'desc' })}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {!loading && transactions && (
        <div className="card">
          {transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-title">No transactions found</div>
              <div className="empty-state-text">
                {filters.search || filters.category || filters.type
                  ? 'Try adjusting your filters'
                  : 'Add your first transaction to get started'}
              </div>
              <button className="btn btn-primary mt-3" onClick={openAdd}>Add Transaction</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Notes / Tags</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td style={{
                        fontWeight: '500',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {txn.description || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td><CategoryBadge category={txn.category} /></td>
                      <td style={{ maxWidth: '180px' }}>
                        {txn.tags && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: txn.notes ? '4px' : 0 }}>
                            {txn.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                              <span key={tag} style={{
                                fontSize: '10px', fontWeight: '600',
                                padding: '1px 7px', borderRadius: '10px',
                                background: '#FFF3E0', color: '#8B6914',
                                border: '1px solid #FFE0B2',
                                whiteSpace: 'nowrap',
                              }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {txn.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {txn.notes}
                          </div>
                        )}
                        {!txn.tags && !txn.notes && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDate(txn.date)}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px', color: 'var(--text-muted)',
                          background: 'var(--bg-main)', padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {txn.payment_method}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${txn.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td style={{
                        textAlign: 'right',
                        fontWeight: '700',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          background: txn.type === 'income' ? 'var(--success-light)' : 'var(--danger-light)',
                          color: txn.type === 'income' ? 'var(--success)' : 'var(--danger)',
                          fontSize: '13px',
                          fontWeight: '700',
                          letterSpacing: '0.2px',
                        }}>
                          {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '2px' }}>
                          <button
                            className="btn-icon"
                            title="Edit transaction"
                            onClick={() => openEdit(txn)}
                            style={{ fontSize: '15px' }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon"
                            title="Delete transaction"
                            onClick={() => handleDelete(txn.id)}
                            style={{ fontSize: '15px' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer summary */}
              <div style={{
                borderTop: '1px solid var(--border)',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}>
                <span>{totalShown} record{totalShown !== 1 ? 's' : ''}</span>
                <span>
                  Total expenses:{' '}
                  <strong style={{
                    color: 'var(--danger)',
                    background: 'var(--danger-light)',
                    padding: '1px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}>
                    −{formatCurrency(totalAmount)}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Transaction' : 'Add Transaction'}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="alert alert-danger" style={{ marginBottom: '12px' }}>
              ⚠️ {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                className="form-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                required
                autoFocus={!editingId}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                className="form-input"
                type="date"
                value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Category *
                {categorizing && (
                  <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--primary)', fontWeight: '400' }}>
                    ✨ Detecting...
                  </span>
                )}
              </label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={form.payment_method}
                onChange={(e) => setForm(f => ({ ...f, payment_method: e.target.value }))}
              >
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Description
                <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>
                  (category auto-detected on blur)
                </span>
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Swiggy dinner order, Uber cab ride..."
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                onBlur={handleDescriptionBlur}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Tags
                <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>
                  comma-separated, e.g. travel, work, emergency
                </span>
              </label>
              <TagInput
                value={form.tags}
                onChange={(val) => setForm(f => ({ ...f, tags: val }))}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-input"
                placeholder="Optional note about this transaction..."
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                style={{ resize: 'vertical', minHeight: '56px', fontFamily: 'inherit' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isMutating}>
              {isMutating ? '⏳ Saving...' : editingId ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
