// Template 01: Enterprise Glass
// Category: CRM / ERP / HRMS
// Design: Sophisticated glass morphism on deep navy — trustworthy, modern, enterprise B2B.
// Colors: #0A0F1E bg, #6366F1 primary, #22D3EE accent
// Font: Inter (clean, professional, dense-information-friendly)
// Motion: Smooth slide-ins, glass shimmer, stagger reveals, floating UI card

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Star, Shield, Globe, BarChart3, Users,
  Lock, Layers, Play, Building2, Workflow, TrendingUp, Bell,
  Search, Settings, ChevronDown, Zap, Database, PieChart
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#0A0F1E',
  bgAlt:      '#0D1424',
  surface:    'rgba(255,255,255,0.035)',
  surfaceHi:  'rgba(255,255,255,0.065)',
  border:     'rgba(255,255,255,0.08)',
  borderHi:   'rgba(255,255,255,0.16)',
  primary:    '#6366F1',
  primaryDim: 'rgba(99,102,241,0.15)',
  accent:     '#22D3EE',
  accentDim:  'rgba(34,211,238,0.12)',
  text:       '#F1F5F9',
  muted:      '#94A3B8',
  dim:        '#475569',
  success:    '#10B981',
  glass:      'rgba(255,255,255,0.04)',
  glassBd:    'rgba(255,255,255,0.1)',
} as const

// ── Animation Variants ────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const slideLeft: Variants = {
  hidden:  { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const staggerSlow: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return { ref, inView }
}

