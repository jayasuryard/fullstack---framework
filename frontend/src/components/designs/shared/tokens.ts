// Shared design token types and per-template palettes.
// Each template owns its own inline tokens for true independence.
// These types are re-exported so consuming code stays consistent.

export interface TemplateTokens {
  bg: string
  bgAlt: string
  surface: string
  surfaceHover: string
  border: string
  borderHover: string
  primary: string
  primaryMuted: string
  accent: string
  accentMuted: string
  text: string
  textMuted: string
  textDim: string
  success: string
  warning: string
  error: string
}

export interface TemplateMeta {
  id: string
  name: string
  category: string
  description: string
  colors: { name: string; value: string }[]
  fonts: string[]
  motion: string
}

export const TEMPLATE_REGISTRY: TemplateMeta[] = [
  {
    id: 'template-01',
    name: 'Enterprise Glass',
    category: 'CRM / ERP / HRMS',
    description: 'Sophisticated glass morphism for enterprise B2B software. Dark navy with indigo accents and backdrop-blur surfaces.',
    colors: [
      { name: 'Background', value: '#0A0F1E' },
      { name: 'Primary', value: '#6366F1' },
      { name: 'Accent', value: '#22D3EE' },
    ],
    fonts: ['Inter'],
    motion: 'Smooth professional slide-ins, glass shimmer, stagger reveals',
  },
  {
    id: 'template-02',
    name: 'Apple Premium',
    category: 'AI / SaaS / Dev Tools',
    description: 'Ultra-refined Apple-inspired minimal design. Pure white with precise typography and restrained micro-animations.',
    colors: [
      { name: 'Background', value: '#FFFFFF' },
      { name: 'Primary', value: '#0071E3' },
      { name: 'Text', value: '#1D1D1F' },
    ],
    fonts: ['SF Pro Display', 'system-ui'],
    motion: 'Subtle opacity fades, scale from 0.98, delayed staggered reveals',
  },
  {
    id: 'template-03',
    name: 'Linear Inspired',
    category: 'Productivity / Internal Tools',
    description: 'Developer-first precision design inspired by Linear. Dark with purple accents and monospace typography.',
    colors: [
      { name: 'Background', value: '#0E1117' },
      { name: 'Primary', value: '#7C3AED' },
      { name: 'Text', value: '#F3F4F6' },
    ],
    fonts: ['Inter', 'JetBrains Mono'],
    motion: 'Instant card reveals, keyboard-driven feel, precise micro-interactions',
  },
  {
    id: 'template-04',
    name: 'Dashboard First',
    category: 'Analytics / ERP / Finance',
    description: 'The product IS the hero. Light clean design with the dashboard visible above the fold — data-driven and analytical.',
    colors: [
      { name: 'Background', value: '#F8FAFC' },
      { name: 'Primary', value: '#3B82F6' },
      { name: 'Success', value: '#10B981' },
    ],
    fonts: ['Manrope'],
    motion: 'Sequential data reveals, counter animations, chart draw-ins',
  },
  {
    id: 'template-05',
    name: 'Minimal Swiss',
    category: 'Healthcare / Manufacturing',
    description: 'Swiss grid principles applied to SaaS. Maximum whitespace, bold typography as visual element, single red accent.',
    colors: [
      { name: 'Background', value: '#FFFFFF' },
      { name: 'Accent', value: '#EF4444' },
      { name: 'Text', value: '#0F0F0F' },
    ],
    fonts: ['Outfit'],
    motion: 'Horizontal grid reveals, bold text animations, clinical precision',
  },
  {
    id: 'template-06',
    name: 'Bold Startup',
    category: 'Marketplace / Booking / Travel',
    description: 'High-energy marketplace design with vivid coral and electric blue. Large bold typography and kinetic animations.',
    colors: [
      { name: 'Primary', value: '#FF4D4D' },
      { name: 'Secondary', value: '#4F46E5' },
      { name: 'Background', value: '#FAFAFA' },
    ],
    fonts: ['Plus Jakarta Sans'],
    motion: 'Spring physics, scale pulses, energetic stagger, parallax depth',
  },
  {
    id: 'template-07',
    name: 'Editorial',
    category: 'CMS / Content / LMS',
    description: 'Magazine editorial sensibility for content-first products. Warm cream, forest green, serif typography.',
    colors: [
      { name: 'Background', value: '#FAF7F2' },
      { name: 'Accent', value: '#2D5A27' },
      { name: 'Text', value: '#1A2E1A' },
    ],
    fonts: ['Playfair Display', 'Lora'],
    motion: 'Elegant deliberate reveals, page-turn feel, refined transitions',
  },
  {
    id: 'template-08',
    name: 'Futuristic AI',
    category: 'AI Platform / Automation / LLM',
    description: 'Cyberpunk aesthetic for AI-native products. Pure black with neon green/cyan — glow effects and scanning animations.',
    colors: [
      { name: 'Background', value: '#000000' },
      { name: 'Primary', value: '#00FF88' },
      { name: 'Secondary', value: '#00CCFF' },
    ],
    fonts: ['Space Grotesk'],
    motion: 'Scan line effects, glitch animations, neural pulse, terminal typing',
  },
  {
    id: 'template-09',
    name: 'Bento Experience',
    category: 'Developer Platform / API / Cloud',
    description: 'Bento grid hero showcasing product features as interactive cards. Slate dark with emerald accents.',
    colors: [
      { name: 'Background', value: '#0F172A' },
      { name: 'Surface', value: '#1E293B' },
      { name: 'Accent', value: '#10B981' },
    ],
    fonts: ['DM Sans'],
    motion: 'Spring card entrances, hover levitation, sequential bento reveal',
  },
  {
    id: 'template-10',
    name: 'Luxury Corporate',
    category: 'Enterprise / Government / Finance',
    description: 'Stately near-black with 22K gold accents. Authoritative, exclusive — built for Fortune 500 and public sector.',
    colors: [
      { name: 'Background', value: '#0A0A0A' },
      { name: 'Gold', value: '#C9A84C' },
      { name: 'Cream', value: '#F5F5F0' },
    ],
    fonts: ['Cormorant Garamond', 'Montserrat'],
    motion: 'Stately controlled reveals, cinematic transitions, gold border animations',
  },
]
