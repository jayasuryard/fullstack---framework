// Template 06: Bold Startup
// Category: Marketplace / Booking / Travel / Consumer SaaS
// Design: High-energy vivid design. Coral/electric-blue, large bold type, kinetic spring animations.
//         Consumer-facing — approachable, exciting, confident.
// Colors: #FF4D4D primary, #4F46E5 secondary, #FAFAFA bg
// Font: Plus Jakarta Sans — bold, friendly, energetic
// Motion: Spring physics, scale pulses, stagger with energy, parallax depth

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Star, Zap, Heart, Globe,
  MapPin, Calendar, Clock, Users, Search, ChevronRight,
  Sparkles, TrendingUp, Shield, Smile, Play, ArrowUpRight
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:        '#FAFAFA',
  bgAlt:     '#FFFFFF',
  bgDark:    '#0F0E17',
  primary:   '#FF4D4D',
  primaryDim:'#FFF0F0',
  secondary: '#4F46E5',
  secondDim: '#EEF2FF',
  accent:    '#FFB800',
  accentDim: '#FFFBEB',
  text:      '#0F0E17',
  textSoft:  '#4A4A5A',
  textDim:   '#9898A6',
  border:    '#EBEBF0',
  success:   '#22C55E',
  sans:      '"Plus Jakarta Sans", "Inter", sans-serif',
} as const

