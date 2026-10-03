/**
 * Formatting utility functions for SpendSense AI
 */

export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) return '₹0'
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return showSymbol ? `₹${formatted}` : formatted
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export const formatMonth = (monthStr) => {
  if (!monthStr) return '—'
  try {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  } catch {
    return monthStr
  }
}

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%'
  return `${parseFloat(value).toFixed(decimals)}%`
}

export const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const getCurrentDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export const getCategoryBadgeClass = (category) => {
  const map = {
    Food: 'badge-food',
    Shopping: 'badge-shopping',
    Transport: 'badge-transport',
    Bills: 'badge-bills',
    Entertainment: 'badge-entertainment',
    Healthcare: 'badge-healthcare',
    Education: 'badge-education',
    Rent: 'badge-rent',
    Other: 'badge-other',
  }
  return map[category] || 'badge-other'
}

export const CATEGORIES = [
  'Food', 'Shopping', 'Transport', 'Bills',
  'Entertainment', 'Healthcare', 'Education', 'Rent', 'Other'
]

export const PAYMENT_METHODS = [
  'UPI', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'
]

export const INCOME_SOURCES = [
  'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'
]

export const CATEGORY_COLORS = {
  Food: '#FF7043',
  Shopping: '#EC407A',
  Transport: '#42A5F5',
  Bills: '#AB47BC',
  Entertainment: '#FFCA28',
  Healthcare: '#66BB6A',
  Education: '#29B6F6',
  Rent: '#FF5722',
  Other: '#9E9E9E',
}
