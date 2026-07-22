# Design System

## Overview

RyoFramework's design system is a **token-driven, themeable component library** built on **Radix UI** primitives with **Tailwind CSS** for styling. It provides a complete set of reusable UI components, layout patterns, animation utilities, and design tokens that ensure visual consistency across the entire application.

```
  ┌────────────────────────────────────────────────────┐
  │                   Design System                     │
  │                                                     │
  │  ┌────────────────────────────────────────────────┐ │
  │  │              Design Tokens                      │ │
  │  │  colors · typography · spacing · radius ·       │ │
  │  │  shadows · light/dark theme maps                │ │
  │  └────────────────────────────────────────────────┘ │
  │                      │                               │
  │                      ▼                               │
  │  ┌────────────────────────────────────────────────┐ │
  │  │            Tailwind Config                      │ │
  │  │  Tokens mapped to Tailwind utilities            │ │
  │  └────────────────────────────────────────────────┘ │
  │                      │                               │
  │                      ▼                               │
  │  ┌────────────────────────────────────────────────┐ │
  │  │         Component Library                       │ │
  │  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐  │ │
  │  │  │ UI (23)  │ │ Layout(3) │ │ Data(1)      │  │ │
  │  │  │ Button   │ │ AppShell  │ │ StatCard     │  │ │
  │  │  │ Card     │ │ Container │ │              │  │ │
  │  │  │ Modal    │ │ PageHeader│ │              │  │ │
  │  │  │ Tabs     │ │           │ │              │  │ │
  │  │  │ Table    │ └───────────┘ └──────────────┘  │ │
  │  │  │ Dropdown │ ┌───────────┐ ┌──────────────┐  │ │
  │  │  │ etc.     │ │ Forms(1)  │ │ AI(1)        │  │ │
  │  │  │          │ │ FormField │ │ Chat         │  │ │
  │  │  │          │ └───────────┘ └──────────────┘  │ │
  │  │  └──────────┘                                  │ │
  │  └────────────────────────────────────────────────┘ │
  │                      │                               │
  │                      ▼                               │
  │  ┌────────────────────────────────────────────────┐ │
  │  │             Animation System                    │ │
  │  │  GSAP (rich animations) + Lenis (smooth scroll) │ │
  │  └────────────────────────────────────────────────┘ │
  │                      │                               │
  │                      ▼                               │
  │  ┌────────────────────────────────────────────────┐ │
  │  │               Theme Provider                    │ │
  │  │  light / dark / system preference detection     │ │
  │  └────────────────────────────────────────────────┘ │
  └────────────────────────────────────────────────────┘
```

## Design Tokens

Design tokens are the foundation of the design system. They define every visual property in a centralized, version-controlled format. All tokens are defined as **JavaScript objects** in `src/design-system/tokens/` and consumed by both Tailwind's config (for utility classes) and component code (for dynamic styling).

### Color System

The color palette uses a 10-step scale (50–950) for each semantic color group, following the Tailwind convention.

#### Semantic Color Roles

| Token | Role | Usage |
|---|---|---|
| `primary` | Brand identity | Buttons, links, active states, selected items |
| `neutral` | UI chrome | Backgrounds, borders, text, dividers |
| `success` | Positive feedback | Confirmation messages, status badges |
| `warning` | Caution | Alerts, rate limits, expiring items |
| `danger` | Destructive actions | Delete buttons, error messages |
| `info` | Informational | Help text, feature indicators |

```js
// tokens/colors.js — Semantic palette
export const colors = {
  primary: {
    50: '#eef2ff',   100: '#e0e7ff',   200: '#c7d2fe',
    300: '#a5b4fc',  400: '#818cf8',   500: '#6366f1',
    600: '#4f46e5',  700: '#4338ca',   800: '#3730a3',
    900: '#312e81',  950: '#1e1b4b',
  },
  // neutral, success, warning, danger, info follow same pattern
};
```

#### Semantic Theme Tokens

The `tokens` object maps light and dark theme variants to semantic roles. Components reference these tokens rather than raw color values:

