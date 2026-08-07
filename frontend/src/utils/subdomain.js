// Multi-tenant subdomain detection. Works in both browser and Node (server.js).
// VITE_APP_DOMAIN is documented in .env.example as the tenant root domain; the
// extraction itself stays hostname-based so it works in preview/deploy too.

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
