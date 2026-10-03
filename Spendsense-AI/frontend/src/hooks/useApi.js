import { useState, useEffect, useCallback } from 'react'

/**
 * Generic hook for API calls with loading, error and data state.
 * @param {Function} apiFn - async API function to call
 * @param {Array} deps - dependency array to re-trigger the fetch
 * @param {boolean} immediate - whether to call immediately on mount
 */
export function useApi(apiFn, deps = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) execute()
  }, [execute]) // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => execute(), [execute])

  return { data, loading, error, refetch, execute }
}

/**
 * Hook for mutation operations (create, update, delete).
 * Does NOT auto-execute.
 */
export function useMutation(apiFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn(...args)
      return { success: true, data: result }
    } catch (err) {
      const message = err.message || 'Operation failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [apiFn])

  return { mutate, loading, error, clearError: () => setError(null) }
}
