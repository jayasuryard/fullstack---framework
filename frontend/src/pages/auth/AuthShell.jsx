// src/pages/auth/AuthShell.jsx
// Shared dark glassmorphism shell for all /login, /forgot-password, /reset-password pages.
import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Zap } from 'lucide-react'

const MotionDiv = motion.div

const iconClass = 'h-4 w-4 text-orange-300'
const HIGHLIGHTS = [
  { icon: <Zap className={iconClass} />, title: 'Built for speed', body: 'Redis-backed sessions and queues keep every workspace snappy at scale.' },
  { icon: <ShieldCheck className={iconClass} />, title: 'Secure by default', body: 'Hashed refresh tokens, rate limiting, and audited access on every request.' },
  { icon: <Sparkles className={iconClass} />, title: 'Ready to extend', body: 'Drop in new modules without fighting the auth or infra layer.' },
]

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-500/30 blur-[120px]" />
      <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[120px]" />
      <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/25 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2 text-white">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold shadow-lg shadow-orange-500/30">
        S
      </div>
      <span className="font-semibold tracking-tight">SaaS Scaffold</span>
    </div>
  )
}

/** Two-column shell — brand/highlights panel + glass form panel. Used for the main auth forms. */
export function AuthShell({ title, subtitle, error, footer, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B16] flex items-center justify-center px-4 py-10">
      <Background />

      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
      >
        <div className="hidden lg:flex flex-col justify-between bg-white/5 backdrop-blur-2xl border-r border-white/10 p-10">
          <div>
            <BrandMark />
            <h1 className="mt-12 text-3xl font-bold leading-tight text-white">
              Everything you need to
              <span className="block bg-gradient-to-r from-orange-300 to-fuchsia-300 bg-clip-text text-transparent">
                launch your next SaaS.
              </span>
            </h1>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Manage your workspace, monitor jobs in real time, and keep your team moving.
            </p>
          </div>

          <div className="space-y-5">
            {HIGHLIGHTS.map(({ icon, title: t, body }) => (
              <div key={t} className="flex gap-3">
                <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  {icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t}</div>
                  <div className="text-xs text-white/50 leading-relaxed">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-white/[0.07] backdrop-blur-2xl p-8 sm:p-10 flex flex-col justify-center">
          <div className="lg:hidden mb-8">
            <BrandMark />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-white/50">{subtitle}</p>
          </div>

          {error && (
            <MotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 rounded-xl bg-red-500/10 border border-red-400/30 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </MotionDiv>
          )}

          {children}

          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}

          <p className="mt-8 text-center text-xs text-white/30">
            © {new Date().getFullYear()} — SaaS Scaffold
          </p>
        </div>
      </MotionDiv>
    </div>
  )
}

/** Single centered glass card — used for confirmation/success states. */
export function AuthNotice({ title, body, footer }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B16] flex items-center justify-center px-4 py-10">
      <Background />
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] backdrop-blur-2xl p-10 text-center shadow-2xl shadow-black/40"
      >
        <div className="text-2xl font-bold text-white mb-2">{title}</div>
        <p className="text-sm text-white/50 mb-6">{body}</p>
        {footer}
      </MotionDiv>
    </div>
  )
}

/** Icon-prefixed input matching the shell's dark glass style. */
export function AuthInput({ icon: Icon, className = '', ...rest }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />}
      <input
        className={`w-full rounded-xl border border-white/15 bg-white/5 py-3 ${Icon ? 'pl-11' : 'px-4'} pr-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-orange-400/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/30 ${className}`}
        {...rest}
      />
    </div>
  )
}

export function AuthLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-white/60">
      {children}
    </label>
  )
}

export const MotionButton = motion.button
