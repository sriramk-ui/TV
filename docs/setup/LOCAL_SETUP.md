# Local Development Setup Guide

Follow this step-by-step walkthrough to configure your local development environment and run the full stack.

---

## 1. Prerequisites

Verify that the following tools are installed on your workstation:
- **Node.js**: `v20.x` or higher (`node -v`)
- **npm**: `v10.x` or higher (`npm -v`)
- **Git**: `2.x` or higher (`git --version`)
- **MongoDB**: MongoDB Atlas cluster URI or local MongoDB daemon. (If no external MongoDB daemon is active, the system includes an in-memory database fallback for rapid testing).

---

## 2. Setup Procedure

### Step 1: Clone Repository
```bash
git clone <repository_url> sri-sankara-production
cd sri-sankara-production
```

### Step 2: Install All Dependencies
Install dependencies across all workspaces using a single root command:
```bash
npm install
```

### Step 3: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and verify the basic configuration:
- `PORT=5000`
- `FRONTEND_PORT=3000`
- `ADMIN_PORT=3001`
- `MONGODB_URI=mongodb://127.0.0.1:27017/sankara_production` (or your Atlas connection string)
- `JWT_SECRET=your_jwt_secret_key`

### Step 4: Seed Database
Populate initial accounts (CMO, Head, EP1, EP2, Accounts, Crew members), departments, and system settings:
```bash
npm run seed
```

### Step 5: Start All Applications
Run all services concurrently in development mode:
```bash
npm run dev
```

Alternatively, run specific applications in separate terminals:
```bash
# Terminal 1: Backend REST API
npm run dev:backend

# Terminal 2: Main Production Portal
npm run dev:frontend

# Terminal 3: Admin Control Panel
npm run dev:admin
```

---

## 3. Verifying Local Setup

Open your browser and navigate to:
1. **Backend Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health) (Expect `{ "status": "healthy" }`)
2. **Main Production Portal**: [http://localhost:3000](http://localhost:3000)
3. **Admin Control Panel**: [http://localhost:3001](http://localhost:3001)

Log in using the default credentials:
- **CMO Admin**: `cmo@srisankaratv.com` / `Password@123`
- **Production Head**: `productionhead@srisankaratv.com` / `Password@123`
- **Executive Producer**: `ep1@srisankaratv.com` / `Password@123`
