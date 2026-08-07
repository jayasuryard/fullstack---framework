// Design Gallery — Preview all 10 templates.
// Route this at /designs in App.jsx to browse the library.
// Click a card to render the full template in-page.

import React, { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ExternalLink } from 'lucide-react'
import { TEMPLATE_REGISTRY } from './shared/tokens'

const TEMPLATES = [
  lazy(() => import('./template-01')),
  lazy(() => import('./template-02')),
  lazy(() => import('./template-03')),
  lazy(() => import('./template-04')),
  lazy(() => import('./template-05')),
  lazy(() => import('./template-06')),
  lazy(() => import('./template-07')),
  lazy(() => import('./template-08')),
  lazy(() => import('./template-09')),
  lazy(() => import('./template-10')),
]

function TemplatePreviewCard({ meta, index, onOpen }: {
  meta: typeof TEMPLATE_REGISTRY[number]
  index: number
  onOpen: () => void
}) {
  const PALETTE_BG: Record<string, string> = {
    'template-01': '#0A0F1E',
    'template-02': '#FFFFFF',
    'template-03': '#0E1117',
    'template-04': '#F8FAFC',
    'template-05': '#FFFFFF',
    'template-06': '#FAFAFA',
    'template-07': '#FAF7F2',
    'template-08': '#000000',
    'template-09': '#0F172A',
    'template-10': '#0A0A0A',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={onOpen}>
      {/* Colour preview */}
      <div className="h-40 flex items-end p-4 relative overflow-hidden"
        style={{ background: PALETTE_BG[meta.id] ?? '#111' }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="text-6xl font-black" style={{
            color: meta.colors[0]?.value ?? '#fff',
            fontFamily: meta.fonts[0] ?? 'system-ui',
          }}>
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
        <div className="relative z-10 flex gap-2">
          {meta.colors.map(c => (
            <div key={c.name} className="w-6 h-6 rounded-full shadow"
              title={`${c.name}: ${c.value}`}
              style={{ background: c.value, border: '2px solid rgba(255,255,255,0.15)' }} />
          ))}
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <ExternalLink size={14} color="#fff" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest block mb-1"
              style={{ color: meta.colors[0]?.value ?? '#888', fontFamily: 'Inter, sans-serif' }}>
              {String(index + 1).padStart(2, '0')} · {meta.category}
            </span>
            <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              {meta.name}
            </h3>
          </div>
          <ArrowRight size={16} color="rgba(255,255,255,0.3)"
            className="flex-shrink-0 mt-1 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>
          {meta.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {meta.fonts.map(f => (
            <span key={f} className="px-2 py-0.5 rounded text-[10px]"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function DesignGallery() {
  const [active, setActive] = useState<number | null>(null)
  const ActiveTemplate = active !== null ? TEMPLATES[active] : null

  return (
    <div style={{ background: '#0D0D16', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }}>
            Ryo Framework · Design Templates
          </span>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>
            10 Premium Landing Page Systems
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Production-ready templates with unique design philosophies, typography, motion systems, and component libraries.
          </p>
          <div className="flex flex-wrap justify-center gap-5 mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span>React + TypeScript</span>
            <span>·</span>
            <span>Tailwind CSS 4</span>
            <span>·</span>
            <span>Framer Motion</span>
            <span>·</span>
            <span>Lucide Icons</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {TEMPLATE_REGISTRY.map((meta, i) => (
            <TemplatePreviewCard
              key={meta.id}
              meta={meta}
              index={i}
              onOpen={() => setActive(i)}
            />
          ))}
        </div>
      </div>

      {/* Full-screen template overlay */}
      <AnimatePresence>
        {active !== null && ActiveTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{ background: '#000' }}>
            {/* Close bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3"
              style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white">
                  Template {String(active + 1).padStart(2, '0')} — {TEMPLATE_REGISTRY[active]?.name}
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {TEMPLATE_REGISTRY[active]?.category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {active > 0 && (
                  <button onClick={() => setActive(a => (a ?? 0) - 1)}
                    className="text-xs px-3 py-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)' }}>
                    ← Prev
                  </button>
                )}
                {active < 9 && (
                  <button onClick={() => setActive(a => (a ?? 0) + 1)}
                    className="text-xs px-3 py-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)' }}>
                    Next →
                  </button>
                )}
                <button onClick={() => setActive(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Template render */}
            <Suspense fallback={
              <div className="flex items-center justify-center h-[80vh]">
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading template...</div>
              </div>
            }>
              <ActiveTemplate />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
