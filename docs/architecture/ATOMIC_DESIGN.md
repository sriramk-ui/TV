# Atomic Design System Architecture

Sri Sankara TV's frontend and admin user interfaces are engineered according to Brad Frost's **Atomic Design methodology**. This guarantees composability, modularity, visual consistency, and maintainability.

```text
Atoms ➔ Molecules ➔ Organisms ➔ Templates ➔ Pages
```

---

## 1. Hierarchy & Classification

### 1. Atoms (`components/atoms/`)
The foundational, indivisible UI elements of the design system. They have zero business logic and receive styling and behavioral parameters via props.
- `Button.jsx`: Variants (`primary`, `secondary`, `outline`, `danger`, `ghost`), sizes (`sm`, `md`, `lg`), loading spinner state.
- `Input.jsx`: Standardized text input, number input, time/date inputs with error borders and label attachments.
- `Textarea.jsx`: Multi-line responsive text area with character counts and autosizing.
- `Select.jsx`: Styled select dropdown with option groupings.
- `Badge.jsx`: Status indicators with semantic color mappings (`requested`, `pending_approval`, `approved`, `changes_requested`).
- `Avatar.jsx`: User initials badge with role color rings.
- `Loader.jsx`: Accessible CSS SVG spinner with size variants.
- `Divider.jsx`: Semantic horizontal and vertical partition lines.

### 2. Molecules (`components/molecules/`)
Combinations of two or more atoms functioning together as a focused unit.
- `FormField.jsx`: Unifies `Input`/`Select` with a label, required indicator, helper text, and validation error message.
- `SearchBar.jsx`: Input atom paired with search icon, clear button, and debounced input handler.
- `StatCard.jsx`: Metric display combining icon, title label, large numeric metric, and trend/subtext indicator.
- `NotificationItem.jsx`: Icon, timestamp, message text, and read/unread status badge.
- `FilterGroup.jsx`: Status dropdown filter and search input paired together.

### 3. Organisms (`components/organisms/`)
Distinct sections of the interface composed of molecules and atoms.
- `Sidebar.jsx`: Full-height responsive navigation drawer with brand mark, role-specific nav items, and user profile switcher.
- `Header.jsx`: Topbar with page eyebrow, title, action buttons, and mobile menu hamburger.
- `DataTable.jsx`: Accessible data table with pagination, sortable headers, empty states, and action buttons.
- `CalendarGrid.jsx`: Monthly and daily production scheduling view displaying active shoots, times, venues, and crew.
- `ShootForm.jsx`: Multi-day shoot request form with date picker and equipment requirements.
- `PAFExpenseTable.jsx`: Decimal-safe expense editor with live calculation (`amount = quantity × rate`), add row, and delete row.
- `ApprovalCard.jsx`: Merged review card presenting shoot occurrences, crew rosters, PAF line items, and Approve / Request Changes buttons.

### 4. Templates (`components/templates/`)
Page-level layout skeletons defining the grid and structural placement of organisms without hardcoded domain data.
- `AppShell.jsx`: Responsive layout incorporating sticky sidebar, top navigation, main content area, and toast overlay.
- `AuthLayout.jsx`: Centered corporate split-screen authentication screen with Sri Sankara TV branding.
- `FormLayout.jsx`: Standardized two-column form structure with sticky action bar.
- `PrintablePAFLayout.jsx`: Formal government/broadcast compliant printable PAF document template.

### 5. Pages (`pages/`)
Specific route endpoints that bind API services, local state, and validation logic into the templates.
