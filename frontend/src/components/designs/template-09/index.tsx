// Template 09: Bento Experience
// Category: Developer Platform / API / Cloud Infrastructure
// Design: Bento grid hero showcasing product features as interactive cards.
//         Slate dark with emerald accents — developer-friendly, modern, interactive.
// Colors: #0F172A bg, #1E293B surface, #10B981 accent
// Font: DM Sans — clean, modern, developer-readable
// Motion: Spring card entrances, hover levitation, sequential bento reveal, tilt effects

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Zap, Shield, Globe, Code2,
  GitBranch, Database, Activity, ChevronRight, Copy, Star,
  Terminal, Layers, Cpu, Cloud, Lock, BarChart2, Settings
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:        '#0F172A',
  bgAlt:     '#0A1120',
  surface:   '#1E293B',
  surfaceHi: '#263447',
  border:    '#1E293B',
  borderHi:  'rgba(16,185,129,0.3)',
  primary:   '#10B981',
  primaryDim:'rgba(16,185,129,0.1)',
  secondary: '#6366F1',
  secondDim: 'rgba(99,102,241,0.15)',
  text:      '#F1F5F9',
  textSoft:  '#94A3B8',
  textDim:   '#475569',
  warning:   '#F59E0B',
  error:     '#EF4444',
  code:      '#F8FAFC',
  sans:      '"DM Sans", "Inter", sans-serif',
  mono:      '"JetBrains Mono", "Fira Code", monospace',
} as const

