// Template 03: Linear Inspired
// Category: Productivity / Project Management / Internal Tools
// Design: Developer-first precision. Near-black with purple accent, monospace code elements.
// Colors: #0E1117 bg, #7C3AED primary, #F3F4F6 text
// Font: Inter + JetBrains Mono (monospace elements)
// Motion: Instant snaps, precise micro-interactions, keyboard-driven feel, row reveals

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Zap, Shield, Globe, Command,
  GitBranch, Layers, ChevronRight, Star, Search, Settings,
  Circle, CheckCircle2, AlertCircle, Clock, Plus, Filter,
  Hash, Users, BarChart2, Keyboard, MoveRight
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:        '#0E1117',
  bgAlt:     '#161B22',
  bgHover:   '#1C2128',
  surface:   'rgba(255,255,255,0.04)',
  surfaceHi: 'rgba(255,255,255,0.07)',
  border:    'rgba(255,255,255,0.08)',
  borderHi:  'rgba(124,58,237,0.4)',
  primary:   '#7C3AED',
  primaryDim:'rgba(124,58,237,0.15)',
  primaryHi: '#8B5CF6',
  text:      '#F3F4F6',
  muted:     '#8B949E',
  dim:       '#484F58',
  success:   '#2EA043',
  warning:   '#D29922',
  error:     '#F85149',
  mono:      '"JetBrains Mono", "Fira Code", monospace',
  sans:      '"Inter", system-ui, sans-serif',
} as const

// ── Animation Variants ────────────────────────────────────────────────────────
const snap: Variants = {
  hidden:  { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.18, ease: 'easeOut' } },
}
const snapUp: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}
const staggerSnap: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05 } },
}
const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
}

