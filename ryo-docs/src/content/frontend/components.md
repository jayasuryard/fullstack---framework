# Components

All UI components are importable from `@/design-system`:

```tsx
import { Button, Input, Card, Badge, Avatar, Modal } from '@/design-system';
```

---

## Button

**File:** `src/design-system/components/ui/Button.tsx`

### Import

```tsx
import { Button } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'link'` | `'primary'` | Visual style |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size preset |
| `loading` | `boolean` | `false` | Shows spinner, disables click |
| `icon` | `ReactNode` | — | Icon before children |
| `iconRight` | `ReactNode` | — | Icon after children |
| `asChild` | `boolean` | `false` | Renders as Radix Slot (for wrapping Link components) |
| Plus all native `ButtonHTMLAttributes` | | | |

### Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="link">Link</Button>
```

### Sizes

```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Loading State

```tsx
<Button loading>Processing</Button>
```

### With Icons

```tsx
import { Plus, ArrowRight } from 'lucide-react';

<Button icon={<Plus className="h-4 w-4" />}>Add Item</Button>
<Button variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>Next Step</Button>
```

### As Child (for routing)

```tsx
import { Link } from 'react-router-dom';

<Button asChild>
  <Link to="/app/dashboard">Go to Dashboard</Link>
</Button>
```

---

## Input

**File:** `src/design-system/components/ui/Input.tsx`

### Import

```tsx
import { Input } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text, auto-generates `id` |
| `error` | `string` | — | Error message, shown below input |
| `hint` | `string` | — | Hint text (hidden when error is present) |
| `icon` | `ReactNode` | — | Icon at left of input |
| `iconRight` | `ReactNode` | — | Icon at right of input |
| Plus all native `InputHTMLAttributes` | | | |

### Basic

```tsx
<Input label="Email" type="email" placeholder="you@example.com" />
```

### With Error

```tsx
<Input label="Password" type="password" error="Password must be at least 8 characters" />
```

### With Hint

```tsx
<Input label="Username" hint="Choose a unique username" />
```

### With Icons

```tsx
import { Search, Mail } from 'lucide-react';

<Input icon={<Search className="h-4 w-4" />} placeholder="Search..." />
<Input label="Email" icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" />
```

---

## Textarea

**File:** `src/design-system/components/ui/Textarea.tsx`

### Import

```tsx
import { Textarea } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text |
| `error` | `string` | — | Error message |
| Plus all native `TextareaHTMLAttributes` | | | |

### Example

```tsx
<Textarea label="Description" placeholder="Enter a description..." rows={4} />
<Textarea label="Bio" error="Bio is required" />
```

---

## Card

**File:** `src/design-system/components/ui/Card.tsx`

### Import

```tsx
import { Card } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'glass'` | `'default'` | Visual style |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding preset |
| Plus all native `HTMLAttributes` | | | |

### Variants

```tsx
<Card variant="default">Default card with border</Card>
<Card variant="elevated">Elevated with shadow</Card>
<Card variant="outlined">Thick border, transparent bg</Card>
<Card variant="glass">Glassmorphism with backdrop blur</Card>
```

### Padding

```tsx
<Card padding="none">No padding (for custom content)</Card>
<Card padding="sm">p-4</Card>
<Card padding="md">p-5</Card>
<Card padding="lg">p-6</Card>
```

### Composition

```tsx
<Card variant="elevated" className="space-y-4">
  <h3 className="text-lg font-semibold">User Stats</h3>
  <div className="flex gap-4">
    <div>
      <p className="text-sm text-neutral-500">Total</p>
      <p className="text-2xl font-bold">1,234</p>
    </div>
    <div>
      <p className="text-sm text-neutral-500">Active</p>
      <p className="text-2xl font-bold">987</p>
    </div>
  </div>
</Card>
```

---

## Badge

**File:** `src/design-system/components/ui/Badge.tsx`

### Import

```tsx
import { Badge } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | Color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `dot` | `boolean` | `false` | Shows a colored dot indicator |
| Plus all native `HTMLAttributes` | | | |

### Variants

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="info">Info</Badge>
```

### Sizes

```tsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### With Dot

```tsx
<Badge variant="success" dot>Online</Badge>
<Badge variant="warning" dot>Away</Badge>
<Badge variant="danger" dot>Offline</Badge>
```

---

## Avatar

**File:** `src/design-system/components/ui/Avatar.tsx`

### Import

```tsx
import { Avatar } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image URL |
| `alt` | `string` | — | Alt text for image |
| `initials` | `string` | — | Initials fallback (preferred) |
| `fallback` | `string` | `'?'` | Fallback text when no src/initials |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size preset |

