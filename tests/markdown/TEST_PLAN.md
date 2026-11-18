# Test Plan & Verification Strategy (TEST_PLAN.md)

## 1. Scope & Objectives
Verify all functional, security, financial, and integration requirements of the Sri Sankara TV Production Management System across the full lifecycle:
- EP Shoot Creation
- Crew Conflict Detection & Buffer Management
- Decimal-Safe PAF Formulation
- Combined CMO Dual-Approval
- Outbox Fan-Out (Email, Voice, Calendar)
- Crew Acknowledgement
- Accounts Delivery

## 2. Test Environment
- Isolated execution using `mongodb-memory-server`
- Mocked external APIs for Brevo, MSG91, and Microsoft/Google Calendar
- Supertest HTTP API test suite
- Jest assertion runner
