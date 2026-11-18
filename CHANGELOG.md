# Sri Sankara TV — Changelog (CHANGELOG.md)

All notable changes to the Sri Sankara TV Production Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-rc1] - 2026-11-18

### Added
- **Monorepo Architecture**: Initialized npm workspaces structure spanning `apps/frontend`, `apps/admin`, `apps/backend`, and four shared packages (`shared`, `ui`, `constants`, `config`).
- **Atomic Design System**: Established Atomic Design hierarchy across frontend and admin applications.
- **Enterprise Design Tokens**: Implemented executive theme palette featuring Deep Navy (`#111C3E`), Corporate Slate (`#1E293B`), Accent Blue (`#243D83`), and Soft Off-White surfaces (`#F8FAFC`).
- **Authentication & RBAC Core**: JWT authentication with refresh token strategy and strict 5-tier role-based access control (`ep`, `production_head`, `cmo`, `accounts`, `crew`).
- **Unidirectional Workflow Engine**: EP Request Creation ➔ Production Head Scheduling & PAF Preparation ➔ Combined CMO Approval ➔ Durable Outbox Dispatch ➔ Crew Mobile Acknowledgement.
- **PAF Financial Engine**: Integer-paise / decimal-safe line item calculation (`Qty × Rate`) with automatic grand totals and strict zero-exposure data filters for EPs and Crew.
- **Crew Conflict Detector**: Time-window overlap evaluation accounting for reporting time, rolling time, pack-up time, and travel buffer margins.
- **Outbox Orchestration Engine**: Asynchronous outbox for Brevo transactional email, MSG91 voice calling, and Google/Microsoft calendar synchronization with automatic 30-minute voice retry and idempotency locks.
- **CMO Hourly Reminder Scheduler**: Automated background check issuing initial notifications and 60-minute interval pending reminders.
- **Comprehensive Documentation**: Complete documentation suite under `docs/` and root Markdown manuals (`README.md`, `USERS.md`, `TESTING.md`, `LOG.md`, `FILE_GUIDE.md`).
- **Automated Test Suite**: Acceptance tests covering scenarios T01 through T36 with in-memory MongoDB runner.
