// Source: Product/frontend/src/utils/subdomain.js (direct extraction — no changes)
// Multi-tenant subdomain detection. Works in both browser and Node (server.js).

export function getSubdomain() {
  if (typeof window === 'undefined') return null
  const host  = window.location.hostname
  const parts = host.split('.')

  if (parts.length >= 3 && parts[0] !== 'www') return parts[0]
  if (host.endsWith('.localhost'))              return host.replace('.localhost', '')
  return null
}

export function isDemoSubdomain() {
  return getSubdomain() === 'demo'
}