```js
export const tokens = {
  light: {
    bg: {
      primary: '#ffffff',
      secondary: '#fafafa',
      elevated: '#ffffff',
      hover: '#f5f5f5',
      selected: '#eef2ff',
      glass: 'rgba(255, 255, 255, 0.7)',
      overlay: 'rgba(0, 0, 0, 0.4)',
    },
    border: {
      divider: '#e5e5e5',
      muted: '#f0f0f0',
      strong: '#d4d4d4',
      interactive: '#6366f1',
    },
    text: {
      primary: '#171717',
      secondary: '#525252',
      muted: '#a3a3a3',
      disabled: '#d4d4d4',
      inverse: '#ffffff',
    },
  },
  dark: {
    bg: {
      primary: '#0a0a0a',
      secondary: '#171717',
      elevated: '#262626',
      hover: '#404040',
      selected: '#312e81',
      glass: 'rgba(10, 10, 10, 0.7)',
      overlay: 'rgba(0, 0, 0, 0.6)',
    },
    border: {
      divider: '#262626',
      muted: '#1f1f1f',
      strong: '#404040',
      interactive: '#818cf8',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a3a3a3',
      muted: '#525252',
      disabled: '#404040',
      inverse: '#0a0a0a',
    },
  },
};
```

### Typography

The type system uses **Inter** as the sans-serif font and **JetBrains Mono** for monospace. Font sizes are designed for a clear hierarchy:

| Token | Size | Line Height | Weight | Letter Spacing | Use Case |
|---|---|---|---|---|---|
| `display` | 3.25rem | 1.1 | 700 | -0.025em | Hero headings |
| `h1` | 2.25rem | 1.2 | 700 | -0.02em | Page titles |
| `h2` | 1.75rem | 1.25 | 600 | -0.015em | Section headings |
| `h3` | 1.375rem | 1.3 | 600 | -0.01em | Card titles |
| `h4` | 1.125rem | 1.4 | 600 | -0.005em | Sub-section titles |
| `h5` | 1rem | 1.5 | 600 | 0 | Small headings |
| `h6` | 0.875rem | 1.5 | 600 | 0 | Mini headings |
| `body-lg` | 1.125rem | 1.6 | 400 | 0 | Large body text |
| `body` | 0.9375rem | 1.6 | 400 | 0 | Default body text |
| `body-sm` | 0.8125rem | 1.5 | 400 | 0 | Secondary text |
| `caption` | 0.75rem | 1.5 | 400 | 0.01em | Captions, timestamps |
| `label` | 0.8125rem | 1.5 | 500 | 0.01em | Form labels |
| `mono` | 0.8125rem | 1.5 | 400 | 0 | Code, data |

```js
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
  },
  fontWeight: {
    light: '300', normal: '400',
    medium: '500', semibold: '600', bold: '700',
  },
  // fontSize map as shown above
};
```

### Spacing Scale

A 14-step spacing scale provides consistent padding, margin, and gap values:

| Token | Value | Example Usage |
|---|---|---|
| `0` | 0px | Reset |
| `1` | 2px | Button inner padding |
| `2` | 4px | Small icon gaps |
| `3` | 8px | Compact card padding |
| `4` | 12px | Form field padding |
| `5` | 16px | Default padding |
| `6` | 20px | Section spacing |
| `7` | 24px | Card padding |
| `8` | 32px | Between sections |
| `9` | 40px | Page section padding |
| `10` | 48px | Large spacing |
| `11` | 64px | Page margins |
| `12` | 80px | Hero spacing |
| `13` | 96px | Extreme spacing |

Container widths are also included in the spacing scale:

```js
container: {
  sm: '640px',  md: '768px',
  lg: '1024px', xl: '1280px',
  '2xl': '1440px',
}
```

### Border Radius

