// Unit tests for the API client's envelope unwrapping — no browser/DOM required.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import api, { unwrapApiResult, ApiError, setActiveOrganizationId } from './api'

describe('unwrapApiResult', () => {
  it('returns responseData.result for success code 1000', () => {
    const body = { responseCode: 1000, responseMessage: 'ok', responseData: { result: { rows: [1, 2] } } }
    expect(unwrapApiResult(body)).toEqual({ rows: [1, 2] })
  })

  it('accepts created code 1012 as success', () => {
    const body = { responseCode: 1012, responseMessage: 'created', responseData: { result: { id: 'x' } } }
    expect(unwrapApiResult(body)).toEqual({ id: 'x' })
  })

  it('throws ApiError for non-success codes', () => {
    const body = { responseCode: 1002, responseMessage: 'Unauthorized access.', responseData: { result: {} } }
    expect(() => unwrapApiResult(body)).toThrow(ApiError)
  })

  it('prefers result.message for error detail', () => {
    const body = { responseCode: 1006, responseMessage: 'Validation failed.', responseData: { result: { message: 'Email is required.' } } }
    try {
      unwrapApiResult(body)
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect(err.message).toBe('Email is required.')
    }
  })

  it('throws ApiError when body missing', () => {
    expect(() => unwrapApiResult(null)).toThrow(ApiError)
  })
})

// ── Tenant context header ──────────────────────────────────────────────────────
// Half of the org-scoping convention lives in the client: every org-scoped call
// must carry X-Organization-Id, and when the path names an :orgId the header MUST
// be derived from that same param (the backend rejects a mismatch with 400).
describe('X-Organization-Id', () => {
  let calls

  const memoryStorage = () => {
    const map = new Map()
    return {
      getItem:    (k) => (map.has(k) ? map.get(k) : null),
      setItem:    (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
    }
  }

  beforeEach(() => {
    calls = []
    globalThis.window = { localStorage: memoryStorage(), sessionStorage: memoryStorage() }
    globalThis.fetch  = vi.fn(async (url, init) => {
      calls.push({ url, headers: init.headers })
      return {
        ok:      true,
        status:  200,
        headers: { get: () => 'application/json' },
        json:    async () => ({ responseCode: 1000, responseMessage: 'ok', responseData: { result: {} } }),
      }
    })
  })

  afterEach(() => {
    delete globalThis.window
    delete globalThis.fetch
  })

  it('derives the header from the :orgId path param, so the two can never disagree', async () => {
    setActiveOrganizationId('org-from-another-tab')
    await api.orgs.members.list({ orgId: 'org-in-the-url' })

    expect(calls[0].url).toContain('/orgs/org-in-the-url/members')
    expect(calls[0].headers['X-Organization-Id']).toBe('org-in-the-url')
  })

  it('falls back to this tab\'s active organization when the path has no :orgId', async () => {
    setActiveOrganizationId('org-active')
    await api.common.me()
    expect(calls[0].headers['X-Organization-Id']).toBe('org-active')
  })

  it('omits the header on user-scoped organization calls', async () => {
    setActiveOrganizationId('org-active')
    await api.orgs.list()
    expect(calls[0].headers['X-Organization-Id']).toBeUndefined()
  })

  it('omits the header entirely when no organization is selected', async () => {
    setActiveOrganizationId(null)
    await api.common.me()
    expect(calls[0].headers['X-Organization-Id']).toBeUndefined()
  })
})
