/**
 * useWebSocket — React hook over the shared WS client (src/server/ws.js).
 *
 * Subscribes to one channel for the lifetime of the component and routes every
 * event to the given handler. Re-subscribing on channel change; handler changes
 * never tear down the socket (kept fresh via ref). Connection status is read
 * reactively via wsClient.onStatus (F20) — not sampled once at call time — so
 * status-dependent UI (e.g. a "reconnecting…" badge) updates as it changes.
 *
 * Usage:
 *   useWebSocket(`job:${jobId}`, (payload) => {
 *     if (payload.status === 'done') setDone(true)
 *   }, { enabled: !!jobId })
 */
import { useEffect, useRef, useState } from 'react'
import { wsClient } from '../server/ws'

export function useWebSocket(channel, handler, { enabled = true } = {}) {
  const handlerRef = useRef(handler)
  useEffect(() => { handlerRef.current = handler })

  const [status, setStatus] = useState(wsClient.currentState)
  useEffect(() => wsClient.onStatus(setStatus), [])

  useEffect(() => {
    if (!enabled || !channel) return

    const off = wsClient.onChannel(channel, (payload) => handlerRef.current?.(payload))

    return () => { off() }
  }, [channel, enabled])

  return { isConnected: status === 'connected', status }
}