| Token | Value | Use Case |
|---|---|---|
| `none` | 0px | Full-bleed elements |
| `xs` | 2px | Tag/chip elements |
| `sm` | 4px | Compact inputs |
| `md` | 6px | Buttons, inputs (default) |
| `lg` | 8px | Cards, modals |
| `xl` | 12px | Large modals, drawers |
| `2xl` | 16px | Mega-modals |
| `3xl` | 20px | Hero sections |
| `full` | 9999px | Pills, badges, avatars |

### Shadows

| Token | Value | Usage |
|---|---|---|
| `xs` | `0 1px 2px 0 rgb(0 0 0 / 0.03)` | Subtle elevation |
| `sm` | `0 1px 3px 0 rgb(0 0 0 / 0.05)` | Cards on hover |
| `md` | `0 4px 6px -2px rgb(0 0 0 / 0.04)` | Default card shadow |
| `lg` | `0 10px 15px -3px rgb(0 0 0 / 0.05)` | Dropdowns, popovers |
| `xl` | `0 20px 25px -5px rgb(0 0 0 / 0.06)` | Modals |
| `2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.12)` | Full-screen overlays |
| `inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.04)` | Inset inputs |
| `glass` | `0 4px 30px rgb(0 0 0 / 0.06)` | Glassmorphism surfaces |

## Theme System

The `ThemeProvider` manages light/dark mode with system preference detection, using a **class-based** strategy (`dark` class on `<html>`).

### Theme Provider

```tsx
// providers/ThemeProvider.tsx
function ThemeProvider({ children, defaultTheme = 'system' }) {
  // Reads initial theme from localStorage or defaults to 'system'
  // Listens to prefers-color-scheme media query changes
  // Toggles 'dark' class on document.documentElement
  // Provides: theme, resolved, setTheme, toggle
}
```

### Theme Modes

| Mode | Behavior |
|---|---|
| `light` | Always light, ignores system preference |
| `dark` | Always dark, ignores system preference |
| `system` | Follows OS-level `prefers-color-scheme`; updates in real-time |

### Usage

```tsx
import { ThemeProvider, useTheme } from '@/design-system';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <YourApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, resolved, setTheme, toggle } = useTheme();
  return (
    <button onClick={toggle}>
      {resolved === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### Tailwind Integration

The `darkMode: 'class'` strategy in `tailwind.config.js` enables dark variants via the `dark:` prefix:

```tsx
<div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100" />
```

## Component Library

### Architecture

The component library is structured in four categories:

```
src/design-system/components/
├── ui/              # 23 generic UI primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Tabs.tsx
│   ├── DropdownMenu.tsx
│   ├── Tooltip.tsx
│   ├── Popover.tsx
│   ├── Accordion.tsx
│   ├── Alert.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Checkbox.tsx
│   ├── Switch.tsx
│   ├── Select.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Spinner.tsx
│   ├── Skeleton.tsx
│   ├── Separator.tsx
│   ├── Kbd.tsx
│   ├── Progress.tsx
│   ├── EmptyState.tsx
│   ├── Command.tsx
│   ├── Toast.tsx
│   ├── Drawer.tsx
│   └── index.ts
├── layout/          # App layout components
│   ├── AppShell.tsx
│   ├── Container.tsx
│   └── PageHeader.tsx
├── forms/           # Form-specific components
│   └── FormField.tsx
├── data-display/    # Data visualization
│   └── StatCard.tsx
├── auth/            # Auth-specific components
│   ├── AuthLayout.tsx
│   └── OAuthButtons.tsx
└── ai/              # AI-specific components
    └── Chat.tsx
