/**
 * Organization context — the user's organizations plus the one this TAB is
 * operating in.
 *
 * Mirrors AuthContext's shape (provider + useX hook + fetch-on-mount effect).
 * The selected org lives in sessionStorage, NOT localStorage: a user who belongs
 * to several orgs must be able to work in org A in one tab and org B in another.
 * The backend agrees — it resolves tenancy per request (route :orgId, else the
 * X-Organization-Id header that api.js attaches), never from session state.
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { getActiveOrganizationId, setActiveOrganizationId } from '../server/api'
import { useAuth } from './AuthContext'

const OrganizationContext = createContext(null)

export const useOrganization = () => {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider')
  return ctx
}

export const OrganizationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [activeOrgId,   setActiveOrgId]   = useState(() => getActiveOrganizationId())
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  // Bumping this re-runs the loader below. The fetch lives entirely inside the
  // effect so no setState is reachable synchronously from it.
  const [reloadKey,     setReloadKey]     = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      let list = []
      let failure = null
      try {
        const result = await (isAuthenticated ? api.orgs.list() : Promise.resolve(null))
        list = result?.organizations ?? []
      } catch (err) {
        failure = err
      }
      if (cancelled) return

      // A stored id from a previous session may name an org the user has since
      // left or that was deleted — fall back to the first one they still have.
      const stored = getActiveOrganizationId()
      const next   = list.some(o => o.id === stored) ? stored : (list[0]?.id ?? null)
      setActiveOrganizationId(next)

      setOrganizations(list)
      setActiveOrgId(next)
      setError(failure)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [isAuthenticated, reloadKey])

  const refresh = useCallback(() => setReloadKey(k => k + 1), [])

  const selectOrganization = useCallback((orgId) => {
    setActiveOrganizationId(orgId)
    setActiveOrgId(orgId)
  }, [])

  const createOrganization = useCallback(async ({ name, slug }) => {
    const result = await api.orgs.create({ name, ...(slug ? { slug } : {}) })
    // Select first, then reload: the loader reads the stored id back, finds the
    // new org in the refetched list and keeps it selected.
    selectOrganization(result.organization.id)
    refresh()
    return result.organization
  }, [refresh, selectOrganization])

  const activeOrganization = organizations.find(o => o.id === activeOrgId) || null

  const value = {
    organizations,
    activeOrganization,
    activeOrgId,
    loading,
    error,
    refresh,
    selectOrganization,
    createOrganization,
    role:       activeOrganization?.role ?? null,
    hasOrgRole: (...roles) => roles.includes(activeOrganization?.role),
  }

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}
