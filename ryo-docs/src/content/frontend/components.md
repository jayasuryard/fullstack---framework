# Components

UI primitives live in `frontend/src/components/common/` and are exported from the barrel `index.js`:

```jsx
import { Button, Badge, Card, Table, Input, Select, Modal, Loading, Toast } from '../components/common'
```

All components are plain React + Tailwind — no Radix, no Headless UI, no design-system package.

## Button

```jsx
<Button variant="primary" loading={saving} onClick={save} icon={<Icon />}>
  Save
</Button>
```

- `variant`: `primary` | `secondary` | `ghost` | `danger`
- `loading`: shows spinner, disables
- `icon`: leading icon node
- Sizes/rounded follow the app Tailwind tokens

## Badge

```jsx
<Badge tone="success">Active</Badge>
```

Tones for status/role chips: `success` | `warning` | `danger` | `neutral` | `info`.

## Card

```jsx
<Card title="Recent orders" actions={<Button>New</Button>}>
  ...
</Card>
```

Bordered container with optional `title`, `actions` slot, and body.

## Table

```jsx
<Table columns={[{ key: 'name', label: 'Name' }, { key: 'amount', label: 'Amount' }]}
       rows={items} loading={loading} emptyText="No items" />
```

Handles loading skeleton, empty state, and keyed rows.

## Input / Select / SearchableSelect

```jsx
<Input label="Email" name="email" value={v} error={err} onChange={...} />
<Select label="Role" options={[{ value: 'admin', label: 'Admin' }]} ... />
<SearchableSelect options={users} onSelect={...} />
```

- `Input`: labeled, error state, id/label wiring.
- `Select`: labeled dropdown.
- `SearchableSelect`: combobox with client-side filtering — for pickers over large lists.

## Calendar

```jsx
<Calendar value={date} onChange={setDate} />
```

`react-calendar` wrapper; styled with Tailwind tokens.

## Modal

```jsx
<Modal open={open} onClose={close} title="Confirm">
  ...
</Modal>
```

Backdrop, escape-to-close, focus containment, `title` header.

## Loading / Toast / useToast

```jsx
<Loading />                      // spinner block
const { toast } = useToast()
toast.success('Saved')           // transient notifications
toast.error('Failed')
```

## Dashboard Primitives

```jsx
<StatCard label="Revenue" value="$12,400" delta="+8%" icon={<Icon />} />
<Icon3D icon={<Icon />} />
<WelcomeBanner name={user.name} />
```

- `StatCard`: KPI card with optional delta and icon.
- `Icon3D`: stylized 3D-ish icon block for hero sections.
- `WelcomeBanner`: dashboard hero strip.

## ProfileModal / PhoneInput

```jsx
<ProfileModal open={open} onClose={close} />
<PhoneInput value={phone} onChange={...} />
formatPhoneForApi('+1 (415) 555-0100')   // → normalized string for the API
```

- `ProfileModal`: edit dialog (name, phone, photo crop via `react-easy-crop`) → calls `api.common.updateProfile` (FormData).
- `PhoneInput`: phone field with country formatting; `formatPhoneForApi` normalizes before submit.

## Adding a Primitive

1. Create `src/components/common/<Name>.jsx`.
2. Export from `src/components/common/index.js`.
3. Style with Tailwind utility classes only; reuse existing tokens.
