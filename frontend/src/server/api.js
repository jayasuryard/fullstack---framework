/**
 * Central API client. All backend calls go through this file.
 *
 * Provides:
 *  - fetch wrapper with auth headers, JSON/FormData, path params, query strings
 *  - Automatic token refresh on HTTP 401 OR envelope code 1010 (TOKEN_EXPIRED) —
 *    backend replies 200 + responseCode for auth failures, so both paths are handled.
 *    Singleton refreshPromise — no duplicate refresh calls.
 *  - ApiError class with responseCode, url, payload
 *  - Response unwrapping (responseCode 1000/1012 = success; anything else throws)
 *  - localStorage session helpers: setAuthSession, clearAuthSession, getStoredToken, etc.
 *  - Namespaced `api` object — add your product's domain methods below
 *
 * To add a new domain namespace:
 *   api.myFeature = {
 *     list:   (query)        => request('GET',    '/admin/my-feature',     {}, query),
 *     get:    ({ id })       => request('GET',    '/admin/my-feature/:id', { id }),
 *     create: (body)         => request('POST',   '/admin/my-feature',     {}, {}, body),
 *     update: ({ id, ...b }) => request('PUT',    '/admin/my-feature/:id', { id }, {}, b),
 *     delete: ({ id })       => request('DELETE', '/admin/my-feature/:id', { id }),
 *   }
 */

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const API_BASE_URL     = RAW_API_BASE_URL.replace(/\/+$/g, '')

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD'])

const STORAGE_KEYS = {
  token:        'token',
  refreshToken: 'refreshToken',
  user:         'user',
}

// Active organization is PER-TAB (sessionStorage), never localStorage: a user who
// belongs to several orgs must be able to run org A in one tab and org B in
// another without the two overwriting each other. The backend has no sticky
// "current org" either — it resolves tenancy per request.
const ACTIVE_ORG_KEY = 'activeOrganizationId'

let refreshPromise = null

// ── Storage helpers ────────────────────────────────────────────────────────────

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function hasSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export function getActiveOrganizationId() {
  if (!hasSessionStorage()) return null
  return window.sessionStorage.getItem(ACTIVE_ORG_KEY)
}

export function setActiveOrganizationId(orgId) {
  if (!hasSessionStorage()) return
  if (orgId) window.sessionStorage.setItem(ACTIVE_ORG_KEY, orgId)
  else window.sessionStorage.removeItem(ACTIVE_ORG_KEY)
}

function readStorageValue(key) {
  if (!hasStorage()) return null
  return window.localStorage.getItem(key)
}

function writeStorageValue(key, value) {
  if (!hasStorage()) return
  if (value === undefined || value === null || value === '') {
    window.localStorage.removeItem(key)
    return
  }
  window.localStorage.setItem(key, value)
}

export function getStoredToken()        { return readStorageValue(STORAGE_KEYS.token) }
export function getStoredRefreshToken() { return readStorageValue(STORAGE_KEYS.refreshToken) }
export function getStoredUser() {
  const raw = readStorageValue(STORAGE_KEYS.user)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

export function setStoredUser(user) {
  writeStorageValue(STORAGE_KEYS.user, JSON.stringify(user))
}

export function setAuthSession({ token, refreshToken, user }) {
  writeStorageValue(STORAGE_KEYS.token,        token)
  writeStorageValue(STORAGE_KEYS.refreshToken, refreshToken)
  if (user) writeStorageValue(STORAGE_KEYS.user, JSON.stringify(user))
}

export function clearAuthSession() {
  Object.values(STORAGE_KEYS).forEach(k => writeStorageValue(k, null))
  setActiveOrganizationId(null)
}

// ── Request internals ──────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(message, status, url, payload) {
    super(message)
    this.name    = 'ApiError'
    this.status  = status
    this.url     = url
    this.payload = payload
  }
}

export { ApiError }

