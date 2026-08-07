# Layouts

Two layouts cover authenticated screens — a desktop sidebar and a mobile bottom nav. Both are plain components in `src/components/`; product navigation is configured by editing the item arrays, not by forking the layouts.

## MainLayout (desktop)

**File:** `src/components/MainLayout.jsx`

- Persistent left sidebar + top bar + scrollable content area.
- Sidebar defined by `NAV_ITEMS`:

```jsx
const NAV_ITEMS = [
  { label: 'Dashboard',  to: '/admin/dashboard',   icon: <LayoutDashboard /> },
  { label: 'Invoices',   to: '/admin/invoices',    icon: <Receipt /> },
  { label: 'Customers',  to: '/admin/customers',   icon: <Users /> },
  { label: 'Settings',   to: '/admin/settings',    icon: <Settings /> },
]
```

- `to` routes are lazy pages registered in `App.jsx`.
- Shows the current user (avatar, name) with logout and profile modal actions.

## MobileLayout (mobile)

**File:** `src/components/MobileLayout.jsx`

- Bottom navigation bar for small screens; content scrolls above it.
- Items in `MOBILE_NAV_ITEMS` (same shape as `NAV_ITEMS`).
- Responsive strategy: both layouts mounted, CSS shows/hides by breakpoint.

## Choosing a Layout

Routing decides which shell wraps a page:

```jsx
// App.jsx
<Route element={<PrivateRoute allowedRoles={['admin']} />}>
  <Route element={<MainLayout />}>
    <Route path="/admin/dashboard" element={<DashboardPage />} />
  </Route>
</Route>
```

Public routes (`/login`, `/forgot-password`, `/reset-password`, `/designs`) render without a layout shell.

## Nav Patterns

- Active state: `NavLink` + Tailwind tokens.
- Sections: group items under a label if a module grows.
- Role-gated items: filter `NAV_ITEMS` with `hasRole(...)`.
- Badges on items: render a `<Badge>` inside the item when counts exist.

## Page Shell Recipe

Every authenticated page follows:

```
<MainLayout>
  header row: title + primary action (Button)
  content: Card / Table / StatCard grid
  loading: <Loading />
  empty: <Table emptyText="..." />
  errors: toast via useToast
</MainLayout>
```

Pages stay presentational: data comes from `useDataFetch`, mutations call `api.*` and toast results.
