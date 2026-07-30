// Template 07: Editorial
// Category: CMS / Content / LMS / Knowledge Base
// Design: Magazine editorial sensibility. Warm cream, forest green accent, serif typography.
//         Content-first — the writing speaks, design supports.
// Colors: #FAF7F2 bg, #2D5A27 accent, #1A2E1A text
// Font: Playfair Display (headings) + Lora (body) — classic, readable, editorial
// Motion: Elegant deliberate reveals, image zoom-out, refined fade-up transitions

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Star, BookOpen, Feather, Globe,
  Rss, Award, Users, Clock, PenTool, Layers, ChevronRight,
  Play, MessageSquare, Heart, Share2, TrendingUp
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:          '#FAF7F2',
  bgAlt:       '#FFFFFF',
  bgGreen:     '#F0F7EE',
  bgDark:      '#1A2E1A',
  text:        '#1A2E1A',
  textSoft:    '#4A5E4A',
  textDim:     '#8E9E8E',
  accent:      '#2D5A27',
  accentLight: '#4A8F40',
  accentDim:   '#E8F5E4',
  border:      '#E2D9C9',
  borderDk:    '#2A3E2A',
  serif:       '"Playfair Display", "Georgia", serif',
  body:        '"Lora", "Georgia", serif',
  sans:        '"Inter", system-ui, sans-serif',
} as const