function getAuthHeaders() {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function isFileLike(value) {
  return typeof File !== 'undefined' && value instanceof File
}

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`
}

function resolvePath(path, pathParams = {}) {
  return path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    const value = pathParams[key]
    if (value === undefined || value === null)
      throw new Error(`Missing path param "${key}" for path "${path}"`)
    return encodeURIComponent(String(value))
  })
}

function withQuery(path, query = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) { value.forEach(item => searchParams.append(key, String(item))); return }
    searchParams.append(key, String(value))
  })
  const qs = searchParams.toString()
  return qs ? `${path}?${qs}` : path
}

async function parseResponseBody(response) {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  const text = await response.text()
  return text || null
}

// Backend now sends real HTTP statuses with the envelope. Pull the human
// message out of the body so callers don't just see "HTTP 403".
async function errorMessageFrom(response, fallback) {
  try {
    const body = await parseResponseBody(response)
    return body?.responseMessage || body?.responseData?.result?.message || fallback
  } catch {
    return fallback
  }
}

export function unwrapApiResult(body, fallbackMessage = 'Request failed') {
  if (!body) throw new ApiError(fallbackMessage, 0, '', body)
  const SUCCESS_CODES = new Set([1000, 1012])
  if (!SUCCESS_CODES.has(body.responseCode)) {
    throw new ApiError(
      body.responseData?.result?.message || body.responseMessage || fallbackMessage,
      body.responseCode,
      '',
      body
    )
  }
  return body.responseData?.result ?? null
}

async function attemptRefresh() {
  const refreshTokenVal = getStoredRefreshToken()
  if (!refreshTokenVal) return false

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/common/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken: refreshTokenVal }),
    })
    const body = await response.json()
    if (body?.responseCode === 1000 && body?.responseData?.result?.token) {
      const { token, refreshToken } = body.responseData.result
      writeStorageValue(STORAGE_KEYS.token,        token)
      writeStorageValue(STORAGE_KEYS.refreshToken, refreshToken)
      return true
    }
    return false
  } catch {
    return false
  }
}

async function request(method, path, pathParams = {}, query = {}, body = null, opts = {}) {
  const { skipAuthRecovery = false } = opts
  const resolvedPath = resolvePath(normalizePath(path), pathParams)
  const url          = `${API_BASE_URL}/api/v1${withQuery(resolvedPath, query)}`

  // Tenant context. When the path carries :orgId the header is derived from that
  // same param, so the two can never disagree (the backend rejects a mismatch
  // with 400). Otherwise fall back to this tab's active organization.
  // `orgId: null` in opts explicitly opts out (user-scoped calls).
  const orgId = 'orgId' in opts ? opts.orgId : (pathParams.orgId ?? getActiveOrganizationId())

  const hasFileUpload =
    body instanceof FormData ||
    (body && typeof body === 'object' && Object.values(body).some(isFileLike))

  let formData
  if (hasFileUpload && !(body instanceof FormData)) {
    formData = new FormData()
    Object.entries(body).forEach(([key, value]) => formData.append(key, value))
  }

  const buildHeaders = () => ({
    ...getAuthHeaders(),
    ...(orgId ? { 'X-Organization-Id': orgId } : {}),
    ...((!hasFileUpload && !METHODS_WITHOUT_BODY.has(method)) ? { 'Content-Type': 'application/json' } : {}),
  })

  const buildBody = () => {
    if (METHODS_WITHOUT_BODY.has(method) || body === null) return undefined
    if (hasFileUpload) return formData || body
    return JSON.stringify(body)
  }

  async function doFetch() {
    return fetch(url, { method, headers: buildHeaders(), body: buildBody() })
  }

  let response = await doFetch()

  // ── Auth recovery: refresh ONCE per request, never in a loop ─────────────────
  // Covers both HTTP 401 and the backend's envelope-level 1010 (it replies 200 +
  // responseCode for auth failures). If the retried request still fails auth,
  // fall through and surface the error — no unbounded refresh/retry spin.
  let authRecovered = false
  const recover = async () => {
    if (authRecovered) return
    authRecovered = true
    if (!refreshPromise) refreshPromise = attemptRefresh().finally(() => { refreshPromise = null })
    const refreshed = await refreshPromise
    if (!refreshed) {
      clearAuthSession()
      throw new ApiError('Session expired', response.status, url, null)
    }
    response = await doFetch()
    if (!response.ok) {
      throw new ApiError(await errorMessageFrom(response, `HTTP ${response.status}`), response.status, url, null)
    }
  }

  if (response.status === 401 && !skipAuthRecovery) {
    await recover()
    return unwrapApiResult(await parseResponseBody(response))
  }

  if (!response.ok) {
    throw new ApiError(await errorMessageFrom(response, `HTTP ${response.status}`), response.status, url, null)
  }

  let responseBody = await parseResponseBody(response)

  if (!skipAuthRecovery && !authRecovered && responseBody?.responseCode === 1010 && getStoredToken()) {
    await recover()
    responseBody = await parseResponseBody(response)
  }

  return unwrapApiResult(responseBody)
}

// ── Public API object — add your product's namespaces here ───────────────────

const api = {
  common: {
    login:   (body)  => request('POST', '/common/auth/login',   {}, {}, body),
    refresh: (body)  => request('POST', '/common/auth/refresh', {}, {}, body, { skipAuthRecovery: true }),
    logout:  ()      => request('POST', '/common/auth/logout'),
    me:      ()      => request('GET',  '/common/auth/me'),
    updateProfile: (body) => request('POST', '/common/auth/profile/update', {}, {}, body),
    forgotPassword: (body) => request('POST', '/common/auth/forgot-password', {}, {}, body),
    resetPassword:  (body) => request('POST', '/common/auth/reset-password',  {}, {}, body),
  },

  // Organizations / multi-tenancy. Calls that name an :orgId are tenant-scoped;
  // list/create/accept are user-scoped.
  orgs: {
    list:   ()     => request('GET',  '/orgs', {}, {}, null, { orgId: null }),
    create: (body) => request('POST', '/orgs', {}, {}, body, { orgId: null }),
    accept: ({ token }) => request('POST', '/orgs/invitations/:token/accept', { token }, {}, null, { orgId: null }),
    members: {
      list:   ({ orgId })       => request('GET',   '/orgs/:orgId/members', { orgId }),
      invite: ({ orgId, ...b }) => request('POST',  '/orgs/:orgId/invitations', { orgId }, {}, b),
      update: ({ orgId, membershipId, ...b }) =>
        request('PATCH', '/orgs/:orgId/members/:membershipId', { orgId, membershipId }, {}, b),
    },
    delete: ({ orgId }) => request('DELETE', '/orgs/:orgId', { orgId }),
  },

  // Add your product's domain namespaces below:
  // admin: {
  //   users: {
  //     list:   (query)   => request('GET',    '/admin/users',     {}, query),
  //     get:    ({ id })  => request('GET',    '/admin/users/:id', { id }),
  //     create: (body)    => request('POST',   '/admin/users',     {}, {}, body),
  //     update: ({ id, ...b }) => request('PUT', '/admin/users/:id', { id }, {}, b),
  //     delete: ({ id })  => request('DELETE', '/admin/users/:id', { id }),
  //   },
  // },
}

export default api