### Sizes

```tsx
<Avatar size="xs" initials="JD" />
<Avatar size="sm" initials="JD" />
<Avatar size="md" initials="JD" />
<Avatar size="lg" initials="JD" />
<Avatar size="xl" initials="JD" />
```

### With Image

```tsx
<Avatar src="/avatars/user.jpg" alt="Jane Doe" />
```

### Fallback Behavior

```tsx
<Avatar initials="JD" />                      {/* Shows "JD" */}
<Avatar fallback="?" />                        {/* Shows "?" */}
<Avatar src="/broken.jpg" initials="US" />     {/* Shows "US" on error */}
```

### With Custom Class Names

```tsx
<Avatar initials="AI" className="bg-primary-100 text-primary-700" />
```

---

## Modal

**File:** `src/design-system/components/ui/Modal.tsx`

Built on **Radix Dialog**. Includes overlay, close button, title, description.

### Import

```tsx
import { Modal } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open) => void` | — | Callback when open state changes |
| `title` | `string` | — | Dialog title |
| `description` | `string` | — | Dialog description |
| `trigger` | `ReactNode` | — | Element that opens the modal |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Max-width preset |
| `children` | `ReactNode` | — | Modal content |

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Modal open={open} onOpenChange={setOpen} title="Confirm Delete" description="This action cannot be undone.">
  <div className="flex gap-3 justify-end">
    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="danger">Delete</Button>
  </div>
</Modal>
```

### With Trigger

```tsx
<Modal trigger={<Button>Open Modal</Button>} title="Edit User" size="lg">
  <Input label="Name" defaultValue="Jane Doe" />
</Modal>
```

### Sizes

```tsx
<Modal size="sm">...</Modal>     {/* max-w-sm */}
<Modal size="md">...</Modal>     {/* max-w-md */}
<Modal size="lg">...</Modal>     {/* max-w-lg */}
<Modal size="xl">...</Modal>     {/* max-w-xl */}
<Modal size="full">...</Modal>   {/* max-w-[90vw] */}
```

---

## Drawer

**File:** `src/design-system/components/ui/Drawer.tsx`

Built on **Radix Dialog** (slide-in panel).

### Import

```tsx
import { Drawer } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open) => void` | — | Callback |
| `title` | `string` | — | Drawer header title |
| `trigger` | `ReactNode` | — | Element that opens the drawer |
| `side` | `'left' \| 'right'` | `'right'` | Slide-in side |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Max-width preset |

### Example

```tsx
<Drawer
  trigger={<Button variant="outline">Open Filters</Button>}
  title="Filters"
  side="right"
  size="sm"
>
  <div className="space-y-4">
    <Switch label="Active only" />
    <Select placeholder="Role">
      <SelectItem value="admin">Admin</SelectItem>
      <SelectItem value="member">Member</SelectItem>
    </Select>
  </div>
</Drawer>
```

---

## Select

**File:** `src/design-system/components/ui/Select.tsx`

Built on **Radix Select**.

### Import

```tsx
import { Select, SelectItem } from '@/design-system';
```

### Props (Select)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text |
| `error` | `string` | — | Error message |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `value` | `string` | — | Controlled value |
| `onValueChange` | `(value) => void` | — | Selection callback |
| `disabled` | `boolean` | `false` | Disabled state |

### Example

```tsx
<Select label="Role" placeholder="Choose a role" value={role} onValueChange={setRole}>
  <SelectItem value="admin">Administrator</SelectItem>
  <SelectItem value="manager">Manager</SelectItem>
  <SelectItem value="member">Member</SelectItem>
</Select>
```

### With Error

```tsx
<Select label="Country" error="Please select a country">
  <SelectItem value="us">United States</SelectItem>
  <SelectItem value="ca">Canada</SelectItem>
</Select>
```

---

## Switch

**File:** `src/design-system/components/ui/Switch.tsx`

Built on **Radix Switch**.

### Import

```tsx
import { Switch } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text, auto-generates `id` |
| `checked` | `boolean` | — | Controlled checked state |
| `onCheckedChange` | `(checked) => void` | — | Change callback |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | — | Custom ID |

### Example

```tsx
const [enabled, setEnabled] = useState(false);

<Switch label="Enable notifications" checked={enabled} onCheckedChange={setEnabled} />
```

