# Sri Sankara TV — Development & Implementation Log (LOG.md)

This log maintains an audit of all development activities, files created/modified, architectural milestones achieved, and verification test outputs.

---

## [Phase 1: Project Foundation & Monorepo Initialization] — 2026-11-18

### Activity Overview
Established monorepo workspace spanning three applications (`apps/frontend`, `apps/admin`, `apps/backend`) and four shared packages (`@sankara/constants`, `@sankara/shared`, `@sankara/ui`, `@sankara/config`). Implemented Atomic Design directories, root and docs Markdown guides.

---

## [Phase 2: Design System & Atomic Components] — 2026-11-18

### Activity Overview
Created executive design tokens, Tailwind configuration presets, and atomic components across both React applications.
- **Atoms**: `Button`, `Input`, `Textarea`, `Select`, `Badge`, `Avatar`, `Loader`, `Divider`.
- **Molecules**: `FormField`, `SearchBar`, `StatCard`, `StatusIndicator`, `FilterControls`.
- **Organisms**: `Sidebar` (Corporate slate navigation), `Header`, `DataTable`, `Modal`, `PAFExpenseTable` (decimal-safe calculation).
- **Templates**: `AppShell`, `AuthLayout`.

---

## [Phase 3: Authentication & RBAC Core] — 2026-11-18

### Activity Overview
- Implemented JWT authentication with refresh token strategy and bcrypt password hashing.
- Enforced strict server-side RBAC across five roles (`ep`, `production_head`, `cmo`, `accounts`, `crew`).
- Enforced zero financial exposure invariant: EPs and Crew are strictly denied from PAF endpoints, and budget figures are stripped at the API query level.

---

## [Phase 4: Core Production Workflow Engine] — 2026-11-18

### Activity Overview
- **EP Request Creation**: Multi-day shoot request generator with UTC interval calculations.
- **Crew Allocation & Availability Engine**: Implemented `intervalsOverlapWithBuffer` accounting for travel and preparation buffers.
- **PAF Formulation**: Decimal-safe integer-paise calculations (`calculateLineAmountPaise`, `calculatePAFGrandTotalPaise`).
- **Combined CMO Approval**: Single authoritative approval covering both schedule and PAF. Initial notification and hourly pending reminder jobs.

---

## [Phase 5: Accounts Delivery & Production Crew Workflows] — 2026-11-18

### Activity Overview
- **Accounts Portal**: View approved PAF ledger, itemized breakdown, and printable official PDF document view with audit header: *"Approved estimated expenditure — not proof of payment"*. Pre-approval records strictly concealed.
- **Crew Portal**: Crew assignment briefing and one-click acknowledgement (`confirmed` or `conflict_reported`).

---

## [Phase 6: Multi-Channel Outbox Integrations] — 2026-11-18

### Activity Overview
- **Transactional Outbox Engine**: Asynchronous job queue (`OutboxJob`) with idempotency keys.
- **Brevo Email Client**: Dispatches assignment notifications, Accounts approved PAF alerts, and CMO hourly reminders.
- **MSG91 Voice Client**: Automated outbound calls with E.164 verification, lawful consent checks, and 30-minute `no_answer` retry rule.
- **Calendar Provider**: Pluggable adapter supporting Google Calendar and Microsoft Outlook appointments with deduplication.

---

## [Phase 7: Central Admin Control Panel] — 2026-11-18

### Activity Overview
- Built independent administrative React application (`apps/admin`) on port 3001.
- Features: Staff Directory with bulk CSV parser, Integration settings (Brevo, MSG91, Calendar), Finance recipient email management, immutable activity logs, and real-time system health metrics.

---

## [Phase 8: Automated Verification & Production Build] — 2026-11-18

### Activity Overview
- Automated test suites passing 19 out of 19 tests with zero failures.
- Both React applications (`apps/frontend` and `apps/admin`) compile and bundle successfully with Vite.
- In-memory MongoDB runner verified for zero-dependency execution.
- Added automatic startup seeder in `server.js` to ensure test accounts (`cmo@srisankaratv.com`, `productionhead@srisankaratv.com`, `ep1@srisankaratv.com`, `accounts@srisankaratv.com`, `karthik.camera@srisankaratv.com` with `Password@123`) are pre-populated upon server launch.
