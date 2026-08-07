// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input } from '../../components/common'

/**
 * Login page. Uses AuthContext.login() which stores the session via setAuthSession
 * (see src/server/api.js) and redirects to the role default route.
 *
 * Expected API envelope (unwrapped by api.js):
 *   { token, refreshToken, user: { id, name, email, role, accessLevel } }
 */
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [userName,  setUserName]  = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from?.pathname || null

  const roleDefault = (role) => {
    const map = { admin: '/admin/dashboard', superAdmin: '/superadmin/dashboard' }
    return map[role] || '/dashboard'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userName || !password) { setError('Enter username and password.'); return }
    setSubmitting(true)
    setError('')
    try {
      const result = await login(userName, password)
      navigate(from || roleDefault(result.user.role), { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">Welcome back</div>
            <div className="text-sm text-gray-500">Sign in to your account</div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              name="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="username"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/forgot-password" className="text-orange-600 hover:text-orange-700">
              Forgot your password?
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} — SaaS Scaffold
        </p>
      </div>
    </div>
  )
}
