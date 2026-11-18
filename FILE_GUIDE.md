# Sri Sankara TV — Project File & Directory Architecture Guide

This guide documents the purpose, responsibilities, and key dependencies for every folder and critical module across the monorepo.

---

## 1. Directory Tree Map

```text
sri-sankara-production/
│
├── apps/
│   ├── frontend/                 # Main operational production portal (React + Vite)
│   ├── admin/                    # Central system administrative console (React + Vite)
│   └── backend/                  # REST API server, database models & worker queues (Node + Express)
│
├── packages/
│   ├── shared/                   # Shared pure utilities (dates, currency, validation)
│   ├── ui/                       # Design tokens, theme variables & shared components
│   ├── constants/                # Enums for roles, statuses, event types & routes
│   └── config/                   # Shared Tailwind preset, ESLint & environment configurations
│
├── docs/                         # Exhaustive technical and operational documentation
│   ├── architecture/             # System diagrams, monorepo design, Atomic Design principles
│   ├── setup/                    # Local environment, docker, and Atlas configuration
│   ├── api/                      # OpenAPI specs, endpoint catalog, and payload examples
│   ├── database/                 # Schema definitions, entity relationships, and indexes
│   ├── workflows/                # Business state machines (EP, PAF, CMO, Outbox)
│   ├── deployment/               # Render, MongoDB Atlas, and production hosting guides
│   └── user-guides/              # Individual role manuals (EP, Head, CMO, Accounts, Crew)
│
├── tests/                        # Automated test suites and test plan documentation
│   ├── frontend/                 # React component, hook, and render unit tests
│   ├── backend/                  # Controller, model, validator, and algorithm tests
│   ├── integration/              # Multi-step API and outbox job processing tests
│   ├── e2e/                      # End-to-end simulated lifecycle tests
│   ├── test-cases/               # Test suites covering scenarios T01 - T36
│   ├── test-reports/             # Test execution outputs and code coverage metrics
│   └── markdown/                 # Markdown test specifications, bug reports, and plans
│
├── scripts/                      # DB migration, seeder, and diagnostic shell utilities
├── .github/workflows/            # CI/CD pipelines for linting, testing, and automated builds
│
├── package.json                  # Monorepo root workspace configuration
├── .gitignore                    # Git tracking exclusion rules
├── .env.example                  # Environment configuration template with security notes
├── README.md                     # High-level overview, quick start, and architecture
├── USERS.md                      # Roles, permission matrix, seed accounts, and operational guides
├── TESTING.md                    # Verification strategy, acceptance test matrix, and commands
├── LOG.md                        # Chronological development and progress log
├── FILE_GUIDE.md                 # This file: Directory and module reference
├── CHANGELOG.md                  # Release version history and roadmap notes
└── CONTRIBUTING.md               # Standards, conventions, and pull request procedures
```

---

## 2. Detailed Application Directory Guides

### 2.1. `apps/frontend/` (Main Production Portal)
The primary web portal utilized by Executive Producers, the Production Head, Accounts Officers, and Crew Members.
- `src/components/atoms/`: Smallest building blocks (Buttons, Inputs, Badges, Icons, Tooltips, Dividers, Loaders).
- `src/components/molecules/`: Form fields, Search bars, KPI stat cards, Date pickers, Notification items.
- `src/components/organisms/`: Enterprise Sidebar, Topbar, Data tables, Shoot calendar, PAF item table, Approval cards.
- `src/components/templates/`: Authentication layout, Operations layout, Form layout, Printable PAF view.
- `src/pages/`:
  - `LoginPage.jsx`: Clean branded authentication with SSO / credential support.
  - `DashboardPage.jsx`: Dynamic role-tailored dashboard with filtered metrics.
  - `ShootRequestPage.jsx`: EP multi-day request creation and tracking.
  - `SchedulePage.jsx`: Production Head workbench, calendar, crew assignment, conflict resolver.
  - `PAFManagementPage.jsx`: Decimal-safe expense editor and print preview.
  - `ApprovalCenterPage.jsx`: Unified CMO review panel with schedule + PAF side-by-side.
  - `AccountsPage.jsx`: Accounts department approved PAF view and PDF download.
  - `CrewPortalPage.jsx`: Crew assignment inspection and mobile one-click acknowledgement.
  - `NotificationsPage.jsx`: In-app notification center.

### 2.2. `apps/admin/` (Administrative Control Panel)
The central administrative portal used by the CMO and System Administrators to govern users, permissions, integrations, and audit trails.
- `src/pages/`:
  - `AdminDashboardPage.jsx`: System overview, server metrics, worker health, active users.
  - `StaffDirectoryPage.jsx`: User CRUD, role assignments, phone (E.164), voice consent, CSV import.
  - `IntegrationSettingsPage.jsx`: Credentials and testing sandbox for Brevo, MSG91, and Calendar.
  - `FinanceRecipientsPage.jsx`: Designated Accounts email address configuration with audit log.
  - `AuditLogPage.jsx`: Immutable activity trail with actor, action, IP, and diff snapshots.
  - `OutboxMonitorPage.jsx`: Delivery queue tracking for emails, calls, and calendar syncs with retry buttons.

### 2.3. `apps/backend/` (Central API & Business Logic Layer)
- `src/config/`: Database connection, environment parser, JWT settings, CORS policy.
- `src/models/`: Mongoose schemas (User, Staff, ShootRequest, ShootOccurrence, CrewAssignment, PAF, PAFLineItem, ApprovalRecord, OutboxJob, CalendarEvent, ActivityLog, SystemSettings).
- `src/controllers/`: Business logic handlers for auth, shoots, paf, approvals, staff, settings, webhooks.
- `src/middlewares/`: JWT authentication, RBAC authorization, row-level ACL, error handling, rate limiting.
- `src/validators/`: Input sanitization and validation schemas for requests, PAFs, and staff CSVs.
- `src/services/`: Conflict detection engine, PAF decimal arithmetic service, outbox dispatcher.
- `src/integrations/`:
  - `msg91/`: Automated voice calling service, webhook receiver, retry orchestrator.
  - `brevo/`: Transactional email templates and delivery API client.
  - `calendar/`: Pluggable adapter interface supporting Google Calendar and Microsoft Graph.
- `src/jobs/`: Background cron workers for hourly CMO reminders, voice call dispatchers, and outbox sweeps.

---

## 3. Packages Guide

- **`packages/constants/`**: Single source of truth for Role types, Shoot statuses, PAF statuses, Call states, and HTTP status codes.
- **`packages/shared/`**: Pure functions for Indian Rupee currency formatting, IST timezone conversions, time range collision algorithms, and phone sanitization.
- **`packages/ui/`**: Shared CSS color variables, font tokens, and Atomic Design constants.
- **`packages/config/`**: Shared Tailwind CSS configuration presets.