---

## Checkbox

**File:** `src/design-system/components/ui/Checkbox.tsx`

Built on **Radix Checkbox**.

### Import

```tsx
import { Checkbox } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text |
| `checked` | `boolean` | — | Controlled checked state |
| `onCheckedChange` | `(checked) => void` | — | Change callback |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | — | Custom ID |

### Example

```tsx
const [agree, setAgree] = useState(false);

<Checkbox label="I agree to the terms" checked={agree} onCheckedChange={setAgree} />
```

---

## Tabs

**File:** `src/design-system/components/ui/Tabs.tsx`

Built on **Radix Tabs**.

### Import

```tsx
import { Tabs } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled value |
| `onValueChange` | `(value) => void` | — | Tab change callback |
| `tabs` | `{ value, label, icon?, content }[]` | — | Tab definitions |
| `className` | `string` | — | Additional classes |

### Example

```tsx
<Tabs
  tabs={[
    { value: 'overview', label: 'Overview', content: <OverviewPanel /> },
    { value: 'analytics', label: 'Analytics', content: <AnalyticsPanel /> },
    { value: 'settings', label: 'Settings', content: <SettingsPanel /> },
  ]}
/>
```

### With Icons

```tsx
import { Settings, BarChart3, FileText } from 'lucide-react';

<Tabs
  tabs={[
    { value: 'overview', label: 'Overview', icon: <FileText className="h-4 w-4" />, content: <Overview /> },
    { value: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, content: <Analytics /> },
    { value: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, content: <Settings /> },
  ]}
/>
```

---

## Accordion

**File:** `src/design-system/components/ui/Accordion.tsx`

Built on **Radix Accordion**.

### Import

```tsx
import { Accordion } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `{ value, title, content }[]` | — | Accordion items |
| `type` | `'single' \| 'multiple'` | `'single'` | Collapse behavior |
| `defaultValue` | `string \| string[]` | — | Default open item(s) |

### Example

```tsx
<Accordion
  type="single"
  defaultValue="item-1"
  items={[
    { value: 'item-1', title: 'What is RyoFramework?', content: <p>RyoFramework is a full-stack web application framework.</p> },
    { value: 'item-2', title: 'How do I get started?', content: <p>Sign up for an account and follow the onboarding guide.</p> },
    { value: 'item-3', title: 'Is it free?', content: <p>We offer a free tier with basic features.</p> },
  ]}
/>
```

### Multiple

```tsx
<Accordion type="multiple" defaultValue={['item-1', 'item-2']} items={items} />
```

---

## Alert

**File:** `src/design-system/components/ui/Alert.tsx`

### Import

```tsx
import { Alert } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Alert style |
| `title` | `string` | — | Bold title text |
| `children` | `ReactNode` | — | Alert body content |
| `dismissible` | `boolean` | `false` | Shows dismiss button |
| `onDismiss` | `() => void` | — | Dismiss callback |

### Examples

```tsx
<Alert variant="info" title="Note">Your account is being reviewed.</Alert>
<Alert variant="success">Changes saved successfully.</Alert>
<Alert variant="warning" title="Warning">Your subscription expires in 7 days.</Alert>
<Alert variant="danger" title="Error" dismissible onDismiss={() => {}}>
  Failed to save changes. Please try again.
</Alert>
```

---

## Tooltip

**File:** `src/design-system/components/ui/Tooltip.tsx`

Built on **Radix Tooltip**.

### Import

```tsx
import { Tooltip, TooltipProvider } from '@/design-system';
```

### Props (Tooltip)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | Tooltip text |
| `children` | `ReactNode` | — | Trigger element |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Tooltip position |
| `delay` | `number` | `300` | Open delay in ms |

### Usage

Wrap your app or section with `TooltipProvider`:

```tsx
<TooltipProvider>
  <Tooltip content="Settings" side="bottom">
    <Button size="sm" variant="ghost">
      <Settings className="h-4 w-4" />
    </Button>
  </Tooltip>
</TooltipProvider>
```

---

## Popover

**File:** `src/design-system/components/ui/Popover.tsx`

Built on **Radix Popover**.

### Import

