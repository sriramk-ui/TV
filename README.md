# Sri Sankara TV — Production Management System

> Enterprise web-based broadcast production lifecycle and workflow management platform for Sri Sankara TV. Built with React.js, Node.js, Express.js, MongoDB Atlas, Tailwind CSS, and Atomic Design.

---

## 1. Executive Summary

Sri Sankara TV Production Management System is a modern enterprise web application built to streamline the television channel's complete broadcast production lifecycle. It eliminates fragmented manual communication, paper approval bottlenecks, scheduling conflicts, and untracked expenditures.

The portal enforces a strict, unidirectional production sequence:
```
[Executive Producer Request] ➔ [Production Head Schedule & PAF Preparation] ➔ [Combined CMO Approval] ➔ [Automated Multi-Channel Dispatch & Accounts Delivery] ➔ [Crew Acknowledgement]
```

### Core Capabilities
- **Shoot Request Creation**: Executive Producers raise detailed single or multi-day shoot requests with reporting, rolling, and pack-up times, venues, and requirements. (Zero financial PAF access for EPs).
- **Crew Scheduling & Conflict Detection**: Production Head schedules crew, vehicles, and equipment with time-window collision detection and travel buffer validation.
- **Production Approval Form (PAF)**: Itemized, decimal-accurate financial budget estimates calculated automatically (`amount = quantity × rate`).
- **Combined CMO Approval**: CMO reviews and makes a single binding decision over the schedule and PAF together in one unified package.
- **Hourly Pending Reminders**: Background scheduled jobs issue initial notifications upon submission and hourly digest reminders while packages await CMO review.
- **Outbox Job Orchestration**: Once approved, durable background workers dispatch:
  1. Approved PAF notifications to configured Accounts/Finance recipients.
  2. Personalized shoot assignments via **Brevo Email**.
  3. Automated telephone voice dispatches via **MSG91 Voice**.
  4. Direct calendar appointment syncing via **Google Calendar** or **Microsoft Outlook**.
- **Crew Mobile Acknowledgement**: Assigned team members view assignment briefings and confirm acceptance or report conflicts.
- **System Administration & Auditability**: Full RBAC, user directory with CSV bulk import, consent tracking, delivery logs, and immutable audit trails.

---

## 2. Technology Stack

### Frontend Application (`apps/frontend`)
- **Framework**: React 18 / 19 with Vite
- **Styling**: Tailwind CSS, custom design tokens
- **Architecture**: Atomic Design System (Atoms, Molecules, Organisms, Templates, Pages)
- **Routing**: React Router DOM (v6+)
- **State Management**: React Context API + Custom Hooks
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT interceptors & CSRF protection

### Admin Application (`apps/admin`)
- **Framework**: React 18 / 19 with Vite
- **Styling**: Tailwind CSS, Enterprise Executive Slate/Navy Theme
- **Architecture**: Atomic Design System
- **Key Modules**: Staff Directory, CSV Importers, Integration Settings (Brevo, MSG91, Calendar), Finance Recipient Management, Audit & Outbox Monitor

### Backend API (`apps/backend`)
- **Runtime**: Node.js (v20+ / v24)
- **Framework**: Express.js REST API
- **Database ORM**: Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with refresh strategy and bcrypt password hashing
- **Authorization**: Server-side Role-Based Access Control (RBAC) with row-level ACL
- **Job Engine**: Transactional outbox pattern with scheduled background cron workers
- **Data Validation**: Joi / express-validator schemas

### Database
- **Database**: MongoDB Atlas (Cloud) / Local MongoDB replica/instance with test in-memory fallback
- **Features**: ACID multi-document transactions, compound unique indexes, optimistic concurrency control via document revisions

### Integrations
- **Email**: Brevo (Sendinblue) REST API with customizable transactional templates
- **Voice Calls**: MSG91 Voice API (instant outbound campaigns, E.164 verification, webhooks, 30-min retry)
- **Calendar**: Google Calendar API & Microsoft Graph Calendar API (pluggable provider strategy)

---

## 3. Monorepo Architecture

The workspace is organized as an npm workspaces monorepo:

```text
sri-sankara-production/
├── apps/
│   ├── frontend/         # React production operations portal (port 3000)
│   ├── admin/            # Centralized admin control panel (port 3001)
│   └── backend/          # Node/Express API, workers & integrations (port 5000)
├── packages/
│   ├── shared/           # Cross-app formatters, date/time IST utils, math helpers
│   ├── ui/               # Design tokens, shared atomic styling specs
│   ├── constants/        # Central roles, statuses, permissions, event types
│   └── config/           # Shared Tailwind presets and configuration constants
├── docs/                 # Exhaustive system, API, and architectural guides
├── tests/                # Automated unit, integration, and E2E test suites
└── scripts/              # Database seeders, deployment helpers, and health checkers
```

---

## 4. Prerequisites

- **Node.js**: `v20.0.0` or higher (verified on `v24.19.0`)
- **npm**: `v10.0.0` or higher (verified on `11.17.0`)
- **MongoDB**: MongoDB Atlas connection string or local MongoDB instance

---

## 5. Quick Start & Installation

### Step 1: Install Dependencies
From the repository root:
```bash
npm install
```
This single command installs all workspace dependencies for all apps and packages.

### Step 2: Configure Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```
Update `.env` with your MongoDB Atlas connection string, JWT secrets, and provider keys (or leave default sandbox mode enabled for local evaluation).

### Step 3: Seed Initial Data
Seed demo users, departments, and default settings:
```bash
npm run seed
```

### Step 4: Run Development Servers
Start backend API, frontend portal, and admin portal concurrently:
```bash
npm run dev
```

The services will be available at:
- **Backend REST API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Main Production Portal**: [http://localhost:3000](http://localhost:3000)
- **Admin Control Panel**: [http://localhost:3001](http://localhost:3001)

---

## 6. Testing

Run all automated test suites across backend and frontend:
```bash
npm test
```

For detailed testing instructions, acceptance matrices, and test case documentation, see [TESTING.md](./TESTING.md).

---

## 7. Documentation Index

- [USERS.md](./USERS.md) — Roles, permissions, credentials, and user workflows.
- [TESTING.md](./TESTING.md) — Test plan, coverage, test cases, and execution guide.
- [FILE_GUIDE.md](./FILE_GUIDE.md) — Directory map and module guide.
- [LOG.md](./LOG.md) — Chronological implementation log.
- [CHANGELOG.md](./CHANGELOG.md) — Release notes and revision history.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Contribution workflow and coding standards.
- [docs/](./docs/) — In-depth architectural blueprints and operational user guides.
