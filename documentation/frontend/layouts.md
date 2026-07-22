# Layouts

## AppShell

**File:** `src/design-system/components/layout/AppShell.tsx`

The core application shell for authenticated pages. Provides a responsive sidebar (hidden on mobile), sticky navbar, and scrollable main content area.

### Import

```tsx
import { AppShell } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebar` | `ReactNode` | — | Sidebar content (hidden below `lg` breakpoint) |
| `navbar` | `ReactNode` | — | Top navigation bar content |
| `children` | `ReactNode` | — | Main content area |
| `sidebarCollapsed` | `boolean` | `false` | Collapses sidebar width to 64px |

### Structure

```
┌──────────────┬─────────────────────────────────┐
│              │          Navbar (h-14)           │
│   Sidebar    ├─────────────────────────────────┤
│   (w-64)     │                                 │
│              │       Main Content (flex-1)      │
│  LG+ only    │       overflow-auto p-6          │
│              │                                 │
└──────────────┴─────────────────────────────────┘
```

### Example

```tsx
<AppShell
  sidebar={
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center px-6 border-b">
        <Link to="/" className="text-xl font-bold text-primary-600">RF</Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-primary-50 text-primary-700">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link to="/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100">
          <Users className="h-4 w-4" />
          Users
        </Link>
      </nav>
    </div>
  }
  navbar={
    <div className="flex items-center justify-end px-6 h-full">
      <Avatar initials="JD" size="sm" />
    </div>
  }
>
  <YourPageContent />
</AppShell>
```

### Usage in DashboardLayout

The `DashboardLayout` component wraps `AppShell` with real navigation and auth:

```tsx
// src/components/layout/DashboardLayout.tsx
import { AppShell, Avatar, cn } from '@/design-system';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/app/users', icon: Users },
  { label: 'Organizations', path: '/app/organizations', icon: Building2 },
  { label: 'AI Chat', path: '/app/ai', icon: Bot },
  { label: 'Billing', path: '/app/billing', icon: CreditCard },
  { label: 'Notifications', path: '/app/notifications', icon: Bell },
  { label: 'Settings', path: '/app/settings', icon: Settings },
  { label: 'Admin', path: '/app/admin', icon: Shield },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center px-6 border-b">
        <Link to="/app/dashboard" className="text-xl font-bold text-primary-600">RF</Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {navItems.filter(/* admin check */).map((item) => (
          <Link key={item.path} to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-950 dark:text-primary-300'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return <AppShell sidebar={sidebar} navbar={navbar}>{children}</AppShell>;
}
```

---

## Container

**File:** `src/design-system/components/layout/Container.tsx`

A centered, responsive container with consistent horizontal padding.

### Import

```tsx
import { Container } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'lg'` | Max-width preset |
| Plus all native `HTMLAttributes` | | | |

### Size Reference

| Size | Max-Width | Use Case |
|------|-----------|----------|
| `sm` | `max-w-3xl` (768px) | Narrow forms, reading content |
| `md` | `max-w-5xl` (1024px) | Medium content pages |
| `lg` | `max-w-7xl` (1280px) | Default, dashboard pages |
| `xl` | `max-w-[1440px]` | Wide dashboards, admin panels |
| `full` | `max-w-full` | Full-bleed layouts |

### Examples

```tsx
<Container size="sm">
  <Card>
    <h1>Login</h1>
    <form>...</form>
  </Card>
</Container>

<Container size="xl">
  <PageHeader title="Dashboard" />
  <div className="grid grid-cols-3 gap-6">
    <StatCard title="Users" value="1,234" />
    <StatCard title="Revenue" value="$45,678" />
    <StatCard title="Active" value="89%" />
  </div>
</Container>
```

---

## PageHeader

**File:** `src/design-system/components/layout/PageHeader.tsx`

Standard page heading with title, optional description, and action slot.

### Import

```tsx
import { PageHeader } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Page heading text |
| `description` | `string` | — | Subtitle below heading |
| `actions` | `ReactNode` | — | Action buttons / controls |
| `className` | `string` | — | Additional classes |

### Examples

```tsx
// Simple
<PageHeader title="Users" description="Manage your team members" />

// With actions
<PageHeader
  title="Organizations"
  description="View and manage organizations"
  actions={<Button>Create Organization</Button>}
/>

// With multiple actions
<PageHeader
  title="Reports"
  actions={
    <>
      <Button variant="outline" icon={<Download className="h-4 w-4" />}>Export</Button>
      <Button icon={<Plus className="h-4 w-4" />}>New Report</Button>
    </>
  }
/>
```

---

## AuthLayout

**File:** `src/design-system/components/auth/AuthLayout.tsx`

Centered card layout for authentication pages (login, signup).

### Import

```tsx
import { AuthLayout } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Main heading |
| `subtitle` | `string` | — | Subheading text |
| `backTo` | `{ label: string, href: string }` | — | Back link above title |
| `children` | `ReactNode` | — | Form content |
| `className` | `string` | — | Additional classes |

### Example

```tsx
<AuthLayout
  title="Welcome back"
  subtitle="Sign in to your account to continue"
  backTo={{ label: "Back to home", href: "/" }}
>
  <form className="space-y-4">
    <Input label="Email" type="email" placeholder="you@example.com" />
    <Input label="Password" type="password" />
    <Button className="w-full">Sign in</Button>
  </form>
</AuthLayout>
```

### Render Structure

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            ← Back to home (optional)            │
│                                                 │
│              Welcome back                       │
│         Sign in to your account                 │
│                                                 │
│  ┌─────────────────────────────────────────────┐│
│  │              Form Content                    ││
│  │                                             ││
│  └─────────────────────────────────────────────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

Centered both vertically and horizontally. Max-width `max-w-sm` (384px).

---

## LandingLayout

**File:** `src/components/layout/LandingLayout.tsx`

Public-facing layout with fixed header, footer, and outlet for marketing pages.

### Import

```tsx
import LandingLayout from '@/components/layout/LandingLayout';
// Register in routes:
<Route path="/" element={<LandingLayout />}>
  <Route index element={<LandingPage />} />
</Route>
```

### Structure

- **Fixed header:** Logo, nav links (Features, Pricing, Docs), sign in / get started buttons. Has `backdrop-blur-lg` for glass effect.
- **Main content:** `<Outlet />` for nested routes. Adds `pt-16` when not on the home page.
- **Footer:** Logo, copyright.

```tsx
export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">RF</div>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">RyoFramework</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {/* Nav links */}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/app/login">Sign in</Link>
            <Link to="/app/signup"><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>
      <main className={/* pt-16 for non-home pages */}>
        <Outlet />
      </main>
      <footer>{/* Logo and copyright */}</footer>
    </div>
  );
}
```

---

## Composition Pattern

A complete page often composes multiple layout components together:

```tsx
function UsersPage() {
  return (
    <Container size="xl">
      <PageHeader
        title="Users"
        description="Manage team members and their roles."
        actions={<Button icon={<Plus className="h-4 w-4" />}>Add User</Button>}
      />

      <Card padding="none" className="overflow-hidden">
        <Table columns={columns} data={users} />
      </Card>
    </Container>
  );
}
```