// ── Variants ──────────────────────────────────────────────────────────────────
const springPop: Variants = {
  hidden:  { opacity: 0, scale: 0.88, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 20 } },
}
const springSlide: Variants = {
  hidden:  { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 250, damping: 22 } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Explore', 'How it works', 'For Hosts', 'Pricing']
  return (
    <>
      <motion.nav initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-0 inset-x-0 z-50 bg-white"
        style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
              <MapPin size={14} color="#fff" />
            </div>
            <span className="font-extrabold text-lg" style={{ color: T.text, fontFamily: T.sans }}>
              wander<span style={{ color: T.primary }}>.</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {nav.map(n => (
              <a key={n} href="#" className="text-sm font-medium hover:opacity-60 transition-opacity"
                style={{ color: T.textSoft, fontFamily: T.sans }}>{n}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm font-medium" style={{ color: T.textSoft, fontFamily: T.sans }}>Log in</a>
            <motion.a href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="text-sm font-bold px-5 py-2.5 rounded-full"
              style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
              Sign up free
            </motion.a>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: T.text }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-16 inset-x-0 z-40 p-6 bg-white"
            style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex flex-col gap-5">
              {nav.map(n => <a key={n} href="#" className="text-base font-medium" style={{ color: T.text, fontFamily: T.sans }}>{n}</a>)}
              <a href="#" className="py-3 rounded-full text-center font-bold text-sm"
                style={{ background: T.primary, color: '#fff' }}>Sign up free</a>
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
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{ background: T.bg }}>
      {/* Big background typography */}
      <div className="absolute inset-0 overflow-hidden select-none pointer-events-none flex items-center justify-center opacity-[0.025]">
        <span className="text-[22vw] font-black" style={{ color: T.primary, fontFamily: T.sans, lineHeight: 0.9 }}>
          GO
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={springSlide}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-7"
                style={{ background: T.accentDim, color: T.accent, fontFamily: T.sans }}>
                <Sparkles size={14} /> 2.4M+ experiences booked this month
              </span>
            </motion.div>
            <motion.h1 variants={springSlide}
              className="text-6xl md:text-7xl font-black leading-[1.02] mb-6"
              style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
              Book the world's<br />
              best <span style={{
                background: `linear-gradient(135deg, ${T.primary}, #FF8C42)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>experiences.</span>
            </motion.h1>
            <motion.p variants={springSlide}
              className="text-lg mb-8 max-w-lg"
              style={{ color: T.textSoft, fontFamily: T.sans }}>
              From rooftop restaurants to secret hikes, cooking classes to yacht charters — discover and book unforgettable experiences worldwide.
            </motion.p>

            {/* Search bar */}
            <motion.div variants={springPop}
              className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl shadow-lg max-w-xl"
              style={{ background: T.bgAlt, border: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2 flex-1 px-4">
                <Search size={16} color={T.textDim} />
                <input placeholder="Search experiences, cities..." className="flex-1 text-sm outline-none bg-transparent"
                  style={{ color: T.text, fontFamily: T.sans }} />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 sm:border-l" style={{ borderColor: T.border }}>
                <MapPin size={14} color={T.primary} />
                <span className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>Anywhere</span>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: T.primary, color: '#fff', fontFamily: T.sans }}>
                Search
              </motion.button>
            </motion.div>

            <motion.div variants={springSlide} className="flex items-center gap-6 mt-6">
              <div className="flex -space-x-2">
                {[T.primary, T.secondary, T.accent, '#10B981'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white"
                    style={{ background: c }} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => <Star key={i} size={13} fill={T.accent} color={T.accent} />)}
                  <span className="text-sm font-bold ml-1" style={{ color: T.text }}>4.9</span>
                </div>
                <p className="text-xs" style={{ color: T.textDim }}>from 180K+ reviews</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Featured Cards */}
          <div className="relative hidden lg:block h-[480px]">
            {[
              { title: 'Sunset Yacht Cruise', location: 'Santorini, Greece', price: '$89', rating: '4.9', tag: 'Popular', color: T.primary, top: '0%', left: '5%', rotate: '-3deg' },
              { title: 'Private Cooking Class', location: 'Tokyo, Japan', price: '$65', rating: '5.0', tag: 'New', color: T.secondary, top: '15%', left: '40%', rotate: '2deg' },
              { title: 'Hidden Waterfall Hike', location: 'Bali, Indonesia', price: '$45', rating: '4.8', tag: 'Adventure', color: '#10B981', top: '42%', left: '0%', rotate: '-1deg' },
            ].map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 40, rotate: card.rotate as string }}
                animate={{ opacity: 1, y: 0, rotate: card.rotate as string }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 + i * 0.15 }}
                whileHover={{ y: -8, rotate: '0deg', zIndex: 10 }}
                className="absolute w-56 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                style={{ top: card.top, left: card.left, background: T.bgAlt, border: `1px solid ${T.border}` }}>
                <div className="h-32 flex items-center justify-center text-4xl"
                  style={{ background: `${card.color}15` }}>
                  {['⛵', '🍣', '🌊'][i]}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${card.color}15`, color: card.color, fontFamily: T.sans }}>
                      {card.tag}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={10} fill={T.accent} color={T.accent} />
                      <span className="text-xs font-bold" style={{ color: T.text }}>{card.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold mt-1" style={{ color: T.text, fontFamily: T.sans }}>{card.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs flex items-center gap-1" style={{ color: T.textDim, fontFamily: T.sans }}>
                      <MapPin size={10} />{card.location}
                    </p>
                    <p className="text-sm font-black" style={{ color: T.primary, fontFamily: T.sans }}>
                      {card.price}<span className="text-xs font-medium text-gray-400">/p</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 22 }}
          className="flex flex-wrap gap-3 mt-12">
          {['🏄 Water sports', '🍳 Cooking classes', '🧘 Wellness', '🎨 Art & Culture', '🥾 Hiking', '🍷 Food tours', '🌙 Nightlife'].map(c => (
            <motion.button key={c} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: T.bgAlt, border: `1px solid ${T.border}`, color: T.textSoft, fontFamily: T.sans }}>
              {c}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Marquee Strip ─────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = ['🌍 2.4M+ Experiences', '⭐ 4.9/5 Rating', '🌏 190+ Countries', '💚 Verified Hosts', '🔒 Secure Payments', '🎯 Instant Confirmation']
  return (
    <div className="py-4 overflow-hidden" style={{ background: T.primary }}>
      <motion.div
        animate={{ x: [0, '-50%'] }}
        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        className="flex gap-10 whitespace-nowrap w-[200%]">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-sm font-bold text-white" style={{ fontFamily: T.sans }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, inView } = useSection()
  const steps = [
    { step: '01', icon: Search, title: 'Discover', desc: 'Browse 500,000+ curated experiences across 190 countries. Filter by date, budget, group size, and interest.', color: T.primary },
    { step: '02', icon: Calendar, title: 'Book instantly', desc: 'Reserve in seconds with instant confirmation. No lengthy email chains, no waiting for approval.', color: T.secondary },
    { step: '03', icon: Smile, title: 'Experience it', desc: 'Show up, enjoy, and leave a review. Your host gets paid automatically. Everyone wins.', color: '#10B981' },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14 text-center">
          <motion.h2 variants={springPop} className="text-5xl font-black mb-4"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
            How Wander works
          </motion.h2>
          <motion.p variants={springPop} className="text-lg" style={{ color: T.textSoft, fontFamily: T.sans }}>
            From discovery to memory — in three steps.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8">
          {steps.map(s => (
            <motion.div key={s.step} variants={springPop} className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: `${s.color}15` }}>
                <s.icon size={28} color={s.color} />
              </div>
              <span className="text-3xl font-black" style={{ color: `${s.color}30`, fontFamily: T.sans }}>{s.step}</span>
              <h3 className="text-xl font-bold mt-2 mb-3" style={{ color: T.text, fontFamily: T.sans }}>{s.title}</h3>
              <p className="text-base" style={{ color: T.textSoft, fontFamily: T.sans }}>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Features / Value Props ────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useSection()
  const feats = [
    { icon: Shield, title: 'Verified hosts only', desc: 'Every host is background-checked, ID-verified, and reviewed. 98% would-recommend rate.', color: T.secondary },
    { icon: Zap, title: 'Instant confirmation', desc: 'Real-time booking confirmation. No waiting. No back-and-forth. Your spot is guaranteed.', color: T.primary },
    { icon: Globe, title: '190+ countries', desc: 'From the Amalfi Coast to Kyoto to Buenos Aires — the best local experiences, everywhere.', color: '#10B981' },
    { icon: Heart, title: 'Flexible cancellation', desc: 'Plans change. Free cancellation up to 24 hours before most experiences. No stress.', color: '#EC4899' },
    { icon: TrendingUp, title: 'Best price guarantee', desc: "Find it cheaper elsewhere and we'll match it plus give you 10% off. We're serious.", color: T.accent },
    { icon: Users, title: 'Group-friendly', desc: 'Private and semi-private options for groups from 2 to 200+. Corporate events welcome.', color: T.secondary },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14 text-center">
          <motion.h2 variants={springPop} className="text-5xl font-black mb-4"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
            Why travelers choose Wander
          </motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feats.map(f => (
            <motion.div key={f.title} variants={springPop}
              whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="p-6 rounded-2xl"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}12` }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: T.text, fontFamily: T.sans }}>{f.title}</h3>
              <p className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Reviews ───────────────────────────────────────────────────────────────────
function Reviews() {
  const { ref, inView } = useSection()
  const reviews = [
    { text: "Our Tokyo food tour was the highlight of the entire trip. Our guide took us to places no tourist would ever find.", name: 'Maria K.', loc: 'New York · Visited Tokyo', stars: 5, exp: '🍣 Food Tour' },
    { text: "Completely spontaneous sunset cruise in Santorini. Booked at noon, on the boat by 6pm. Magical.", name: 'Tom B.', loc: 'London · Visited Santorini', stars: 5, exp: '⛵ Yacht Cruise' },
    { text: "The Bali waterfall hike. Private guide, 4 hours, completely off-the-beaten-path. I cried a little. It was that good.", name: 'Aisha R.', loc: 'Dubai · Visited Bali', stars: 5, exp: '🌊 Hiking' },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-12 text-center">
          <motion.h2 variants={springPop} className="text-5xl font-black mb-2"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
            Real stories,<br />
            <span style={{ color: T.primary }}>real memories.</span>
          </motion.h2>
          <motion.div variants={springPop} className="flex justify-center items-center gap-2 mt-4">
            <div className="flex">{Array(5).fill(0).map((_, i) => <Star key={i} size={18} fill={T.accent} color={T.accent} />)}</div>
            <span className="font-black text-xl" style={{ color: T.text }}>4.9</span>
            <span className="text-sm" style={{ color: T.textDim, fontFamily: T.sans }}>from 180,000+ reviews</span>
          </motion.div>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5">
          {reviews.map(r => (
            <motion.div key={r.name} variants={springPop}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl"
              style={{ background: T.bgAlt, border: `1px solid ${T.border}` }}>
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-4"
                style={{ background: T.primaryDim, color: T.primary, fontFamily: T.sans }}>
                {r.exp}
              </span>
              <div className="flex gap-0.5 mb-3">
                {Array(r.stars).fill(0).map((_, i) => <Star key={i} size={13} fill={T.accent} color={T.accent} />)}
              </div>
              <p className="text-base mb-4" style={{ color: T.text, fontFamily: T.sans }}>"{r.text}"</p>
              <div>
                <p className="text-sm font-bold" style={{ color: T.text, fontFamily: T.sans }}>{r.name}</p>
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: T.textDim, fontFamily: T.sans }}>
                  <MapPin size={10} />{r.loc}
                </p>
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
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.h2 variants={springPop} className="text-5xl font-black mb-4"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.03em' }}>
            Free to browse.<br />
            <span style={{ color: T.primary }}>Pay only when you book.</span>
          </motion.h2>
          <motion.p variants={springPop} className="text-lg mb-12" style={{ color: T.textSoft, fontFamily: T.sans }}>
            No subscription. No membership. Just a small booking fee — and it's included in the price you see.
          </motion.p>
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-4 text-left">
            {[
              { icon: '🌍', title: 'For travelers', desc: 'No booking fee. 100% transparent pricing. Free cancellation on most experiences.', color: T.primary },
              { icon: '🏡', title: 'For hosts', desc: 'Join free. Keep 85% of every booking. Wander handles payments, disputes, and marketing.', color: T.secondary },
              { icon: '🏢', title: 'For companies', desc: 'Team outings, client entertainment, offsites. Dedicated account manager. Invoicing available.', color: '#10B981' },
            ].map(p => (
              <motion.div key={p.title} variants={springPop}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: T.text, fontFamily: T.sans }}>{p.title}</h3>
                <p className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>{p.desc}</p>
                <a href="#" className="inline-flex items-center gap-1 text-sm font-bold mt-4"
                  style={{ color: p.color, fontFamily: T.sans }}>
                  Learn more <ChevronRight size={14} />
                </a>
              </motion.div>
            ))}
          </motion.div>
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
          <motion.h2 variants={springPop}
            className="text-6xl font-black text-white mb-5"
            style={{ fontFamily: T.sans, letterSpacing: '-0.03em' }}>
            Your next<br />adventure awaits.
          </motion.h2>
          <motion.p variants={springPop} className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: T.sans }}>
            Join 4 million travelers who've made unforgettable memories with Wander.
          </motion.p>
          <motion.div variants={springPop} className="flex flex-wrap gap-4 justify-center">
            <motion.a href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full font-black text-base"
              style={{ background: '#fff', color: T.primary, fontFamily: T.sans }}>
              Start exploring free →
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full font-bold text-base"
              style={{ color: '#fff', border: '2px solid rgba(255,255,255,0.4)', fontFamily: T.sans }}>
              Become a host
            </motion.a>
          </motion.div>
          <motion.p variants={springPop} className="mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: T.sans }}>
            Free to join · No subscription · Book your first experience today
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = {
    Discover: ['Experiences', 'Destinations', 'Trending', 'Deals', 'Gift cards'],
    Hosting: ['Become a host', 'Host resources', 'Partner program', 'Host community'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Sustainability'],
    Support: ['Help Center', 'Safety', 'Cancellations', 'Accessibility', 'Trust & Safety'],
  }
  return (
    <footer className="pt-14 pb-8" style={{ background: T.bgDark }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
                <MapPin size={12} color="#fff" />
              </div>
              <span className="font-extrabold text-white" style={{ fontFamily: T.sans }}>wander.</span>
            </div>
            <p className="text-xs" style={{ color: '#666', fontFamily: T.sans }}>
              Extraordinary experiences. Everywhere.
            </p>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#444', fontFamily: T.sans }}>{col}</p>
              <ul className="flex flex-col gap-2">
                {links.map(l => <li key={l}><a href="#" className="text-xs hover:text-white transition-colors" style={{ color: '#666', fontFamily: T.sans }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: '1px solid #1A1A2E' }}>
          <p className="text-xs" style={{ color: '#444', fontFamily: T.sans }}>© 2026 Wander, Inc. All rights reserved.</p>
          <p className="text-xs" style={{ color: '#444', fontFamily: T.sans }}>Privacy · Terms · Sitemap</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template06() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <MarqueeStrip />
      <HowItWorks />
      <Features />
      <Reviews />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
