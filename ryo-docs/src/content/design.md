# Design System

No separate design-system package. The UI kit lives in `frontend/src/components/common/` and is exported through a barrel file:

```jsx
import { Button, Badge, Card, Table, Input, Select, Modal, Loading, Toast } from '../components/common'
```

## Foundation

- **Tailwind CSS 4** via the Vite plugin — no `tailwind.config.js`, no PostCSS config. Theme values are plain CSS `@theme` tokens in the app CSS.
- Icons: Phosphor (`@phosphor-icons/react`), lucide-react, and react-icons.
- Animations: framer-motion.
- Components are plain React + Tailwind; no Radix, no Headless UI, no component library dependency.

## Primitives (`src/components/common/`)

| Export | Purpose |
|--------|---------|
| `Button` | variants (primary/secondary/ghost/danger), loading state, icon slot |
| `Badge` | status/role chips |
| `Card` | bordered container with header/body slots |
| `Table` | data table with loading/empty states |
| `Input` | labeled input with error state |
| `Select` | labeled select |
| `SearchableSelect` | combobox with filtering |
| `Calendar` | date picker (react-calendar wrapper) |
| `Modal` | dialog with backdrop, focus, escape-to-close |
| `Loading` | spinner / skeleton block |
| `Toast` + `useToast` | transient notifications |
| `StatCard` | dashboard KPI card |
| `Icon3D` | stylized 3D-ish icon block |
| `WelcomeBanner` | dashboard hero strip |
| `ProfileModal` | edit-profile dialog (name/phone/photo) |
| `PhoneInput` + `formatPhoneForApi` | phone input + E.164-style normalization |

## Forms

- Plain controlled components; zod-like validation happens on the backend via `validateBody`.
- File inputs submit as `FormData` through `api.js` (auto-detected when a `File` is in the body).
- `formatPhoneForApi` normalizes the phone string before sending.

## Theming

- Tailwind 4 `@theme` tokens drive colors, spacing, radii.
- Dark mode: class-based (add the class on the root element).
- Component classes are co-located per component; no global CSS component layer.

## Pages and Templates

- Auth pages: Login, Forgot Password, Reset Password (`src/pages/auth/`).
- Dashboard: `src/pages/DashboardPage.jsx` with `StatCard` grid.
- Landing templates: `src/components/designs/` — 10 TSX templates, lazy-loaded in a gallery at `/designs`. This is the only TypeScript in the app.
