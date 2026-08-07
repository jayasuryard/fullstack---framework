// Template 05: Minimal Swiss
// Category: Healthcare / Manufacturing / B2B Professional Services
// Design: Swiss grid principles. Maximum whitespace, bold typography as the primary visual,
//         one high-contrast red accent. Clinical, precise, authoritative.
// Colors: #FFFFFF bg, #0F0F0F text, #EF4444 accent
// Font: Outfit — geometric, modern Helvetica replacement
// Motion: Horizontal grid reveals, bold text reveals from clip, clinical precision

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Shield, Globe, Clock,
  ArrowUpRight, Minus, Plus, ChevronDown, Star
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:       '#FFFFFF',
  bgSoft:   '#F7F7F7',
  bgDark:   '#0F0F0F',
  text:     '#0F0F0F',
  textSoft: '#6B6B6B',
  textDim:  '#ABABAB',
  accent:   '#EF4444',
  accentDim:'#FEF2F2',
  border:   '#E5E5E5',
  borderDk: '#1A1A1A',
  sans:     '"Outfit", "Helvetica Neue", Helvetica, sans-serif',
} as const

// ── Variants ──────────────────────────────────────────────────────────────────
const clipReveal: Variants = {
  hidden:  { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
  visible: { clipPath: 'inset(0 0% 0 0)', opacity: 1, transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const slideRight: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const rise: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Product', 'Customers', 'Pricing', 'Resources']

  return (
    <>
      <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed top-0 inset-x-0 z-50 bg-white"
        style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full" style={{ background: T.accent }} />
            <span className="text-base font-bold tracking-tight" style={{ color: T.text, fontFamily: T.sans }}>
              FORMA
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {nav.map(n => (
              <a key={n} href="#" className="text-sm hover:opacity-60 transition-opacity"
                style={{ color: T.text, fontFamily: T.sans }}>{n}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>Sign in</a>
            <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-sm font-medium px-5 py-2.5 rounded-none"
              style={{ background: T.text, color: T.bg, fontFamily: T.sans }}>
              Get a demo
            </motion.a>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: T.text }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-16 inset-x-0 z-40 bg-white p-6"
            style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex flex-col gap-5">
              {nav.map(n => <a key={n} href="#" className="text-base" style={{ color: T.text, fontFamily: T.sans }}>{n}</a>)}
              <a href="#" className="py-3 text-center font-medium text-sm" style={{ background: T.text, color: T.bg }}>Get a demo</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-16 min-h-screen flex items-center" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="grid grid-cols-12 gap-6 items-end py-24">
          {/* Large col number marker */}
          <div className="col-span-1 pb-2">
            <span className="text-xs" style={{ color: T.textDim, fontFamily: T.sans, writingMode: 'vertical-lr' }}>
              01 / HERO
            </span>
          </div>
          {/* Main Headline */}
          <div className="col-span-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <div className="overflow-hidden mb-4">
                <motion.p initial={{ y: '100%' }} animate={{ y: 0 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-sm font-medium uppercase tracking-[0.2em]"
                  style={{ color: T.accent, fontFamily: T.sans }}>
                  Quality Operations Software
                </motion.p>
              </div>
              <div className="overflow-hidden mb-2">
                <motion.h1 initial={{ y: '100%' }} animate={{ y: 0 }}
                  transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
                  className="text-7xl md:text-[96px] font-black leading-none tracking-tight"
                  style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.04em' }}>
                  Precision
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-2">
                <motion.h1 initial={{ y: '100%' }} animate={{ y: 0 }}
                  transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.18 }}
                  className="text-7xl md:text-[96px] font-black leading-none tracking-tight"
                  style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.04em' }}>
                  operations.
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1 initial={{ y: '100%' }} animate={{ y: 0 }}
                  transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.26 }}
                  className="text-7xl md:text-[96px] font-black leading-none tracking-tight"
                  style={{ color: T.accent, fontFamily: T.sans, letterSpacing: '-0.04em' }}>
                  Zero defects.
                </motion.h1>
              </div>
            </motion.div>
          </div>
          {/* Right column: descriptor + CTA */}
          <div className="col-span-3 col-start-10 pb-4 flex flex-col gap-6">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm leading-relaxed" style={{ color: T.textSoft, fontFamily: T.sans }}>
              The quality management system built for manufacturers, healthcare providers, and regulated industries that cannot afford errors.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col gap-3">
              <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between px-5 py-3 text-sm font-medium"
                style={{ background: T.text, color: T.bg, fontFamily: T.sans }}>
                Schedule a demo <ArrowRight size={14} />
              </motion.a>
              <motion.a href="#" whileHover={{ opacity: 0.7 }}
                className="flex items-center gap-2 text-sm"
                style={{ color: T.textSoft, fontFamily: T.sans }}>
                Download case study <ArrowUpRight size={14} />
              </motion.a>
            </motion.div>
          </div>
        </div>

        {/* Swiss horizontal rule */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.8 }}
          className="h-px w-full" style={{ background: T.border, transformOrigin: 'left' }} />

        {/* Bottom meta row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-wrap justify-between items-center py-5 gap-4">
          {[
            { label: 'ISO 9001 certified', value: '✓' },
            { label: '2,400+ clients globally', value: '2.4K' },
            { label: 'Healthcare, MFG, Pharma, Gov.', value: '' },
            { label: 'On-premise or cloud', value: '' },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-2">
              {m.value && <span className="text-xs font-bold" style={{ color: T.accent }}>{m.value}</span>}
              <span className="text-xs" style={{ color: T.textSoft, fontFamily: T.sans }}>{m.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Problem / Solution ────────────────────────────────────────────────────────
function ProblemSolution() {
  const { ref, inView } = useSection()
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgDark }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-1">
            <span className="text-xs" style={{ color: '#444', fontFamily: T.sans, writingMode: 'vertical-lr' }}>
              02 / PROBLEM
            </span>
          </div>
          <div className="col-span-11 grid md:grid-cols-2 gap-16">
            <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
              <motion.p variants={rise} className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#666' }}>
                THE PROBLEM
              </motion.p>
              <motion.h2 variants={rise} className="text-4xl font-black leading-tight mb-6"
                style={{ color: '#FFFFFF', fontFamily: T.sans, letterSpacing: '-0.02em' }}>
                Quality failures cost the global economy $1.2 trillion per year.
              </motion.h2>
              <ul className="flex flex-col gap-4">
                {[
                  'Manual audit trails spread across 14 spreadsheets',
                  'Nonconformances discovered too late — after the recall',
                  'Compliance reports that take 3 weeks to assemble',
                  'No single source of truth across facilities',
                ].map(p => (
                  <motion.li key={p} variants={rise} className="flex items-start gap-3 text-sm"
                    style={{ color: '#999', fontFamily: T.sans }}>
                    <X size={14} color={T.accent} className="mt-0.5 flex-shrink-0" />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
              <motion.p variants={rise} className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: T.accent }}>
                THE SOLUTION
              </motion.p>
              <motion.h2 variants={rise} className="text-4xl font-black leading-tight mb-6"
                style={{ color: '#FFFFFF', fontFamily: T.sans, letterSpacing: '-0.02em' }}>
                Forma: quality at the speed of your operations.
              </motion.h2>
              <ul className="flex flex-col gap-4">
                {[
                  'Automated audit trails — every change captured, timestamped, signed',
                  'Real-time deviation detection with instant CAPA triggers',
                  'One-click compliance reports for FDA, ISO, IATF, SOX',
                  'Single system of record across all plants and regions',
                ].map(p => (
                  <motion.li key={p} variants={rise} className="flex items-start gap-3 text-sm"
                    style={{ color: '#999', fontFamily: T.sans }}>
                    <Check size={14} color={T.accent} className="mt-0.5 flex-shrink-0" />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Features — Swiss Grid ─────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useSection()
  const features = [
    { num: '01', title: 'Document Control', desc: 'Version-controlled SOPs, work instructions, and forms. Electronic signatures. Automatic distribution and acknowledgment tracking.' },
    { num: '02', title: 'Audit Management', desc: 'Plan, schedule, and execute internal and external audits. Real-time findings capture. Automated finding-to-CAPA escalation.' },
    { num: '03', title: 'CAPA Workflow', desc: 'Root cause analysis tools (5 Why, Fishbone, FMEA). Structured corrective action plans with deadline tracking and effectiveness checks.' },
    { num: '04', title: 'Supplier Quality', desc: 'Supplier scorecards, incoming inspection, deviation management, and supplier corrective action requests — all in one module.' },
    { num: '05', title: 'Regulatory Compliance', desc: 'Pre-built report templates for FDA 21 CFR Part 11, ISO 9001, IATF 16949, ISO 13485, and GMP. Audit-ready at any time.' },
    { num: '06', title: 'Analytics & KPIs', desc: 'Quality KPI dashboards, trend analysis, SPC charts, and Pareto analysis. Identify systemic issues before they become recalls.' },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-1">
            <span className="text-xs" style={{ color: T.textDim, fontFamily: T.sans, writingMode: 'vertical-lr' }}>
              03 / PLATFORM
            </span>
          </div>
          <div className="col-span-11">
            <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
              <motion.p variants={rise} className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: T.accent, fontFamily: T.sans }}>
                MODULES
              </motion.p>
              <motion.h2 variants={rise} className="text-5xl font-black leading-tight"
                style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
                Every quality process,<br />connected.
              </motion.h2>
            </motion.div>
          </div>
        </div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E5E5]">
          {features.map(f => (
            <motion.div key={f.num} variants={rise}
              whileHover={{ background: T.bgSoft }}
              className="p-8 bg-white transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-6">
                <span className="text-xs font-bold" style={{ color: T.accent, fontFamily: T.sans }}>{f.num}</span>
                <motion.div
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                  className="group-hover:opacity-100 opacity-0 transition-opacity">
                  <ArrowUpRight size={16} color={T.text} />
                </motion.div>
              </div>
              <h3 className="text-base font-bold mb-3" style={{ color: T.text, fontFamily: T.sans }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: T.textSoft, fontFamily: T.sans }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Trust Strip ───────────────────────────────────────────────────────────────
function Trust() {
  const { ref, inView } = useSection()
  const certifications = ['ISO 9001', 'ISO 27001', 'SOC 2 Type II', 'GDPR', 'FDA 21 CFR Part 11', 'HIPAA']
  return (
    <section ref={ref} className="py-16" style={{ background: T.bgSoft, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-10 items-center">
          {certifications.map(c => (
            <motion.div key={c} variants={rise}
              className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: T.accent }}>
                <Check size={10} color="#fff" strokeWidth={3} />
              </div>
              <span className="text-sm font-bold" style={{ color: T.textSoft, fontFamily: T.sans }}>{c}</span>
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
    { quote: "We passed our FDA audit without a single major observation. Three years ago, that same audit had 14 findings. Forma changed how we operate.", name: 'Dr. Christine Bauer', role: 'VP Quality · MedAxis Devices', stars: 5 },
    { quote: "Our CAPA cycle time dropped from 45 days to 12. Quality issues that used to drag on for months now close in under two weeks.", name: 'Takeshi Mori', role: 'Quality Director · Precision MFG', stars: 5 },
    { quote: "Implementation across 6 plants in 3 countries. The consistency we have now is something we spent 10 years trying to achieve manually.", name: 'Anna Lindqvist', role: 'Global Quality Manager · Nordic Pharma', stars: 5 },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-1">
            <span className="text-xs" style={{ color: T.textDim, fontFamily: T.sans, writingMode: 'vertical-lr' }}>
              04 / CUSTOMERS
            </span>
          </div>
          <div className="col-span-11">
            <motion.h2 variants={rise} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              className="text-5xl font-black" style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
              Results that matter<br />in regulated industries.
            </motion.h2>
          </div>
        </div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-px bg-[#E5E5E5]">
          {testimonials.map(t => (
            <motion.div key={t.name} variants={rise} className="p-8 bg-white">
              <div className="flex gap-0.5 mb-6">
                {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={12} fill="#0F0F0F" color="#0F0F0F" />)}
              </div>
              <p className="text-base leading-relaxed mb-8" style={{ color: T.text, fontFamily: T.sans }}>"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.bgSoft }}>
                  <span className="text-xs font-bold" style={{ color: T.text }}>{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: T.text, fontFamily: T.sans }}>{t.name}</p>
                  <p className="text-xs" style={{ color: T.textSoft, fontFamily: T.sans }}>{t.role}</p>
                </div>
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
    { name: 'Professional', price: '$299', period: '/mo', features: ['Up to 3 facilities', '5 quality modules', 'Email support', 'Standard reports', 'Training library'] },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited facilities', 'All modules', 'Dedicated CSM', 'Custom validation', 'On-premise option', 'SLA guarantee'], highlight: true },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgSoft }}>
      <div className="max-w-5xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.p variants={rise} className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: T.accent, fontFamily: T.sans }}>
              PRICING
            </motion.p>
            <motion.h2 variants={rise} className="text-5xl font-black" style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
              Investment in<br />zero defects.
            </motion.h2>
          </div>
          <motion.p variants={rise} className="text-base" style={{ color: T.textSoft, fontFamily: T.sans }}>
            All plans include implementation support, validation documentation, and training. Contact us for site license pricing.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-px bg-[#E5E5E5]">
          {plans.map(p => (
            <motion.div key={p.name} variants={rise}
              className="p-8"
              style={{ background: p.highlight ? T.bgDark : T.bg }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: p.highlight ? '#666' : T.textSoft, fontFamily: T.sans }}>
                {p.name}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black"
                  style={{ color: p.highlight ? '#fff' : T.text, fontFamily: T.sans }}>
                  {p.price}
                </span>
                <span className="text-sm" style={{ color: p.highlight ? '#666' : T.textSoft }}>{p.period}</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm"
                    style={{ color: p.highlight ? '#999' : T.textSoft, fontFamily: T.sans }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: T.accent }}>
                      <Check size={10} color="#fff" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a href="#" whileHover={{ opacity: 0.85 }}
                className="block text-center py-3 text-sm font-bold"
                style={{
                  background: p.highlight ? T.accent : T.text,
                  color: '#fff',
                  fontFamily: T.sans,
                }}>
                {p.highlight ? 'Contact enterprise sales' : 'Request a demo'}
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
    <section ref={ref} className="py-32" style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.p variants={rise} className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: T.accent, fontFamily: T.sans }}>
              GET STARTED
            </motion.p>
            <motion.h2 variants={rise} className="text-6xl font-black leading-none"
              style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.04em' }}>
              Quality<br />starts<br />
              <span style={{ color: T.accent }}>here.</span>
            </motion.h2>
          </div>
          <motion.div variants={rise} className="flex flex-col gap-4">
            <p className="text-base mb-2" style={{ color: T.textSoft, fontFamily: T.sans }}>
              Join 2,400 organizations who've made quality a competitive advantage, not a compliance burden.
            </p>
            <motion.a href="#" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="flex items-center justify-between px-6 py-4 text-sm font-bold"
              style={{ background: T.text, color: T.bg, fontFamily: T.sans }}>
              Schedule a 30-minute demo <ArrowRight size={16} />
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="flex items-center justify-between px-6 py-4 text-sm font-medium"
              style={{ border: `1px solid ${T.border}`, color: T.text, fontFamily: T.sans }}>
              Download compliance guide <ArrowUpRight size={16} />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-10" style={{ background: T.bgDark }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {[
            { col: 'PRODUCT', links: ['Document Control', 'Audit Management', 'CAPA', 'Supplier Quality', 'Analytics'] },
            { col: 'INDUSTRIES', links: ['Medical Devices', 'Pharmaceutical', 'Automotive', 'Aerospace', 'Food & Bev'] },
            { col: 'COMPANY', links: ['About', 'Careers', 'Blog', 'Contact'] },
            { col: 'LEGAL', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
          ].map(({ col, links }) => (
            <div key={col}>
              <p className="text-[10px] font-bold tracking-widest mb-4" style={{ color: '#444', fontFamily: T.sans }}>{col}</p>
              <ul className="flex flex-col gap-2">
                {links.map(l => <li key={l}><a href="#" className="text-xs hover:text-white transition-colors" style={{ color: '#666', fontFamily: T.sans }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-8 border-t" style={{ borderColor: '#1A1A1A' }}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: T.accent }} />
            <span className="font-bold text-sm text-white" style={{ fontFamily: T.sans }}>FORMA</span>
          </div>
          <p className="text-xs" style={{ color: '#444', fontFamily: T.sans }}>© 2026 Forma Systems GmbH. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template05() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <ProblemSolution />
      <Features />
      <Trust />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
