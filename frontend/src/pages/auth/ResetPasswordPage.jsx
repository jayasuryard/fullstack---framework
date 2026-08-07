// src/pages/auth/ResetPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../server/api'
import { Button, Input } from '../../components/common'

/**
 * Reset-password page — email + 6-digit OTP + new password.
 * Backend caps OTP attempts per email (5); exceeding it requires a fresh code.
 */
export default function ResetPasswordPage() {
  const [email,       setEmail]       = useState('')
  const [otp,         setOtp]         = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error,       setError]       = useState('')
  const [done,        setDone]        = useState(false)
  const [submitting,  setSubmitting]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !otp || !newPassword) { setError('All fields are required.'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setSubmitting(true)
    setError('')
    try {
      await api.common.resetPassword({ email, otp, newPassword })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Reset failed. Try requesting a new code.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Password updated</div>
          <p className="text-sm text-gray-500 mb-6">All your sessions were signed out.</p>
          <Link to="/login" className="text-sm text-orange-600 hover:text-orange-700">
            Sign in with your new password
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
            <div className="text-2xl font-bold text-gray-900 mb-1">Set a new password</div>
            <div className="text-sm text-gray-500">Use the code from your email.</div>
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
            <Input
              label="6-digit code"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <Input
              label="New password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/forgot-password" className="text-orange-600 hover:text-orange-700">
              Request a new code
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
