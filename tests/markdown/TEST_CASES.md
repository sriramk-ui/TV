# Detailed Test Case Specifications (TEST_CASES.md)

This catalog details scenarios T01 through T36:

| ID | Title | Precondition | Input / Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **T01** | EP Single-Day Request | Logged in as EP | Submit shoot form without PAF | Created with status `requested` |
| **T02** | EP Multi-Day Request | Logged in as EP | Submit 3-day date range | 1 parent shoot + 3 occurrences |
| **T03** | EP Direct PAF Write Block | Logged in as EP | POST `/api/v1/pafs` | 403 Forbidden |
| **T04** | EP Printable PAF URL Leak | Logged in as EP | GET `/api/v1/pafs/1/print` | 403 Forbidden |
| **T05** | Head Creates PAF | Logged in as Head | POST `/api/v1/pafs` | PAF created, linked to shoot |
| **T06** | Decimal PAF Calculation | Head entering items | 2 × 300 + 1 × 100 | Total = 70,000 paise (₹700.00) |
| **T07** | Submission Without Crew | Shoot has 0 crew | POST `/api/v1/shoots/1/submit` | 422 Unprocessable Entity |
| **T08** | Overlapping Crew Conflict | Staff assigned 09:00-14:00 | Assign same staff 11:00-16:00 | Blocked with conflict error |
| **T09** | Non-Overlapping Same-Day | Staff assigned 06:00-11:00 | Assign same staff 15:00-20:00 | Allowed with buffer |
| **T10** | Head Combined Submit | Schedule & PAF ready | POST `/api/v1/shoots/1/submit` | Atomic transition to `pending_approval` |
| **T11** | Initial CMO Notification | Package submitted | Worker checks outbox | Outbox job created & sent |
| **T12** | Hourly Reminder Trigger | Package pending > 60m | Run reminder cron | Reminder email dispatched |
| **T13** | Reminder Cease on Approval | CMO approves | Run reminder cron | Zero reminders sent |
| **T14** | CMO Request Changes | Package pending | Decision: `changes_requested` | Package returned; 0 staff emails |
| **T15** | CMO Combined Approval | Package pending | Decision: `approve` | Atomic approval; 4 jobs enqueued |
| **T16** | Unconfigured Accounts Email| No email configured | Post-approval worker | Job marked `awaiting_configuration` |
| **T17** | Brevo Provider Down | Network error simulated | Outbox worker | Job marked `retryable_failure` |
| **T18** | Accounts Receives Approved PAF| Logged in as Accounts | GET `/api/v1/pafs` | Approved PAF visible with print link |
| **T19** | EP Redacted View | Logged in as EP | GET `/api/v1/shoots/1` | Schedule visible; PAF amounts null |
| **T20** | Calendar Sync Success | Approved shoot | Calendar worker | Event ID persisted in DB |
| **T21** | Calendar Timeout Idempotency | Timeout on write | Worker retries job | Single calendar event created |
| **T22** | Calendar Revision Update | Schedule amended | Calendar worker | Existing event updated via PATCH |
| **T23** | Cancellation Event Deletion | Shoot cancelled | Outbox worker | Calendar event deleted, cancel mail sent |
| **T24** | Consenting Voice Dispatch | Opted-in crew | Worker runs voice queue | Call attempt 1 queued |
| **T25** | MSG91 Webhook No-Answer 1 | Call 1 no_answer | Webhook received | Call attempt 2 scheduled +30m |
| **T26** | MSG91 Webhook No-Answer 2 | Call 2 no_answer | Webhook received | Status `not_reached`; alert Head |
| **T27** | Webhook Idempotency | Duplicate webhook | POST webhook twice | Processed once; zero extra retries |
| **T28** | Connected vs Acknowledged | User answers | Webhook `connected` | State `connected`, not acknowledged |
| **T29** | Voice Conflict Report | User reports conflict | Webhook received | Alert Head; schedule unchanged |
| **T30** | Staff Consent Revocation | Staff opts out | Update user opt-in | Pending calls suppressed |
| **T31** | User Deactivation | User deactivated | Attempt login / assign | 401 Unauthorized / assignment blocked |
| **T32** | Staff CSV Validation | Corrupt CSV row | POST `/api/v1/staff/import-csv` | Rollback with exact line error |
| **T33** | Finance Recipient Change | CMO updates address | PUT `/api/v1/admin/settings` | Audited in ActivityLog |
| **T34** | Worker Concurrency Lock | 2 workers race | Simultaneous run | Handled by lock; zero duplicate sends |
| **T35** | Database Schema Integrity | Database inspection | Query all models | Indexes, references & constraints intact |
| **T36** | Account Brute Force Lock | 5 failed logins | Rapid invalid logins | Rate limited / audit warning |
