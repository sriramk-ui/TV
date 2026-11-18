# Bug Tracking & Defect Register (BUG_REPORT.md)

| Issue ID | Module | Description | Severity | Status | Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | PAF | Floating point rounding error in float summation | Critical | Resolved | Switched to integer paise persistence |
| **BUG-002** | Calendar | Multiple calendar event creations on network retry | High | Resolved | Added unique compound idempotency key |
| **BUG-003** | Auth | Deactivated user token remained valid until expiry | High | Resolved | Added active check middleware against DB |
