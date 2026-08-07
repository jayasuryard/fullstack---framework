/**
 * Reusable WebSocket client for the framework's shared hub (backend/helpers/ws/hub.js).
 *
 * All realtime features use this single connection: job progress, live
 * dashboards, notifications, presence — anything pushed via emitToChannel().
 *
 * Usage:
 *   import { wsClient } from './ws'
 *   wsClient.connect(['job:' + jobId, 'user:' + userId])   // optional — connect() auto-runs on first subscribe
 *   const off = wsClient.onChannel('job:' + jobId, (payload) => { ... })
 *   // ... later:
 *   off()                                   // stop listening
 *   wsClient.unsubscribeChannel('job:' + jobId)
 *
 *   wsClient.onStatus((state) => { ... })  // 'connecting' | 'connected' | 'reconnecting' | 'closed'
 *
 * React: prefer useWebSocket(channel, handler) from '../hooks/useWebSocket'.
 *
 * Auth: the access token travels as ?token= (browsers can't set WS headers).
 * On reconnect the latest stored token is used — the API client's refresh flow
 * already rotated it by the time a reconnect happens.
 */

import { getStoredToken } from './api'

const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ||
  (typeof location !== 'undefined' && location.protocol
    ? `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`
    : 'ws://localhost')

const RECONNECT_MIN_MS  = 500
const RECONNECT_MAX_MS  = 30_000

class WsClient {
  constructor() {
    this.socket          = null
    this.channels        = new Set()
    this.channelHandlers = new Map()   // channel -> Set<cb>
    this.statusHandlers  = new Set()
    this.retryDelay      = RECONNECT_MIN_MS
    this.intentionalClose = false
    this.currentState    = 'closed'
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  connect(channels = []) {
    channels.forEach(c => this.channels.add(c))
    this.intentionalClose = false
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return
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

  unsubscribeChannel(channel) {
    this.channels.delete(channel)
    this.channelHandlers.delete(channel)
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.send({ type: 'unsubscribe', channels: [channel] })
    }
  }

  onChannel(channel, cb) {
    if (!this.channelHandlers.has(channel)) this.channelHandlers.set(channel, new Set())
    this.channelHandlers.get(channel).add(cb)
    return () => this.channelHandlers.get(channel)?.delete(cb)
  }

  onStatus(cb) {
    this.statusHandlers.add(cb)
    return () => this.statusHandlers.delete(cb)
  }

  disconnect() {
    this.intentionalClose = true
    this.socket?.close()
    this.socket = null
    this.setState('closed')
  }

  // ── Internals ───────────────────────────────────────────────────────────────

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

    const token = getStoredToken()
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

    socket.onclose = () => {
      if (this.socket !== socket) return
      this.socket = null
      if (this.intentionalClose) return
      this.setState('reconnecting')
      setTimeout(() => this.connect(), this.retryDelay)
      this.retryDelay = Math.min(this.retryDelay * 2, RECONNECT_MAX_MS)
    }
  }
}

export const wsClient = new WsClient()
export default wsClient
