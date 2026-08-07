// Template 08: Futuristic AI
// Category: AI Platform / Automation / LLM / Agent Orchestration
// Design: Cyberpunk aesthetic for AI-native products. Pure black with neon green/cyan.
//         Glow effects, scanning animations, neural network visualization, terminal feel.
// Colors: #000000 bg, #00FF88 primary, #00CCFF secondary
// Font: Space Grotesk — geometric, futuristic, technical
// Motion: Scan line effects, glitch, neural pulse, terminal typing, glow pulses

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Zap, Shield, Globe, Cpu,
  Activity, GitBranch, ChevronRight, Play, Code2, Database,
  Network, Bot, Terminal, Workflow, Eye, Lock
} from 'lucide-react'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:        '#000000',
  bgAlt:     '#050505',
  bgSurface: '#0A0A0A',
  primary:   '#00FF88',
  primaryDim:'rgba(0,255,136,0.08)',
  primaryGlow:'rgba(0,255,136,0.3)',
  secondary: '#00CCFF',
  secondDim: 'rgba(0,204,255,0.08)',
  secondGlow:'rgba(0,204,255,0.3)',
  border:    'rgba(255,255,255,0.06)',
  borderGlow:'rgba(0,255,136,0.2)',
  text:      '#FFFFFF',
  textSoft:  'rgba(255,255,255,0.55)',
  textDim:   'rgba(255,255,255,0.25)',
  error:     '#FF4444',
  warning:   '#FFAA00',
  sans:      '"Space Grotesk", "Inter", sans-serif',
  mono:      '"JetBrains Mono", "Fira Code", monospace',
} as const

