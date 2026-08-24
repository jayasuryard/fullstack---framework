// src/pages/auth/ResetPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Lock, Mail } from 'lucide-react'
import api from '../../server/api'
import { AuthInput, AuthLabel, AuthNotice, AuthShell, MotionButton } from './AuthShell'

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
      <AuthNotice
        title="Password updated"
        body="All your sessions were signed out."
        footer={
          <Link to="/login" className="text-sm text-orange-300 hover:text-orange-200 transition-colors">
            Sign in with your new password
          </Link>
        }
      />
    )
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Use the code from your email."
      error={error}
      footer={
        <Link to="/forgot-password" className="text-orange-300 hover:text-orange-200 transition-colors">
          Request a new code
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <AuthLabel htmlFor="email">Email</AuthLabel>
          <AuthInput
            icon={Mail}
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <AuthLabel htmlFor="otp">6-digit code</AuthLabel>
          <AuthInput
            icon={KeyRound}
            id="otp"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>

        <div>
          <AuthLabel htmlFor="newPassword">New password</AuthLabel>
          <AuthInput
            icon={Lock}
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
          />
        </div>

        <MotionButton
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Resetting…' : 'Reset password'}
        </MotionButton>
      </form>
    </AuthShell>
  )
}