// ── Variants ──────────────────────────────────────────────────────────────────
const bentoEnter: Variants = {
  hidden:  { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

// ── BentoCard ─────────────────────────────────────────────────────────────────
function BentoCard({ children, className = '', accent = T.primary }: {
  children: React.ReactNode; className?: string; accent?: string
}) {
  return (
    <motion.div
      variants={bentoEnter}
      whileHover={{ y: -5, borderColor: `${accent}50`, boxShadow: `0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px ${accent}25` }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
      }}>
      {children}
    </motion.div>
  )
}

// ── Code Block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0A0F1A', border: `1px solid ${T.border}` }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#111827', borderBottom: `1px solid ${T.border}` }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
        </div>
        <span className="text-[10px]" style={{ color: T.textDim, fontFamily: T.mono }}>{lang}</span>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded"
          style={{ color: copied ? T.primary : T.textDim, background: T.surface, fontFamily: T.sans }}>
          <Copy size={9} />
          {copied ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>
      <pre className="p-4 text-xs overflow-x-auto" style={{ color: T.code, fontFamily: T.mono, lineHeight: 1.7 }}>
        {code}
      </pre>
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Product', 'Docs', 'Pricing', 'Community', 'Blog']
  return (
    <>
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        className="fixed top-0 inset-x-0 z-50"
        style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
              <Layers size={14} color="#fff" />
            </div>
            <span className="font-bold text-sm" style={{ color: T.text, fontFamily: T.sans }}>
              Strata<span style={{ color: T.primary }}>Cloud</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {nav.map(n => <a key={n} href="#" className="text-sm hover:text-white transition-colors" style={{ color: T.textSoft, fontFamily: T.sans }}>{n}</a>)}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: T.mono }}>
              npm install strata-sdk
            </div>
            <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-sm font-bold px-4 py-2 rounded-lg"
              style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
              Get API key
            </motion.a>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: T.textSoft }}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-14 inset-x-0 z-40 p-5"
            style={{ background: T.bgAlt, borderBottom: `1px solid ${T.border}` }}>
            <div className="flex flex-col gap-4">
              {nav.map(n => <a key={n} href="#" className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>{n}</a>)}
              <a href="#" className="py-2.5 rounded-lg text-center font-bold text-sm"
                style={{ background: T.primary, color: '#fff' }}>Get API key</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Hero — Bento Grid ─────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-14 pb-16 overflow-hidden" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-6 pt-16">
        {/* Headline */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="text-center mb-14">
          <motion.div variants={bentoEnter}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: T.primaryDim, color: T.primary, border: `1px solid ${T.borderHi}`, fontFamily: T.sans }}>
              <Activity size={11} /> Now GA: Strata Functions + Strata DB
            </span>
          </motion.div>
          <motion.h1 variants={bentoEnter}
            className="text-5xl md:text-7xl font-bold leading-[1.06] mb-5"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
            Build cloud backends<br />
            <span style={{ color: T.primary }}>in minutes, not months.</span>
          </motion.h1>
          <motion.p variants={bentoEnter} className="text-lg max-w-xl mx-auto mb-8"
            style={{ color: T.textSoft, fontFamily: T.sans }}>
            Serverless functions, managed databases, real-time subscriptions, and edge CDN — unified in one developer platform.
          </motion.p>
          <motion.div variants={bentoEnter} className="flex flex-wrap gap-3 justify-center">
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
              Get started free <ArrowRight size={15} />
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
              style={{ color: T.textSoft, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
              <Code2 size={14} /> View docs
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Bento Grid */}
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Large card — Deploy in seconds */}
          <BentoCard className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={15} color={T.primary} />
              <span className="text-xs font-bold" style={{ color: T.textSoft, fontFamily: T.sans }}>Deploy in seconds</span>
            </div>
            <CodeBlock
              code={`$ strata deploy
✓ Building function...
✓ Deploying to 42 edge nodes...
✓ Live at api.yourdomain.com/fn/hello

Deployment time: 3.2s`}
              lang="bash" />
          </BentoCard>

          {/* Uptime card */}
          <BentoCard accent={T.secondary}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} color={T.primary} />
              <span className="text-xs font-bold" style={{ color: T.textSoft, fontFamily: T.sans }}>Live uptime</span>
            </div>
            <div className="text-4xl font-bold mb-2" style={{ color: T.primary, fontFamily: T.sans }}>99.99%</div>
            <div className="flex gap-0.5 mb-3">
              {Array(24).fill(0).map((_, i) => (
                <div key={i} className="flex-1 rounded-sm h-6"
                  style={{ background: i === 14 || i === 15 ? T.warning : T.primary, opacity: i === 14 || i === 15 ? 0.5 : 0.8 }} />
              ))}
            </div>
            <p className="text-[10px]" style={{ color: T.textDim, fontFamily: T.sans }}>Last 24 hours · 2 minor events</p>
          </BentoCard>

          {/* Stack card */}
          <BentoCard>
            <p className="text-xs font-bold mb-4" style={{ color: T.textSoft, fontFamily: T.sans }}>Tech stack</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Functions', icon: Zap, color: T.primary },
                { label: 'Database', icon: Database, color: T.secondary },
                { label: 'Storage', icon: Cloud, color: T.warning },
                { label: 'Auth', icon: Lock, color: '#EC4899' },
                { label: 'CDN', icon: Globe, color: '#00CCFF' },
                { label: 'Analytics', icon: BarChart2, color: T.primary },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: T.surfaceHi }}>
                  <s.icon size={11} color={s.color} />
                  <span className="text-[10px]" style={{ color: T.textSoft, fontFamily: T.sans }}>{s.label}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Languages */}
          <BentoCard accent={T.primary}>
            <p className="text-xs font-bold mb-4" style={{ color: T.textSoft, fontFamily: T.sans }}>SDKs & languages</p>
            <div className="flex flex-col gap-2">
              {[
                { lang: 'TypeScript / JavaScript', color: '#F7DF1E' },
                { lang: 'Python', color: '#3776AB' },
                { lang: 'Go', color: '#00ADD8' },
                { lang: 'Rust (preview)', color: '#F74C00' },
              ].map(l => (
                <div key={l.lang} className="flex items-center gap-2 text-xs"
                  style={{ color: T.textSoft, fontFamily: T.sans }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  {l.lang}
                </div>
              ))}
            </div>
            <a href="#" className="flex items-center gap-1 text-xs mt-5" style={{ color: T.primary, fontFamily: T.sans }}>
              Browse all SDKs <ChevronRight size={11} />
            </a>
          </BentoCard>

          {/* Global edge */}
          <BentoCard className="md:col-span-2" accent={T.secondary}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold" style={{ color: T.textSoft, fontFamily: T.sans }}>Global edge network</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: T.primaryDim, color: T.primary, fontFamily: T.sans }}>
                42 regions
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { region: 'US East', latency: '8ms', status: 'ok' },
                { region: 'EU West', latency: '12ms', status: 'ok' },
                { region: 'AP South', latency: '18ms', status: 'ok' },
                { region: 'US West', latency: '6ms', status: 'ok' },
                { region: 'SA East', latency: '24ms', status: 'ok' },
                { region: 'AF South', latency: '31ms', status: 'warn' },
              ].map(r => (
                <div key={r.region} className="p-2 rounded-lg" style={{ background: T.surfaceHi }}>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: r.status === 'ok' ? T.primary : T.warning }} />
                    <span className="text-[9px]" style={{ color: T.textDim, fontFamily: T.sans }}>{r.region}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: T.text, fontFamily: T.mono }}>{r.latency}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Pricing card */}
          <BentoCard accent={T.primary}>
            <p className="text-xs font-bold mb-2" style={{ color: T.textSoft, fontFamily: T.sans }}>Start free</p>
            <div className="text-3xl font-bold mb-1" style={{ color: T.text, fontFamily: T.sans }}>$0</div>
            <p className="text-xs mb-4" style={{ color: T.textDim, fontFamily: T.sans }}>100K requests/mo free forever</p>
            {['5GB DB storage', 'SSL + CDN', 'GitHub deploy'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs mb-2"
                style={{ color: T.textSoft, fontFamily: T.sans }}>
                <Check size={11} color={T.primary} strokeWidth={2.5} /> {f}
              </div>
            ))}
            <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="block text-center py-2 rounded-lg text-xs font-bold mt-5"
              style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
              Start for free
            </motion.a>
          </BentoCard>
        </motion.div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useSection()
  const feats = [
    { icon: Zap, title: 'Strata Functions', desc: 'Deploy serverless functions in 3 seconds to 42 edge regions. Auto-scaling, zero cold starts, native TypeScript.', color: T.primary, code: 'export default fn(req) => { return req.json() }' },
    { icon: Database, title: 'Strata DB', desc: 'Managed Postgres with automatic backups, connection pooling, branching, and REST/GraphQL APIs auto-generated from your schema.', color: T.secondary, code: 'const users = await db.users.findMany({ where: { active: true } })' },
    { icon: Activity, title: 'Strata Realtime', desc: 'WebSocket subscriptions, broadcast channels, and presence tracking with sub-50ms latency across all regions.', color: T.warning, code: 'strata.channel("room:42").on("update", handler)' },
    { icon: Cloud, title: 'Strata Storage', desc: 'S3-compatible object storage with built-in CDN, image transformations, signed URLs, and automatic geo-replication.', color: '#EC4899', code: 'await storage.from("avatars").upload("user.png", file)' },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14">
          <motion.span variants={bentoEnter} className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary, fontFamily: T.sans }}>
            PRODUCTS
          </motion.span>
          <motion.h2 variants={bentoEnter} className="text-4xl font-bold mt-3 mb-3"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.02em' }}>
            Everything your backend needs.
          </motion.h2>
          <motion.p variants={bentoEnter} className="text-base max-w-lg"
            style={{ color: T.textSoft, fontFamily: T.sans }}>
            Replace your fragmented cloud stack with one unified platform. One bill, one DX.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-5">
          {feats.map(f => (
            <motion.div key={f.title} variants={bentoEnter}
              className="p-6 rounded-2xl"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.color}15` }}>
                  <f.icon size={18} color={f.color} />
                </div>
                <h3 className="text-base font-bold" style={{ color: T.text, fontFamily: T.sans }}>{f.title}</h3>
              </div>
              <p className="text-sm mb-5" style={{ color: T.textSoft, fontFamily: T.sans }}>{f.desc}</p>
              <div className="p-3 rounded-lg text-xs" style={{ background: '#0A0F1A', fontFamily: T.mono, color: f.color }}>
                {f.code}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Integration Strip ─────────────────────────────────────────────────────────
function Integrations() {
  const { ref, inView } = useSection()
  const integrations = ['Vercel', 'Next.js', 'Remix', 'Astro', 'SvelteKit', 'Nuxt', 'GitHub', 'GitLab', 'Stripe', 'Auth0', 'Resend', 'Cloudflare']
  return (
    <section ref={ref} className="py-16" style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.p variants={bentoEnter} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-center text-sm mb-8" style={{ color: T.textDim, fontFamily: T.sans }}>
          Integrates with your existing stack
        </motion.p>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-3">
          {integrations.map(i => (
            <motion.span key={i} variants={bentoEnter}
              whileHover={{ scale: 1.05, borderColor: T.primary }}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: T.sans }}>
              {i}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const { ref, inView } = useSection()
  const qs = [
    { quote: "We migrated from AWS + Vercel + Supabase to Strata. Our infra bill dropped 60% and we have one fewer vendor to manage.", name: 'Kai Mendez', role: 'CTO · Orbit App', stars: 5 },
    { quote: "Strata Functions are the fastest cold-start serverless runtime I've used. The DX is exactly what developer tools should feel like.", name: 'Priya Shah', role: 'Founding Engineer · Clearstack', stars: 5 },
    { quote: "DB branching changed how we do staging environments. Every PR now gets its own database branch automatically.", name: 'Liam Park', role: 'Staff Engineer · Pulsar', stars: 5 },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 variants={bentoEnter} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-4xl font-bold mb-12 text-center"
          style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.02em' }}>
          Built by devs. Loved by devs.
        </motion.h2>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5">
          {qs.map(t => (
            <motion.div key={t.name} variants={bentoEnter}
              className="p-6 rounded-2xl"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="flex gap-0.5 mb-4">
                {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={12} fill={T.warning} color={T.warning} />)}
              </div>
              <p className="text-sm mb-5" style={{ color: T.textSoft, fontFamily: T.sans }}>"{t.quote}"</p>
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
    { name: 'Free', price: '$0', period: '', desc: 'For side projects', features: ['100K requests/mo', '500MB DB', '5GB storage', 'Community support', 'SSL + CDN', 'Git deploy'], cta: 'Start free', primary: false },
    { name: 'Pro', price: '$25', period: '/mo', desc: 'For production apps', features: ['5M requests/mo', '8GB DB', '100GB storage', 'Priority support', 'DB branching', 'Team members', 'Analytics dashboard'], cta: 'Start trial', primary: true },
    { name: 'Team', price: '$99', period: '/mo', desc: 'For growing teams', features: ['Unlimited requests', 'Unlimited DB', '1TB storage', 'SSO + SAML', 'Custom domains', 'SLA guarantee', 'Dedicated support'], cta: 'Contact us', primary: false },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-12 text-center">
          <motion.h2 variants={bentoEnter} className="text-4xl font-bold mb-4"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.02em' }}>
            Pricing that scales with you
          </motion.h2>
          <motion.p variants={bentoEnter} className="text-base" style={{ color: T.textSoft, fontFamily: T.sans }}>
            Start free. Pay as you grow. No per-seat nonsense.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5">
          {plans.map(p => (
            <motion.div key={p.name} variants={bentoEnter}
              whileHover={{ borderColor: T.borderHi }}
              className="p-6 rounded-2xl flex flex-col transition-colors"
              style={{
                background: p.primary ? T.surface : T.bgAlt,
                border: `1px solid ${p.primary ? T.primary + '40' : T.border}`,
              }}>
              {p.primary && (
                <span className="self-start mb-4 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: T.primaryDim, color: T.primary, fontFamily: T.sans }}>
                  Most popular
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: T.textDim, fontFamily: T.sans }}>{p.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold" style={{ color: T.text, fontFamily: T.sans }}>{p.price}</span>
                <span className="text-xs" style={{ color: T.textDim }}>{p.period}</span>
              </div>
              <p className="text-xs mb-6" style={{ color: T.textDim, fontFamily: T.sans }}>{p.desc}</p>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs"
                    style={{ color: T.textSoft, fontFamily: T.sans }}>
                    <Check size={11} color={T.primary} strokeWidth={2.5} /> {f}
                  </li>
                ))}
              </ul>
              <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="block text-center py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: p.primary ? T.primary : T.surface,
                  color: p.primary ? '#fff' : T.text,
                  border: p.primary ? 'none' : `1px solid ${T.border}`,
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
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-4xl mx-auto px-6">
        <BentoCard className="p-10 text-center" accent={T.primary}>
          <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <motion.div variants={bentoEnter} className="mb-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary, fontFamily: T.sans }}>
                GET STARTED
              </span>
            </motion.div>
            <motion.h2 variants={bentoEnter} className="text-5xl font-bold mb-5"
              style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
              Ship your backend.<br />
              <span style={{ color: T.primary }}>Today.</span>
            </motion.h2>
            <motion.p variants={bentoEnter} className="text-base mb-8"
              style={{ color: T.textSoft, fontFamily: T.sans }}>
              Free forever for individual developers. No credit card required.
            </motion.p>
            <motion.div variants={bentoEnter} className="flex flex-wrap gap-4 justify-center">
              <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold"
                style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
                Start building free <ArrowRight size={16} />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl"
                style={{ color: T.textSoft, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
                Read the docs
              </motion.a>
            </motion.div>
            <motion.p variants={bentoEnter} className="mt-5 text-xs" style={{ color: T.textDim, fontFamily: T.mono }}>
              {'$'} npm install strata-sdk && strata login
            </motion.p>
          </motion.div>
        </BentoCard>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = {
    Products: ['Functions', 'Database', 'Storage', 'Realtime', 'Auth', 'Edge CDN'],
    Developers: ['Docs', 'SDK Reference', 'Status', 'Changelog', 'Examples'],
    Company: ['About', 'Blog', 'Careers', 'Security', 'Press'],
    Legal: ['Privacy', 'Terms', 'DPA', 'Cookie Policy'],
  }
  return (
    <footer className="pt-14 pb-8" style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
                <Layers size={12} color="#fff" />
              </div>
              <span className="font-bold text-sm" style={{ color: T.text, fontFamily: T.sans }}>StrataCloud</span>
            </div>
            <p className="text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>
              Developer platform for the modern web.
            </p>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: T.textDim, fontFamily: T.sans }}>{col}</p>
              <ul className="flex flex-col gap-2">
                {links.map(l => <li key={l}><a href="#" className="text-xs hover:text-white transition-colors" style={{ color: T.textDim, fontFamily: T.sans }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6" style={{ borderTop: `1px solid ${T.border}` }}>
          <p className="text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>© 2026 StrataCloud Inc.</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.primary }} />
            <span className="text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template09() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <Features />
      <Integrations />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
