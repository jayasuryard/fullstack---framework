// Unit tests for the reusable WebSocket client (src/server/ws.js) with a stubbed
// WebSocket — no browser/DOM/network required.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ── Test doubles ───────────────────────────────────────────────────────────────
class FakeWebSocket {
  static CONNECTING = 0
  static OPEN       = 1
  static CLOSING    = 2
  static CLOSED     = 3
  static instances  = []

  constructor(url) {
    this.url        = url
    this.readyState = FakeWebSocket.CONNECTING
    this.sent       = []
    FakeWebSocket.instances.push(this)
  }
  send(data)              { this.sent.push(data) }
  close()                 { this.readyState = FakeWebSocket.CLOSED; this.onclose?.({}) }
  _open()                 { this.readyState = FakeWebSocket.OPEN; this.onopen?.() }
  _message(payload)       { this.onmessage?.({ data: JSON.stringify(payload) }) }
}

const localStorageStub = (() => {
  const store = new Map()
  return {
    getItem:   (k) => store.has(k) ? store.get(k) : null,
    setItem:   (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear:     () => store.clear(),
  }
})()

// ── Suite ─────────────────────────────────────────────────────────────────────
let wsClient
let resetClient

describe('wsClient', () => {
  beforeEach(async () => {
    FakeWebSocket.instances = []
    globalThis.window = { localStorage: localStorageStub }
    localStorageStub.setItem('token', 'test-token')
    globalThis.WebSocket = FakeWebSocket

    const mod = await import('./ws')
    wsClient = mod.wsClient
    resetClient = () => {
      wsClient.disconnect()
      wsClient.channels.clear()
      wsClient.channelHandlers.clear()
      wsClient.retryDelay = 500
      wsClient.intentionalClose = false
    }
    resetClient()
  })

  afterEach(() => {
    delete globalThis.window
    delete globalThis.WebSocket
    vi.useRealTimers()
  })

  it('connects with token + channels in the URL', () => {
    wsClient.connect(['job:abc'])
    const ws = FakeWebSocket.instances[0]
    expect(ws.url).toBe('ws://localhost/ws?token=test-token&channels=job%3Aabc')
  })

  it('reports connected state on open', () => {
    const states = []
    wsClient.onStatus(s => states.push(s))
    wsClient.connect(['a'])
    FakeWebSocket.instances[0]._open()
    expect(states).toContain('connected')
  })

  it('dispatches channel events to registered handlers', () => {
    const cb = vi.fn()
    wsClient.onChannel('job:abc', cb)
    wsClient.connect(['job:abc'])
    const ws = FakeWebSocket.instances[0]
    ws._open()
    ws._message({ type: 'event', channel: 'job:abc', payload: { status: 'done' } })
    expect(cb).toHaveBeenCalledWith({ status: 'done' })
  })

  it('does not dispatch to handlers of other channels', () => {
    const cb = vi.fn()
    wsClient.onChannel('job:other', cb)
    wsClient.connect(['job:abc'])
    FakeWebSocket.instances[0]._open()
    FakeWebSocket.instances[0]._message({ type: 'event', channel: 'job:abc', payload: {} })
    expect(cb).not.toHaveBeenCalled()
  })

  it('off() removes a channel handler', () => {
    const cb = vi.fn()
    const off = wsClient.onChannel('a', cb)
    off()
    wsClient.connect(['a'])
    FakeWebSocket.instances[0]._open()
    FakeWebSocket.instances[0]._message({ type: 'event', channel: 'a', payload: {} })
    expect(cb).not.toHaveBeenCalled()
  })

  it('subscribeChannel sends a subscribe message when open', () => {
    wsClient.connect(['a'])
    const ws = FakeWebSocket.instances[0]
    ws._open()
    wsClient.subscribeChannel('b')
    expect(ws.sent).toContain(JSON.stringify({ type: 'subscribe', channels: ['b'] }))
  })

  it('unsubscribeChannel removes the channel and notifies the server', () => {
    wsClient.connect(['a'])
    const ws = FakeWebSocket.instances[0]
    ws._open()
    wsClient.unsubscribeChannel('a')
    expect(ws.sent).toContain(JSON.stringify({ type: 'unsubscribe', channels: ['a'] }))
    expect(wsClient.channels.has('a')).toBe(false)
  })

  it('reconnects with backoff after an unexpected close', () => {
    vi.useFakeTimers()
    wsClient.connect(['a'])
    const first = FakeWebSocket.instances[0]
    first._open()
    first.close()  // unexpected (not intentional)
    expect(FakeWebSocket.instances.length).toBe(1)
    vi.advanceTimersByTime(500)
    expect(FakeWebSocket.instances.length).toBe(2)
    expect(FakeWebSocket.instances[1].url).toContain('channels=a')
  })

  it('does not reconnect after intentional disconnect()', () => {
    vi.useFakeTimers()
    wsClient.connect(['a'])
    const first = FakeWebSocket.instances[0]
    first._open()
    wsClient.disconnect()
    first.close()
    vi.advanceTimersByTime(5000)
    expect(FakeWebSocket.instances.length).toBe(1)
  })
})
