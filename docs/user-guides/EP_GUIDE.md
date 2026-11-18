# Executive Producer (EP) User Manual

Welcome to the Sri Sankara TV Production Management System. This manual guides Executive Producers through requesting shoots, managing production requirements, and tracking shoot statuses.

---

## 1. Logging In
1. Navigate to the portal at `http://localhost:3000` (or your company URL).
2. Enter your official email (e.g. `ep1@srisankaratv.com`) and password.
3. Upon successful login, you will land on the **Executive Producer Overview Dashboard**.

---

## 2. Raising a New Shoot Request
1. Click the **"＋ Create Schedule"** button at the top right of the dashboard.
2. Complete the shoot information form:
   - **Program / Show Name**: Enter the official show title (e.g., *Purattasi Saturdays Special*).
   - **Client / Guest**: Enter client, speaker, or temple trustee contact.
   - **Category**: Select *Studio*, *Temple OB*, *Special Event*, or *Documentary*.
   - **Shoot Dates**: Select the start and end dates. (For single-day shoots, start and end dates match).
   - **Reporting Time**: The exact time crew must report to the venue (e.g. `06:00`).
   - **Rolling Time**: The time cameras begin rolling (e.g. `07:30`).
   - **Pack-up Time**: Estimated completion time (e.g. `14:00`). Check *Overnight* if wrapping after midnight.
   - **Venue & Google Maps**: Enter the physical address and paste a Google Maps link.
   - **Equipment & Preferred Crew**: Specify special camera, crane, or drone needs and estimated crew size.
3. Click **"Submit Shoot Request"**.
4. The request is assigned a unique series ID (e.g. `SSTV-2026-0001`) and status `requested`.

---

## 3. Tracking Request Status
In your Overview table, requests reflect real-time status:
- `requested`: Awaiting Production Head crew and PAF preparation.
- `pending_approval`: Production Head has assigned crew and submitted the package to the CMO.
- `approved`: CMO has approved both schedule and budget. Your assigned crew will receive their schedules.
- `changes_requested`: CMO has returned the package for clarification.

> [!NOTE]
> Executive Producers have zero access to financial budgets, unit rates, or PAF totals. Contact the Production Head for budget inquiries.
