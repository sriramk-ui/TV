# REST API Endpoints Specification

This document details all REST endpoints provided by the `@sankara/backend` service.

---

## 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates user credentials; returns JWT and user profile |
| `POST` | `/api/v1/auth/refresh` | Public | Exchanges valid refresh token for a new access token |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieves current authenticated session and profile |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Updates current user password |
| `POST` | `/api/v1/auth/logout` | Authenticated | Invalidates session |

---

## 2. Shoot Management Endpoints (`/api/v1/shoots`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/shoots` | All Authenticated | Lists shoots (role-filtered; EP sees own, Crew sees assigned, Head/CMO sees all) |
| `POST` | `/api/v1/shoots` | `ep`, `production_head`, `cmo` | Creates new shoot request with occurrences |
| `GET` | `/api/v1/shoots/:id` | All Authenticated | Gets shoot details (financial PAF data redacted for EP & Crew) |
| `PUT` | `/api/v1/shoots/:id` | `ep`, `production_head`, `cmo` | Updates shoot metadata before approval |
| `PUT` | `/api/v1/shoots/:id/occurrences/:occId` | `production_head`, `cmo` | Modifies date, reporting time, venue for an occurrence |
| `PUT` | `/api/v1/shoots/occurrences/:occId/assignments` | `production_head`, `cmo` | Assigns crew & equipment; validates time collisions |
| `POST` | `/api/v1/shoots/:id/submit` | `production_head`, `cmo` | Submits schedule + PAF as combined package to CMO |
| `POST` | `/api/v1/shoots/:id/cancel` | `production_head`, `cmo` | Cancels shoot; triggers cancellation notifications |

---

## 3. PAF & Financial Endpoints (`/api/v1/pafs`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pafs` | `production_head`, `cmo`, `accounts` | Lists PAFs (Accounts sees only `approved`) |
| `GET` | `/api/v1/pafs/:id` | `production_head`, `cmo`, `accounts` | Gets itemized PAF with server-calculated amounts |
| `POST` | `/api/v1/pafs` | `production_head`, `cmo` | Creates or saves draft PAF for a shoot |
| `PUT` | `/api/v1/pafs/:id` | `production_head`, `cmo` | Updates expense items and recalculates totals |
| `GET` | `/api/v1/pafs/:id/print` | `production_head`, `cmo`, `accounts` | Returns printable HTML / PDF payload for approved PAF |

> [!CAUTION]
> EP and Crew roles are strictly denied (`403 Forbidden`) on all `/api/v1/pafs` endpoints.

---

## 4. Combined CMO Approvals (`/api/v1/approvals`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/approvals/pending` | `cmo` | Lists pending combined approval packages |
| `POST` | `/api/v1/approvals/:id/decision` | `cmo` | Atomically executes `approve` or `request_changes` |
| `GET` | `/api/v1/approvals/history` | `cmo`, `production_head` | Audited history of approval packages |

---

## 5. Crew Acknowledgement (`/api/v1/crew`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/crew/my-assignments` | `crew` | Lists personal assignments with dates and reporting times |
| `POST` | `/api/v1/crew/assignments/:id/ack` | `crew` | Submits acknowledgement (`confirmed` or `conflict_reported`)|

---

## 6. Staff & Admin Management (`/api/v1/staff`, `/api/v1/admin`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/staff` | `production_head`, `cmo` | Lists team members with roles, phones, consent |
| `POST` | `/api/v1/staff` | `cmo` | Creates new staff member |
| `PUT` | `/api/v1/staff/:id` | `cmo` | Updates staff member details or toggles active status |
| `POST` | `/api/v1/staff/import-csv` | `cmo` | Bulk imports staff from CSV with transactional validation |
| `GET` | `/api/v1/admin/settings` | `cmo` | Retrieves integration credentials and system options |
| `PUT` | `/api/v1/admin/settings` | `cmo` | Updates integration configurations and finance recipients |
| `GET` | `/api/v1/admin/audit-logs` | `cmo` | Retrieves immutable audit log stream |
| `GET` | `/api/v1/admin/outbox-jobs` | `cmo`, `production_head` | Inspects outbox queue status and failure causes |
| `POST` | `/api/v1/admin/outbox-jobs/:id/retry` | `cmo`, `production_head` | Triggers manual retry for a failed outbox job |

---

## 7. Webhook Endpoints (`/api/v1/webhooks`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/webhooks/msg91` | MSG91 Provider | Receives voice call outcome, DTMF or speech acknowledgement |
