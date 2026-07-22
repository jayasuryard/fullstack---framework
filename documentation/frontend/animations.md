# Animations

## GSAP Integration

GSAP (GreenSock Animation Platform) v3.12 is integrated with the ScrollTrigger plugin. The animation library is in `src/design-system/animations/gsap.ts`.

### Import

```tsx
import { useGsapAnimation, useGsapTimeline, animations } from '@/design-system';
```

### Pre-built Animation Presets

All presets accept a `gsap.TweenTarget` (element or selector) and an optional `delay` in seconds.

| Animation | Behavior |
|-----------|----------|
| `fadeIn` | Opacity 0 → 1 |
| `fadeUp` | Opacity 0, y: 20 → Opacity 1, y: 0 |
| `fadeDown` | Opacity 0, y: -20 → Opacity 1, y: 0 |
| `slideLeft` | Opacity 0, x: 20 → Opacity 1, x: 0 |
| `slideRight` | Opacity 0, x: -20 → Opacity 1, x: 0 |
| `scale` | Opacity 0, scale: 0.95 → Opacity 1, scale: 1 |
| `reveal` | clip-path: inset(0 100% 0 0) → inset(0 0% 0 0) |
| `counter` | Animates a number from start to end on a target element |
| `sectionReveal` | fadeUp + ScrollTrigger (triggers at `top 85%`) |
| `staggerList` | Staggered fadeUp for list children (0.05s interval) |
| `modalEnter` | Scale up for modal open |
| `modalExit` | Scale down for modal close |
| `pageEnter` | Subtle fade up for page transitions |
| `pageExit` | Subtle fade down for page transitions |

## useGsapAnimation Hook

The simplest way to animate a single element on mount.

```tsx
import { useGsapAnimation } from '@/design-system';

function FadeInBox() {
  const ref = useGsapAnimation('fadeUp');

  return <div ref={ref}>This fades up on mount</div>;
}
```

### With Dependencies

```tsx
function AnimatedContent({ visible }) {
  const ref = useGsapAnimation('scale', [visible]);

  return (
    <div ref={ref} style={{ display: visible ? 'block' : 'none' }}>
      Scales in when visible becomes true
    </div>
  );
}
```

## Direct Animation Usage

For more control, use the `animations` object directly with `useEffect`:

### Fade Up with Delay

```tsx
import { useEffect, useRef } from 'react';
import { animations } from '@/design-system';

function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animations.fadeUp(titleRef.current);
    animations.fadeUp(subtitleRef.current, 0.15);
    animations.fadeUp(ctaRef.current, 0.3);
  }, []);

  return (
    <div>
      <h1 ref={titleRef}>Welcome</h1>
      <p ref={subtitleRef}>Subtitle text</p>
      <div ref={ctaRef}><Button>Get Started</Button></div>
    </div>
  );
}
```

### Stagger List

```tsx
import { useEffect, useRef } from 'react';
import { animations } from '@/design-system';

function FeatureList({ features }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    animations.staggerList(listRef.current?.children || []);
  }, []);

  return (
    <ul ref={listRef} className="space-y-2">
      {features.map((f) => <li key={f}>{f}</li>)}
    </ul>
  );
}
```

### Counter

```tsx
import { useEffect, useRef } from 'react';
import { animations } from '@/design-system';

function AnimatedCounter({ end }: { end: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) animations.counter(ref.current, 0, end, 2);
  }, [end]);

  return <span ref={ref}>0</span>;
}
```

### Scroll-triggered Reveal (sectionReveal)

```tsx
import { useEffect, useRef } from 'react';
import { animations } from '@/design-system';

function ScrollSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animations.sectionReveal(ref.current);
  }, []);

  return (
    <div ref={ref} className="h-screen flex items-center justify-center">
      This section fades up when scrolled into view
    </div>
  );
}
```

## useGsapTimeline Hook

Creates a GSAP timeline for sequenced animations.

```tsx
import { useGsapTimeline } from '@/design-system';

function SequenceAnimation() {
  const tl = useGsapTimeline();

  useEffect(() => {
    const timeline = tl();
    timeline
      .fromTo('.box-1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 })
      .fromTo('.box-2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.15')
      .fromTo('.box-3', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3 });
  }, [tl]);

  return (
    <div>
      <div className="box-1">First</div>
      <div className="box-2">Second (overlaps)</div>
      <div className="box-3">Third</div>
    </div>
  );
}
```

---

## Lenis Smooth Scroll

Lenis v1.1 provides smooth scrolling with easing control. Integration is in `src/design-system/animations/lenis.ts`.

### useLenis Hook

Initializes a Lenis instance for smooth scrolling on the page.

```tsx
import { useLenis } from '@/design-system';

function SmoothScrollPage() {
  useLenis({
    duration: 1.2,
    smoothWheel: true,
  });

  return <div className="h-[300vh]">Smooth scrolling content</div>;
}
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `duration` | `1.2` | Scroll duration factor |
| `easing` | `t => min(1, 1.001 - 2^(-10t))` | Easing function |
| `orientation` | `'vertical'` | Scroll direction |
| `smoothWheel` | `true` | Enable smooth wheel scrolling |
| `wheelMultiplier` | `1` | Wheel speed multiplier |
| `touchMultiplier` | `2` | Touch speed multiplier |

Any additional options are passed through to the Lenis constructor.

### useLenisScrollTo Hook

Returns a function to programmatically scroll to an element or position with smooth animation.

```tsx
import { useLenisScrollTo } from '@/design-system';

function Navigation() {
  const scrollTo = useLenisScrollTo();

  return (
    <nav>
      <button onClick={() => scrollTo('#section-1')}>Section 1</button>
      <button onClick={() => scrollTo('#section-2', { duration: 2 })}>Section 2 (slow)</button>
      <button onClick={() => scrollTo(document.getElementById('footer')!)}>Footer</button>
    </nav>
  );
}
```

---

## Page Transition Animations

For page transitions, use `pageEnter` and `pageExit`:

```tsx
import { useEffect, useRef } from 'react';
import { animations } from '@/design-system';

function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animations.pageEnter(pageRef.current);
    return () => animations.pageExit(pageRef.current);
  }, []);

  return <div ref={pageRef}>Dashboard content</div>;
}
```

## Tailwind Animations

The project also includes Tailwind's `animate-in` utilities from `tailwindcss-animate` plugin for mount/unmount animations used by Radix-based components (Modal, Drawer, Tooltip, DropdownMenu, Popover). These are handled internally by the components.
