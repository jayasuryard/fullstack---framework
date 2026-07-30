/**
 * Generic data-fetch hook — mirrors the pattern used throughout product/ pages.
 * Source: Extracted pattern from Product/frontend/src/hooks/useClasses.js
 *         and dozens of inline useEffect data-fetches in product pages.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useDataFetch(
 *     () => api.admin.users.list({ page, limit }),
 *     [page, limit]   // re-fetch when these change
 *   )
 */
import { useState, useEffect, useCallback } from 'react'

export function useDataFetch(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