// ── Variants ──────────────────────────────────────────────────────────────────
const elegant: Variants = {
  hidden:  { opacity: 0, y: 32, filter: 'blur(2px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}
const imageReveal: Variants = {
  hidden:  { opacity: 0, scale: 1.06 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
}

function useSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Features', 'Pricing', 'Community', 'Blog']
  return (
    <>
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50"
        style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Feather size={18} color={T.accent} />
            <span className="text-lg font-bold" style={{ color: T.text, fontFamily: T.serif, letterSpacing: '-0.01em' }}>
              Folio
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {nav.map(n => (
              <a key={n} href="#" className="text-sm hover:opacity-60 transition-opacity"
                style={{ color: T.textSoft, fontFamily: T.sans }}>{n}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>Sign in</a>
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="text-sm font-medium px-5 py-2.5 rounded-full"
              style={{ background: T.accent, color: '#fff', fontFamily: T.sans }}>
              Start writing →
            </motion.a>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: T.text }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="fixed top-16 inset-x-0 z-40 p-6"
            style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
            <div className="flex flex-col gap-5">
              {nav.map(n => <a key={n} href="#" className="text-base" style={{ color: T.text, fontFamily: T.sans }}>{n}</a>)}
              <a href="#" className="py-3 text-center rounded-full font-medium text-sm"
                style={{ background: T.accent, color: '#fff' }}>Start writing free</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Hero — Magazine Split ─────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-16 overflow-hidden"
      style={{ background: T.bg }}>
      <div className="max-w-6xl mx-auto px-8 w-full py-20">
        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: T.accent, fontFamily: T.sans }}>
            Publishing Platform
          </span>
          <div className="h-px flex-1" style={{ background: T.border }} />
          <span className="text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>Est. 2026</span>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Headline — large editorial col */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '102%' }} animate={{ y: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="text-6xl md:text-8xl font-black leading-[1.02]"
                style={{ color: T.text, fontFamily: T.serif, letterSpacing: '-0.02em' }}>
                Where great
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '102%' }} animate={{ y: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                className="text-6xl md:text-8xl font-black leading-[1.02] italic"
                style={{ color: T.accent, fontFamily: T.serif, letterSpacing: '-0.02em' }}>
                writing
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '102%' }} animate={{ y: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
                className="text-6xl md:text-8xl font-black leading-[1.02]"
                style={{ color: T.text, fontFamily: T.serif, letterSpacing: '-0.02em' }}>
                lives forever.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-lg leading-relaxed mt-8 max-w-lg"
              style={{ color: T.textSoft, fontFamily: T.body }}>
              The publishing platform for serious writers, educators, and creators who believe in the power of long-form content. Build your audience. Own your words.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="flex flex-wrap gap-4 mt-8">
              <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full font-medium"
                style={{ background: T.accent, color: '#fff', fontFamily: T.sans }}>
                Start writing free <ArrowRight size={16} />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full"
                style={{ color: T.text, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
                <BookOpen size={15} /> See examples
              </motion.a>
            </motion.div>
          </div>

          {/* Right — sample content cards */}
          <div className="lg:col-span-5 flex flex-col gap-4 pt-4">
            {[
              { category: 'Essay', title: 'The Lost Art of Deliberate Reading', author: 'C. Morgan', time: '8 min read', highlight: true },
              { category: 'Tutorial', title: 'Building a Writing Practice That Sticks', author: 'T. Nakamura', time: '12 min read', highlight: false },
              { category: 'Analysis', title: 'Why Newsletters Ate the Internet', author: 'S. Beaumont', time: '6 min read', highlight: false },
            ].map((c, i) => (
              <motion.div key={c.title}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 + i * 0.12 }}
                whileHover={{ x: 4 }}
                className={`p-5 rounded-2xl cursor-pointer group ${c.highlight ? '' : ''}`}
                style={{
                  background: c.highlight ? T.accentDim : T.bgAlt,
                  border: `1px solid ${c.highlight ? `${T.accent}25` : T.border}`,
                }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: c.highlight ? T.accent : T.textDim, fontFamily: T.sans }}>
                    {c.category}
                  </span>
                  <ChevronRight size={14} color={T.textDim}
                    className="group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-base font-bold mb-3 leading-snug"
                  style={{ color: T.text, fontFamily: T.serif }}>{c.title}</h3>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full" style={{ background: T.accentDim }} />
                  <span className="text-xs" style={{ color: T.textSoft, fontFamily: T.sans }}>{c.author}</span>
                  <span className="text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>· {c.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap gap-10 mt-16 pt-8"
          style={{ borderTop: `1px solid ${T.border}` }}>
          {[
            { value: '280K+', label: 'active writers' },
            { value: '4.2M', label: 'monthly readers' },
            { value: '18M+', label: 'articles published' },
            { value: '$2.8M', label: 'paid to creators' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-black" style={{ color: T.accent, fontFamily: T.serif }}>{s.value}</p>
              <p className="text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useSection()
  const feats = [
    { icon: PenTool, title: 'A writing experience that gets out of your way', desc: 'Distraction-free editor. Markdown + rich text. Automatic saving. Focus mode. The tool should serve the writing, not the other way around.', color: T.accent },
    { icon: Rss, title: 'Built-in newsletter and subscription tools', desc: "Grow your email list. Send beautiful newsletters. Offer paid subscriptions. Your audience, your economics — Folio doesn't take a cut of subs.", color: T.accent },
    { icon: TrendingUp, title: 'Analytics that respect your readers', desc: "See what's working. Real reads, not pageviews. Time spent, not bounces. No ad-trackers, no third-party scripts, no surveillance capitalism.", color: T.accent },
    { icon: Globe, title: 'SEO-optimized by default', desc: 'Automatic structured data, fast-loading pages, sitemap generation, open graph tags. Your writing finds readers organically.', color: T.accent },
    { icon: Users, title: 'Community features built for learning', desc: 'Comments, annotations, reading lists, cohorts. Build a community of readers who engage — not just consume.', color: T.accent },
    { icon: Award, title: 'Own your content, your audience, your revenue', desc: 'Export everything, anytime. Custom domain. GDPR-compliant. Your readers are yours — always. We never monetize your audience.', color: T.accent },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgGreen }}>
      <div className="max-w-6xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-16 max-w-2xl">
          <motion.span variants={elegant} className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: T.accent, fontFamily: T.sans }}>
            THE PLATFORM
          </motion.span>
          <motion.h2 variants={elegant}
            className="text-5xl font-black mt-4 leading-tight"
            style={{ color: T.text, fontFamily: T.serif, letterSpacing: '-0.02em' }}>
            Everything a serious creator needs.
          </motion.h2>
          <motion.p variants={elegant} className="text-base mt-4 leading-relaxed"
            style={{ color: T.textSoft, fontFamily: T.body }}>
            Not a blogging tool. Not a newsletter tool. Not a community tool. Folio is all three — deeply integrated, beautifully simple.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {feats.map(f => (
            <motion.div key={f.title} variants={elegant}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center mb-5"
                style={{ background: T.accentDim }}>
                <f.icon size={17} color={T.accent} />
              </div>
              <h3 className="text-base font-bold mb-2 leading-snug"
                style={{ color: T.text, fontFamily: T.serif }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: T.textSoft, fontFamily: T.body }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Featured Content ──────────────────────────────────────────────────────────
function Editorial() {
  const { ref, inView } = useSection()
  const articles = [
    { cat: 'Long-form', title: 'The discipline of daily writing and why consistency beats inspiration', author: 'Helena Cross', readTime: '14 min', pub: 'The Craft', bgEmoji: '✍️' },
    { cat: 'Interview', title: 'James Clear on building a one-million subscriber newsletter from scratch', author: 'Folio Team', readTime: '22 min', pub: 'Creator Spotlight', bgEmoji: '🎙️' },
    { cat: 'Tutorial', title: 'How to write a cold email that gets a 40% reply rate', author: 'Alex Norris', readTime: '9 min', pub: 'Business Writing', bgEmoji: '📧' },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bg }}>
      <div className="max-w-6xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-12">
          <div className="flex items-center justify-between">
            <motion.h2 variants={elegant} className="text-4xl font-black"
              style={{ color: T.text, fontFamily: T.serif, letterSpacing: '-0.02em' }}>
              Featured on Folio
            </motion.h2>
            <motion.a href="#" variants={elegant}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: T.accent, fontFamily: T.sans }}>
              Browse all <ArrowRight size={14} />
            </motion.a>
          </div>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6">
          {articles.map(a => (
            <motion.article key={a.title} variants={elegant}
              whileHover={{ y: -4 }}
              className="group cursor-pointer">
              <div className="h-48 rounded-2xl flex items-center justify-center text-6xl mb-5 overflow-hidden"
                style={{ background: T.accentDim }}>
                {a.bgEmoji}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: T.accent, fontFamily: T.sans }}>
                {a.cat}
              </span>
              <h3 className="text-xl font-bold mt-2 mb-3 leading-snug group-hover:underline decoration-2 underline-offset-2"
                style={{ color: T.text, fontFamily: T.serif }}>
                {a.title}
              </h3>
              <div className="flex items-center justify-between text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>
                <span>{a.author} · {a.pub}</span>
                <div className="flex items-center gap-1">
                  <Clock size={11} />{a.readTime}
                </div>
              </div>
            </motion.article>
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
    { quote: "I moved from Substack after 3 years. The difference in editor quality is night and day. Folio treats writing like a craft.", name: 'Dr. Maya Patel', role: 'Author · 28K subscribers', stars: 5 },
    { quote: "My LMS content is finally beautiful. Students complete 40% more modules since I migrated to Folio's course builder.", name: 'Prof. James Rodriguez', role: 'Online Educator · 12K students', stars: 5 },
    { quote: "I launched a paid community on Folio in one afternoon. First $1,000 in subscriptions came within 48 hours.", name: 'Sara Okonkwo', role: 'Business Writer · Folio Creator', stars: 5 },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgDark }}>
      <div className="max-w-6xl mx-auto px-8">
        <motion.h2 variants={elegant} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-4xl font-black mb-14 text-center italic"
          style={{ color: '#F5F0E8', fontFamily: T.serif }}>
          "Writing is thinking made visible."
        </motion.h2>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6">
          {qs.map(t => (
            <motion.div key={t.name} variants={elegant}
              className="p-7 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex gap-0.5 mb-5">
                {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={13} fill="#A8D5A0" color="#A8D5A0" />)}
              </div>
              <p className="text-base leading-relaxed mb-6 italic"
                style={{ color: 'rgba(255,255,255,0.75)', fontFamily: T.body }}>
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-bold" style={{ color: '#F5F0E8', fontFamily: T.serif }}>{t.name}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: T.sans }}>{t.role}</p>
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
    { name: 'Writer', price: 'Free', period: '', desc: 'Start your writing journey', features: ['Unlimited articles', 'Basic analytics', '5GB storage', 'Custom domain (own domain)', 'Community access'], cta: 'Start writing', primary: false },
    { name: 'Creator', price: '$12', period: '/mo', desc: 'For serious creators and educators', features: ['Everything in Writer', 'Paid subscriptions', 'Email newsletters', 'Advanced analytics', 'Course builder', 'Priority support'], cta: 'Start free trial', primary: true },
    { name: 'Publication', price: '$49', period: '/mo', desc: 'For teams and publications', features: ['Everything in Creator', 'Up to 5 authors', 'Team editing workflow', 'White-label options', 'API access', 'Dedicated support'], cta: 'Contact us', primary: false },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgGreen }}>
      <div className="max-w-5xl mx-auto px-8">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14 text-center">
          <motion.h2 variants={elegant} className="text-5xl font-black mb-4"
            style={{ color: T.text, fontFamily: T.serif, letterSpacing: '-0.02em' }}>
            Write freely.<br />
            <span style={{ color: T.accent }}>Monetize when ready.</span>
          </motion.h2>
          <motion.p variants={elegant} className="text-base" style={{ color: T.textSoft, fontFamily: T.body }}>
            Start free. No payment details required.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5">
          {plans.map(p => (
            <motion.div key={p.name} variants={elegant}
              className="p-7 rounded-2xl flex flex-col"
              style={{
                background: p.primary ? T.bgDark : T.bgAlt,
                border: `1px solid ${p.primary ? T.bgDark : T.border}`,
              }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: p.primary ? '#A8D5A0' : T.textDim, fontFamily: T.sans }}>
                {p.name}
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black" style={{ color: p.primary ? '#F5F0E8' : T.text, fontFamily: T.serif }}>
                  {p.price}
                </span>
                <span className="text-sm" style={{ color: p.primary ? 'rgba(255,255,255,0.4)' : T.textDim }}>{p.period}</span>
              </div>
              <p className="text-sm mb-7" style={{ color: p.primary ? 'rgba(255,255,255,0.5)' : T.textSoft, fontFamily: T.body }}>
                {p.desc}
              </p>
              <ul className="flex flex-col gap-3 flex-1 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm"
                    style={{ color: p.primary ? 'rgba(255,255,255,0.65)' : T.textSoft, fontFamily: T.sans }}>
                    <Check size={14} color={p.primary ? '#A8D5A0' : T.accent} className="mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="block text-center py-3 rounded-full text-sm font-medium"
                style={{
                  background: p.primary ? T.accent : T.accentDim,
                  color: p.primary ? '#fff' : T.accent,
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
    <section ref={ref} className="py-32" style={{ background: T.bg }}>
      <div className="max-w-3xl mx-auto px-8 text-center">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.h2 variants={elegant}
            className="text-6xl font-black leading-tight mb-6"
            style={{ color: T.text, fontFamily: T.serif, letterSpacing: '-0.02em' }}>
            Your story<br />deserves to<br />
            <em style={{ color: T.accent }}>be heard.</em>
          </motion.h2>
          <motion.p variants={elegant} className="text-lg leading-relaxed mb-10"
            style={{ color: T.textSoft, fontFamily: T.body }}>
            Join 280,000 writers and educators who've made Folio their home. Free forever for individuals.
          </motion.p>
          <motion.div variants={elegant} className="flex flex-wrap gap-4 justify-center">
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-full font-medium"
              style={{ background: T.accent, color: '#fff', fontFamily: T.sans }}>
              Create your Folio — free
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-full"
              style={{ color: T.text, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
              <BookOpen size={16} /> Read a sample publication
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
    Platform: ['Editor', 'Newsletter', 'Courses', 'Community', 'Analytics', 'API'],
    Discover: ['Featured writing', 'Publications', 'Topics', 'Authors', 'Collections'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Manifesto'],
    Legal: ['Privacy', 'Terms', 'Content Policy', 'GDPR'],
  }
  return (
    <footer className="pt-16 pb-8" style={{ background: T.bgDark }}>
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid md:grid-cols-5 gap-10 mb-14">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Feather size={16} color="#A8D5A0" />
              <span className="font-bold text-lg" style={{ color: '#F5F0E8', fontFamily: T.serif }}>Folio</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: T.body }}>
              Where great writing lives forever.
            </p>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.25)', fontFamily: T.sans }}>{col}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map(l => <li key={l}>
                  <a href="#" className="text-xs hover:opacity-80" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: T.sans }}>{l}</a>
                </li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: T.sans }}>© 2026 Folio Publishing, Inc.</p>
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: T.body }}>
            "Write. Publish. Matter."
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template07() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <Features />
      <Editorial />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
