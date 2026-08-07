// Template 04: Dashboard First
// Category: Analytics / ERP / Finance
// Design: The product IS the hero. Light, clean, data-driven. Dashboard visible above the fold.
// Colors: #F8FAFC bg, #1E293B text, #3B82F6 primary, #10B981 success
// Font: Manrope — clear, geometric, data-friendly
// Motion: Sequential data reveals, counter animations, chart draw-ins, number counts

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Check, Menu, X, TrendingUp, TrendingDown,
  BarChart2, PieChart, Activity, Users, DollarSign, ShoppingCart,
  Bell, Search, Settings, Filter, Download, Plus, Star,
  Globe, Shield, Zap, ChevronDown
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#F8FAFC',
  bgAlt:      '#FFFFFF',
  bgDark:     '#0F172A',
  surface:    '#FFFFFF',
  border:     '#E2E8F0',
  borderDark: '#1E293B',
  primary:    '#3B82F6',
  primaryDim: '#EFF6FF',
  text:       '#0F172A',
  textSoft:   '#475569',
  textDim:    '#94A3B8',
  success:    '#10B981',
  warning:    '#F59E0B',
  error:      '#EF4444',
  purple:     '#8B5CF6',
  sans:       '"Manrope", "Inter", sans-serif',
} as const

// ── Variants ──────────────────────────────────────────────────────────────────
const rise: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 60
    const timer = setInterval(() => {
      start = Math.min(start + step, to)
      setVal(Math.floor(start))
      if (start >= to) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to])

  return (
    <span ref={ref}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Product', 'Use Cases', 'Integrations', 'Pricing', 'Docs']

  return (
    <>
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50"
        style={{ background: T.bgAlt, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
              <BarChart2 size={15} color="#fff" />
            </div>
            <span className="font-bold text-base" style={{ color: T.text, fontFamily: T.sans }}>
              Metric<span style={{ color: T.primary }}>IQ</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {nav.map(n => (
              <a key={n} href="#" className="text-sm hover:opacity-80"
                style={{ color: T.textSoft, fontFamily: T.sans }}>{n}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>Log in</a>
            <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
              Start free →
            </motion.a>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: T.text }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 inset-x-0 z-40 p-5"
            style={{ background: T.bgAlt, borderBottom: `1px solid ${T.border}` }}>
            <div className="flex flex-col gap-4">
              {nav.map(n => <a key={n} href="#" className="text-base" style={{ color: T.textSoft }}>{n}</a>)}
              <a href="#" className="py-2.5 text-center rounded-lg font-semibold text-sm" style={{ background: T.primary, color: '#fff' }}>Start free</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Hero (Dashboard Showcase) ─────────────────────────────────────────────────
function Hero() {
  const bars = [42, 67, 55, 82, 74, 91, 78, 100, 88, 95, 76, 110]
  return (
    <section className="pt-16 pb-8" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Copy */}
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="text-center pt-16 pb-12 max-w-3xl mx-auto">
          <motion.div variants={rise}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
              style={{ background: T.primaryDim, color: T.primary, fontFamily: T.sans }}>
              <Activity size={12} /> Trusted by 8,000+ finance and ops teams
            </span>
          </motion.div>
          <motion.h1 variants={rise}
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-5"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
            All your metrics,<br />
            <span style={{ color: T.primary }}>finally in one place.</span>
          </motion.h1>
          <motion.p variants={rise} className="text-lg mb-8" style={{ color: T.textSoft, fontFamily: T.sans }}>
            Connect every data source. Build dashboards in minutes. Share insights that actually change decisions.
          </motion.p>
          <motion.div variants={rise} className="flex flex-wrap gap-3 justify-center">
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
              Start for free <ArrowRight size={15} />
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-xl text-sm font-medium"
              style={{ background: T.bgAlt, color: T.textSoft, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
              Live demo
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Dashboard Frame */}
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
          style={{ border: `1px solid ${T.border}` }}>
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: '#F1F5F9', borderColor: T.border }}>
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 flex justify-center">
              <div className="rounded-md py-1 px-4 text-xs" style={{ background: T.bgAlt, color: T.textDim, border: `1px solid ${T.border}` }}>
                app.metriciq.com/overview
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell size={13} color={T.textDim} />
              <div className="w-6 h-6 rounded-full" style={{ background: T.primary }} />
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="bg-white" style={{ minHeight: '480px' }}>
            <div className="grid grid-cols-12">
              {/* Sidebar */}
              <div className="col-span-2 p-4 border-r" style={{ borderColor: T.border, background: '#FAFAFA' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: T.textDim }}>Navigation</p>
                {[
                  { icon: Activity, label: 'Overview', active: true },
                  { icon: BarChart2, label: 'Revenue', active: false },
                  { icon: Users, label: 'Customers', active: false },
                  { icon: ShoppingCart, label: 'Orders', active: false },
                ].map(item => (
                  <div key={item.label}
                    className={`flex items-center gap-2 py-2 px-2 rounded-lg mb-1 text-xs`}
                    style={{
                      background: item.active ? T.primaryDim : 'transparent',
                      color: item.active ? T.primary : T.textSoft,
                      fontFamily: T.sans,
                    }}>
                    <item.icon size={13} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main Content */}
              <div className="col-span-10 p-5">
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'MRR', value: '$284K', delta: '+12.4%', up: true, color: T.primary },
                    { label: 'Active Users', value: '12,847', delta: '+8.1%', up: true, color: T.success },
                    { label: 'Churn Rate', value: '2.3%', delta: '-0.4%', up: false, color: T.error },
                    { label: 'LTV/CAC', value: '4.2x', delta: '+0.3x', up: true, color: T.purple },
                  ].map(kpi => (
                    <div key={kpi.label} className="p-3 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                      <p className="text-[10px] font-semibold mb-1" style={{ color: T.textDim, fontFamily: T.sans }}>{kpi.label}</p>
                      <p className="text-lg font-extrabold" style={{ color: T.text, fontFamily: T.sans }}>{kpi.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {kpi.up ? <TrendingUp size={10} color={T.success} /> : <TrendingDown size={10} color={T.error} />}
                        <span className="text-[10px] font-semibold" style={{ color: kpi.up ? T.success : T.error }}>
                          {kpi.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Revenue Chart */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold" style={{ color: T.text, fontFamily: T.sans }}>Revenue Trend</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${T.success}15`, color: T.success }}>+12.4% MoM</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-28">
                      {bars.map((h, i) => (
                        <motion.div key={i}
                          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                          transition={{ delay: 0.6 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="flex-1 rounded-t-sm"
                          style={{ originY: 1, height: `${h}%`, background: i === bars.length - 1 ? T.primary : `${T.primary}40` }} />
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: T.text }}>Top Channels</p>
                    {[
                      { label: 'Direct', pct: 38, color: T.primary },
                      { label: 'Organic', pct: 27, color: T.success },
                      { label: 'Paid', pct: 21, color: T.purple },
                      { label: 'Referral', pct: 14, color: T.warning },
                    ].map(c => (
                      <div key={c.label} className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px]" style={{ color: T.textSoft }}>{c.label}</span>
                          <span className="text-[10px] font-bold" style={{ color: T.text }}>{c.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: T.border }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }}
                            transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full" style={{ background: c.color }} />
                        </div>
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

// ── Metrics Strip ─────────────────────────────────────────────────────────────
function MetricsStrip() {
  const { ref, inView } = useSection()
  const stats = [
    { icon: DollarSign, value: 8000, suffix: '+', label: 'teams trust us', color: T.primary },
    { icon: Activity, value: 250, suffix: 'M+', label: 'data points processed daily', color: T.success },
    { icon: Globe, value: 95, suffix: '+', label: 'integrations available', color: T.purple },
    { icon: Shield, value: 99.9, suffix: '%', label: 'uptime last 12 months', color: T.warning },
  ]
  return (
    <section ref={ref} className="py-16" style={{ background: T.bgDark }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(s => (
            <motion.div key={s.label} variants={rise} className="text-center">
              <s.icon size={24} color={s.color} className="mx-auto mb-3" />
              <div className="text-4xl font-extrabold mb-1"
                style={{ color: '#FFFFFF', fontFamily: T.sans }}>
                {inView ? <Counter to={typeof s.value === 'number' ? s.value : 0} suffix={s.suffix} /> : '0'}
              </div>
              <p className="text-sm" style={{ color: '#64748B', fontFamily: T.sans }}>{s.label}</p>
            </motion.div>
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
    {
      icon: Zap,
      title: 'Connect any data source in minutes',
      desc: 'Native connectors for Salesforce, Stripe, PostgreSQL, BigQuery, Shopify, HubSpot, and 90+ more. No ETL setup required.',
      badge: '95+ connectors',
      color: T.primary,
    },
    {
      icon: BarChart2,
      title: 'Drag-and-drop dashboard builder',
      desc: 'Charts, tables, KPIs, funnels, cohort analysis — compose any view without writing SQL or waiting for a data analyst.',
      badge: '30+ chart types',
      color: T.success,
    },
    {
      icon: TrendingUp,
      title: 'Anomaly detection and alerts',
      desc: 'AI-powered monitoring flags unexpected changes in your metrics before they become problems. Slack, email, or PagerDuty alerts.',
      badge: 'AI-powered',
      color: T.purple,
    },
    {
      icon: Users,
      title: 'Collaborative analytics',
      desc: 'Comment on charts, share snapshots, schedule email digests, and build permission-controlled dashboards for every stakeholder.',
      badge: 'Team-first',
      color: T.warning,
    },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-16 text-center">
          <motion.span variants={rise} className="text-sm font-bold uppercase tracking-widest" style={{ color: T.primary, fontFamily: T.sans }}>
            CAPABILITIES
          </motion.span>
          <motion.h2 variants={rise} className="text-4xl font-extrabold mt-3 mb-4"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.02em' }}>
            Data-driven decisions,<br />without the data team bottleneck.
          </motion.h2>
          <motion.p variants={rise} className="text-base max-w-2xl mx-auto" style={{ color: T.textSoft, fontFamily: T.sans }}>
            Business users can answer their own questions. Data teams can focus on high-value work.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-5">
          {features.map(f => (
            <motion.div key={f.title} variants={rise}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}
              transition={{ duration: 0.25 }}
              className="p-7 rounded-2xl"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.color}12` }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${f.color}12`, color: f.color, fontFamily: T.sans }}>
                  {f.badge}
                </span>
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: T.text, fontFamily: T.sans }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: T.textSoft, fontFamily: T.sans }}>{f.desc}</p>
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
    { quote: "We replaced 4 different reporting tools with MetricIQ. Our execs now self-serve 90% of their data questions.", name: 'Rachel Torres', role: 'Head of Analytics · Momentum', stars: 5 },
    { quote: "The anomaly detection saved us from a billing bug that would have cost $80K in a single quarter.", name: 'David Park', role: 'CFO · Clearpath', stars: 5 },
    { quote: "Setup took 2 hours. Our Stripe, Salesforce, and PostgreSQL data were unified in one dashboard by end of day.", name: 'Emma Laurent', role: 'CTO · Kaizen Finance', stars: 5 },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-12 text-center">
          <motion.h2 variants={rise} className="text-4xl font-extrabold"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.02em' }}>
            Loved by data-driven teams.
          </motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <motion.div key={t.name} variants={rise}
              className="p-6 rounded-2xl"
              style={{ background: T.bgAlt, border: `1px solid ${T.border}` }}>
              <div className="flex gap-0.5 mb-4">
                {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />)}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: T.textSoft, fontFamily: T.sans }}>"{t.quote}"</p>
              <div>
                <p className="text-sm font-bold" style={{ color: T.text, fontFamily: T.sans }}>{t.name}</p>
                <p className="text-xs mt-0.5" style={{ color: T.textDim, fontFamily: T.sans }}>{t.role}</p>
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
    { name: 'Starter', price: '$49', period: '/mo', desc: 'For small teams just getting started', features: ['5 data sources', '10 dashboards', '3 team members', 'Standard charts', 'Email alerts', '7-day data history'], cta: 'Start free trial', primary: false },
    { name: 'Business', price: '$199', period: '/mo', desc: 'For growing analytics teams', features: ['25 data sources', 'Unlimited dashboards', '25 team members', 'All chart types', 'AI anomaly detection', '1-year data history', 'Priority support'], cta: 'Start free trial', primary: true },
    { name: 'Enterprise', price: 'Custom', period: '', desc: 'For organizations with complex needs', features: ['Unlimited sources', 'Unlimited everything', 'SAML SSO + SCIM', 'Data governance tools', 'Custom retention', 'Dedicated CSM'], cta: 'Talk to us', primary: false },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14 text-center">
          <motion.h2 variants={rise} className="text-4xl font-extrabold mb-4"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.02em' }}>
            Start free. Scale as you grow.
          </motion.h2>
          <motion.p variants={rise} className="text-base" style={{ color: T.textSoft, fontFamily: T.sans }}>
            All plans include a 14-day trial. No credit card required.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5">
          {plans.map(p => (
            <motion.div key={p.name} variants={rise}
              className="p-7 rounded-2xl flex flex-col"
              style={{
                background: p.primary ? T.bgDark : T.bg,
                border: `1px solid ${p.primary ? T.bgDark : T.border}`,
                boxShadow: p.primary ? '0 20px 50px rgba(15,23,42,0.25)' : 'none',
              }}>
              {p.primary && (
                <span className="self-start mb-4 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: T.primary, color: '#fff' }}>
                  Most popular
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: p.primary ? '#64748B' : T.textDim, fontFamily: T.sans }}>
                {p.name}
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold"
                  style={{ color: p.primary ? '#FFFFFF' : T.text, fontFamily: T.sans }}>
                  {p.price}
                </span>
                <span className="text-sm" style={{ color: p.primary ? '#64748B' : T.textDim }}>{p.period}</span>
              </div>
              <p className="text-sm mb-6" style={{ color: p.primary ? '#64748B' : T.textSoft, fontFamily: T.sans }}>{p.desc}</p>
              <ul className="flex flex-col gap-2.5 flex-1 mb-7">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm"
                    style={{ color: p.primary ? '#94A3B8' : T.textSoft, fontFamily: T.sans }}>
                    <Check size={14} color={p.primary ? T.success : T.primary} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="block text-center py-3 rounded-xl text-sm font-bold"
                style={{
                  background: p.primary ? T.primary : T.primaryDim,
                  color: p.primary ? '#fff' : T.primary,
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
    <section ref={ref} className="py-20" style={{ background: T.primary }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.h2 variants={rise} className="text-5xl font-extrabold mb-5 text-white"
            style={{ fontFamily: T.sans, letterSpacing: '-0.02em' }}>
            Your metrics shouldn't<br />live in spreadsheets.
          </motion.h2>
          <motion.p variants={rise} className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: T.sans }}>
            Connect your data in minutes. No SQL. No engineers.
          </motion.p>
          <motion.div variants={rise} className="flex flex-wrap gap-4 justify-center">
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl font-bold"
              style={{ background: '#FFFFFF', color: T.primary, fontFamily: T.sans }}>
              Start free — no card needed
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl font-medium"
              style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontFamily: T.sans }}>
              Book a demo
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = {
    Product: ['Dashboards', 'Connectors', 'Alerts', 'Reports', 'API'],
    'Use Cases': ['Finance', 'Marketing', 'Sales', 'Product', 'Operations'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
  }
  return (
    <footer className="pt-14 pb-8" style={{ background: T.bgDark }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: T.primary }}>
                <BarChart2 size={13} color="#fff" />
              </div>
              <span className="font-bold text-sm text-white">MetricIQ</span>
            </div>
            <p className="text-xs" style={{ color: '#475569', fontFamily: T.sans }}>Analytics for teams who make decisions with data.</p>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#334155' }}>{col}</p>
              <ul className="flex flex-col gap-2">
                {links.map(l => <li key={l}><a href="#" className="text-xs hover:text-white transition-colors" style={{ color: '#475569' }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: '#1E293B' }}>
          <p className="text-xs" style={{ color: '#334155' }}>© 2026 MetricIQ, Inc.</p>
          <p className="text-xs" style={{ color: '#334155' }}>SOC 2 Type II · GDPR · CCPA</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template04() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <MetricsStrip />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
