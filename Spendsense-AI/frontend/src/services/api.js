import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// ─── Transactions ───────────────────────────────────────────────────────────
export const transactionApi = {
  getAll: (params = {}) => api.get('/transactions/', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions/', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  categorize: (description) => api.post('/transactions/categorize', { description }),
}

// ─── Income ─────────────────────────────────────────────────────────────────
export const incomeApi = {
  getAll: (params = {}) => api.get('/income/', { params }),
  getById: (id) => api.get(`/income/${id}`),
  create: (data) => api.post('/income/', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
}

// ─── Budgets ─────────────────────────────────────────────────────────────────
export const budgetApi = {
  getAll: (params = {}) => api.get('/budgets/', { params }),
  getUtilization: (month) => api.get('/budgets/utilization', { params: { month } }),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets/', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  copyToNextMonth: (fromMonth) => api.post('/budgets/copy-to-next-month', { from_month: fromMonth }),
}

// ─── Savings Goals ───────────────────────────────────────────────────────────
export const savingsApi = {
  getAll: () => api.get('/savings-goals/'),
  getById: (id) => api.get(`/savings-goals/${id}`),
  create: (data) => api.post('/savings-goals/', data),
  update: (id, data) => api.put(`/savings-goals/${id}`, data),
  delete: (id) => api.delete(`/savings-goals/${id}`),
  addSavings: (id, amount) => api.post(`/savings-goals/${id}/add-savings`, { amount }),
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard/'),
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  get: () => api.get('/analytics/'),
}

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiApi = {
  getInsights: () => api.get('/ai/insights'),
  getPredictions: () => api.get('/ai/predictions'),
  askAssistant: (query) => api.post('/ai/assistant', { query }),
  categorize: (description) => api.post('/ai/categorize', { description }),
}

export default api
