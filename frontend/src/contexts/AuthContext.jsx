/**
 * Auth context — global auth state, login, logout, token management, role/access flags.
 *
 * Pattern: localStorage hydration → /me validation on mount → automatic 401 recovery.
 * To add role context switching (e.g. impersonation, tenant switching), extend this
 * context with switchContext / clearContext following the same pattern.
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import api, { clearAuthSession, getStoredToken, getStoredUser, setAuthSession } from '../server/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)

  // Validate stored token on mount
  useEffect(() => {
    const validate = async () => {
      const token = getStoredToken()
      if (!token) { setLoading(false); return }

      try {
        const profile = await api.common.me()
        setUser(profile)
      } catch {
        clearAuthSession()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    validate()
  }, [])

  const login = async (userName, password) => {
    const result = await api.common.login({ userName, password })
    setAuthSession({ token: result.token, refreshToken: result.refreshToken, user: result.user })
    setUser(result.user)
    return result
  }

  const logout = async () => {
    try { await api.common.logout() } catch { /* ignore */ }
    clearAuthSession()
    setUser(null)
  }

  const updateProfile = async (formData) => {
    const profile = await api.common.updateProfile(formData)
    setUser(prev => ({ ...prev, ...profile }))
    return profile
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    hasRole:         (...roles) => roles.includes(user?.role),
    isReadOnly:      () => user?.accessLevel === 'read_only',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