// ── Variants ──────────────────────────────────────────────────────────────────
const glowIn: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const scanReveal: Variants = {
  hidden:  { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
  visible: { opacity: 1, clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.6, ease: 'easeOut' } },
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

// ── Glow Card ─────────────────────────────────────────────────────────────────
function GlowCard({ children, className = '', color = T.primary }: {
  children: React.ReactNode; className?: string; color?: string
}) {
  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 30px ${color.replace(')', ',0.2)').replace('rgb', 'rgba')}`,
        borderColor: color,
      }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl ${className}`}
      style={{
        background: T.bgSurface,
        border: `1px solid ${T.border}`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
      {children}
    </motion.div>
  )
}

// ── Terminal Typer ────────────────────────────────────────────────────────────
function TerminalTyper({ lines }: { lines: string[] }) {
  const [displayed, setDisplayed] = useState<string[]>([])
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || lineIdx >= lines.length) return
    if (charIdx < lines[lineIdx].length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), 30)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setDisplayed(d => [...d, lines[lineIdx]])
        setLineIdx(l => l + 1)
        setCharIdx(0)
      }, 400)
      return () => clearTimeout(t)
    }
  }, [inView, lineIdx, charIdx, lines])

  const current = lineIdx < lines.length ? lines[lineIdx].slice(0, charIdx) : ''

  return (
    <div ref={ref} className="p-5 rounded-xl overflow-hidden" style={{ background: '#050505', border: `1px solid ${T.border}`, fontFamily: T.mono }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full" style={{ background: T.error }} />
        <div className="w-3 h-3 rounded-full" style={{ background: T.warning }} />
        <div className="w-3 h-3 rounded-full" style={{ background: T.primary }} />
        <span className="text-xs ml-2" style={{ color: T.textDim }}>nexus-cli — bash</span>
      </div>
      <div className="text-xs leading-relaxed space-y-1.5">
        {displayed.map((line, i) => (
          <div key={i}>
            <span style={{ color: T.primary }}>$ </span>
            <span style={{ color: T.text }}>{line}</span>
          </div>
        ))}
        {lineIdx < lines.length && (
          <div>
            <span style={{ color: T.primary }}>$ </span>
            <span style={{ color: T.text }}>{current}</span>
            <span className="animate-pulse" style={{ color: T.primary }}>_</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const nav = ['Platform', 'Models', 'Agents', 'Pricing', 'Docs']

  return (
    <>
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${T.border}`,
        }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: T.primaryDim, border: `1px solid ${T.borderGlow}` }}>
              <Network size={14} color={T.primary} />
            </div>
            <span className="font-bold text-sm" style={{ color: T.text, fontFamily: T.sans }}>
              Nexus<span style={{ color: T.primary }}>AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {nav.map(n => (
              <a key={n} href="#" className="text-sm hover:text-white transition-colors"
                style={{ color: T.textSoft, fontFamily: T.sans }}>{n}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>Sign in</a>
            <motion.a href="#" whileHover={{ boxShadow: `0 0 20px ${T.primaryGlow}` }}
              whileTap={{ scale: 0.97 }}
              className="text-sm font-bold px-4 py-2 rounded-lg"
              style={{ background: T.primary, color: '#000', fontFamily: T.sans }}>
              Start building
            </motion.a>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: T.textSoft }}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-14 inset-x-0 z-40 p-5"
            style={{ background: '#050505', borderBottom: `1px solid ${T.border}` }}>
            <div className="flex flex-col gap-4">
              {nav.map(n => <a key={n} href="#" className="text-sm" style={{ color: T.textSoft, fontFamily: T.sans }}>{n}</a>)}
              <a href="#" className="py-2.5 rounded-lg text-center font-bold text-sm"
                style={{ background: T.primary, color: '#000' }}>Start building</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Hero (Neural Network) ─────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-14 overflow-hidden"
      style={{ background: T.bg }}>
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `linear-gradient(rgba(0,255,136,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.5) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

      {/* Animated scan line */}
      <motion.div
        animate={{ y: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        className="absolute inset-x-0 h-px opacity-30 pointer-events-none z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
        style={{ background: T.primary }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-3xl"
        style={{ background: T.secondary }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={glowIn}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-7"
                style={{ background: T.primaryDim, color: T.primary, border: `1px solid ${T.borderGlow}`, fontFamily: T.sans }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.primary }} />
                AGI-grade reasoning · Now in Beta
              </span>
            </motion.div>
            <motion.h1 variants={glowIn}
              className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6"
              style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
              The AI that<br />
              <span style={{
                textShadow: `0 0 40px ${T.primaryGlow}`,
                color: T.primary,
              }}>
                thinks ahead.
              </span>
            </motion.h1>
            <motion.p variants={glowIn} className="text-lg mb-8"
              style={{ color: T.textSoft, fontFamily: T.sans }}>
              Nexus AI orchestrates autonomous agents, multi-step reasoning chains, and tool-use at enterprise scale. Build AI systems that actually work.
            </motion.p>
            <motion.div variants={glowIn} className="flex flex-wrap gap-4">
              <motion.a href="#"
                whileHover={{ boxShadow: `0 0 30px ${T.primaryGlow}` }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: T.primary, color: '#000', fontFamily: T.sans }}>
                Start building free <ArrowRight size={16} />
              </motion.a>
              <motion.a href="#"
                whileHover={{ borderColor: T.secondary, boxShadow: `0 0 20px ${T.secondGlow}` }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
                style={{ color: T.secondary, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
                <Play size={14} fill={T.secondary} /> Watch demo
              </motion.a>
            </motion.div>

            {/* Live metrics */}
            <motion.div variants={glowIn}
              className="grid grid-cols-3 gap-4 mt-10 p-4 rounded-xl"
              style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}>
              {[
                { label: 'Agents online', value: '1,284', color: T.primary },
                { label: 'Tokens/sec', value: '482K', color: T.secondary },
                { label: 'Uptime', value: '99.98%', color: '#00FF88' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: m.color }} />
                    <span className="text-lg font-bold" style={{ color: m.color, fontFamily: T.sans, textShadow: `0 0 20px ${m.color}60` }}>
                      {m.value}
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: T.textDim, fontFamily: T.sans }}>{m.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Terminal + Agent Viz */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-4">
            <motion.div variants={scanReveal}>
              <TerminalTyper lines={[
                'nexus agent create --model gpt-4o --tools web,code,files',
                'nexus agent run "Research competitors and draft a report"',
                'agent:init  ✓ Memory loaded (128K context)',
                'agent:step  → Web search: "top SaaS competitors 2026"',
                'agent:step  → Analyzing 24 sources...',
                'agent:step  → Drafting report structure',
                'agent:done  ✓ Report.md saved (4,200 words, 8 sections)',
              ]} />
            </motion.div>
            <motion.div variants={glowIn}
              className="p-4 rounded-xl"
              style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold" style={{ color: T.textDim, fontFamily: T.sans }}>AGENT GRAPH</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: T.primaryDim, color: T.primary }}>Running</span>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Orchestrator', icon: Network, color: T.primary },
                  { label: 'Researcher', icon: Eye, color: T.secondary },
                  { label: 'Coder', icon: Code2, color: '#FFAA00' },
                  { label: 'Writer', icon: Terminal, color: '#FF66CC' },
                ].map((node, i) => (
                  <React.Fragment key={node.label}>
                    <div className="flex flex-col items-center gap-1.5">
                      <motion.div
                        animate={{ boxShadow: [`0 0 0px ${node.color}`, `0 0 15px ${node.color}60`, `0 0 0px ${node.color}`] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${node.color}15`, border: `1px solid ${node.color}40` }}>
                        <node.icon size={15} color={node.color} />
                      </motion.div>
                      <span className="text-[9px]" style={{ color: T.textDim, fontFamily: T.sans }}>{node.label}</span>
                    </div>
                    {i < 3 && (
                      <motion.div
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                        className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})` }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Capabilities ──────────────────────────────────────────────────────────────
function Capabilities() {
  const { ref, inView } = useSection()
  const caps = [
    { icon: Bot, title: 'Autonomous Agents', desc: 'Deploy agents that plan, reason, use tools, and complete multi-step tasks without human-in-the-loop babysitting.', color: T.primary },
    { icon: Cpu, title: 'Multi-model Orchestration', desc: 'Route tasks to the right model — GPT-4o, Claude 3.5, Gemini, Llama 3, or your fine-tuned weights. Automatic fallback.', color: T.secondary },
    { icon: Database, title: 'Memory & RAG', desc: 'Persistent memory across agent runs. Built-in vector DB. Hybrid search. Automatic context windowing. Enterprise-grade retrieval.', color: '#FFAA00' },
    { icon: Workflow, title: 'Visual Workflow Builder', desc: 'Drag-and-drop agent workflow builder. Branch on conditions, loop on outputs, fork for parallel tasks. No code required.', color: '#FF66CC' },
    { icon: Shield, title: 'Guardrails & Safety', desc: 'Constitutional AI filters, output validation, cost caps, rate limiting, PII redaction. Configurable trust boundaries per agent.', color: T.primary },
    { icon: Activity, title: 'Real-time Observability', desc: 'Full trace of every agent step. Token costs. Latency breakdown. LLM call logs. Debug failed runs at the prompt level.', color: T.secondary },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-16 text-center">
          <motion.div variants={glowIn}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary, fontFamily: T.sans }}>
              PLATFORM CAPABILITIES
            </span>
          </motion.div>
          <motion.h2 variants={glowIn}
            className="text-5xl font-bold mt-4 mb-4"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.02em' }}>
            Built for what AI<br />
            <span style={{ color: T.primary, textShadow: `0 0 30px ${T.primaryGlow}` }}>
              can actually do.
            </span>
          </motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caps.map(c => (
            <motion.div key={c.title} variants={glowIn}>
              <GlowCard className="p-6 h-full" color={c.color}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${c.color}12`, border: `1px solid ${c.color}25` }}>
                  <c.icon size={20} color={c.color} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: T.text, fontFamily: T.sans }}>{c.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: T.textSoft, fontFamily: T.sans }}>{c.desc}</p>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Performance Stats ─────────────────────────────────────────────────────────
function Stats() {
  const { ref, inView } = useSection()
  const stats = [
    { value: '482K', label: 'tokens/second throughput', color: T.primary },
    { value: '<100ms', label: 'median first token latency', color: T.secondary },
    { value: '99.99%', label: 'uptime SLA for enterprise', color: T.primary },
    { value: '1M+', label: 'agent tasks completed today', color: T.secondary },
  ]
  return (
    <section ref={ref} className="py-20" style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map(s => (
            <motion.div key={s.label} variants={glowIn} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2"
                style={{ color: s.color, fontFamily: T.sans, textShadow: `0 0 30px ${s.color}50` }}>
                {s.value}
              </div>
              <p className="text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>{s.label}</p>
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
    { name: 'Developer', price: 'Free', period: '', desc: '500K tokens/month', features: ['3 models', '5 concurrent agents', '10K memory entries', 'Community support'], cta: 'Start free', primary: false, color: T.secondary },
    { name: 'Scale', price: '$99', period: '/mo', desc: '50M tokens/month', features: ['All models', 'Unlimited agents', '1M memory entries', 'Visual workflow builder', 'Guardrails', 'Priority support'], cta: 'Start trial', primary: true, color: T.primary },
    { name: 'Enterprise', price: 'Custom', period: '', desc: 'Dedicated infra', features: ['Custom token volume', 'On-premise option', 'Private model hosting', 'SLA guarantee', 'SSO + SCIM', 'Dedicated CSM'], cta: 'Contact us', primary: false, color: T.secondary },
  ]
  return (
    <section ref={ref} className="py-24" style={{ background: T.bgAlt }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-14 text-center">
          <motion.h2 variants={glowIn} className="text-5xl font-bold mb-4"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.02em' }}>
            Transparent pricing.<br />
            <span style={{ color: T.primary, textShadow: `0 0 30px ${T.primaryGlow}` }}>No surprises.</span>
          </motion.h2>
          <motion.p variants={glowIn} className="text-base" style={{ color: T.textSoft, fontFamily: T.sans }}>
            Start free. Scale to billions of tokens.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-4">
          {plans.map(p => (
            <motion.div key={p.name} variants={glowIn}
              whileHover={{ borderColor: p.color, boxShadow: `0 0 30px ${p.color}15` }}
              className="p-6 rounded-2xl flex flex-col transition-all duration-200"
              style={{
                background: T.bgSurface,
                border: `1px solid ${p.primary ? p.color + '50' : T.border}`,
                boxShadow: p.primary ? `0 0 40px ${p.color}15` : 'none',
              }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: T.textDim, fontFamily: T.sans }}>{p.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold"
                  style={{ color: T.text, fontFamily: T.sans, textShadow: p.primary ? `0 0 20px ${p.color}50` : 'none' }}>
                  {p.price}
                </span>
                <span className="text-sm" style={{ color: T.textDim }}>{p.period}</span>
              </div>
              <p className="text-xs mb-6" style={{ color: T.textDim, fontFamily: T.sans }}>{p.desc}</p>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs"
                    style={{ color: T.textSoft, fontFamily: T.sans }}>
                    <Check size={12} color={p.color} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a href="#"
                whileHover={{ boxShadow: `0 0 20px ${p.color}40` }}
                whileTap={{ scale: 0.97 }}
                className="block text-center py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: p.primary ? p.color : `${p.color}15`,
                  color: p.primary ? '#000' : p.color,
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
    <section ref={ref} className="relative py-32 overflow-hidden" style={{ background: T.bg }}>
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: `linear-gradient(${T.primary}40 1px, transparent 1px), linear-gradient(90deg, ${T.primary}40 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <motion.div
        animate={{ boxShadow: [`0 0 80px ${T.primaryGlow}`, `0 0 160px ${T.primaryGlow}`, `0 0 80px ${T.primaryGlow}`] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{ background: T.primary }} />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.h2 variants={glowIn}
            className="text-6xl font-bold mb-6"
            style={{ color: T.text, fontFamily: T.sans, letterSpacing: '-0.025em' }}>
            The future of AI is<br />
            <span style={{ color: T.primary, textShadow: `0 0 50px ${T.primaryGlow}` }}>
              agentic.
            </span>
          </motion.h2>
          <motion.p variants={glowIn} className="text-lg mb-10"
            style={{ color: T.textSoft, fontFamily: T.sans }}>
            Start building on Nexus AI today. Free tier available. No credit card required.
          </motion.p>
          <motion.div variants={glowIn} className="flex flex-wrap gap-4 justify-center">
            <motion.a href="#"
              whileHover={{ boxShadow: `0 0 40px ${T.primaryGlow}` }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl font-bold"
              style={{ background: T.primary, color: '#000', fontFamily: T.sans }}>
              Start building free →
            </motion.a>
            <motion.a href="#"
              whileHover={{ borderColor: T.secondary }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl font-medium"
              style={{ color: T.secondary, border: `1px solid ${T.border}`, fontFamily: T.sans }}>
              Read the docs
            </motion.a>
          </motion.div>
          <motion.p variants={glowIn} className="mt-5 text-xs" style={{ color: T.textDim, fontFamily: T.mono }}>
            {'>'} 500K free tokens · All models · No credit card
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = {
    Platform: ['Agents', 'Models', 'Memory', 'Workflows', 'Guardrails', 'API'],
    Developers: ['Documentation', 'SDK', 'Examples', 'Status', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Research', 'Security'],
    Legal: ['Privacy', 'Terms', 'DPA', 'Compliance'],
  }
  return (
    <footer className="pt-14 pb-8" style={{ background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: T.primaryDim, border: `1px solid ${T.borderGlow}` }}>
                <Network size={12} color={T.primary} />
              </div>
              <span className="font-bold text-sm" style={{ color: T.text, fontFamily: T.sans }}>NexusAI</span>
            </div>
            <p className="text-xs" style={{ color: T.textDim, fontFamily: T.sans }}>
              AGI-grade AI infrastructure for the builders of tomorrow.
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.primary }} />
              <span className="text-[10px]" style={{ color: T.textDim, fontFamily: T.sans }}>All systems operational</span>
            </div>
          </div>
          {Object.entries(cols).map(([col, links]) => (
            <div key={col}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: T.textDim, fontFamily: T.sans }}>{col}</p>
              <ul className="flex flex-col gap-2">
                {links.map(l => <li key={l}><a href="#" className="text-xs hover:text-white transition-colors" style={{ color: T.textDim, fontFamily: T.sans }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6" style={{ borderTop: `1px solid ${T.border}` }}>
          <p className="text-xs" style={{ color: T.textDim, fontFamily: T.mono }}>© 2026 Nexus AI Corp.</p>
          <p className="text-xs" style={{ color: T.textDim, fontFamily: T.mono }}>SOC 2 · GDPR · ISO 27001</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Template08() {
  return (
    <div style={{ background: T.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <Navbar />
      <Hero />
      <Capabilities />
      <Stats />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
