# Production Deployment & Hosting Guide

This guide outlines deployment steps for hosting the Sri Sankara TV Production Management System on **Render**, **Vercel / Netlify**, and **MongoDB Atlas**.

---

## 1. Hosting Architecture

```text
[Frontend / Admin React SPAs] ➔ Hosted on Render Static Sites / Vercel / Netlify
[Backend Express REST API]     ➔ Hosted on Render Web Service (Node.js runtime)
[Database Cluster]            ➔ Hosted on MongoDB Atlas (AWS Mumbai ap-south-1)
```

---

## 2. Step-by-Step Deployment Walkthrough

### 2.1. MongoDB Atlas Configuration
1. Create a dedicated MongoDB Atlas cluster in the `ap-south-1` (Mumbai) region for lowest latency to Chennai.
2. In **Database Access**, create an application user with readWrite privileges to `sankara_production`.
3. In **Network Access**, add Render outbound IP addresses (or `0.0.0.0/0` with strong password authentication).
4. Copy the connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/sankara_production?retryWrites=true&w=majority`.

### 2.2. Backend API Deployment (Render Web Service)
1. In Render dashboard, click **New +** ➔ **Web Service**.
2. Connect your Git repository.
3. Configure settings:
   - **Name**: `sankara-production-api`
   - **Environment**: `Node`
   - **Root Directory**: `.` (monorepo root)
   - **Build Command**: `npm install && npm run build -w @sankara/shared`
   - **Start Command**: `npm run start -w @sankara/backend`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<your_atlas_connection_string>`
   - `JWT_SECRET`: `<generated_high_entropy_secret>`
   - `FRONTEND_URL`: `https://production.srisankaratv.com`
   - `ADMIN_URL`: `https://admin.srisankaratv.com`
   - `BREVO_API_KEY`: `<brevo_live_key>`
   - `MSG91_AUTH_KEY`: `<msg91_live_key>`

### 2.3. Frontend & Admin Deployments (Render Static Site / Vercel)
1. **Frontend App**:
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: `VITE_API_BASE_URL=https://sankara-production-api.onrender.com/api/v1`
2. **Admin App**:
   - **Root Directory**: `apps/admin`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: `VITE_API_BASE_URL=https://sankara-production-api.onrender.com/api/v1`

---

## 3. Production Health & Post-Deployment Checklist

1. Execute health endpoint: `GET https://<api-domain>/api/v1/health`.
2. Run database seeder: `npm run seed -w @sankara/backend`.
3. Log in as CMO to verify SSL certificates, CSRF cookies, and session tokens.
4. Verify Brevo SMTP domain sender verification.
5. Verify MSG91 DLT template registration with Indian telecom authorities.