```

### Component Design Principles

1. **Radix UI primitives** for behavior (keyboard navigation, focus management, ARIA attributes)
2. **`cn()` utility** for conditional class merging (based on `clsx`)
3. **Tailwind CSS** for all styling — no CSS modules, no styled-components
4. **Forwarded refs** via `React.forwardRef` for form library compatibility
5. **`asChild` pattern** from Radix's Slot for polymorphic components
6. **Loading states** built-in (Button has `loading` prop with spinner)
7. **Focus ring**: `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`

### Button Component (Reference Implementation)

```tsx
// components/ui/Button.tsx
export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  iconRight,
  asChild,
  children,
  ...props
}) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-150',
        'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],  // primary, secondary, outline, ghost, danger, link
        sizes[size],        // xs, sm, md, lg, xl
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {!loading && iconRight}
    </Comp>
  );
}
```

### Available Variants

| Variant | Style | Use Case |
|---|---|---|
| `primary` | Filled neutral-900/100 | Primary actions |
| `secondary` | Light neutral-100/800 | Secondary actions |
| `outline` | Bordered transparent | Tertiary actions |
| `ghost` | No border/fill, hover only | Toolbar actions |
| `danger` | Filled danger-600 | Destructive actions |
| `link` | Text only, underline on hover | Inline navigation |

### Sizes

| Size | Height | Padding | Font | Use Case |
|---|---|---|---|---|
| `xs` | 28px | 10px | xs | Compact tables |
| `sm` | 32px | 12px | sm | Form actions |
| `md` | 36px | 16px | sm | Default |
| `lg` | 40px | 20px | sm | Prominent actions |
| `xl` | 48px | 24px | base | Heroes, CTAs |

## Layout Components

### AppShell

The primary application layout with collapsible sidebar, navbar, and content area:

```tsx
<AppShell
  sidebar={<Sidebar />}
  navbar={<Navbar />}
  sidebarCollapsed={false}
>
  <Outlet />
</AppShell>
```

Structure:
```
┌──────────────┬──────────────────────────────┐
│              │  Navbar (h-14, backdrop-blur) │
│   Sidebar    ├──────────────────────────────┤
│  (hidden     │                              │
│   on <lg)    │   Main Content (overflow-auto)│
│   w-64 / w-16│                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

- Sidebar: hidden on mobile, shown on `lg:` breakpoint, collapsible `w-64`/`w-16`
- Navbar: `h-14` with `backdrop-blur-md` glass effect
- Content area: scrollable with `p-6` padding
- Full dark mode support via `dark:` variants

### Container

A centered content wrapper with responsive max-width:

```tsx
<Container size="lg">
  <PageContent />
</Container>
```

| Size | Max Width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1440px |
| `full` | None (100%) |

### PageHeader

Standard page header with title, description, and actions area:

```tsx
<PageHeader
  title="Users"
  description="Manage team members and their permissions"
  actions={<Button>Add User</Button>}
/>
```

Renders:
```
# Users
Manage team members and their permissions    [Add User]
```

## Animation System

### GSAP (GreenSock Animation Platform)

GSAP is used for rich, performant animations. The `ScrollTrigger` plugin handles scroll-driven reveals.

**Pre-built animation presets** (`animations/gsap.ts`):

| Animation | Effect | Duration | Use Case |
|---|---|---|---|
| `fadeIn` | Opacity 0 → 1 | 0.4s | Element entrance |
| `fadeUp` | Opacity 0 → 1, y 20 → 0 | 0.5s | Section reveals |
| `fadeDown` | Opacity 0 → 1, y -20 → 0 | 0.5s | Header entrance |
| `slideLeft` | Opacity 0 → 1, x 20 → 0 | 0.4s | Sidebar items |
| `slideRight` | Opacity 0 → 1, x -20 → 0 | 0.4s | Back navigation |
| `scale` | Opacity 0 → 1, scale 0.95 → 1 | 0.3s | Modal entrance |
| `reveal` | Clip-path inset reveal | 0.8s | Hero sections |
| `counter` | Number animation | 1.5s | Stat counters |
| `sectionReveal` | Fade up on scroll (ScrollTrigger) | 0.6s | Scroll reveals |
| `staggerList` | Staggered fade up items | 0.3s + stagger | Lists, grids |
| `modalEnter` | Modal appear | 0.2s | Modal dialogs |
| `modalExit` | Modal disappear | 0.15s | Modal close |
| `pageEnter` | Page transition in | 0.35s | Route transitions |
| `pageExit` | Page transition out | 0.2s | Route transitions |

**Hook usage**:

