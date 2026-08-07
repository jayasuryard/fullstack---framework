# Design System

The design system is the `src/components/common/` kit + Tailwind CSS 4 theme tokens. No token JSON files, no `tailwind.config.js` — Tailwind 4 defines tokens as CSS.

## Tailwind 4 Setup

`vite.config.js` registers the Tailwind Vite plugin; the app CSS holds the theme:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  /* spacing / radius / font tokens */
}
```

Tokens → utilities automatically (`bg-brand-500`, `text-brand-600`). No config file to maintain.

## Visual Language

- Colors: semantic tokens (brand, success, warning, danger, neutral) — defined in `@theme`, consumed as utilities.
- Radii/spacing: Tailwind defaults unless overridden in `@theme`.
- Typography: system font stack (default Tailwind) — swap by adding `--font-sans` in `@theme`.
- Dark mode: class strategy — toggling a class on the root flips `dark:` variants.

## Component Kit

| Group | Exports |
|-------|---------|
| Actions | `Button` (variants, loading, icon) |
| Display | `Badge`, `Card`, `StatCard`, `Icon3D`, `WelcomeBanner` |
| Forms | `Input`, `Select`, `SearchableSelect`, `Calendar`, `PhoneInput` (+ `formatPhoneForApi`) |
| Feedback | `Toast` + `useToast`, `Loading`, `Modal` |
| Data | `Table` (loading/empty states) |
| Profile | `ProfileModal` |

Import from the barrel: `import { Button, Table } from '../components/common'`.

## Responsive Rules

- Mobile-first; `sm:`/`md:`/`lg:` breakpoints.
- `MainLayout` sidebar hidden below `md`, `MobileLayout` bottom nav shown only below `md`.
- Tables scroll horizontally on small screens (wrap in `overflow-x-auto`).

## Page Layout Convention

```
Header:  page title left, primary action right
Body:    StatCard grid → filter row → Card(Table)
States:  Loading / empty / error / success (toast)
```

## Landing Templates (designs)

`src/components/designs/` holds 10 landing-page templates in **TSX** (the only TypeScript in the app). They are:

- Lazy-loaded (`React.lazy`) in the gallery at `/designs` and `/designs/:id`.
- Styled with Tailwind + framer-motion; themeable via tokens.
- Built as standalone pages — copy one as the public marketing page.

## Icons

- Phosphor (`@phosphor-icons/react`) and lucide-react for UI; react-icons for brand glyphs.
- Icon components passed as props (`icon={<Receipt />}`) — keeps primitives icon-agnostic.

## Motion

framer-motion only; presets in page-level code, not a global animation layer. See [Animations](./animations).