function GlassCard({ children, className = '', hover = true }: {
  children: React.ReactNode; className?: string; hover?: boolean
}) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, borderColor: T.borderHi } : {}}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl ${className}`}
      style={{
        background: T.surface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${T.border}`,
      }}
    >
      {children}
    </motion.div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{ background: T.primaryDim, color: T.primary, border: `1px solid rgba(99,102,241,0.25)` }}
    >
      {children}
    </span>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Product', 'Solutions', 'Enterprise', 'Pricing', 'Docs']

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: 'rgba(10,15,30,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
              <Layers size={16} color="#fff" />
            </div>
            <span className="font-semibold text-base" style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>
              Nexus<span style={{ color: T.accent }}>ERP</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {nav.map(n => (
              <a key={n} href="#" className="text-sm transition-colors hover:opacity-100"
                style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>
                {n}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>
              Sign in
            </a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{ background: T.primary, color: '#fff', fontFamily: 'Inter, sans-serif' }}
            >
              Get started
            </motion.a>
          </div>

          <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-lg" style={{ color: T.muted }}>
            <Menu size={20} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 p-6"
              style={{ background: '#0D1424', borderLeft: `1px solid ${T.border}` }}
            >
              <button onClick={() => setOpen(false)} className="mb-8" style={{ color: T.muted }}>
                <X size={20} />
              </button>
              <div className="flex flex-col gap-4">
                {nav.map(n => (
                  <a key={n} href="#" className="text-base py-2" style={{ color: T.muted }}>
                    {n}
                  </a>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <a href="#" className="text-center py-2.5 rounded-lg text-sm" style={{ color: T.muted, border: `1px solid ${T.border}` }}>
                  Sign in
                </a>
                <a href="#" className="text-center py-2.5 rounded-lg text-sm font-medium" style={{ background: T.primary, color: '#fff' }}>
                  Get started free
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${T.bg} 0%, #0D1830 100%)` }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `linear-gradient(${T.border} 1px, transparent 1px), linear-gradient(90deg, ${T.border} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: T.primary }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: T.accent }} />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6">
          <motion.div variants={fadeUp}>
            <Badge><Zap size={12} />New · Enterprise Suite 4.0</Badge>
          </motion.div>
          <motion.h1 variants={fadeUp}
            className="text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight"
            style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>
            The ERP platform<br />
            built for <span style={{
              background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>scale-up teams</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg leading-relaxed max-w-lg"
            style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>
            Unify HR, finance, operations, and CRM in one platform. Real-time data, role-based access, and audit trails baked in from day one.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <motion.a href="#"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm"
              style={{ background: T.primary, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
              Start free trial <ArrowRight size={16} />
            </motion.a>
            <motion.a href="#"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
              style={{ color: T.text, border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', background: T.surface }}>
              <Play size={14} /> Watch demo
            </motion.a>
          </motion.div>
          <motion.div variants={fadeUp} className="flex items-center gap-6 pt-2">
            <div className="flex -space-x-2">
              {['#6366F1','#22D3EE','#10B981','#F59E0B'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  style={{ background: c, borderColor: T.bg, color: '#fff' }}>
                  {['JD','KL','SM','AB'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />)}</div>
              <p className="text-xs mt-0.5" style={{ color: T.dim }}>Trusted by 2,000+ enterprises</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — Glass UI Card */}
        <motion.div variants={slideLeft} initial="hidden" animate="visible">
          <GlassCard className="p-4 shadow-2xl" hover={false}>
            {/* Mini Navbar */}
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: T.primary }}>
                  <Layers size={12} color="#fff" />
                </div>
                <span className="text-xs font-semibold" style={{ color: T.text }}>Nexus Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer"
                  style={{ background: T.surfaceHi }}><Search size={11} color={T.muted} /></div>
                <div className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer"
                  style={{ background: T.surfaceHi }}><Bell size={11} color={T.muted} /></div>
                <div className="w-6 h-6 rounded-full" style={{ background: T.primary }} />
              </div>
            </div>
            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Revenue', value: '$2.4M', delta: '+12%', color: T.success },
                { label: 'Headcount', value: '1,240', delta: '+8%', color: T.accent },
                { label: 'Open Deals', value: '86', delta: '+5%', color: '#F59E0B' },
              ].map(m => (
                <GlassCard key={m.label} className="p-3" hover={false}>
                  <p className="text-[10px] mb-1" style={{ color: T.dim }}>{m.label}</p>
                  <p className="text-base font-bold" style={{ color: T.text }}>{m.value}</p>
                  <span className="text-[10px]" style={{ color: m.color }}>{m.delta} ↑</span>
                </GlassCard>
              ))}
            </div>
            {/* Chart placeholder */}
            <GlassCard className="p-3 mb-3" hover={false}>
              <p className="text-xs font-medium mb-3" style={{ color: T.muted }}>Revenue Trend</p>
              <div className="flex items-end gap-1.5 h-16">
                {[40, 65, 50, 80, 70, 90, 75, 95, 85, 100, 88, 110].map((h, i) => (
                  <motion.div key={i}
                    initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                    style={{ originY: 1 }}
                    className="flex-1 rounded-sm"
                    style2={{ height: `${h}%`, background: i === 11 ? T.primary : T.primaryDim }}
                  >
                    <div className="w-full h-full rounded-sm"
                      style={{ height: `${h}%`, background: i === 11 ? T.primary : T.primaryDim }} />
                  </motion.div>
                ))}
              </div>
            </GlassCard>
            {/* Recent Activity */}
            <div className="flex flex-col gap-2">
              {[
                { icon: Users, label: 'New hire onboarded — Priya Singh', time: '2m ago', color: T.accent },
                { icon: TrendingUp, label: 'Q3 forecast updated — Finance', time: '15m ago', color: T.success },
                { icon: Database, label: 'Payroll run completed — 1,240 employees', time: '1h ago', color: '#F59E0B' },
              ].map(a => (
                <div key={a.label} className="flex items-center gap-3 py-1.5 px-2 rounded-lg"
                  style={{ background: T.surface }}>
                  <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${a.color}20` }}>
                    <a.icon size={11} color={a.color} />
                  </div>
                  <span className="text-[11px] flex-1" style={{ color: T.muted }}>{a.label}</span>
                  <span className="text-[10px]" style={{ color: T.dim }}>{a.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}

// ── Logos Strip ───────────────────────────────────────────────────────────────
function LogoStrip() {
  const { ref, inView } = useSection()
  const logos = ['Accenture', 'Deloitte', 'KPMG', 'McKinsey', 'BCG', 'PwC', 'EY', 'Gartner']
  return (
    <section ref={ref} className="py-12" style={{ background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.p variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-center text-sm mb-8" style={{ color: T.dim, fontFamily: 'Inter, sans-serif' }}>
          Trusted by 2,000+ enterprise teams worldwide
        </motion.p>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {logos.map(l => (
            <motion.span key={l} variants={fadeUp}
              className="text-sm font-semibold tracking-widest uppercase opacity-30"
              style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>
              {l}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useSection()
  const features = [
    { icon: Users, title: 'Unified HRMS', desc: 'Onboarding, payroll, performance reviews, org charts — all connected. No more spreadsheets or siloed HR tools.', accent: T.primary },
    { icon: PieChart, title: 'Financial Intelligence', desc: 'Real-time P&L, budget vs actuals, AP/AR automation, and one-click audit trails for compliance.', accent: T.accent },
    { icon: Workflow, title: 'Process Automation', desc: 'Visual workflow builder with approval chains, escalations, and SLA monitoring — no code required.', accent: '#10B981' },
    { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 Type II, GDPR, HIPAA-ready. Role-based access, MFA, and field-level encryption out of the box.', accent: '#F59E0B' },
    { icon: Globe, title: 'Multi-Entity Support', desc: 'Manage multiple subsidiaries, currencies, and jurisdictions from a single control plane.', accent: '#EC4899' },
    { icon: BarChart3, title: 'Embedded Analytics', desc: 'Drag-and-drop dashboards, scheduled reports, and AI-powered anomaly detection without a BI tool.', accent: T.primary },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16">
          <motion.div variants={fadeUp}><Badge>Platform</Badge></motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold mt-4 mb-4"
            style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>
            Everything your enterprise needs
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg max-w-xl mx-auto"
            style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>
            Replace 12 disconnected tools with one unified platform. Deploy in weeks, not quarters.
          </motion.p>
        </motion.div>
        <motion.div variants={staggerSlow} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <motion.div key={f.title} variants={fadeUp}>
              <GlassCard className="p-6 h-full">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.accent}18` }}>
                  <f.icon size={20} color={f.accent} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>
                  {f.desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Metrics ───────────────────────────────────────────────────────────────────
function Metrics() {
  const { ref, inView } = useSection()
  const stats = [
    { value: '98%', label: 'uptime SLA guaranteed' },
    { value: '4.2×', label: 'faster month-end close' },
    { value: '67%', label: 'reduction in HR admin time' },
    { value: '$2.1M', label: 'average annual savings' },
  ]
  return (
    <section ref={ref} className="py-20" style={{ background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(s => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2"
                style={{
                  background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  fontFamily: 'Inter, sans-serif',
                }}>
                {s.value}
              </div>
              <p className="text-sm" style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const { ref, inView } = useSection()
  const testimonials = [
    { quote: "We replaced SAP for our mid-market division. Implementation took 6 weeks and our finance team hasn't looked back.", name: 'Sarah Chen', role: 'CFO, Meridian Group', stars: 5 },
    { quote: "The audit trail and role-based access alone sold our compliance team. Everything else was a bonus.", name: 'Marcus Webb', role: 'CTO, Fortis Capital', stars: 5 },
    { quote: "Payroll for 800 employees across 5 countries now runs in minutes. The old system took days.", name: 'Priya Nair', role: 'CHRO, Omnivest Ltd', stars: 5 },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14 text-center">
          <motion.div variants={fadeUp}><Badge>Testimonials</Badge></motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold mt-4"
            style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>
            From enterprise teams like yours
          </motion.h2>
        </motion.div>
        <motion.div variants={staggerSlow} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <motion.div key={t.name} variants={fadeUp}>
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold" style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: T.dim, fontFamily: 'Inter, sans-serif' }}>{t.role}</p>
                </div>
              </GlassCard>
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
    {
      name: 'Growth',
      price: '$299',
      period: '/mo',
      desc: 'For scaling teams up to 200 employees',
      features: ['HRMS + Payroll', 'Financial reporting', '5 custom workflows', 'Email support', '99.5% uptime SLA'],
      cta: 'Start free trial',
      primary: false,
    },
    {
      name: 'Enterprise',
      price: '$899',
      period: '/mo',
      desc: 'For multi-entity organizations',
      features: ['Everything in Growth', 'Multi-entity & currency', 'Unlimited workflows', 'Dedicated CSM', '99.9% uptime SLA', 'SOC 2 audit reports'],
      cta: 'Start free trial',
      primary: true,
    },
    {
      name: 'Global',
      price: 'Custom',
      period: '',
      desc: 'For Fortune 1000 and public sector',
      features: ['Everything in Enterprise', 'On-premise option', 'Custom integrations', 'White-glove onboarding', 'SLA up to 99.99%', 'Dedicated infra'],
      cta: 'Contact sales',
      primary: false,
    },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14 text-center">
          <motion.div variants={fadeUp}><Badge>Pricing</Badge></motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold mt-4 mb-3"
            style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>
            Transparent, value-based pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base" style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>
            All plans include a 14-day free trial. No credit card required.
          </motion.p>
        </motion.div>
        <motion.div variants={staggerSlow} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6">
          {plans.map(p => (
            <motion.div key={p.name} variants={fadeUp}>
              <GlassCard className={`p-7 h-full flex flex-col relative ${p.primary ? 'ring-1' : ''}`}
                hover={false}
                style2={{ ringColor: T.primary }}>
                {p.primary && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: T.primary, color: '#fff' }}>
                      Most popular
                    </span>
                  </div>
                )}
                <div className={`${p.primary ? 'ring-1 ring-[#6366F1]' : ''} rounded-xl`}>
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.dim }}>{p.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold" style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>{p.price}</span>
                      <span className="text-sm" style={{ color: T.dim }}>{p.period}</span>
                    </div>
                    <p className="text-sm mt-2" style={{ color: T.muted }}>{p.desc}</p>
                  </div>
                  <ul className="flex flex-col gap-3 flex-1 mb-7">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: T.muted }}>
                        <Check size={14} color={T.success} className="mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <motion.a href="#"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="block text-center py-3 rounded-xl text-sm font-medium"
                    style={{
                      background: p.primary ? T.primary : T.surface,
                      color: p.primary ? '#fff' : T.text,
                      border: p.primary ? 'none' : `1px solid ${T.border}`,
                      fontFamily: 'Inter, sans-serif',
                    }}>
                    {p.cta}
                  </motion.a>
                </div>
              </GlassCard>
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
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.h2 variants={fadeUp} className="text-5xl font-bold mb-6"
            style={{ color: T.text, fontFamily: 'Inter, sans-serif' }}>
            Ready to unify your<br />
            <span style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              enterprise operations?
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg mb-10" style={{ color: T.muted, fontFamily: 'Inter, sans-serif' }}>
            Join 2,000+ enterprise teams. Go live in weeks, not quarters.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium"
              style={{ background: T.primary, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
              Start 14-day free trial <ArrowRight size={16} />
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl text-sm"
              style={{ color: T.text, border: `1px solid ${T.border}`, background: T.surface, fontFamily: 'Inter, sans-serif' }}>
              Schedule a demo
            </motion.a>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-sm" style={{ color: T.dim }}>
            No credit card · 14-day trial · SOC 2 certified
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = {
    Product: ['Dashboard', 'HRMS', 'Finance', 'Procurement', 'Workflow Builder', 'Analytics'],
    Solutions: ['Mid-Market', 'Enterprise', 'Manufacturing', 'Healthcare', 'Finance Services'],
    Company: ['About', 'Customers', 'Blog', 'Careers', 'Press', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookie Policy', 'GDPR', 'SOC 2'],
  }
  return (
    <footer className="pt-16 pb-8" style={{ background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
                <Layers size={14} color="#fff" />
              </div>
              <span className="font-semibold text-sm" style={{ color: T.text }}>NexusERP</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: T.dim }}>
              Enterprise operations platform for modern organizations.
            </p>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: T.dim }}>{col}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map(l => (
                  <li key={l}><a href="#" className="text-xs hover:opacity-80" style={{ color: T.muted }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: `1px solid ${T.border}` }}>
          <p className="text-xs" style={{ color: T.dim }}>© 2026 NexusERP. All rights reserved.</p>
          <p className="text-xs" style={{ color: T.dim }}>SOC 2 Type II · GDPR · HIPAA</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template01() {
  return (
    <div style={{ background: T.bg, fontFamily: 'Inter, sans-serif' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <Metrics />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