```tsx
import { Popover } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | — | Element that opens the popover |
| `children` | `ReactNode` | — | Popover content |
| `open` | `boolean` | — | Controlled open |
| `onOpenChange` | `(open) => void` | — | Open callback |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Position |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment |

### Example

```tsx
<Popover trigger={<Button variant="outline">Filters</Button>}>
  <div className="space-y-3">
    <Switch label="Show active only" />
    <Select placeholder="Sort by">
      <SelectItem value="date">Date</SelectItem>
      <SelectItem value="name">Name</SelectItem>
    </Select>
    <Button size="sm" className="w-full">Apply</Button>
  </div>
</Popover>
```

---

## DropdownMenu

**File:** `src/design-system/components/ui/DropdownMenu.tsx`

Built on **Radix Dropdown Menu**.

### Import

```tsx
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/design-system';
```

### Props

| Component | Props | Description |
|-----------|-------|-------------|
| `DropdownMenu` | `trigger`, `children`, `align?` | Root wrapper |
| `DropdownMenuItem` | All Radix `DropdownMenuItemProps` | Menu item |
| `DropdownMenuSeparator` | — | Visual divider |
| `DropdownMenuLabel` | `children` | Section label |

### Example

```tsx
<DropdownMenu trigger={<Button variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>}>
  <DropdownMenuLabel>Actions</DropdownMenuLabel>
  <DropdownMenuItem onClick={() => console.log('edit')}>Edit</DropdownMenuItem>
  <DropdownMenuItem onClick={() => console.log('duplicate')}>Duplicate</DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem onClick={() => console.log('delete')} className="text-danger-600">Delete</DropdownMenuItem>
</DropdownMenu>
```

---

## CommandPalette

**File:** `src/design-system/components/ui/Command.tsx`

### Import

```tsx
import { CommandPalette, useCommandPalette } from '@/design-system';
```

### Props (CommandPalette)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open) => void` | — | Close callback |
| `items` | `CommandItem[]` | — | Flat list of commands |
| `groups?` | `{ label, items }[]` | — | Grouped commands |
| `placeholder?` | `string` | `'Search...'` | Input placeholder |

### CommandItem

```ts
interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string[];
  onSelect: () => void;
}
```

### Usage with Hook

```tsx
function MyPage() {
  const { open, setOpen } = useCommandPalette(); // Cmd+K / Ctrl+K

  const items = [
    { id: '1', label: 'Go to Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, shortcut: ['G', 'D'], onSelect: () => navigate('/app/dashboard') },
    { id: '2', label: 'Go to Settings', icon: <Settings className="h-4 w-4" />, shortcut: ['G', 'S'], onSelect: () => navigate('/app/settings') },
  ];

  return <CommandPalette open={open} onOpenChange={setOpen} items={items} />;
}
```

### With Groups

```tsx
<CommandPalette
  open={open}
  onOpenChange={setOpen}
  placeholder="Search commands..."
  groups={[
    {
      label: 'Navigation',
      items: [/* ... */],
    },
    {
      label: 'Actions',
      items: [/* ... */],
    },
  ]}
/>
```

---

## Table

**File:** `src/design-system/components/ui/Table.tsx`

### Import

```tsx
import { Table } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column<T>[]` | — | Column definitions |
| `data` | `T[]` | — | Data array |
| `loading` | `boolean` | `false` | Shows skeleton loader |
| `emptyMessage` | `string` | `'No data'` | Empty state text |
| `onRowClick` | `(item) => void` | — | Row click handler |
| `pagination` | `{ page, totalPages, onPageChange }` | — | Pagination controls |

### Column Definition

```ts
interface Column<T> {
  key: string;
  header: string;
  cell?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}
```

### Example

```tsx
const columns = [
  { key: 'name', header: 'Name', cell: (user) => <span className="font-medium">{user.firstName} {user.lastName}</span> },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', cell: (user) => <Badge variant="primary">{user.role}</Badge> },
  { key: 'status', header: 'Status', cell: (user) => <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'} dot>{user.status}</Badge> },
];

<Table
  columns={columns}
  data={users}
  loading={isLoading}
  onRowClick={(user) => navigate(`/app/users/${user.id}`)}
  pagination={{ page: 1, totalPages: 5, onPageChange: (p) => console.log(p) }}
/>
```

---

## Progress

**File:** `src/design-system/components/ui/Progress.tsx`

### Import

```tsx
import { Progress } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value |
| `max` | `number` | `100` | Maximum value |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar thickness |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color |
| `showLabel` | `boolean` | `false` | Shows percentage text |

### Examples

```tsx
<Progress value={75} />
<Progress value={45} size="sm" />
<Progress value={90} variant="success" showLabel />
<Progress value={100} max={200} variant="warning" />
```

---

## Spinner

**File:** `src/design-system/components/ui/Spinner.tsx`

### Import

```tsx
import { Spinner } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size preset |

