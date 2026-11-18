# Sri Sankara TV — User Roles, Permissions & Operational Guide

This document defines the user personas, role hierarchy, permission matrix, default test credentials, and role-specific workflows for the Sri Sankara TV Production Management System.

---

## 1. Role Categories & Permission Matrix

| Capability / Action | Executive Producer (`ep`) | Production Head (`production_head`) | Chief Managing Officer (`cmo`) | Accounts / Finance (`accounts`) | Production Crew (`crew`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Create Shoot Request** | **Yes** | Assist / Edit | Override | No | No |
| **View Own Shoot Requests** | Yes | Yes (All) | Yes (All) | No | No |
| **View Approved Schedules** | Role-filtered | Yes (All) | Yes (All) | Need-to-know | Assigned Only |
| **Assign Crew & Equipment** | No | **Yes** | Override | No | No |
| **Conflict & Availability Checks**| No | **Yes** | Yes | No | No |
| **Create / Edit PAF Budget** | **STRICT NO** | **Yes** | **Yes** | No | No |
| **View PAF Financial Amounts** | **STRICT NO** | Yes | Yes | **Approved Only** | **STRICT NO** |
| **Download / Print Approved PAF** | **STRICT NO** | Yes | Yes | **Approved Only** | **STRICT NO** |
| **Submit Package to CMO** | No | **Yes** | Override | No | No |
| **Approve / Return Package** | No | No | **YES (Sole Authority)**| No | No |
| **Manage Finance Email Recipients**| No | No | **Yes** | No | No |
| **Manage Team Directory & CSV** | No | No | **Yes** | No | No |
| **Acknowledge Shoot Assignment**| If assigned | If assigned | If assigned | No | **Yes** |
| **View AI Call Outcomes** | No | **Yes** | **Yes** | No | Own Only |
| **Access Admin Control Panel** | No | No | **Yes** | No | No |

---

## 2. Seed Accounts & Default Credentials

During initial seeding (`npm run seed`), the following accounts are initialized with the default password `Password@123`:

| Role | Name | Email | Phone (E.164) | Access Portal |
| :--- | :--- | :--- | :--- | :--- |
| **CMO / Admin** | Sundara Raman (CMO) | `cmo@srisankaratv.com` | `+919840011001` | Main Portal + Admin Panel |
| **Production Head** | K. Natarajan | `productionhead@srisankaratv.com` | `+919840011002` | Main Portal |
| **Executive Producer** | R. Shankaranarayanan | `ep1@srisankaratv.com` | `+919840011003` | Main Portal |
| **Executive Producer** | Meenakshi Sundaram | `ep2@srisankaratv.com` | `+919840011004` | Main Portal |
| **Accounts / Finance** | S. Padmanabhan | `accounts@srisankaratv.com` | `+919840011005` | Main Portal |
| **Crew (Photographer)** | V. Karthik | `karthik.camera@srisankaratv.com`| `+919840011010` | Main Portal (Crew View) |
| **Crew (Technician)** | P. Balaji | `balaji.tech@srisankaratv.com` | `+919840011011` | Main Portal (Crew View) |
| **Crew (Editor)** | M. Rajesh | `rajesh.editor@srisankaratv.com` | `+919840011012` | Main Portal (Crew View) |
| **Crew (Driver)** | T. Suresh | `suresh.driver@srisankaratv.com` | `+919840011013` | Main Portal (Crew View) |

> [!IMPORTANT]
> All users must change their default password upon first login in production environments.

---

## 3. Role-Specific Operational Workflows

### 3.1. Executive Producer (EP) Workflow
1. **Login** to the Main Production Portal using assigned EP credentials.
2. Select **"＋ Create Schedule"** from the top right.
3. Complete the request form:
   - Program / Show Name (e.g., *Purattasi Saturdays Special*, *Navaratri Mahotsavam*)
   - Client / Guest / Devotee details
   - Shoot Category (Studio, Temple OB, Special Event, Documentary)
   - Shoot Date(s): Supports single day or multi-day spanning consecutive or spaced dates.
   - Timings: Reporting Time, Rolling Time, Pack-up/End Time. (Check *Overnight Shoot* if wrapping after midnight).
   - Venue Name, Address, and Google Maps Navigation link.
   - Equipment Requirements, Preferred Crew count, and Shoot Notes.
4. Click **Submit Request**. The status becomes `requested`.
5. EP tracks the status in the Overview dashboard. EPs **never** have visibility into PAF financials, rates, or budget totals.

### 3.2. Production Head Workflow
1. Review incoming `requested` shoots in the **Incoming Requests** queue.
2. Open the planner to assign team members:
   - Camera 1, Camera 2, Technician, Sound Engineer, Assistant, Driver, Vehicle.
   - The system immediately verifies staff availability against other confirmed or pending shoots for that day and flags time-window collisions (taking into account configured travel buffer windows).
3. Open **PAF Preparation** for the shoot:
   - Automatically prefilled with Show Title, Dates, Venue, and Episode count.
   - Add itemized expense rows: Particulars, Unit (Days/Hours/Vehicles), Quantity, Unit Rate (₹), and Payment Mode (Cash, UPI, Bank Transfer).
   - The line item amount (`Qty × Rate`) and total PAF estimate are computed automatically by decimal-safe arithmetic.
4. Once crew allocation and PAF are verified, click **"Submit Schedule + PAF for CMO Approval"**.
5. Both the shoot occurrences and the PAF transition atomically to `pending_approval` / `pending_cmo`.

### 3.3. CMO / Administrator Workflow
1. CMO receives an immediate submission email and sees pending items in the **CMO Approvals** center.
2. If left pending, the system issues an hourly reminder email digest to the CMO.
3. In the unified Approval Center, the CMO views:
   - EP Shoot details, venue, dates, and times.
   - Day-specific crew assignments with conflict verification indicator.
   - Full PAF expense breakdown, unit rates, payment modes, and estimated grand total.
4. The CMO has two binding options:
   - **Approve**: Atomically locks the schedule and PAF. Triggers outbox jobs for Accounts email, staff Brevo assignments, MSG91 voice calling, and calendar event generation.
   - **Request Changes**: Enters mandatory revision remarks. The package is returned to the Production Head as `changes_requested`. No external notifications or financial releases are triggered.

### 3.4. Accounts Department Workflow
1. Accounts staff login and access the **PAF & Budgets** section.
2. Pre-approval PAFs are strictly concealed; Accounts sees only **Approved** records.
3. Accounts can view approved breakdowns, verify approver identity and timestamp, and print or download official versioned PAF PDF documents carrying the mandatory audit disclaimer: *"Approved estimated expenditure — not proof of payment"*.

### 3.5. Production Team (Crew) Workflow
1. Crew members receive personalized assignment emails with reporting time, venue, Google Maps location, and designated role.
2. Crew members with voice opt-in consent receive an automated call from the Sri Sankara TV Production Desk.
3. Crew members can log in to the portal on mobile or desktop to view their personal assignments and click **"Acknowledge Assignment"** or report a schedule conflict directly.

---

## 4. Security & Isolation Invariants

1. **Zero Financial Leakage to EPs and Crew**:
   - The backend API strips `paf`, `paf_id`, `estimated_total`, and expense items from all EP and Crew endpoint responses.
   - Direct requests to `/api/v1/pafs` or printable PAF URLs return `403 Forbidden` for non-authorized roles.
2. **Atomic Combined Approval**:
   - The CMO cannot approve PAF without the crew schedule or vice versa.
3. **Deactivation Safeguards**:
   - Deactivated users cannot authenticate, cannot receive new assignments, and their pending automated voice calls are automatically suppressed.
