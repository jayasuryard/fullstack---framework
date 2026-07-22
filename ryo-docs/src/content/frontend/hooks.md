# Hooks

## useAuth

**File:** `src/hooks/useAuth.tsx`

Provides authentication state and methods throughout the app. Requires `AuthProvider` in the component tree.

### Import

```tsx
import { useAuth } from '@/hooks/useAuth';
```

### Return Value

```ts
interface UseAuthReturn {
  user: User | null;       // Current user object or null
  loading: boolean;        // True during initial profile fetch
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
}
```

### User Type

```ts
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  avatar?: string;
  phone?: string;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
}
```

### Examples

**Login page:**

```tsx
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/design-system';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // User is set, ProtectedRoute will redirect to dashboard
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}
      <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit" className="w-full">Sign in</Button>
    </form>
  );
}
```

**Protected check:**

```tsx
const { user, loading } = useAuth();

if (loading) return <Spinner />;
if (!user) return <Navigate to="/login" replace />;
```

**Role-based rendering:**

```tsx
const { user } = useAuth();

{user?.role === 'ADMIN' && <AdminPanel />}
```

**Logout:**

```tsx
const { logout } = useAuth();

<Button onClick={logout}>Sign out</Button>
```

---

## useBreakpoint

**File:** `src/design-system/hooks/useBreakpoint.ts`

Returns the current responsive breakpoint and boolean flags.

### Import

```tsx
import { useBreakpoint } from '@/design-system';
```

### Return Value

```ts
{
  isSm: boolean;       // width >= 640px
  isMd: boolean;       // width >= 768px
  isLg: boolean;       // width >= 1024px
  isXl: boolean;       // width >= 1280px
  is2xl: boolean;      // width >= 1440px
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}
```

### Examples

```tsx
function ResponsiveSidebar() {
  const { isLg } = useBreakpoint();

  if (!isLg) return <Drawer trigger={<Button>Menu</Button>}>...</Drawer>;
  return <aside className="w-64">Sidebar content</aside>;
}

function DataTable() {
  const { breakpoint } = useBreakpoint();

  return (
    <Table
      columns={breakpoint === 'sm' ? compactColumns : fullColumns}
      data={data}
    />
  );
}
```

---

## useMediaQuery

**File:** `src/design-system/hooks/useMediaQuery.ts`

Evaluates a CSS media query string and returns whether it matches.

### Import

```tsx
import { useMediaQuery } from '@/design-system';
```

### Signature

```ts
function useMediaQuery(query: string): boolean
```

### Examples

```tsx
const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
const isHighDPI = useMediaQuery('(min-resolution: 2dppx)');
const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');

// Usage
{!isReducedMotion && <AnimatedSection />}
```

---

## useClipboard

**File:** `src/design-system/hooks/useClipboard.ts`

Provides copy-to-clipboard functionality with a temporary "copied" state.

### Import

```tsx
import { useClipboard } from '@/design-system';
```

### Signature

```ts
function useClipboard(timeout?: number): { copy: (text: string) => Promise<boolean>; copied: boolean }
```

### Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `timeout` | `number` | `2000` | Duration (ms) the `copied` flag remains `true` |

### Return Value

| Value | Type | Description |
|-------|------|-------------|
| `copy` | `(text) => Promise<boolean>` | Copies text to clipboard, returns success |
| `copied` | `boolean` | `true` for `timeout` ms after copying |

### Example

```tsx
function CopyButton({ text }: { text: string }) {
  const { copy, copied } = useClipboard();

  return (
    <Button variant="outline" onClick={() => copy(text)}>
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}
```

### Copy API Key

```tsx
function ApiKeyDisplay({ key }: { key: string }) {
  const { copy, copied } = useClipboard();

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 rounded bg-neutral-100 px-3 py-2 text-sm font-mono">{key}</code>
      <Button size="sm" variant="outline" onClick={() => copy(key)}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
```

---

## useLocalStorage

**File:** `src/design-system/hooks/useLocalStorage.ts`

Persists state to `localStorage` with a `useState`-like API.

### Import

