# Multi-Channel Notification & Outbox Workflow Specification

Post-approval communication spans four distinct delivery channels orchestrated through a durable transactional outbox.

---

## 1. Notification Channels

### 1.1. Channel 1: Accounts / Finance Delivery (Brevo Email)
- **Recipients**: Designated Finance email addresses configured in CMO Settings.
- **Content**: Show name, production series reference, dates, approver timestamp, full itemized expense table, total approved cost, and secure printable PAF link / PDF attachment.
- **Safety**: Outbox records state as `awaiting_configuration` if no accounts email is configured; never silently discards.

### 1.2. Channel 2: Staff Assignment Notification (Brevo Email)
- **Recipients**: Assigned crew members and initiating Executive Producer.
- **Content**: Show title, shoot date, reporting time, rolling time, estimated pack-up, venue address, Google Maps link, designated equipment, and contact numbers.
- **Privacy**: PAF financial figures and budget line items are strictly omitted.

### 1.3. Channel 3: Automated Outbound Voice Calling (MSG91 Voice)
- **Eligibility**: Dispatched strictly to assigned personnel with verified phone numbers (`E.164`) and lawful voice consent (`voice_opt_in: true`).
- **Scheduling**: First attempt queued immediately upon CMO approval.
- **Retry Policy**:
  - `no_answer` on Attempt 1: Automatically schedules Attempt 2 after **30 minutes**.
  - `no_answer` on Attempt 2: Marks state as `not_reached`, logs failure, and alerts Production Head.
  - No 3rd automatic attempt is ever made.
  - `connected` is treated separately from `acknowledged`. A call is only acknowledged if user speech or DTMF confirmation is captured.

### 1.4. Channel 4: Direct Calendar Synchronization (Google / Outlook)
- **Action**: Directly inserts appointments into assigned staff members' primary work calendars.
- **Attributes**: Start datetime (reporting time), end datetime (pack-up), subject, venue location, and production notes.
- **Deduplication**: Remote event ID is persisted in `CalendarEvent`. Subsequent amendments PATCH the existing event ID rather than creating duplicates.
