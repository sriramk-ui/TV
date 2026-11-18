# Environment Configuration Specification

This document details all configuration parameters required by the Sri Sankara TV Production Management System across Development, Staging, and Production environments.

---

## 1. Environment Variable Catalog

| Variable | Type | Default | Description | Environment |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `development` | Runtime environment (`development`, `test`, `production`) | All |
| `PORT` | Integer | `5000` | Port for the Express.js REST API server | All |
| `API_BASE_URL` | URL | `http://localhost:5000/api/v1` | Publicly reachable base URL for API | All |
| `FRONTEND_PORT` | Integer | `3000` | Port for Vite frontend dev server | Dev |
| `FRONTEND_URL` | URL | `http://localhost:3000` | Allowed origin for frontend app in CORS | All |
| `ADMIN_PORT` | Integer | `3001` | Port for Vite admin dev server | Dev |
| `ADMIN_URL` | URL | `http://localhost:3001` | Allowed origin for admin app in CORS | All |
| `MONGODB_URI` | URI | — | MongoDB Atlas connection string | Staging / Prod |
| `MONGODB_USE_MEMORY_FALLBACK` | Boolean | `true` | Allows local in-memory DB when mongod is absent | Dev / Test |
| `JWT_SECRET` | String | — | High-entropy secret for signing session JWTs | All |
| `JWT_EXPIRES_IN` | String | `24h` | Lifespan of access tokens | All |
| `JWT_REFRESH_SECRET` | String | — | Secret for signing refresh tokens | All |
| `JWT_REFRESH_EXPIRES_IN` | String | `7d` | Lifespan of refresh tokens | All |
| `BCRYPT_SALT_ROUNDS` | Integer | `10` | Salt work factor for password hashing | All |
| `BREVO_API_KEY` | String | — | Brevo (Sendinblue) REST API Key | Staging / Prod |
| `BREVO_SENDER_NAME` | String | `Sri Sankara TV Production Desk` | Official email display sender | All |
| `BREVO_SENDER_EMAIL` | Email | `production@srisankaratv.com` | Verified Brevo sender address | All |
| `BREVO_ENABLED` | Boolean | `false` | Enable live outbound email dispatch | Staging / Prod |
| `BREVO_SANDBOX_MODE` | Boolean | `true` | Log email dispatches without sending live mail | Dev / Test |
| `MSG91_AUTH_KEY` | String | — | MSG91 Authentication key for voice campaigns | Staging / Prod |
| `MSG91_CALL_CAMPAIGN_ID` | String | — | Configured voice campaign flow identifier | Staging / Prod |
| `MSG91_CALLER_NUMBER` | E.164 | `+914424991234` | Registered official channel outbound number | All |
| `MSG91_WEBHOOK_SECRET` | String | — | Signature token to verify incoming webhooks | All |
| `MSG91_ENABLED` | Boolean | `false` | Enable live outbound voice calling | Staging / Prod |
| `MSG91_SANDBOX_MODE` | Boolean | `true` | Log voice calls locally without calling telco | Dev / Test |
| `CALENDAR_PROVIDER` | String | `google` | Active calendar integration (`google` or `outlook`)| All |
| `CALENDAR_ENABLED` | Boolean | `false` | Enable live calendar sync | Staging / Prod |
| `CALENDAR_SANDBOX_MODE` | Boolean | `true` | Simulate calendar writes locally | Dev / Test |
| `CRON_HOURLY_REMINDERS_ENABLED`| Boolean | `true` | Enable hourly pending CMO reminder scheduler | All |
| `CRON_VOICE_OUTBOX_ENABLED` | Boolean | `true` | Enable voice outbox dispatcher worker | All |

---

## 2. Secrets Management & Security Rules

1. **Zero Plaintext Secrets in Repositories**:
   - `.env` is ignored in Git.
   - Never commit API keys, passwords, or token secrets to version control.
2. **Production Hosting Deployment**:
   - In Render, configure all production secrets in the **Environment** settings panel.
   - Use MongoDB Atlas network access allowlists to restrict database connections to the Render outbound IP range.