### Example

```tsx
<Spinner size="sm" />
<Spinner />
<Spinner size="xl" />
```

---

## Skeleton

**File:** `src/design-system/components/ui/Skeleton.tsx`

### Import

```tsx
import { Skeleton } from '@/design-system';
```

### Props

Accepts all native `HTMLAttributes`. Apply your own width/height.

### Example

```tsx
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-32 w-full rounded-xl" />
</div>
```

---

## EmptyState

**File:** `src/design-system/components/ui/EmptyState.tsx`

### Import

```tsx
import { EmptyState } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | `Inbox` icon | Icon component |
| `title` | `string` | — | Main message |
| `description` | `string` | — | Subtitle |
| `action` | `ReactNode` | — | Call-to-action (usually a Button) |

### Example

```tsx
<EmptyState
  icon={<Users className="h-12 w-12" />}
  title="No users found"
  description="Get started by inviting your first team member."
  action={<Button>Invite Users</Button>}
/>
```

---

## Separator

**File:** `src/design-system/components/ui/Separator.tsx`

Built on **Radix Separator**.

### Import

```tsx
import { Separator } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction |

### Example

```tsx
<Separator />
<Separator orientation="vertical" className="h-8 mx-2" />
```

---

## Kbd

**File:** `src/design-system/components/ui/Kbd.tsx`

### Import

```tsx
import { Kbd } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keys` | `string[]` | — | Array of key names |

### Example

```tsx
<Kbd keys={['⌘', 'K']} />
<Kbd keys={['⌘', '⇧', 'P']} />
```

---

## FormField

**File:** `src/design-system/components/forms/FormField.tsx`

### Import

```tsx
import { FormField } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text |
| `error` | `string` | — | Error message |
| `hint` | `string` | — | Hint text |
| `required` | `boolean` | `false` | Shows asterisk |

### Example

```tsx
<FormField label="Email" error="Email is required" required>
  <Input placeholder="you@example.com" />
</FormField>

<FormField label="Bio" hint="Tell us about yourself">
  <Textarea rows={3} />
</FormField>
```

---

## StatCard

**File:** `src/design-system/components/data-display/StatCard.tsx`

### Import

```tsx
import { StatCard } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Label text |
| `value` | `string \| number` | — | Main value |
| `description` | `string` | — | Footer text |
| `icon` | `ReactNode` | — | Header icon |
| `trend` | `{ value: number, positive: boolean }` | — | Trend indicator |

### Example

```tsx
<StatCard
  title="Total Revenue"
  value="$12,345"
  icon={<DollarSign className="h-4 w-4" />}
  trend={{ value: 12.5, positive: true }}
  description="vs. previous month"
/>

<StatCard
  title="Active Users"
  value="1,234"
  trend={{ value: 3.2, positive: false }}
/>
```

---

## Chat

**File:** `src/design-system/components/ai/Chat.tsx`

### Import

```tsx
import { Chat } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `Message[]` | — | Message history |
| `onSend` | `(content) => void` | — | Send callback |
| `streaming` | `string` | — | Streaming text being received |
| `loading` | `boolean` | `false` | Disables input while loading |

### Message Type

```ts
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
```

### Example

```tsx
const [messages, setMessages] = useState<Message[]>([]);
const [streaming, setStreaming] = useState('');

async function handleSend(content: string) {
  const userMsg: Message = { id: uuid(), role: 'user', content, createdAt: new Date().toISOString() };
  setMessages(prev => [...prev, userMsg]);
  // Start streaming response...
}

<Chat messages={messages} onSend={handleSend} streaming={streaming} />
```

---

## Toast

**File:** `src/design-system/components/ui/Toast.tsx`

Uses **react-hot-toast**. The `ToastProvider` is rendered at the app root.

### Import

```tsx
import { ToastProvider } from '@/design-system';
// Rendered once in main.tsx

import toast from 'react-hot-toast';

// Usage anywhere in the app:
toast.success('Changes saved');
toast.error('Something went wrong');
toast('A plain toast');
```

---

## OAuthButtons

**File:** `src/design-system/components/auth/OAuthButtons.tsx`

### Import

```tsx
import { OAuthButtons } from '@/design-system';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'signin' \| 'signup'` | — | Button text variant |

### Example

```tsx
<OAuthButtons mode="signup" />
```
