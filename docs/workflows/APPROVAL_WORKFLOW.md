# Combined CMO Approval Workflow Specification

In the Sri Sankara TV Production Management System, **the Chief Managing Officer (CMO) holds sole, indivisible approval authority** over both the shooting schedule and the financial PAF budget.

---

## 1. Core Workflow Principles

```mermaid
sequenceDiagram
    autonumber
    actor PH as Production Head
    participant API as Backend REST API
    participant DB as MongoDB Atlas
    actor CMO as Chief Managing Officer
    participant OB as Outbox Worker
    actor ACC as Accounts Dept
    actor CRW as Production Crew

    PH->>API: POST /api/v1/shoots/:id/submit
    API->>DB: Atomically set status: pending_approval & pending_cmo
    API->>OB: Enqueue initial CMO notification & schedule hourly reminder
    API-->>PH: Package submitted successfully
    OB-->>CMO: Brevo Email: Shoot Review Required (with link & summary)

    opt Every 60 Minutes (if still pending)
        OB-->>CMO: Hourly Reminder Digest
    end

    CMO->>API: GET /api/v1/approvals/pending
    API-->>CMO: Merged view (Schedule + Crew + Full PAF Breakdown)

    alt CMO Approves Package
        CMO->>API: POST /api/v1/approvals/:id/decision (action: 'approve')
        API->>DB: Atomically set status: approved; cancel pending reminders
        API->>OB: Enqueue Accounts email, Staff Brevo assignment, MSG91 call, Calendar sync
        API-->>CMO: Package approved
        par Multi-Channel Outbox Fan-out
            OB->>ACC: Brevo Email with approved PAF & printable PDF link
            OB->>CRW: Brevo Email with shoot reporting details
            OB->>CRW: MSG91 Automated Voice Call briefing
            OB->>DB: Google / Outlook calendar event created
        end
    else CMO Requests Changes
        CMO->>API: POST /api/v1/approvals/:id/decision (action: 'changes_requested', reason)
        API->>DB: Atomically set status: changes_requested; log reason
        API-->>CMO: Package returned to Production Head
        API->>PH: Notification with revision remarks (zero staff or accounts fan-out)
    end
```

---

## 2. Invariants & Rules

1. **Atomic Dual-Approval**:
   The CMO cannot approve the crew roster while rejecting the budget, or vice versa. Both must be approved together.
2. **Snapshot Immutability**:
   Upon approval, an immutable JSON snapshot of the PAF and crew assignments is persisted in the approval record. Any subsequent amendments generate a new revision that must undergo CMO re-approval.
3. **Hourly Reminders**:
   Reminders cease immediately once the CMO records a decision.