```tsx
import { useGsapAnimation, useGsapTimeline } from '@/design-system';

function FadeInSection() {
  const ref = useGsapAnimation('fadeUp', []);
  return <div ref={ref}>Content</div>;
}

function TimedSequence() {
  const timeline = useGsapTimeline();
  useEffect(() => {
    const tl = timeline();
    tl.to('.el1', { x: 100 })
      .to('.el2', { opacity: 1 })
      .to('.el3', { scale: 1.2 });
  }, []);
  return <div>...</div>;
}
```

### Lenis (Smooth Scrolling)

Lenis provides smooth, performant scrolling with configurable easing:

```tsx
import { useLenis } from '@/design-system';

function SmoothScrollLayout() {
  useLenis({
    duration: 1.2,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });
  return <div>{/* page content */}</div>;
}
```

Default easing: `min(1, 1.001 - pow(2, -10 * t))` — a custom exponential ease-out.

## Hooks

The design system provides reusable hooks in `src/design-system/hooks/`:

| Hook | Purpose | Returns |
|---|---|---|
| `useBreakpoint` | Current responsive breakpoint | `'sm' | 'md' | 'lg' | 'xl' | '2xl'` |
| `useMediaQuery` | Match CSS media query | `boolean` |
| `useClipboard` | Copy text to clipboard | `{ copy, copied }` |
| `useLocalStorage` | Persist state to localStorage | `[value, setValue]` |
| `useScroll` | Scroll position tracking | `{ scrollX, scrollY, direction }` |

## Responsive Design Approach

The framework uses a **mobile-first** responsive design with Tailwind breakpoints:

| Breakpoint | Min Width | Target |
|---|---|---|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1440px | Wide screens |

Key responsive patterns:

- **Sidebar**: Hidden on `<lg`, collapsed `w-16` or expanded `w-64` on `>=lg`
- **Navigation**: Bottom navigation on mobile, sidebar on desktop
- **Cards**: Single column on mobile, auto-fill grid on desktop
- **Tables**: Horizontal scroll on mobile, full table on desktop
- **Modals**: Full-screen on mobile, centered on desktop

## Accessibility

The design system targets **WCAG AA** compliance:

| Criterion | Implementation |
|---|---|
| **1.1.1 Non-text Content** | All icons have `aria-label` or visible text; `img` elements have `alt` |
| **1.4.3 Contrast** | Token values validated for 4.5:1 contrast ratio (text) and 3:1 (large text) |
| **1.4.12 Text Spacing** | No hardcoded line heights that override user preferences |
| **2.1.1 Keyboard** | All interactive elements are keyboard-navigable (Radix handles this) |
| **2.4.3 Focus Order** | Components follow logical tab order |
| **2.4.7 Focus Visible** | `focus-visible:ring-2` on all interactive elements |
| **3.2.1 On Focus** | No disruptive context changes on focus |
| **4.1.2 Name, Role, Value** | Radix primitives provide proper ARIA attributes |

## Utility: `cn()`

The `cn()` utility combines `clsx` for conditional classes with Tailwind class merging:

```ts
import { cn } from '@/design-system';

cn('px-4 py-2', isActive && 'bg-blue-500', className)
// Merges Tailwind classes, later classes win on conflicts
```

## Design System Entry Point

All exports are centralized in `src/design-system/index.ts`:

```ts
export { ThemeProvider, useTheme } from './providers';
export { useGsapAnimation, useGsapTimeline, animations } from './animations/gsap';
export { useLenis } from './animations/lenis';
export { useBreakpoint, useMediaQuery, useClipboard, useLocalStorage, useScroll } from './hooks';
export { cn } from './utils';
export * from './components/ui';
export { AppShell } from './components/layout/AppShell';
export { Container } from './components/layout/Container';
export { PageHeader } from './components/layout/PageHeader';
export { FormField } from './components/forms/FormField';
export { StatCard } from './components/data-display/StatCard';
export { Chat } from './components/ai/Chat';
export { AuthLayout } from './components/auth/AuthLayout';
```
