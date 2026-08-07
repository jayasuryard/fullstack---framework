// Template 10: Luxury Corporate
// Category: Enterprise / Government / Financial Services / Professional Services
// Design: Stately near-black with 22K gold accents. Authoritative, exclusive, formal.
//         Built for Fortune 500 presentations and public sector procurement.
// Colors: #0A0A0A bg, #C9A84C gold, #F5F5F0 cream
// Font: Cormorant Garamond (headings, authority) + Montserrat (body, modern)
// Motion: Stately controlled reveals, cinematic transitions, gold border animations

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Shield, Globe, Award,
  ChevronRight, Star, Building2, Lock, Users,
  BarChart2, TrendingUp, FileText, Handshake, Eye
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:        '#0A0A0A',
  bgAlt:     '#0D0D0D',
  bgDark:    '#050505',
  bgWarm:    '#F5F5F0',
  surface:   '#141414',
  surfaceHi: '#1C1C1C',
  gold:      '#C9A84C',
  goldLight: '#E8C56A',
  goldDim:   'rgba(201,168,76,0.1)',
  goldBorder:'rgba(201,168,76,0.25)',
  cream:     '#F5F5F0',
  creamDim:  '#E8E4DC',
  border:    'rgba(255,255,255,0.06)',
  borderGold:'rgba(201,168,76,0.2)',
  text:      '#F5F5F0',
  textSoft:  'rgba(245,245,240,0.6)',
  textDim:   'rgba(245,245,240,0.3)',
  serif:     '"Cormorant Garamond", "Georgia", serif',
  sans:      '"Montserrat", "Helvetica Neue", Helvetica, sans-serif',
} as const

// ── Variants ──────────────────────────────────────────────────────────────────
const luxReveal: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } },
}
const goldLine: Variants = {
  hidden:  { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } },
}

function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

