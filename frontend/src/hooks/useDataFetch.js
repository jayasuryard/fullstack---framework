/**
 * Generic data-fetch hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useDataFetch(
 *     () => api.admin.users.list({ page, limit }),
 *     [page, limit]   // re-fetch when these change
 *   )
 */
import { useState, useEffect, useRef } from 'react'

export function useDataFetch(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)

  // Keep ref in sync AFTER render so consumers can pass inline fetchers.
  useEffect(() => { fetcherRef.current = fetcher })

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetcherRef.current()
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [tick, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: () => setTick(t => t + 1) }
}
