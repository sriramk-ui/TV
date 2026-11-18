# Sri Sankara TV — Testing Strategy & Verification Guide

This document specifies the testing strategy, test suites, acceptance criteria, and execution procedures for the Sri Sankara TV Production Management System.

---

## 1. Testing Strategy Overview

The testing architecture follows a strict verification pyramid:
1. **Unit Tests**: Data models, decimal paise arithmetic, time-window conflict detection algorithms, phone number validation (E.164), and JWT authentication middlewares.
2. **Integration / API Tests**: Supertest HTTP suite validating all REST API endpoints, role-based authorization (RBAC), row-level access control, and transaction boundaries.
3. **Outbox & Worker Tests**: Testing asynchronous dispatchers for Brevo email, MSG91 voice calling, calendar synchronization, and retry mechanisms.
4. **End-to-End (E2E) Flow Tests**: Simulating the complete production lifecycle from EP request submission through Head PAF creation, CMO combined approval, outbox dispatch, and Crew acknowledgement.

---

## 2. Testing Tools & Setup

- **Test Runner**: Jest / Mocha + Supertest
- **In-Memory Database**: MongoDB Memory Server (`mongodb-memory-server`) to ensure 100% reproducible, isolated tests without requiring an active external MongoDB daemon.
- **Mocking Providers**: Mocking Brevo REST API, MSG91 Voice HTTP calls, and Google/Microsoft Calendar APIs for deterministic execution.

---

## 3. Core Acceptance Criteria Matrix (T01 - T36)

The system is tested against the 36 critical acceptance scenarios mandated by the project specification:

| ID | Test Scenario | Expected Result | Verified By |
| :--- | :--- | :--- | :--- |
| **T01** | EP creates single-day request without PAF | Request saved as `requested`; no PAF required | API Test `shoots.test.js` |
| **T02** | EP creates 3-day request | Creates parent series + 3 child shoot occurrences | API Test `shoots.test.js` |
| **T03** | EP calls PAF create API endpoint | HTTP `403 Forbidden`; zero financial write | Security Test `rbac.test.js` |
| **T04** | EP opens direct printable PAF URL | HTTP `403 Forbidden`; no budget leak | Security Test `rbac.test.js` |
| **T05** | Production Head creates PAF for EP request | Correct totals, line items, and shoot linkage | Integration Test `paf.test.js` |
| **T06** | PAF line items 2×300 and 1×100 | Server-calculated total ₹700 (70,000 paise), not manually editable | Unit Test `paf_math.test.js` |
| **T07** | Head submits without crew assigned on one day | HTTP `422 Unprocessable Entity`; missing day flagged | Validation Test `shoots.test.js` |
| **T08** | One crew member assigned overlapping shoots | Blocked with conflict error message; highlights collided shoot | Algorithm Test `conflict.test.js` |
| **T09** | Non-overlapping same-day shoots with buffer | Allowed and saved successfully | Algorithm Test `conflict.test.js` |
| **T10** | Head submits multi-day package | One CMO approval item created, all occurrences `pending_approval` | Flow Test `approval.test.js` |
| **T11** | Initial CMO notification upon submission | Outbox job created and sent immediately | Outbox Test `outbox.test.js` |
| **T12** | Pending package over 60 minutes | Hourly reminder job enqueued and logged | Job Test `cron.test.js` |
| **T13** | CMO approves before next reminder | Further reminders suppressed for that package | Job Test `cron.test.js` |
| **T14** | CMO returns package with reason | Status `changes_requested`; no staff or Accounts notification | Flow Test `approval.test.js` |
| **T15** | CMO approves complete package | Atomically sets shoot & PAF to `approved`; outbox jobs created | Flow Test `approval.test.js` |
| **T16** | Finance recipient address not configured | Job held in `awaiting_configuration` status | Outbox Test `outbox.test.js` |
| **T17** | Brevo / Finance sender server down | Marked `retryable_failure`; scheduled for backoff retry | Outbox Test `outbox.test.js` |
| **T18** | Accounts receives approved PAF | Verified approved payload, correct total, and printable link | Flow Test `approval.test.js` |
| **T19** | EP views approved schedule | Schedule visible; rates and financial amounts completely stripped | Security Test `rbac.test.js` |
| **T20** | Calendar sync succeeds | External event ID persisted in `CalendarEvent` document | Integration Test `calendar.test.js`|
| **T21** | Calendar API times out | Job retried with idempotency key; no duplicate events created | Integration Test `calendar.test.js`|
| **T22** | New approved revision after amendment | Existing calendar event updated via PATCH; no stale duplicates | Integration Test `calendar.test.js`|
| **T23** | Approved shoot cancelled | Calendar events deleted; cancellation emails dispatched | Flow Test `shoots.test.js` |
| **T24** | Consenting staff voice call | Job queued with `attempt_number: 1` immediately post-approval | Outbox Test `voice.test.js` |
| **T25** | MSG91 webhook `no_answer` on attempt 1 | Attempt 2 scheduled for `+30 minutes` | Outbox Test `voice.test.js` |
| **T26** | MSG91 webhook `no_answer` on attempt 2 | Status set to `not_reached`; alert sent to Production Head; no 3rd call | Outbox Test `voice.test.js` |
| **T27** | Repeated identical webhook delivered | Processed idempotently; no duplicate retry or duplicate alert | Webhook Test `webhook.test.js` |
| **T28** | Call connected but unconfirmed | Status recorded as `connected`, distinct from `acknowledged` | Webhook Test `webhook.test.js` |
| **T29** | Staff reports conflict via voice call | Alert raised to Head; crew schedule remains unchanged until review | Webhook Test `webhook.test.js` |
| **T30** | Staff revokes voice consent | Voice opt-in set to false; pending calls immediately cancelled | Outbox Test `voice.test.js` |
| **T31** | Staff user deactivated | Login rejected; existing sessions invalidated; blocked from assignment | Security Test `auth.test.js` |
| **T32** | CSV import with invalid email or dupes | Transaction rolled back with exact row error; no partial corrupt import | Staff Test `staff_csv.test.js` |
| **T33** | Finance recipient list modified | Audited in `ActivityLog`; no duplicate send to existing recipients | Admin Test `settings.test.js` |
| **T34** | Worker run simultaneously (race condition) | Row-level idempotency lock prevents duplicate processing | Job Test `concurrency.test.js` |
| **T35** | Database backup restore verification | Verified collections, indexes, and document references intact | Database Test `schema.test.js` |
| **T36** | CMO account lockout / brute force | Rate limiter throttles after threshold; audit log alerts admin | Security Test `auth.test.js` |

---

## 4. How to Execute Tests

### Running All Automated Tests
```bash
npm test
```

### Running Backend API & Unit Tests Only
```bash
npm run test -w @sankara/backend
```

### Running Integration & RBAC Tests
```bash
npm run test:integration -w @sankara/backend
```

### Generating Coverage Reports
```bash
npm run test:coverage -w @sankara/backend
```
Coverage summaries and HTML reports are generated under `tests/test-reports/coverage/`.
