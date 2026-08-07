# Animations

Animation library: **framer-motion** (v12). Used for page transitions, dashboard micro-interactions, and the landing templates. No GSAP, no Lenis.

## Patterns

### Page transitions

Lazy pages + `Suspense` give a natural loading boundary; add motion on mount:

```jsx
import { motion } from 'framer-motion'

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      ...
    </motion.div>
  )
}
```

### Staggered lists

```jsx
<motion.div initial="hidden" animate="show"
  variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
  {items.map(item => (
    <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
      ...
    </motion.div>
  ))}
</motion.div>
```

### Hover / tap affordances

```jsx
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  <Button>Submit</Button>
</motion.button>
```

### Modal / drawer entrances

framer-motion `AnimatePresence` + `motion.div` for exit animations:

```jsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50"
    />
  )}
</AnimatePresence>
```

## Rules

- Duration 0.15–0.3 s for UI; longer only for hero/landing sections.
- Respect `prefers-reduced-motion`: gate decorative animations.
- Animations live beside the component they animate — no global animation module.
- Landing templates may be more expressive; dashboard stays subtle.

## When Not to Animate

- Data tables (use the built-in loading/empty states).
- Form validation errors (appear instantly).
- Navigation between routes with heavy content — use `Suspense` fallback instead.
