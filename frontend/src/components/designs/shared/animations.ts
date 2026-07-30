// Shared Framer Motion variant library for all 10 design templates.
// Import the variants that match your template's personality.

import type { Variants } from 'framer-motion'

// ── Universal ─────────────────────────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const staggerSlow: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
}

// ── Enterprise Glass (T01) ────────────────────────────────────────────────────
export const glassReveal: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export const glassCard: Variants = {
  rest:  { scale: 1, boxShadow: '0 4px 30px rgba(0,0,0,0.3)' },
  hover: { scale: 1.02, boxShadow: '0 8px 40px rgba(99,102,241,0.2)', transition: { duration: 0.3 } },
}

// ── Apple Premium (T02) ───────────────────────────────────────────────────────
export const appleFade: Variants = {
  hidden:  { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

export const appleText: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export const appleStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.3 } },
}

// ── Linear Inspired (T03) ────────────────────────────────────────────────────
export const linearSnap: Variants = {
  hidden:  { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}

export const linearRow: Variants = {
  hidden:  { opacity: 0, scaleX: 0.97 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.25 } },
}

export const linearStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05 } },
}

// ── Dashboard First (T04) ────────────────────────────────────────────────────
export const dashReveal: Variants = {
  hidden:  { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
}

export const countUp: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

// ── Minimal Swiss (T05) ──────────────────────────────────────────────────────
export const swissReveal: Variants = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const swissLine: Variants = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

// ── Bold Startup (T06) ───────────────────────────────────────────────────────
export const springPop: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
}

export const springSlide: Variants = {
  hidden:  { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
}

export const boldStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

// ── Editorial (T07) ──────────────────────────────────────────────────────────
export const editorialReveal: Variants = {
  hidden:  { opacity: 0, y: 32, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

export const imageReveal: Variants = {
  hidden:  { opacity: 0, scale: 1.05 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
}

// ── Futuristic AI (T08) ──────────────────────────────────────────────────────
export const glowPulse: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const scanReveal: Variants = {
  hidden:  { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.6, ease: 'easeOut' } },
}

// ── Bento Experience (T09) ───────────────────────────────────────────────────
export const bentoCard: Variants = {
  hidden:  { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 25 } },
}

export const bentoHover = {
  y: -6,
  scale: 1.02,
  transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
}

// ── Luxury Corporate (T10) ───────────────────────────────────────────────────
export const luxuryReveal: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
}

export const goldLine: Variants = {
  hidden:  { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 } },
}

export const luxuryStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.4 } },
}
