/**
 * Reusable WebSocket client for the framework's shared hub (backend/helpers/ws/hub.js).
 *
 * All realtime features use this single connection: job progress, live
 * dashboards, notifications, presence — anything pushed via emitToChannel().
 *
 * Usage:
 *   import { wsClient } from './ws'
 *   const off = wsClient.onChannel('job:' + jobId, (payload) => { ... })  // auto-connects
 *   // ... later:
 *   off()                                   // stop THIS listener only (ref-counted)
 *
 *   wsClient.onStatus((state) => { ... })  // 'connecting' | 'connected' | 'reconnecting' | 'closed'
 *
 * React: prefer useWebSocket(channel, handler) from '../hooks/useWebSocket'.
 *
 * Auth: the access token travels as ?token= (browsers can't set WS headers).
 * On reconnect the latest in-memory token is used — the API client's refresh flow
 * already rotated it by the time a reconnect happens.
 */

import { getAccessToken } from './api'

// Prefer an explicit WS origin; fall back to deriving one from the configured API
// origin (http(s) -> ws(s)) rather than the frontend's OWN origin, which is wrong
// whenever the API lives on a different host/port (the historical F20 default).
function deriveWsBaseUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  const apiBase = import.meta.env.VITE_API_BASE_URL
  if (apiBase) return apiBase.replace(/^http/, 'ws').replace(/\/+$/g, '')
  if (typeof location !== 'undefined' && location.protocol) {
    return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`
  }
  return 'ws://localhost'
}
const WS_BASE_URL = deriveWsBaseUrl()

const RECONNECT_MIN_MS  = 500
const RECONNECT_MAX_MS  = 30_000

// Close codes the backend WS hub (backend/helpers/ws/hub.js) sends for auth
// failures — retrying with the same (proven-bad) token would just spin forever.
const AUTH_REJECTED_CLOSE_CODES = new Set([4001, 4003])

class WsClient {
  constructor() {
    this.socket          = null
    this.channels        = new Set()
    this.channelHandlers = new Map()   // channel -> Set<cb>
    this.statusHandlers  = new Set()
    this.retryDelay      = RECONNECT_MIN_MS
    this.intentionalClose = false
    this.authRejected    = false
    this.currentState    = 'closed'
    this.reconnectTimer  = null
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  connect(channels = []) {
    channels.forEach(c => this.channels.add(c))
    this.intentionalClose = false
    this.authRejected     = false
    this.clearReconnectTimer()
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) return
    this.open()
  }

  subscribeChannel(channel) {
    this.channels.add(channel)
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', channels: [channel] })
    } else {
      this.connect()
    }
  }

  // Force-unsubscribe a channel for ALL listeners. Prefer the unsubscribe function
  // returned by onChannel() for a single listener — this exists for callers that
  // intentionally want to drop every subscriber on a channel at once.
  unsubscribeChannel(channel) {
    this.channels.delete(channel)
    this.channelHandlers.delete(channel)
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.send({ type: 'unsubscribe', channels: [channel] })
    }
  }

  // Registers one listener on a channel, auto-connecting/subscribing as needed
  // (matches the docs' "auto-connects" promise — F20). Ref-counted: the returned
  // unsubscribe removes ONLY this listener, and the server-side unsubscribe is
  // only sent once the LAST listener for that channel is gone, so two components
  // sharing one channel never break each other.
  onChannel(channel, cb) {
    const isFirstListener = !this.channelHandlers.has(channel) || this.channelHandlers.get(channel).size === 0
    if (!this.channelHandlers.has(channel)) this.channelHandlers.set(channel, new Set())
    this.channelHandlers.get(channel).add(cb)

    if (isFirstListener) this.subscribeChannel(channel)

    return () => {
      const handlers = this.channelHandlers.get(channel)
      if (!handlers) return
      handlers.delete(cb)
      if (handlers.size === 0) this.unsubscribeChannel(channel)
    }
  }

  onStatus(cb) {
    this.statusHandlers.add(cb)
    return () => this.statusHandlers.delete(cb)
  }

  disconnect() {
    this.intentionalClose = true
    this.clearReconnectTimer()
    this.socket?.close()
    this.socket = null
    this.setState('closed')
  }

  // ── Internals ───────────────────────────────────────────────────────────────

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  setState(state) {
    this.currentState = state
    this.statusHandlers.forEach(cb => { try { cb(state) } catch { /* handler errors are isolated */ } })
  }

  send(payload) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload))
    }
  }

  open() {
    this.setState(this.retryDelay > RECONNECT_MIN_MS ? 'reconnecting' : 'connecting')

    const token = getAccessToken()
    const channels = [...this.channels].join(',')
    const url = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token || '')}${channels ? `&channels=${encodeURIComponent(channels)}` : ''}`

    const socket = new WebSocket(url)
    this.socket = socket

    socket.onopen = () => {
      this.retryDelay = RECONNECT_MIN_MS
      this.setState('connected')
    }

    socket.onmessage = (event) => {
      let msg
      try { msg = JSON.parse(event.data) } catch { return }
      if (!msg) return

      if (msg.type === 'event' && msg.channel) {
        const handlers = this.channelHandlers.get(msg.channel)
        if (handlers) handlers.forEach(cb => { try { cb(msg.payload) } catch { /* isolated */ } })
      }
    }

    socket.onerror = () => {
      // onclose follows; the close handler owns reconnect logic.
    }

    socket.onclose = (event) => {
      if (this.socket !== socket) return
      this.socket = null
      if (this.intentionalClose) return

      if (AUTH_REJECTED_CLOSE_CODES.has(event.code)) {
        // Retrying with the same rejected token would spin forever. Stop; a fresh
        // explicit connect()/subscribeChannel() call (e.g. after AuthContext
        // obtains a new token) starts a clean attempt.
        this.authRejected = true
        this.setState('closed')
        return
      }

      this.setState('reconnecting')
      this.clearReconnectTimer()
      this.reconnectTimer = setTimeout(() => { this.reconnectTimer = null; this.connect() }, this.retryDelay)
      this.retryDelay = Math.min(this.retryDelay * 2, RECONNECT_MAX_MS)
    }
  }
}

export const wsClient = new WsClient()
export default wsClient
