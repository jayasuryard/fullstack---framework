// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import api from '../../server/api'
import { AuthInput, AuthLabel, AuthNotice, AuthShell, MotionButton } from './AuthShell'

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
      <AuthNotice
        title="Check your email"
        body="If that email exists, we sent a 6-digit code. It expires in 10 minutes."
        footer={
          <Link to="/reset-password" className="text-sm text-orange-300 hover:text-orange-200 transition-colors">
            I have a code — reset my password
          </Link>
        }
      />
    )
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a one-time code."
      error={error}
      footer={
        <Link to="/login" className="text-orange-300 hover:text-orange-200 transition-colors">
          Back to sign in
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

        <MotionButton
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send code'}
        </MotionButton>
      </form>
    </AuthShell>
  )
}
