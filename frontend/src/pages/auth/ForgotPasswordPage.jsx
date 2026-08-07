// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../server/api'
import { Button, Input } from '../../components/common'

/**
 * Forgot-password page — requests a 6-digit OTP by email.
 * Backend always returns the same success message (no user enumeration).
 */
export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [sent,      setSent]      = useState(false)
  const [error,     setError]     = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError('Enter your email.'); return }
    setSubmitting(true)
    setError('')
    try {
      await api.common.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Check your email</div>
          <p className="text-sm text-gray-500 mb-6">
            If that email exists, we sent a 6-digit code. It expires in 10 minutes.
          </p>
          <Link to="/reset-password" className="text-sm text-orange-600 hover:text-orange-700">
            I have a code — reset my password
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">Reset your password</div>
            <div className="text-sm text-gray-500">We'll email you a one-time code.</div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Sending…' : 'Send code'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-orange-600 hover:text-orange-700">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
