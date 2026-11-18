# Chief Managing Officer (CMO) User Manual

This manual guides the Chief Managing Officer (CMO) through reviewing combined production packages, executing binding approvals, managing team directories, and configuring system integrations.

---

## 1. Approval Center Operations
1. Log in to the portal using your CMO credentials.
2. Click **"CMO Approvals"** in the sidebar. A badge displays the number of packages pending your review.
3. Each pending card presents a unified view:
   - **Shoot Overview**: Show title, EP name, dates, venue, and reporting hours.
   - **Assigned Roster**: Day-specific crew and vehicle assignments with collision clearance indicators.
   - **PAF Financial Table**: Itemized budget rows, units, quantities, rates, and computed grand total.

---

## 2. Rendering a Decision
You have two authoritative choices:
- **Approve (✓)**:
  - Click **"✓ Approve"**.
  - A confirmation dialog confirms: *"Approve both estimated PAF and crew schedule together? This releases the PAF to Accounts and triggers calendar, email and AI call workflows."*
  - On confirmation, the system atomically approves the package, cancels further pending reminders, and dispatches outbox jobs.
- **Request Changes**:
  - Click **"Request Changes"**.
  - Enter mandatory revision instructions (e.g., *"Reduce vehicle count to 1 and adjust food budget"*).
  - The package is returned to the Production Head. No staff or Accounts notifications are released.

---

## 3. Managing Staff & Integrations (Admin Console)
Access the **Admin Control Panel** at `http://localhost:3001`:
1. **Team Directory**: Add individual staff members, toggle active/inactive status, or upload a bulk CSV.
2. **Finance Settings**: Specify the official recipient email addresses for approved PAFs.
3. **Outbox Monitor & Call Center**: View live delivery status of emails, automated phone calls, and calendar writes.
