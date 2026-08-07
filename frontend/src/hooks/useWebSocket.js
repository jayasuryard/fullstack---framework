/**
 * useWebSocket — React hook over the shared WS client (src/server/ws.js).
 *
 * Subscribes to one channel for the lifetime of the component and routes every
 * event to the given handler. Re-subscribing on channel change; handler changes
 * never tear down the socket (kept fresh via ref).
 *
 * Usage:
 *   useWebSocket(`job:${jobId}`, (payload) => {
 *     if (payload.status === 'done') setDone(true)
 *   }, { enabled: !!jobId })
 */
import { useEffect, useRef } from 'react'
import { wsClient } from '../server/ws'

export function useWebSocket(channel, handler, { enabled = true } = {}) {
  const handlerRef = useRef(handler)
  useEffect(() => { handlerRef.current = handler })

  useEffect(() => {
    if (!enabled || !channel) return

    wsClient.subscribeChannel(channel)
    const off = wsClient.onChannel(channel, (payload) => handlerRef.current?.(payload))

    return () => {
      off()
      wsClient.unsubscribeChannel(channel)
    }
  }, [channel, enabled])

  return { isConnected: wsClient.currentState === 'connected' }
}