function GoldDivider() {
  return (
    <motion.div variants={goldLine}
      className="h-px w-16 my-6"
      style={{ background: T.gold, transformOrigin: 'left' }} />
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['About', 'Services', 'Clients', 'Insights', 'Contact']

  return (
    <>
      <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${T.borderGold}`,
        }}>
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none flex items-center justify-center"
              style={{ background: T.goldDim, border: `1px solid ${T.goldBorder}` }}>
              <Award size={16} color={T.gold} />
            </div>
            <div>
              <span className="text-sm font-bold tracking-[0.15em] uppercase"
                style={{ color: T.cream, fontFamily: T.sans, letterSpacing: '0.15em' }}>
                Stratford
              </span>
              <span className="block text-[9px] tracking-[0.2em] uppercase"
                style={{ color: T.gold, fontFamily: T.sans }}>
                & Associates
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {nav.map(n => (
              <a key={n} href="#"
                className="text-xs tracking-[0.12em] uppercase hover:opacity-80 transition-opacity"
                style={{ color: T.textSoft, fontFamily: T.sans, letterSpacing: '0.12em' }}>
                {n}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <motion.a href="#"
              whileHover={{ borderColor: T.gold, color: T.gold }}
              transition={{ duration: 0.2 }}
              className="text-xs tracking-[0.12em] uppercase px-5 py-2.5"
              style={{
                color: T.textSoft,
                border: `1px solid ${T.border}`,
                fontFamily: T.sans,
                transition: 'border-color 0.2s, color 0.2s',
              }}>
              Request consultation
            </motion.a>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: T.textSoft }}>
            {open ? <X size={18} /> : <Menu size={18} />}
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
              transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 p-8"
              style={{ background: T.bgDark, borderLeft: `1px solid ${T.borderGold}` }}>
              <button onClick={() => setOpen(false)} className="mb-10" style={{ color: T.textSoft }}>
                <X size={18} />
              </button>
              <div className="flex flex-col gap-6">
                {nav.map(n => (
                  <a key={n} href="#"
                    className="text-xs tracking-[0.15em] uppercase"
                    style={{ color: T.textSoft, fontFamily: T.sans }}>
                    {n}
                  </a>
                ))}
              </div>
              <div className="mt-10 pt-10" style={{ borderTop: `1px solid ${T.border}` }}>
                <a href="#" className="text-xs tracking-[0.15em] uppercase"
                  style={{ color: T.gold, fontFamily: T.sans }}>
                  Request consultation →
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
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{ background: T.bg }}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(201,168,76,0.5) 0px, rgba(201,168,76,0.5) 1px, transparent 1px, transparent 60px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Large decorative gold line */}
      <motion.div
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ originY: 0 }}
        className="absolute top-20 bottom-20 left-16 w-px hidden lg:block">
        <div className="h-full w-px"
          style={{ background: `linear-gradient(180deg, transparent, ${T.gold}, transparent)` }} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-8 lg:px-24 w-full py-20">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-4xl">
          <motion.div variants={luxReveal}>
            <span className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: T.gold, fontFamily: T.sans }}>
              Est. 1987 · Global Advisory
            </span>
            <motion.div variants={goldLine}
              className="h-px w-12 mt-4 mb-8"
              style={{ background: T.gold, transformOrigin: 'left' }} />
          </motion.div>

          <div className="overflow-hidden mb-3">
            <motion.h1
              initial={{ y: '102%' }} animate={{ y: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="text-6xl md:text-8xl lg:text-[96px] font-light leading-[1.02]"
              style={{ color: T.cream, fontFamily: T.serif, letterSpacing: '-0.01em' }}>
              Strategic
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-3">
            <motion.h1
              initial={{ y: '102%' }} animate={{ y: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}
              className="text-6xl md:text-8xl lg:text-[96px] font-light leading-[1.02] italic"
              style={{ color: T.gold, fontFamily: T.serif, letterSpacing: '-0.01em' }}>
              clarity.
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-10">
            <motion.h1
              initial={{ y: '102%' }} animate={{ y: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.54 }}
              className="text-6xl md:text-8xl lg:text-[96px] font-light leading-[1.02]"
              style={{ color: T.cream, fontFamily: T.serif, letterSpacing: '-0.01em' }}>
              Decisive results.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="text-base leading-relaxed max-w-xl mb-10"
            style={{ color: T.textSoft, fontFamily: T.sans, fontWeight: 300, letterSpacing: '0.02em' }}>
            Stratford & Associates advises boards, governments, and leadership teams on transformational strategy, governance, and organizational design. Trusted by 340+ institutions across 60 countries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-wrap gap-4">
            <motion.a href="#"
              whileHover={{ borderColor: T.gold, color: T.gold }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-7 py-4 text-xs tracking-[0.15em] uppercase"
              style={{ color: T.cream, border: `1px solid ${T.textDim}`, fontFamily: T.sans, transition: 'border-color 0.2s, color 0.2s' }}>
              Request a consultation <ArrowRight size={14} />
            </motion.a>
            <motion.a href="#"
              whileHover={{ color: T.goldLight }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-7 py-4 text-xs tracking-[0.15em] uppercase"
              style={{ color: T.gold, fontFamily: T.sans }}>
              View our approach <ChevronRight size={14} />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex flex-wrap gap-10 mt-20 pt-10"
          style={{ borderTop: `1px solid ${T.border}` }}>
          {[
            { value: '340+', label: 'Institutional clients' },
            { value: '60', label: 'Countries served' },
            { value: '$2.4T', label: 'Assets advised' },
            { value: '38yrs', label: 'Advisory excellence' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-light" style={{ color: T.gold, fontFamily: T.serif }}>{s.value}</div>
              <div className="text-[10px] tracking-[0.15em] uppercase mt-1"
                style={{ color: T.textDim, fontFamily: T.sans }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Trust Signals ─────────────────────────────────────────────────────────────
function TrustSignals() {
  const { ref, inView } = useSection()
  const logos = ['G8 Member Nations', 'UN Advisory Panel', 'World Bank Partner', 'IMF Consultation', 'G20 Advisory Board', 'OECD Contributor']
  return (
    <section ref={ref} className="py-14" style={{ background: T.bgDark, borderTop: `1px solid ${T.borderGold}` }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.p variants={luxReveal} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-center text-[10px] tracking-[0.3em] uppercase mb-8"
          style={{ color: T.textDim, fontFamily: T.sans }}>
          Selected affiliations and mandates
        </motion.p>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-x-12 gap-y-4">
          {logos.map(l => (
            <motion.span key={l} variants={luxReveal}
              className="text-[10px] tracking-[0.25em] uppercase"
              style={{ color: T.textDim, fontFamily: T.sans }}>
              {l}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Services ──────────────────────────────────────────────────────────────────
function Services() {
  const { ref, inView } = useSection()
  const services = [
    { num: 'I', icon: BarChart2, title: 'Corporate Strategy', desc: 'Board-level strategic planning, portfolio transformation, M&A advisory, and market entry strategy for complex multi-jurisdictional environments.' },
    { num: 'II', icon: Building2, title: 'Governance & Risk', desc: 'Board governance frameworks, regulatory risk mapping, audit committee advisory, and ESG integration for institutional compliance.' },
    { num: 'III', icon: Users, title: 'Organizational Design', desc: 'Operating model transformation, leadership succession planning, talent architecture, and change management at enterprise scale.' },
    { num: 'IV', icon: Globe, title: 'Public Sector Advisory', desc: 'Government policy design, public-private partnership structuring, sovereign wealth fund advisory, and multilateral institution engagement.' },
    { num: 'V', icon: TrendingUp, title: 'Financial Restructuring', desc: 'Debt restructuring, capital optimization, distressed asset advisory, and creditor negotiation for complex financial situations.' },
    { num: 'VI', icon: Lock, title: 'Sovereign & Security', desc: 'National security strategy, critical infrastructure protection, cyber resilience policy, and intelligence community engagement.' },
  ]
  return (
    <section ref={ref} className="py-28" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="mb-20">
          <motion.span variants={luxReveal} className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: T.gold, fontFamily: T.sans }}>
            Practice Areas
          </motion.span>
          <GoldDivider />
          <motion.h2 variants={luxReveal}
            className="text-5xl md:text-6xl font-light leading-tight"
            style={{ color: T.cream, fontFamily: T.serif, letterSpacing: '-0.01em' }}>
            Depth of expertise.<br />
            <em style={{ color: T.gold }}>Breadth of impact.</em>
          </motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ background: T.border }}>
          {services.map(s => (
            <motion.div key={s.num} variants={luxReveal}
              whileHover={{ background: T.surface }}
              className="p-9 cursor-pointer group transition-colors"
              style={{ background: T.bg }}>
              <div className="flex items-start justify-between mb-7">
                <span className="text-xs tracking-[0.2em]"
                  style={{ color: T.gold, fontFamily: T.sans }}>
                  {s.num}
                </span>
                <s.icon size={16} color={T.textDim} className="group-hover:text-gold transition-colors" />
              </div>
              <h3 className="text-xl font-light mb-4"
                style={{ color: T.cream, fontFamily: T.serif }}>
                {s.title}
              </h3>
              <p className="text-xs leading-relaxed font-light"
                style={{ color: T.textSoft, fontFamily: T.sans, letterSpacing: '0.02em' }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Thought Leadership ────────────────────────────────────────────────────────
function Insights() {
  const { ref, inView } = useSection()
  const insights = [
    { category: 'White Paper', title: 'The Governance Imperative: Board Structures for a Volatile Decade', date: 'January 2026', read: '24 min' },
    { category: 'Research', title: 'Sovereign Wealth in Transition: Allocation Strategies for the Energy Shift', date: 'December 2025', read: '18 min' },
    { category: 'Advisory Note', title: 'AI Governance Frameworks for Regulated Industries: A Board Primer', date: 'November 2025', read: '12 min' },
  ]
  return (
    <section ref={ref} className="py-28" style={{ background: T.bgDark }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="flex justify-between items-start mb-16">
          <div>
            <motion.span variants={luxReveal} className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: T.gold, fontFamily: T.sans }}>
              Thought Leadership
            </motion.span>
            <GoldDivider />
            <motion.h2 variants={luxReveal} className="text-4xl font-light"
              style={{ color: T.cream, fontFamily: T.serif }}>
              Perspectives from the practice
            </motion.h2>
          </div>
          <motion.a href="#" variants={luxReveal}
            className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase"
            style={{ color: T.gold, fontFamily: T.sans }}>
            All insights <ArrowRight size={12} />
          </motion.a>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col gap-px" style={{ background: T.borderGold }}>
          {insights.map((insight, i) => (
            <motion.div key={insight.title} variants={luxReveal}
              whileHover={{ paddingLeft: '2.25rem' }}
              transition={{ duration: 0.25 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-7 cursor-pointer group"
              style={{ background: T.bgDark, transition: 'padding-left 0.25s' }}>
              <div className="flex items-center gap-8">
                <span className="text-[10px] tracking-[0.2em] uppercase w-24 flex-shrink-0"
                  style={{ color: T.gold, fontFamily: T.sans }}>
                  {insight.category}
                </span>
                <h3 className="text-base font-light"
                  style={{ color: T.cream, fontFamily: T.serif }}>
                  {insight.title}
                </h3>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <span className="text-[10px]" style={{ color: T.textDim, fontFamily: T.sans }}>{insight.date}</span>
                <span className="text-[10px]" style={{ color: T.textDim, fontFamily: T.sans }}>{insight.read}</span>
                <ArrowRight size={12} color={T.gold} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
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
  const qs = [
    { quote: "Stratford's analysis identified three systemic risks our internal teams had entirely missed. Their counsel directly shaped our board's decision on the merger.", name: 'Sir Michael Worthington', role: 'Chairman, Apex Financial Group' },
    { quote: "The depth of policy expertise Stratford brought to our digital transformation initiative was unmatched. They understood the regulatory landscape in ways no one else did.", name: 'H.E. Ambassador Chen Wei', role: 'Former Minister of Finance, Asia-Pacific' },
    { quote: "Working with Stratford is unlike any other advisory relationship. They challenge assumptions rigorously and have the intellectual courage to deliver difficult truths.", name: 'Dame Patricia Holloway', role: 'CEO, Meridian Capital Management' },
  ]
  return (
    <section ref={ref} className="py-28" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="mb-16">
          <motion.span variants={luxReveal} className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: T.gold, fontFamily: T.sans }}>
            Client Perspectives
          </motion.span>
          <GoldDivider />
          <motion.h2 variants={luxReveal} className="text-4xl font-light"
            style={{ color: T.cream, fontFamily: T.serif }}>
            What our clients say
          </motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-7">
          {qs.map(t => (
            <motion.div key={t.name} variants={luxReveal}
              className="p-8 relative"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="text-4xl font-light mb-5" style={{ color: T.gold, fontFamily: T.serif, lineHeight: 1 }}>"</div>
              <p className="text-sm leading-relaxed mb-8 italic font-light"
                style={{ color: T.textSoft, fontFamily: T.serif }}>
                {t.quote}
              </p>
              <div style={{ borderTop: `1px solid ${T.borderGold}` }} className="pt-5">
                <p className="text-sm font-light" style={{ color: T.cream, fontFamily: T.serif }}>{t.name}</p>
                <p className="text-[10px] tracking-[0.1em] mt-1"
                  style={{ color: T.gold, fontFamily: T.sans }}>
                  {t.role}
                </p>
              </div>
              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 w-6 h-6"
                style={{ borderTop: `1px solid ${T.gold}`, borderRight: `1px solid ${T.gold}` }} />
              <div className="absolute bottom-0 left-0 w-6 h-6"
                style={{ borderBottom: `1px solid ${T.gold}`, borderLeft: `1px solid ${T.gold}` }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Contact / CTA ─────────────────────────────────────────────────────────────
function Contact() {
  const { ref, inView } = useSection()
  return (
    <section ref={ref} className="py-28" style={{ background: T.bgDark }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <motion.span variants={luxReveal} className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: T.gold, fontFamily: T.sans }}>
              Begin a Conversation
            </motion.span>
            <GoldDivider />
            <motion.h2 variants={luxReveal} className="text-5xl md:text-6xl font-light leading-tight mb-6"
              style={{ color: T.cream, fontFamily: T.serif, letterSpacing: '-0.01em' }}>
              Clarity begins<br />
              <em style={{ color: T.gold }}>here.</em>
            </motion.h2>
            <motion.p variants={luxReveal} className="text-sm leading-relaxed mb-8 font-light"
              style={{ color: T.textSoft, fontFamily: T.sans, letterSpacing: '0.02em' }}>
              Our engagements begin with a confidential consultation. All inquiries are handled by a senior partner and responded to within 24 hours.
            </motion.p>
            <motion.div variants={stagger}>
              {[
                { icon: Globe, label: 'Global offices', value: 'London · New York · Singapore · Dubai · Tokyo' },
                { icon: FileText, label: 'Engagements', value: 'Retainer, project, and board-seat advisory' },
                { icon: Shield, label: 'Confidentiality', value: 'NDA-first. All inquiries are strictly confidential.' },
              ].map(item => (
                <motion.div key={item.label} variants={luxReveal}
                  className="flex items-start gap-4 mb-6">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ border: `1px solid ${T.borderGold}` }}>
                    <item.icon size={14} color={T.gold} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase mb-1"
                      style={{ color: T.gold, fontFamily: T.sans }}>{item.label}</p>
                    <p className="text-xs font-light" style={{ color: T.textSoft, fontFamily: T.sans }}>{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Contact form */}
          <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <motion.div variants={luxReveal}
              className="p-8"
              style={{ border: `1px solid ${T.borderGold}`, background: T.surface }}>
              <p className="text-xs tracking-[0.2em] uppercase mb-6" style={{ color: T.gold, fontFamily: T.sans }}>
                Confidential Inquiry
              </p>
              {[
                { label: 'Full name', placeholder: 'Your name', type: 'text' },
                { label: 'Organisation', placeholder: 'Your organisation', type: 'text' },
                { label: 'Email address', placeholder: 'Your email', type: 'email' },
              ].map(field => (
                <div key={field.label} className="mb-5">
                  <label className="block text-[10px] tracking-[0.15em] uppercase mb-2"
                    style={{ color: T.textDim, fontFamily: T.sans }}>
                    {field.label}
                  </label>
                  <input type={field.type} placeholder={field.placeholder}
                    className="w-full py-3 px-0 bg-transparent text-sm outline-none"
                    style={{
                      color: T.cream,
                      fontFamily: T.sans,
                      fontWeight: 300,
                      borderBottom: `1px solid ${T.border}`,
                    }} />
                </div>
              ))}
              <div className="mb-7">
                <label className="block text-[10px] tracking-[0.15em] uppercase mb-2"
                  style={{ color: T.textDim, fontFamily: T.sans }}>
                  Nature of enquiry
                </label>
                <textarea rows={3} placeholder="Brief description of your advisory need"
                  className="w-full py-3 px-0 bg-transparent text-sm outline-none resize-none"
                  style={{
                    color: T.cream,
                    fontFamily: T.sans,
                    fontWeight: 300,
                    borderBottom: `1px solid ${T.border}`,
                  }} />
              </div>
              <motion.button
                whileHover={{ borderColor: T.goldLight, color: T.goldLight }}
                transition={{ duration: 0.2 }}
                className="w-full py-4 text-xs tracking-[0.2em] uppercase"
                style={{
                  border: `1px solid ${T.gold}`,
                  color: T.gold,
                  fontFamily: T.sans,
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}>
                Submit confidential inquiry →
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = {
    'Practice Areas': ['Corporate Strategy', 'Governance & Risk', 'Organizational Design', 'Public Sector', 'Financial Advisory'],
    Insights: ['White Papers', 'Research', 'Advisory Notes', 'Event Summaries'],
    'The Firm': ['Our History', 'Partners', 'Offices', 'Careers', 'Press'],
    Legal: ['Privacy Notice', 'Terms', 'Cookie Policy', 'Regulatory'],
  }
  return (
    <footer className="pt-16 pb-8" style={{ background: T.bg, borderTop: `1px solid ${T.borderGold}` }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-5 gap-12 mb-14">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <Award size={14} color={T.gold} />
              <div>
                <span className="text-xs tracking-[0.15em] uppercase block" style={{ color: T.cream, fontFamily: T.sans }}>Stratford</span>
                <span className="text-[9px] tracking-[0.2em] uppercase block" style={{ color: T.gold, fontFamily: T.sans }}>& Associates</span>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed font-light"
              style={{ color: T.textDim, fontFamily: T.sans }}>
              Independent global advisory since 1987.
            </p>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-4"
                style={{ color: T.gold, fontFamily: T.sans }}>{col}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-[10px] hover:opacity-80 font-light"
                      style={{ color: T.textDim, fontFamily: T.sans, letterSpacing: '0.05em' }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-7"
          style={{ borderTop: `1px solid ${T.border}` }}>
          <p className="text-[9px] tracking-[0.15em] uppercase"
            style={{ color: T.textDim, fontFamily: T.sans }}>
            © 2026 Stratford & Associates. All rights reserved.
          </p>
          <p className="text-[9px] italic tracking-[0.05em]"
            style={{ color: T.textDim, fontFamily: T.serif }}>
            "Strategy without execution is daydreaming."
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template10() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <TrustSignals />
      <Services />
      <Insights />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  )
}
