# Design System

## Token System

Design tokens are defined as JavaScript modules in `src/design-system/tokens/` and re-exported from `src/design-system/tokens/index.js`. They are also mirrored in `tailwind.config.js` for use with utility classes.

### Import Paths

```ts
import { colors, tokens, typography, spacing, radius, shadows } from '@/design-system/tokens';
```

### Colors

#### Semantic Palette

| Token | Hex (500) | Usage |
|-------|-----------|-------|
| `primary` | `#6366f1` | Primary actions, links, active states |
| `neutral` | `#737373` | Text, backgrounds, borders |
| `success` | `#22c55e` | Success states, positive trends |
| `warning` | `#f59e0b` | Warnings, pending states |
| `danger` | `#ef4444` | Errors, destructive actions |
| `info` | `#3b82f6` | Informational states |

Each color has a full 50-950 scale:

```js
// src/design-system/tokens/colors.js
export const colors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',  // default
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  // success, warning, danger, info, neutral follow the same pattern
};
```

#### Theme Tokens

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

```js
// src/design-system/tokens/typography.js
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
  },
  fontSize: {
    display: ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
    h1: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
    h2: ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
    h3: ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
    h4: ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
    h5: ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '600' }],
    'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
    body: ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0' }],
    'body-sm': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0' }],
    caption: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
    label: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '500' }],
    mono: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0' }],
  },
};
```

### Spacing

```js
// src/design-system/tokens/spacing.js
export const spacing = {
  0: '0px',   1: '2px',   2: '4px',
  3: '8px',   4: '12px',  5: '16px',
  6: '20px',  7: '24px',  8: '32px',
  9: '40px',  10: '48px', 11: '64px',
  12: '80px', 13: '96px',
  container: {
    sm: '640px',  md: '768px',  lg: '1024px',
    xl: '1280px', '2xl': '1440px',
  },
};
```

### Border Radius

```js
// src/design-system/tokens/radius.js
export const radius = {
  none: '0px',    xs: '2px',   sm: '4px',
  md: '6px',      lg: '8px',   xl: '12px',
  '2xl': '16px',  '3xl': '20px', full: '9999px',
};
```

### Shadows

```js
// src/design-system/tokens/shadows.js
export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
  md: '0 4px 6px -2px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.03)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.12)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)',
  glass: '0 4px 30px rgb(0 0 0 / 0.06)',
};
```

## ThemeProvider

Located at `src/design-system/providers/ThemeProvider.tsx`.

The `ThemeProvider` manages three modes: `'light'`, `'dark'`, and `'system'`. It toggles the `dark` class on `<html>` and provides the resolved theme value.

```tsx
import { ThemeProvider } from '@/design-system';

function Root() {
  return (
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  );
}
```

### API

```tsx
const { theme, resolved, setTheme, toggle } = useTheme();

// theme: 'light' | 'dark' | 'system'  (stored preference)
// resolved: 'light' | 'dark'           (actual applied mode)
// setTheme: (theme) => void            (set a specific mode)
// toggle: () => void                    (toggle light/dark)
```

### Usage Example

```tsx
import { useTheme } from '@/design-system';
import { Moon, Sun, Monitor } from 'lucide-react';

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-1">
      <button onClick={() => setTheme('light')} data-active={theme === 'light'}>
        <Sun className="h-4 w-4" />
      </button>
      <button onClick={() => setTheme('dark')} data-active={theme === 'dark'}>
        <Moon className="h-4 w-4" />
      </button>
      <button onClick={() => setTheme('system')} data-active={theme === 'system'}>
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
```

## cn() Utility

The `cn()` utility combines `clsx` for conditional class joining with proper Tailwind class merging (via `tailwind-merge` pattern, currently using plain `clsx`).

```ts
// src/design-system/utils.ts
import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}
```

Usage:

```tsx
import { cn } from '@/design-system';

<div className={cn('base-class', condition && 'conditional-class', className)} />
```

## Using Design Tokens in Components

### Via Tailwind Classes (recommended)

```tsx
<div className="bg-primary-500 text-white rounded-lg p-4 shadow-md">
  Primary colored card
</div>

<div className="dark:bg-neutral-800 dark:text-neutral-100">
  Dark mode aware element
</div>
```

### Via Token Imports (for dynamic usage)

```tsx
import { tokens, typography } from '@/design-system/tokens';

function Component() {
  const { resolved } = useTheme();
  const themeTokens = tokens[resolved];

  return (
    <div style={{ backgroundColor: themeTokens.bg.primary }}>
      <p style={{ fontFamily: typography.fontFamily.sans.join(', ') }}>
        Content
      </p>
    </div>
  );
}
```

### Tailwind Config Integration

All tokens are registered in `tailwind.config.js`:

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: { /* primary, neutral, success, warning, danger, info */ },
      fontFamily: { sans: ['Inter', ...], mono: ['JetBrains Mono', ...] },
      fontSize: { display: ['3.25rem', { ... }] },
      boxShadow: { glass: '0 4px 30px rgba(0, 0, 0, 0.06)' },
      keyframes: { /* accordion animations */ },
      animation: { /* accordion-down, accordion-up */ },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-animate')],
};
```

## Component Library Overview

The component library contains **27 UI primitives** plus **6 composite components**:

| Category | Components | Count |
|----------|-----------|-------|
| UI Primitives | Button, Input, Card, Badge, Avatar, Modal, Drawer, Select, Switch, Checkbox, Textarea, Tabs, Accordion, Alert, Tooltip, Popover, DropdownMenu, CommandPalette, Table, Progress, Spinner, Skeleton, Separator, Kbd, EmptyState, Toast, | 27 |
| Layout | AppShell, Container, PageHeader | 3 |
| Forms | FormField | 1 |
| Data Display | StatCard | 1 |
| Auth | AuthLayout, OAuthButtons | 2 |
| AI | Chat | 1 |

All components are re-exported from `@/design-system`:

```tsx
import {
  Button, Input, Card, Badge, Avatar, Modal, Drawer, Tabs,
  Accordion, Alert, Tooltip, Select, SelectItem, Switch,
  Checkbox, Textarea, Popover, DropdownMenu, DropdownMenuItem,
  CommandPalette, useCommandPalette, Table, Progress, Spinner,
  Skeleton, Separator, Kbd, EmptyState,
  AppShell, Container, PageHeader, FormField, StatCard,
  Chat, AuthLayout, useTheme, cn, useGsapAnimation, useLenis,
  useBreakpoint, useMediaQuery, useClipboard, useLocalStorage, useScroll,
} from '@/design-system';
```