function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Features', 'Changelog', 'Customers', 'Pricing', 'Blog']

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: 'rgba(14,17,23,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${T.border}`,
        }}>
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: T.primary }}>
              <Layers size={13} color="#fff" />
            </div>
            <span className="font-semibold text-sm" style={{ color: T.text, fontFamily: T.sans }}>Flux</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {nav.map(n => (
              <a key={n} href="#" className="text-sm hover:text-white transition-colors"
                style={{ color: T.muted, fontFamily: T.sans }}>{n}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.muted }}>
              <Search size={11} />
              <span style={{ fontFamily: T.sans }}>Search</span>
              <span className="ml-1 px-1 rounded text-xs" style={{ background: T.bgHover, fontFamily: T.mono }}>⌘K</span>
            </div>
            <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg"
              style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
              Start free
            </motion.a>
          </div>
          <button onClick={() => setOpen(true)} className="md:hidden" style={{ color: T.muted }}>
            <Menu size={18} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-64 p-5"
              style={{ background: T.bgAlt, borderLeft: `1px solid ${T.border}` }}>
              <button onClick={() => setOpen(false)} className="mb-6" style={{ color: T.muted }}>
                <X size={18} />
              </button>
              <div className="flex flex-col gap-4">
                {nav.map(n => (
                  <a key={n} href="#" className="text-sm" style={{ color: T.muted }}>{n}</a>
                ))}
                <a href="#" className="mt-4 text-center py-2 rounded-lg text-sm font-medium"
                  style={{ background: T.primary, color: '#fff' }}>Start free</a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Hero (Command Interface) ──────────────────────────────────────────────────
function Hero() {
  const [typed, setTyped] = useState('')
  const commands = ['Create issue · Frontend', 'Assign to @maya · P1', 'Set sprint · Q3-2026']
  const [cmdIdx, setCmdIdx] = useState(0)

  useEffect(() => {
    const target = commands[cmdIdx]
    if (typed.length < target.length) {
      const t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 60)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setCmdIdx(i => (i + 1) % commands.length)
        setTyped('')
      }, 1800)
      return () => clearTimeout(t)
    }
  }, [typed, cmdIdx])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-14 pb-16 overflow-hidden"
      style={{ background: T.bg }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-8"
            style={{ background: T.primaryDim, color: T.primaryHi, border: `1px solid rgba(124,58,237,0.25)`, fontFamily: T.sans }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.primary }} />
            Flux 2.0 · Now with AI-powered triage
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-[1.08] mb-6"
          style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
          Ship software<br />
          <span style={{ color: T.primaryHi }}>without the noise.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-lg mb-8 max-w-lg mx-auto"
          style={{ color: T.muted, fontFamily: T.sans }}>
          Issue tracking, project planning, and roadmaps designed for engineering teams that value focus.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap gap-3 justify-center mb-14">
          <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
            Get started free <ArrowRight size={14} />
          </motion.a>
          <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
            style={{ color: T.muted, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
            <Keyboard size={14} /> View keyboard shortcuts
          </motion.a>
        </motion.div>

        {/* Command Palette Demo */}
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{ border: `1px solid ${T.border}`, background: T.bgAlt }}>
          {/* Title bar */}
          <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs" style={{ color: T.dim, fontFamily: T.sans }}>Flux — Engineering Team</span>
            </div>
          </div>

          <div className="grid grid-cols-5 min-h-[300px]">
            {/* Left sidebar */}
            <div className="col-span-1 p-3" style={{ background: T.bg, borderRight: `1px solid ${T.border}` }}>
              <div className="flex flex-col gap-1">
                {['Issues', 'Projects', 'Cycles', 'Backlog', 'Roadmap'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${i === 0 ? 'font-medium' : ''}`}
                    style={{
                      color: i === 0 ? T.text : T.muted,
                      background: i === 0 ? T.surfaceHi : 'transparent',
                      fontFamily: T.sans,
                    }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? T.primary : T.dim }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Issue list */}
            <div className="col-span-2 p-3" style={{ borderRight: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: T.muted, fontFamily: T.sans }}>In Progress</span>
                <span className="text-xs" style={{ color: T.dim, fontFamily: T.mono }}>3</span>
              </div>
              {[
                { id: 'FLX-142', title: 'Fix pagination bug in table', priority: 'high' },
                { id: 'FLX-139', title: 'Add keyboard shortcut hints', priority: 'med' },
                { id: 'FLX-135', title: 'Optimize bundle size', priority: 'low' },
              ].map(issue => (
                <div key={issue.id} className="flex items-center gap-2 py-2 px-2 rounded-md mb-1 cursor-pointer"
                  style={{ background: issue.id === 'FLX-142' ? T.surfaceHi : 'transparent' }}>
                  <AlertCircle size={12} color={issue.priority === 'high' ? T.error : issue.priority === 'med' ? T.warning : T.muted} />
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: T.dim, fontFamily: T.mono }}>{issue.id}</span>
                  <span className="text-xs truncate" style={{ color: T.text, fontFamily: T.sans }}>{issue.title}</span>
                </div>
              ))}
            </div>

            {/* Detail pane + command palette */}
            <div className="col-span-2 p-3 relative">
              <p className="text-xs font-medium mb-2" style={{ color: T.text, fontFamily: T.sans }}>FLX-142</p>
              <p className="text-xs mb-4" style={{ color: T.muted, fontFamily: T.sans }}>Fix pagination bug in table component when filtered results are active.</p>
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-10">
                <div className="rounded-lg overflow-hidden shadow-xl" style={{ background: T.bgHover, border: `1px solid ${T.borderHi}` }}>
                  <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <Command size={12} color={T.primary} />
                    <span className="text-xs" style={{ color: T.text, fontFamily: T.mono }}>
                      {typed}<span className="animate-pulse">|</span>
                    </span>
                  </div>
                  <div className="py-1">
                    {['New issue', 'Assign member', 'Set priority', 'Add to cycle'].map((cmd, i) => (
                      <div key={cmd} className={`flex items-center justify-between px-3 py-1.5 text-xs ${i === 0 ? 'rounded-md' : ''}`}
                        style={{ background: i === 0 ? T.primaryDim : 'transparent', color: i === 0 ? T.primaryHi : T.muted, fontFamily: T.sans }}>
                        {cmd}
                        {i === 0 && <span style={{ fontFamily: T.mono, fontSize: '10px' }}>↵</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useSection()
  const features = [
    { icon: Command, title: 'Command everywhere', desc: '⌘K opens a global command palette. Every action — assign, prioritize, comment, move — is one keystroke away.', badge: '⌘K' },
    { icon: Zap, title: 'Zero-latency sync', desc: 'Changes propagate in under 50ms to all team members. No refresh, no conflicts, no "who changed this?"', badge: '<50ms' },
    { icon: GitBranch, title: 'Git integration', desc: 'Auto-link PRs, commits, and branches to issues. Close issues on merge. See code status without leaving Flux.', badge: 'GitHub · GitLab' },
    { icon: BarChart2, title: 'Cycle analytics', desc: 'Track velocity, cycle time, and throughput. Predictable delivery — not vibes-based planning.', badge: 'Analytics' },
    { icon: Filter, title: 'Powerful filters', desc: 'Filter by 30+ attributes including custom fields. Save views for daily standup, sprint review, on-call triage.', badge: '30+ filters' },
    { icon: Shield, title: 'SSO + SCIM', desc: 'SAML 2.0, Okta, Azure AD, Google Workspace — with SCIM provisioning and automatic deprovisioning.', badge: 'SOC 2' },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={staggerSnap} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14">
          <motion.span variants={snap} className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.primary, fontFamily: T.sans }}>
            PLATFORM
          </motion.span>
          <motion.h2 variants={snap} className="text-4xl font-bold mt-3 mb-3"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
            Designed for<br />engineering teams.
          </motion.h2>
          <motion.p variants={snap} className="text-base" style={{ color: T.muted, fontFamily: T.sans }}>
            Not another project management tool. A workspace that respects how engineers actually work.
          </motion.p>
        </motion.div>
        <motion.div variants={staggerSnap} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ background: T.border }}>
          {features.map(f => (
            <motion.div key={f.title} variants={snap}
              whileHover={{ background: T.bgHover }}
              className="p-7 transition-colors"
              style={{ background: T.bg }}>
              <div className="flex items-start justify-between mb-5">
                <f.icon size={18} color={T.primary} />
                <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: T.primaryDim, color: T.primaryHi, fontFamily: T.mono }}>
                  {f.badge}
                </span>
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: T.text, fontFamily: T.sans }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: T.muted, fontFamily: T.sans }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Keyboard Shortcuts ────────────────────────────────────────────────────────
function Shortcuts() {
  const { ref, inView } = useSection()
  const shortcuts = [
    { key: 'C', action: 'Create new issue' },
    { key: 'E', action: 'Edit selected issue' },
    { key: 'A', action: 'Assign to me' },
    { key: 'P', action: 'Set priority' },
    { key: 'M', action: 'Move to project' },
    { key: 'D', action: 'Set due date' },
    { key: ']', action: 'Increase priority' },
    { key: '[', action: 'Decrease priority' },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div variants={staggerSnap} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <motion.span variants={snap} className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.primary, fontFamily: T.sans }}>
              KEYBOARD-FIRST
            </motion.span>
            <motion.h2 variants={snap} className="text-4xl font-bold mt-3 mb-4"
              style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
              Your hands stay<br />on the keyboard.
            </motion.h2>
            <motion.p variants={snap} className="text-base mb-6" style={{ color: T.muted, fontFamily: T.sans }}>
              Every action in Flux has a keyboard shortcut. Power users report 3× faster issue management versus point-and-click tools.
            </motion.p>
            <motion.a href="#" variants={snap} whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: T.primaryHi, fontFamily: T.sans }}>
              See all shortcuts <ChevronRight size={14} />
            </motion.a>
          </motion.div>
          <motion.div variants={staggerFast} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="flex flex-col gap-2">
            {shortcuts.map(s => (
              <motion.div key={s.key} variants={snap}
                className="flex items-center gap-4 py-2.5 px-4 rounded-lg"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <kbd className="w-8 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ background: T.bgHover, color: T.text, border: `1px solid ${T.border}`, fontFamily: T.mono }}>
                  {s.key}
                </kbd>
                <span className="text-sm" style={{ color: T.muted, fontFamily: T.sans }}>{s.action}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const { ref, inView } = useSection()
  const testimonials = [
    { quote: "We switched from Jira 8 months ago. Our team of 40 engineers now completes sprint planning in 20 minutes instead of 3 hours.", name: 'Alex Kim', role: 'VP Engineering · Helios', stars: 5 },
    { quote: "The keyboard shortcuts alone make it worth it. I can triage 50 issues in the time Jira took to load.", name: 'Sofia Reyes', role: 'Staff Engineer · Cascade', stars: 5 },
    { quote: "Cycle analytics showed us our P1 issues take 4× longer than estimated. That visibility changed how we prioritize.", name: 'Ben Okafor', role: 'Engineering Manager · Prism', stars: 5 },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={staggerSnap} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-12 text-center">
          <motion.span variants={snap} className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.primary, fontFamily: T.sans }}>
            CUSTOMERS
          </motion.span>
          <motion.h2 variants={snap} className="text-4xl font-bold mt-3"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
            Engineers love it.
          </motion.h2>
        </motion.div>
        <motion.div variants={staggerSnap} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <motion.div key={t.name} variants={snap}
              className="p-6 rounded-xl"
              style={{ background: T.bgAlt, border: `1px solid ${T.border}` }}>
              <div className="flex gap-0.5 mb-4">
                {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />)}
              </div>
              <p className="text-sm mb-5" style={{ color: T.muted, fontFamily: T.sans }}>"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold" style={{ color: T.text, fontFamily: T.sans }}>{t.name}</p>
                <p className="text-xs mt-0.5" style={{ color: T.dim, fontFamily: T.sans }}>{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const { ref, inView } = useSection()
  const plans = [
    { name: 'Free', price: '$0', period: '', desc: 'For small teams up to 10 members', features: ['Unlimited issues', '2 active projects', 'Community support', 'Basic integrations'], cta: 'Get started', primary: false },
    { name: 'Plus', price: '$8', period: '/seat/mo', desc: 'For growing engineering teams', features: ['Unlimited projects', 'Cycle analytics', 'GitHub + GitLab', 'Priority support', 'Custom fields', 'SAML SSO'], cta: 'Start 14-day trial', primary: true },
    { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations', features: ['Everything in Plus', 'SCIM provisioning', 'Audit logs', 'Custom data retention', 'Dedicated CSM', 'SLA guarantee'], cta: 'Talk to sales', primary: false },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div variants={staggerSnap} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-12 text-center">
          <motion.span variants={snap} className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.primary, fontFamily: T.sans }}>
            PRICING
          </motion.span>
          <motion.h2 variants={snap} className="text-4xl font-bold mt-3 mb-3"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
            Simple, fair pricing.
          </motion.h2>
          <motion.p variants={snap} className="text-base" style={{ color: T.muted, fontFamily: T.sans }}>
            No per-feature gating. Pay for seats, get everything.
          </motion.p>
        </motion.div>
        <motion.div variants={staggerSnap} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-4">
          {plans.map(p => (
            <motion.div key={p.name} variants={snap}
              className="p-6 rounded-xl flex flex-col"
              style={{
                background: p.primary ? T.primary : T.bg,
                border: `1px solid ${p.primary ? T.primary : T.border}`,
              }}>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: p.primary ? 'rgba(255,255,255,0.7)' : T.dim, fontFamily: T.sans }}>
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold"
                    style={{ color: p.primary ? '#fff' : T.text, fontFamily: T.sans }}>
                    {p.price}
                  </span>
                  <span className="text-xs" style={{ color: p.primary ? 'rgba(255,255,255,0.6)' : T.dim }}>{p.period}</span>
                </div>
                <p className="text-xs mt-2" style={{ color: p.primary ? 'rgba(255,255,255,0.7)' : T.muted }}>{p.desc}</p>
              </div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs"
                    style={{ color: p.primary ? 'rgba(255,255,255,0.85)' : T.muted, fontFamily: T.sans }}>
                    <Check size={12} color={p.primary ? '#fff' : T.primary} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="block text-center py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: p.primary ? 'rgba(255,255,255,0.2)' : T.primaryDim,
                  color: p.primary ? '#fff' : T.primaryHi,
                  fontFamily: T.sans,
                }}>
                {p.cta}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  const { ref, inView } = useSection()
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div variants={staggerSnap} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.h2 variants={snap} className="text-5xl font-bold mb-5"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
            Stop managing work.<br />
            <span style={{ color: T.primaryHi }}>Start shipping it.</span>
          </motion.h2>
          <motion.p variants={snap} className="text-base mb-8" style={{ color: T.muted, fontFamily: T.sans }}>
            Free for teams up to 10. No credit card required.
          </motion.p>
          <motion.div variants={snap} className="flex flex-wrap gap-3 justify-center">
            <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium"
              style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
              Get started free <ArrowRight size={14} />
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm"
              style={{ color: T.muted, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
              Read docs
            </motion.a>
          </motion.div>
          <motion.p variants={snap} className="mt-5 text-xs" style={{ color: T.dim, fontFamily: T.mono }}>
            {'>'} Works with GitHub, GitLab, Slack, Figma, and 40+ more integrations
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = {
    Product: ['Issues', 'Projects', 'Cycles', 'Roadmap', 'Analytics', 'API'],
    Integrations: ['GitHub', 'GitLab', 'Slack', 'Figma', 'Sentry', 'PagerDuty'],
    Company: ['About', 'Blog', 'Changelog', 'Careers', 'Press'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookie Policy'],
  }
  return (
    <footer className="pt-14 pb-8" style={{ background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: T.primary }}>
                <Layers size={11} color="#fff" />
              </div>
              <span className="font-semibold text-sm" style={{ color: T.text, fontFamily: T.sans }}>Flux</span>
            </div>
            <p className="text-xs" style={{ color: T.dim, fontFamily: T.sans }}>
              Issue tracking for engineering teams who ship.
            </p>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: T.dim, fontFamily: T.sans }}>{col}</p>
              <ul className="flex flex-col gap-2">
                {links.map(l => (<li key={l}><a href="#" className="text-xs hover:text-white transition-colors" style={{ color: T.muted, fontFamily: T.sans }}>{l}</a></li>))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6" style={{ borderTop: `1px solid ${T.border}` }}>
          <p className="text-xs" style={{ color: T.dim, fontFamily: T.mono }}>© 2026 Flux, Inc. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} />
            <span className="text-xs" style={{ color: T.dim, fontFamily: T.sans }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template03() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <Features />
      <Shortcuts />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
