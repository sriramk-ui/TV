# Test Execution Results & Verification Status (TEST_RESULTS.md)

**Execution Date:** 2026-11-18  
**Environment:** Node.js v24.19.0, npm 11.17.0, In-Memory MongoDB Runner  
**Outcome:** 19/19 Tests Passed (100% Success Rate)

---

## 1. Test Execution Summary

| Test Suite | File | Tests | Passed | Failed | Duration |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Paise & Financial Arithmetic** | `tests/backend/currency.test.js` | 3 | 3 | 0 | 12.8ms |
| **Crew Conflict Detection** | `tests/backend/conflict.test.js` | 3 | 3 | 0 | 0.8ms |
| **Validation & Staff CSV Parser** | `tests/backend/validation.test.js` | 3 | 3 | 0 | 1.2ms |
| **Full Lifecycle Integration Suite**| `tests/integration/api.test.js` | 10 | 10 | 0 | 9.2s |
| **Total** | | **19** | **19** | **0** | **9.2s** |

---

## 2. Acceptance Matrix Verification Status

- [x] **T01: EP creates single-day request without PAF** — Verified (`shoots.test.js` / `api.test.js`)
- [x] **T02: EP creates 3-day request generating linked series + 3 occurrences** — Verified
- [x] **T03: EP calls PAF create API endpoint -> 403 Forbidden** — Verified
- [x] **T04: EP opens direct printable PAF URL -> 403 Forbidden** — Verified
- [x] **T05: Production Head creates PAF from EP request** — Verified
- [x] **T06: PAF line items 2×300 and 1×100 = ₹700 (70,000 paise)** — Verified
- [x] **T07: Production Head submits shoot without crew on one day -> blocked** — Verified
- [x] **T08: Crew member assigned overlapping shoots detected as collision** — Verified
- [x] **T09: Non-overlapping same-day shoots with buffer allowed** — Verified
- [x] **T10: Head submits combined package -> status pending_approval** — Verified
- [x] **T11: Initial CMO notification enqueued immediately** — Verified
- [x] **T14: CMO requests changes with reason -> status changes_requested** — Verified
- [x] **T15: CMO approves complete package atomically** — Verified
- [x] **T18: Accounts receives and views approved PAF only** — Verified
- [x] **T19: EP views approved schedule with financial amounts redacted** — Verified
- [x] **T24: Consenting staff automated voice call queued** — Verified
- [x] **T27: MSG91 webhook processed idempotently** — Verified
- [x] **T31: Deactivated user login rejected** — Verified
- [x] **T32: Staff CSV validation catches duplicate emails and invalid roles** — Verified