```tsx
import { useLocalStorage } from '@/design-system';
```

### Signature

```ts
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void]
```

### Return Value

| Position | Name | Description |
|----------|------|-------------|
| `[0]` | `stored` | Current value |
| `[1]` | `set` | Set a new value (accepts updater function) |
| `[2]` | `remove` | Remove key from localStorage, reset to initialValue |

### Examples

```tsx
function ThemePreference() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme-preference', 'light');

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}

function SidebarState() {
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);

  return (
    <Button onClick={() => setCollapsed((prev) => !prev)}>
      {collapsed ? 'Expand' : 'Collapse'}
    </Button>
  );
}

function ResetableSetting() {
  const [value, setValue, removeValue] = useLocalStorage('setting', 'default');

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={removeValue}>Reset to default</button>
    </div>
  );
}
```

---

## useScroll

**File:** `src/design-system/hooks/useScroll.ts`

Tracks scroll position, direction, and viewport boundaries.

### Import

```tsx
import { useScroll } from '@/design-system';
```

### Return Value

```ts
{
  y: number;               // Current window.scrollY
  direction: 'up' | 'down'; // Last scroll direction
  atTop: boolean;          // scrollY < 10
  atBottom: boolean;       // Near bottom of page
}
```

### Examples

```tsx
function ScrollAwareHeader() {
  const { y, direction } = useScroll();

  return (
    <header className={cn(
      'fixed top-0 w-full transition-transform duration-200',
      direction === 'down' && y > 100 ? '-translate-y-full' : 'translate-y-0'
    )}>
      Header content
    </header>
  );
}

function BackToTop() {
  const { y } = useScroll();

  if (y < 500) return null;

  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      Back to top
    </button>
  );
}

function ScrollProgress() {
  const { y, atBottom } = useScroll();
  const progress = Math.min((y / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100);

  return <div className="fixed top-0 left-0 h-1 bg-primary-500 transition-all" style={{ width: `${progress}%` }} />;
}
```

---

## useCommandPalette

**File:** `src/design-system/components/ui/Command.tsx`

Manages the open/close state of the command palette and registers the `Cmd+K` / `Ctrl+K` keyboard shortcut.

### Import

```tsx
import { useCommandPalette } from '@/design-system';
```

### Return Value

```ts
{
  open: boolean;
  setOpen: (open: boolean) => void;
}
```

### Example

```tsx
import { CommandPalette, useCommandPalette } from '@/design-system';
import { useNavigate } from 'react-router-dom';

function AppCommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();

  const items = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      shortcut: ['G', 'D'],
      onSelect: () => navigate('/app/dashboard'),
    },
    {
      id: 'users',
      label: 'Go to Users',
      icon: <Users className="h-4 w-4" />,
      shortcut: ['G', 'U'],
      onSelect: () => navigate('/app/users'),
    },
    {
      id: 'settings',
      label: 'Open Settings',
      icon: <Settings className="h-4 w-4" />,
      onSelect: () => navigate('/app/settings'),
    },
  ];

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      items={items}
      placeholder="Search pages and actions..."
    />
  );
}
```

Keyboard behavior is handled automatically:
- `Cmd+K` / `Ctrl+K` toggles open
- `Escape` closes
- `ArrowDown` / `ArrowUp` navigates results
- `Enter` executes the selected item

---

## useGsapAnimation

See [Animations](./animations.md#usegsapanimation-hook) for full documentation.

```tsx
import { useGsapAnimation } from '@/design-system';

const ref = useGsapAnimation('fadeUp');
```

---

## useLenis / useLenisScrollTo

See [Animations - Lenis](./animations.md#lenis-smooth-scroll) for full documentation.

```tsx
import { useLenis, useLenisScrollTo } from '@/design-system';

useLenis({ duration: 1.2 });
const scrollTo = useLenisScrollTo();
```

---

## useTheme

See [Design System - ThemeProvider](./design-system.md#themeprovider) for full documentation.

```tsx
import { useTheme } from '@/design-system';

const { theme, resolved, setTheme, toggle } = useTheme();
```
