// Template 02: Apple Premium
// Category: AI / SaaS / Dev Tools
// Design: Ultra-refined Apple-inspired minimal. Pure white, precise typography, restrained micro-animations.
// Colors: #FFFFFF bg, #1D1D1F text, #0071E3 primary
// Font: SF Pro Display / system-ui — tight tracking, generous leading
// Motion: Subtle opacity fades, scale from 0.98, delayed staggered reveals, scroll-triggered depth

import React, { useState, useRef } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Sparkles, Zap, Shield, Globe,
  Code2, GitBranch, Layers, Play, ChevronRight, Star, Command,
  Cpu, BarChart2, Lock, Wand2
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:        '#FFFFFF',
  bgSoft:    '#F5F5F7',
  bgDark:    '#1D1D1F',
  text:      '#1D1D1F',
  textSoft:  '#6E6E73',
  textDim:   '#AEAEB2',
  primary:   '#0071E3',
  primaryHi: '#0077ED',
  border:    '#D2D2D7',
  borderSoft:'#E8E8ED',
  surface:   '#F5F5F7',
  surfaceDk: '#2C2C2E',
} as const

// ── Animation Variants ────────────────────────────────────────────────────────
const appleReveal: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}
const appleFade: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.3 } },
}

function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return { ref, inView }
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Features', 'Showcase', 'Pricing', 'Developers', 'Blog']

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: `1px solid ${T.borderSoft}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} color={T.primary} />
            <span className="text-base font-semibold tracking-tight" style={{ color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Aether<span style={{ color: T.primary }}>AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {nav.map(n => (
              <a key={n} href="#" className="text-sm transition-opacity hover:opacity-100"
                style={{ color: T.textSoft, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {n}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-sm" style={{ color: T.textSoft, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Sign in
            </a>
            <motion.a href="#"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-sm px-4 py-2 rounded-full font-medium"
              style={{ background: T.primary, color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Try for free
            </motion.a>
          </div>
          <button onClick={() => setOpen(true)} className="md:hidden" style={{ color: T.text }}>
            <Menu size={20} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 inset-x-0 z-50 p-6 pt-14"
              style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.borderSoft}` }}>
              <button onClick={() => setOpen(false)} className="absolute top-4 right-6" style={{ color: T.text }}>
                <X size={20} />
              </button>
              <div className="flex flex-col gap-5 mt-4">
                {nav.map(n => (
                  <a key={n} href="#" className="text-xl font-medium" style={{ color: T.text }}>{n}</a>
                ))}
                <a href="#" className="text-center py-3 rounded-full text-sm font-medium mt-4"
                  style={{ background: T.primary, color: '#fff' }}>
                  Try for free
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
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, -60])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-24 overflow-hidden"
      style={{ background: T.bg }}>
      {/* Subtle gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,113,227,0.08) 0%, transparent 60%)' }} />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: T.surface, color: T.textSoft, border: `1px solid ${T.borderSoft}`, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.primary }} />
            Introducing Aether v3 — now with reasoning
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[1.02]"
          style={{ color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
          Intelligence,<br />
          <span style={{ color: T.primary }}>beautifully simple.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="text-xl md:text-2xl leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: T.textSoft, fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 300 }}>
          The AI platform that thinks with you. Build, deploy, and scale AI-powered features with zero friction.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center mb-16">
          <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-base"
            style={{ background: T.primary, color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Get started free <ChevronRight size={16} />
          </motion.a>
          <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full text-base"
            style={{ color: T.text, border: `1px solid ${T.border}`, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <Play size={14} fill={T.text} /> Watch 2-min demo
          </motion.a>
        </motion.div>

        {/* Product window */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}>
          <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)]"
            style={{ border: `1px solid ${T.borderSoft}` }}>
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: T.bgSoft, borderBottom: `1px solid ${T.borderSoft}` }}>
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4">
                <div className="rounded-md py-1 px-3 text-xs text-center max-w-xs mx-auto"
                  style={{ background: T.border, color: T.textSoft }}>
                  app.aetherai.com/studio
                </div>
              </div>
            </div>
            {/* App UI */}
            <div className="grid grid-cols-4 min-h-[320px]" style={{ background: T.bg }}>
              {/* Sidebar */}
              <div className="col-span-1 p-4" style={{ background: T.bgSoft, borderRight: `1px solid ${T.borderSoft}` }}>
                <p className="text-xs font-semibold mb-3" style={{ color: T.textDim }}>WORKSPACE</p>
                {['📊 Analytics', '🤖 AI Studio', '🔗 Integrations', '⚙️ Settings'].map(i => (
                  <div key={i} className={`text-xs py-2 px-2 rounded-lg mb-1 ${i.includes('AI') ? 'font-medium' : ''}`}
                    style={{ color: i.includes('AI') ? T.primary : T.textSoft, background: i.includes('AI') ? `${T.primary}10` : 'transparent' }}>
                    {i}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div className="col-span-3 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold" style={{ color: T.text }}>AI Studio</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${T.primary}15`, color: T.primary }}>
                    Live
                  </span>
                </div>
                <div className="rounded-xl p-4 mb-4 text-left" style={{ background: T.bgSoft }}>
                  <p className="text-xs font-medium mb-2" style={{ color: T.textSoft }}>Prompt</p>
                  <p className="text-sm" style={{ color: T.text }}>Summarize last week's sales pipeline and identify deals at risk.</p>
                </div>
                <div className="rounded-xl p-4 text-left" style={{ background: `${T.primary}08`, border: `1px solid ${T.primary}20` }}>
                  <p className="text-xs font-medium mb-2" style={{ color: T.primary }}>Response</p>
                  <p className="text-sm" style={{ color: T.text }}>
                    <span className="font-medium">14 deals</span> in pipeline totaling <span className="font-medium">$2.1M</span>.
                    <span style={{ color: '#EF4444' }}> 3 deals at risk</span> — stalled for 14+ days without contact. <span style={{ color: T.primary }}>Recommended action: schedule follow-up calls.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ── Feature Highlights ────────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useSection()
  const features = [
    { icon: Cpu, title: 'Reasoning Engine', desc: 'Chain-of-thought AI that breaks complex tasks into steps, explains its work, and asks when uncertain.', color: T.primary },
    { icon: Code2, title: 'API-first platform', desc: 'SDKs for Python, TypeScript, Go, and REST. Stream responses, function calling, and embeddings in one unified API.', color: '#AF52DE' },
    { icon: Shield, title: 'Enterprise privacy', desc: 'Your data never trains our models. SOC 2 Type II. GDPR. Bring-your-own-key encryption. Full audit logs.', color: '#30D158' },
    { icon: Zap, title: 'Edge inference', desc: 'Sub-100ms responses via 40 global edge nodes. Automatic failover. 99.99% uptime with no cold starts.', color: '#FF9F0A' },
    { icon: GitBranch, title: 'Version control', desc: 'Version, A/B test, and roll back AI prompts and models like you version code — with diffs and approvals.', color: '#FF3B30' },
    { icon: Globe, title: 'Global reach', desc: 'Support for 95 languages with automatic translation, cultural adaptation, and locale-aware responses.', color: T.primary },
  ]
  return (
    <section ref={ref} className="py-28" style={{ background: T.bgSoft }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="text-center mb-20">
          <motion.p variants={appleReveal} className="text-sm font-medium mb-4" style={{ color: T.primary, fontFamily: 'system-ui, sans-serif' }}>
            CAPABILITIES
          </motion.p>
          <motion.h2 variants={appleReveal}
            className="text-5xl font-bold tracking-tight mb-5"
            style={{ color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
            Built for builders.
          </motion.h2>
          <motion.p variants={appleReveal} className="text-xl font-light max-w-xl mx-auto"
            style={{ color: T.textSoft, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Everything you need to ship AI features that users love.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <motion.div key={f.title} variants={appleReveal}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="p-7 rounded-2xl"
              style={{ background: T.bg, border: `1px solid ${T.borderSoft}` }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${f.color}12` }}>
                <f.icon size={20} color={f.color} />
              </div>
              <h3 className="text-base font-semibold mb-2"
                style={{ color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed font-light"
                style={{ color: T.textSoft, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Gallery / Showcase ────────────────────────────────────────────────────────
function Showcase() {
  const { ref, inView } = useSection()
  const items = [
    { title: 'Customer Support', desc: 'Deflect 80% of tickets automatically', bg: '#F0F0FF' },
    { title: 'Sales Intelligence', desc: 'Identify pipeline risk before it stalls', bg: '#F0FFF7' },
    { title: 'Document AI', desc: 'Extract, classify, and summarize instantly', bg: '#FFF7F0' },
    { title: 'Code Generation', desc: 'Ship features 3× faster with AI pair programming', bg: '#F0F6FF' },
  ]
  return (
    <section ref={ref} className="py-28" style={{ background: T.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-16 text-center">
          <motion.p variants={appleReveal} className="text-sm font-medium mb-4" style={{ color: T.primary }}>
            USE CASES
          </motion.p>
          <motion.h2 variants={appleReveal} className="text-5xl font-bold tracking-tight"
            style={{ color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
            Works for every team.
          </motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-5">
          {items.map(item => (
            <motion.div key={item.title} variants={appleReveal}
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-3xl cursor-pointer"
              style={{ background: item.bg }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold"
                  style={{ color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {item.title}
                </h3>
                <ArrowRight size={18} color={T.primary} />
              </div>
              <p className="text-sm" style={{ color: T.textSoft, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function Stats() {
  const { ref, inView } = useSection()
  const stats = [
    { value: '10B+', label: 'API calls per month' },
    { value: '<50ms', label: 'median response time' },
    { value: '99.99%', label: 'uptime last 12 months' },
    { value: '50K+', label: 'developers building today' },
  ]
  return (
    <section ref={ref} style={{ background: T.bgDark }}>
      <div className="max-w-6xl mx-auto px-6 py-28">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16">
          <motion.h2 variants={appleReveal} className="text-5xl font-bold tracking-tight"
            style={{ color: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
            Numbers that matter.
          </motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map(s => (
            <motion.div key={s.label} variants={appleReveal} className="text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
                {s.value}
              </div>
              <p className="text-sm font-light" style={{ color: '#86868B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {s.label}
              </p>
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
      name: 'Developer',
      price: 'Free',
      period: '',
      desc: '100K tokens/month. Perfect for prototyping.',
      features: ['3 models included', '100K tokens/month', 'Community support', 'Public API access'],
      cta: 'Start free',
      primary: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/mo',
      desc: '10M tokens/month. For production apps.',
      features: ['All models', '10M tokens/month', 'Priority support', 'Analytics dashboard', 'Webhooks & streaming', 'SOC 2 compliance'],
      cta: 'Start free trial',
      primary: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'Unlimited scale. Custom contracts.',
      features: ['Custom token volume', 'Dedicated infra', 'SLA guarantees', 'Private model fine-tuning', 'BYOK encryption', 'Dedicated support'],
      cta: 'Contact sales',
      primary: false,
    },
  ]
  return (
    <section ref={ref} className="py-28" style={{ background: T.bgSoft }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="text-center mb-16">
          <motion.p variants={appleReveal} className="text-sm font-medium mb-4" style={{ color: T.primary }}>PRICING</motion.p>
          <motion.h2 variants={appleReveal} className="text-5xl font-bold tracking-tight mb-4"
            style={{ color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
            Simple, honest pricing.
          </motion.h2>
          <motion.p variants={appleReveal} className="text-lg font-light" style={{ color: T.textSoft }}>
            Start free. Upgrade when you're ready.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5">
          {plans.map(p => (
            <motion.div key={p.name} variants={appleReveal}
              className="p-8 rounded-3xl flex flex-col"
              style={{
                background: p.primary ? T.bgDark : T.bg,
                border: `1px solid ${p.primary ? 'transparent' : T.borderSoft}`,
              }}>
              <div className="mb-7">
                <p className="text-sm font-semibold mb-2" style={{ color: p.primary ? '#86868B' : T.textSoft }}>
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight"
                    style={{ color: p.primary ? '#FFFFFF' : T.text, fontFamily: 'system-ui, sans-serif' }}>
                    {p.price}
                  </span>
                  <span className="text-sm" style={{ color: p.primary ? '#86868B' : T.textSoft }}>{p.period}</span>
                </div>
                <p className="text-sm mt-2 font-light" style={{ color: p.primary ? '#86868B' : T.textSoft }}>
                  {p.desc}
                </p>
              </div>
              <ul className="flex flex-col gap-3 flex-1 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm font-light"
                    style={{ color: p.primary ? '#E5E5E7' : T.textSoft }}>
                    <Check size={14} color={p.primary ? '#30D158' : T.primary} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="block text-center py-3 rounded-full text-sm font-medium"
                style={{
                  background: p.primary ? T.primary : 'transparent',
                  color: p.primary ? '#fff' : T.primary,
                  border: p.primary ? 'none' : `1px solid ${T.primary}`,
                  fontFamily: 'system-ui, sans-serif',
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
    <section ref={ref} className="py-28" style={{ background: T.bg }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.h2 variants={appleReveal}
            className="text-6xl font-bold tracking-tight mb-6"
            style={{ color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.03em' }}>
            Start building.<br />Today.
          </motion.h2>
          <motion.p variants={appleReveal} className="text-xl font-light mb-10"
            style={{ color: T.textSoft, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Free to start. No credit card required.
          </motion.p>
          <motion.div variants={appleReveal} className="flex flex-wrap gap-4 justify-center">
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-full text-base font-medium"
              style={{ background: T.primary, color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
              Get started free
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base"
              style={{ color: T.primary, fontFamily: 'system-ui, sans-serif' }}>
              Read the docs <ArrowRight size={16} />
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
    Product: ['Studio', 'API', 'Models', 'Embeddings', 'Fine-tuning', 'Edge'],
    Solutions: ['Customer Support', 'Sales AI', 'Code AI', 'Document AI'],
    Developers: ['Documentation', 'Quickstart', 'SDKs', 'Status', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Privacy', 'Terms'],
  }
  return (
    <footer className="pt-14 pb-8" style={{ background: T.bgSoft, borderTop: `1px solid ${T.borderSoft}` }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} color={T.primary} />
              <span className="text-sm font-semibold" style={{ color: T.text }}>AetherAI</span>
            </div>
            <p className="text-xs font-light" style={{ color: T.textSoft }}>
              The AI platform for builders who care about craft.
            </p>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: T.textDim }}>{col}</p>
              <ul className="flex flex-col gap-2">
                {links.map(l => (
                  <li key={l}><a href="#" className="text-xs hover:opacity-80" style={{ color: T.textSoft }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: `1px solid ${T.borderSoft}` }}>
          <p className="text-xs" style={{ color: T.textDim }}>Copyright © 2026 AetherAI, Inc.</p>
          <p className="text-xs" style={{ color: T.textDim }}>Privacy Policy · Terms of Use · Cookie Settings</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template02() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <Features />
      <Showcase />
      <Stats />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
