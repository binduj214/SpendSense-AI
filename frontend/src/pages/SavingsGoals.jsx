import React, { useState } from 'react'
import { savingsApi } from '../services/api'
import { useApi, useMutation } from '../hooks/useApi'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Modal from '../components/Modal'
import ProgressBar from '../components/ProgressBar'
import { formatCurrency, formatDate, getCurrentDate } from '../utils/formatters'

const EMPTY_FORM = { name: '', target_amount: '', current_savings: '0', target_date: '', description: '' }

export default function SavingsGoals() {
  const { addToast } = useToast()
  usePageTitle('Savings Goals')
  const { data: goals, loading, error, refetch } = useApi(savingsApi.getAll)
  const [showModal, setShowModal] = useState(false)
  const [showAddSavingsModal, setShowAddSavingsModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const createMut = useMutation((data) => savingsApi.create(data))
  const updateMut = useMutation((id, data) => savingsApi.update(id, data))
  const deleteMut = useMutation((id) => savingsApi.delete(id))
  const addSavingsMut = useMutation((id, amount) => savingsApi.addSavings(id, amount))

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(''); setShowModal(true) }
  const openEdit = (g) => {
    setForm({ name: g.name, target_amount: g.target_amount, current_savings: g.current_savings, target_date: g.target_date || '', description: g.description || '' })
    setEditingId(g.id); setFormError(''); setShowModal(true)
  }

  const openAddSavings = (g) => { setSelectedGoal(g); setAddAmount(''); setShowAddSavingsModal(true) }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return
    const res = await deleteMut.mutate(id)
    if (res.success) { addToast('Goal deleted', 'success'); refetch() }
    else addToast(res.error || 'Failed to delete', 'error')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.target_amount || parseFloat(form.target_amount) <= 0) { setFormError('Target amount must be greater than 0'); return }
    const payload = { ...form, target_amount: parseFloat(form.target_amount), current_savings: parseFloat(form.current_savings || 0) }
    if (!payload.target_date) delete payload.target_date
    const res = editingId ? await updateMut.mutate(editingId, payload) : await createMut.mutate(payload)
    if (res.success) {
      setShowModal(false)
      addToast(editingId ? 'Goal updated!' : 'New savings goal created!', 'success')
      refetch()
    }
    else setFormError(res.error)
  }

  const handleAddSavings = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return
    const res = await addSavingsMut.mutate(selectedGoal.id, parseFloat(addAmount))
    if (res.success) {
      setShowAddSavingsModal(false)
      addToast(`₹${parseFloat(addAmount).toLocaleString('en-IN')} added to '${selectedGoal.name}'! 🎉`, 'success')
      refetch()
    } else {
      addToast(res.error || 'Failed to add savings', 'error')
    }
  }

  const totalTarget = goals ? goals.reduce((s, g) => s + g.target_amount, 0) : 0
  const totalSaved = goals ? goals.reduce((s, g) => s + g.current_savings, 0) : 0
  const completedCount = goals ? goals.filter(g => g.is_completed).length : 0

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Track your progress toward financial milestones</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ New Goal</button>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Target</div>
          <div style={{ fontSize: '26px', fontWeight: '700' }}>{formatCurrency(totalTarget)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Saved</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--success)' }}>{formatCurrency(totalSaved)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Goals Completed</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--primary)' }}>{completedCount}</div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {!loading && goals && (
        goals.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🏦</div>
              <div className="empty-state-title">No savings goals yet</div>
              <div className="empty-state-text">Create a savings goal to start working toward something</div>
              <button className="btn btn-primary mt-3" onClick={openAdd}>Create Goal</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {goals.map((goal) => {
              const pct = goal.target_amount > 0 ? Math.min((goal.current_savings / goal.target_amount) * 100, 100) : 0
              const remaining = goal.target_amount - goal.current_savings
              return (
                <div key={goal.id} className="card" style={{ borderTop: `4px solid ${goal.is_completed ? 'var(--success)' : 'var(--primary)'}` }}>
                  <div className="flex-between" style={{ marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '16px' }}>{goal.name}</div>
                      {goal.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{goal.description}</div>}
                    </div>
                    {goal.is_completed && <span className="badge badge-success" style={{ fontSize: '12px' }}>✓ Completed</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saved</div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--success)' }}>{formatCurrency(goal.current_savings)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target</div>
                      <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(goal.target_amount)}</div>
                    </div>
                  </div>

                  <ProgressBar value={goal.current_savings} max={goal.target_amount} showLabel={false} />
                  <div className="flex-between mt-2" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    <span>{pct.toFixed(0)}% achieved</span>
                    {!goal.is_completed && <span>₹{remaining.toLocaleString('en-IN')} remaining</span>}
                  </div>

                  {goal.target_date && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      🎯 Target date: {formatDate(goal.target_date)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    {!goal.is_completed && (
                      <button className="btn btn-primary btn-sm" onClick={() => openAddSavings(goal)} style={{ flex: 1 }}>
                        + Add Savings
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(goal)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(goal.id)}>🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Goal' : 'New Savings Goal'}>
        <form onSubmit={handleSubmit}>
          {formError && <div className="alert alert-danger" style={{ marginBottom: '12px' }}>{formError}</div>}
          <div className="form-group">
            <label className="form-label">Goal Name *</label>
            <input className="form-input" placeholder="e.g. New Laptop" value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Target Amount (₹) *</label>
              <input className="form-input" type="number" min="1" step="100"
                value={form.target_amount} onChange={(e) => setForm(f => ({ ...f, target_amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Current Savings (₹)</label>
              <input className="form-input" type="number" min="0" step="100"
                value={form.current_savings} onChange={(e) => setForm(f => ({ ...f, current_savings: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input className="form-input" type="date" value={form.target_date}
              onChange={(e) => setForm(f => ({ ...f, target_date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="What is this goal for?"
              value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createMut.loading || updateMut.loading}>
              {createMut.loading || updateMut.loading ? 'Saving...' : editingId ? 'Update' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Savings Modal */}
      <Modal isOpen={showAddSavingsModal} onClose={() => setShowAddSavingsModal(false)} title={`Add to: ${selectedGoal?.name}`}>
        <div>
          <div className="form-group">
            <label className="form-label">Amount to Add (₹)</label>
            <input className="form-input" type="number" min="1" step="100" placeholder="Enter amount"
              value={addAmount} onChange={(e) => setAddAmount(e.target.value)} autoFocus />
          </div>
          {selectedGoal && (
            <div style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <div>Current: {formatCurrency(selectedGoal.current_savings)}</div>
              <div>Target: {formatCurrency(selectedGoal.target_amount)}</div>
              <div>Remaining: {formatCurrency(selectedGoal.target_amount - selectedGoal.current_savings)}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowAddSavingsModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSavings} disabled={addSavingsMut.loading}>
              {addSavingsMut.loading ? 'Adding...' : 'Add Savings'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
