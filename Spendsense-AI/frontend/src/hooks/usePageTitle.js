import { useEffect } from 'react'

/**
 * Sets the browser tab title.
 * @param {string} title - Page-level title (without app name)
 */
export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} – SpendSense AI` : 'SpendSense AI'
    return () => { document.title = prev }
  }, [title])
}
