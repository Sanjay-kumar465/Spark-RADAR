# Spark Radar — Production Google OAuth 2.0 Setup Guide

Complete guide for configuring, deploying, and testing Google OAuth 2.0 (Google Identity Services) for Spark Radar across Vercel (Frontend) and Render (FastAPI Backend).

---

## 1. OAuth Architecture Overview

Spark Radar implements **Google Identity Services (GSI)** with server-side cryptographic token validation:

```
[User Browser]
      │
      ▼ (Clicks "Sign in with Google" / One-Tap)
[Google Identity Services SDK]
      │
      ▼ (Returns signed OpenID Connect ID token)
[GoogleSignInButton.tsx]
      │
      ▼ POST /api/v1/auth/google { credential: ID_TOKEN, workspace_name }
[FastAPI Backend (Render)]
      │
      ├─► 1. Cryptographically verify signature against Google Public Keys (JWKS)
      ├─► 2. Validate token issuer: accounts.google.com / https://accounts.google.com
      ├─► 3. Validate audience: matches GOOGLE_CLIENT_ID
      ├─► 4. Validate expiration (exp) and email_verified == true
      ├─► 5. Match or create User & primary business Workspace in database
      └─► 6. Issue signed Spark Radar Bearer JWT
      │
      ▼ (Returns Token model { access_token, user, workspace })
[React Frontend (Vercel)]
      │
      ▼ (Stores token in localStorage, updates AuthContext)
[Redirects to /dashboard]
```

### Security Note on Client Secret:
Because Spark Radar uses **Google Identity Services ID-token verification** (where the frontend receives the signed ID token from Google and the backend cryptographically verifies it using Google's public keys), a **`GOOGLE_CLIENT_SECRET` is NOT required at runtime**. The backend does not need to perform an authorization-code exchange against Google's `/token` endpoint, eliminating the risk of Client Secret compromise.

---

## 2. Credentials Reference

| Parameter | Description | Required At Runtime | Scope |
| :--- | :--- | :---: | :--- |
| **Google Cloud Project** | `spark-radar-513115` | — | Google Cloud Console |
| **`GOOGLE_CLIENT_ID`** | Web Client ID (`*.apps.googleusercontent.com`) | **Yes** | Frontend (`VITE_GOOGLE_CLIENT_ID`) & Backend (`GOOGLE_CLIENT_ID`) |
| **`GOOGLE_CLIENT_SECRET`** | OAuth Client Secret | **No** (GSI uses public key verification) | Keep secure in Google Cloud Console; not required on Render or Vercel |

---

## 3. Google Cloud Console Configuration

1. Navigate to [Google Cloud Console — APIs & Services — Credentials](https://console.cloud.google.com/apis/credentials).
2. Select project **`spark-radar-513115`**.
3. Under **OAuth 2.0 Client IDs**, select your Web Client (or create one with type **Web application**).
4. **Authorized JavaScript origins** (Required):
   ```text
   https://spark-radar-saas.vercel.app
   http://localhost:5173
   http://127.0.0.1:5173
   http://localhost:3000
   http://127.0.0.1:3000
   ```
   > **Important:** Do not append trailing slashes `/` in Google Cloud Console origins.
5. **Authorized redirect URIs**:
   - Google Identity Services (GSI) credential callback flow operates client-side inside the browser DOM and **does not require a redirect URI**.
   - If Google Cloud Console requires saving at least one URI or if you wish to prepare for future server redirect flows, set:
     ```text
     https://spark-radar-saas.vercel.app/login
     http://localhost:5173/login
     ```
6. Click **Save**.

---

## 4. Environment Variables Configuration

### A. Frontend Configuration

**Local file:** `frontend/.env`  
**Production host:** Vercel Dashboard → Project Settings → Environment Variables

| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_GOOGLE_CLIENT_ID` | Yes | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` | Public Google Web Client ID |
| `VITE_API_BASE_URL` | Yes | `https://spark-radar-api.onrender.com` | Live FastAPI backend URL (or `http://127.0.0.1:8000` in local dev) |

> **Security Rule:** Never add `GOOGLE_CLIENT_SECRET` to Vercel or any `VITE_*` variable. Frontend bundles are public and any secrets placed in them will be exposed to users.

### B. Backend Configuration

**Local file:** `backend/.env`  
**Production host:** Render Dashboard → Web Service → Environment Variables

| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `GOOGLE_CLIENT_ID` | Yes | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` | Matches frontend client ID for audience verification |
| `FRONTEND_URL` | Yes | `https://spark-radar-saas.vercel.app/` | Deployed frontend URL |
| `BACKEND_CORS_ORIGINS` | Yes | `https://spark-radar-saas.vercel.app,http://localhost:5173` | Allowed CORS origins for authenticated API calls |
| `SECRET_KEY` | Yes | `YOUR_RANDOM_SECRET_KEY` | High-entropy random JWT signing key |
| `DATABASE_URL` | Yes | `sqlite:///./spark_radar.db` or PostgreSQL | Database connection string |

---

## 5. Deployment Instructions

### A. Render (FastAPI Backend)

1. Connect your repository on [Render.com](https://render.com) and create a **Web Service**.
2. **Build Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
3. **Environment Variables:** Add `GOOGLE_CLIENT_ID`, `FRONTEND_URL`, `BACKEND_CORS_ORIGINS`, `SECRET_KEY`, and `DATABASE_URL`.
4. Verify backend health endpoint:
   ```bash
   curl https://spark-radar-api.onrender.com/api/v1/health
   ```
   Expected response: `{"status":"healthy","service":"Spark Radar API","version":"1.0.0"}`

### B. Vercel (React Frontend)

1. Open project on [Vercel.com](https://vercel.com) → **Settings** → **Environment Variables**.
2. Add `VITE_GOOGLE_CLIENT_ID` and `VITE_API_BASE_URL`.
3. Go to **Deployments** → click `...` → **Redeploy** so Vite injects the variables into the static bundle.

---

## 6. Local Development Instructions

1. **Start Backend (Terminal 1):**
   ```bash
   cd "D:\Spark RADAR\backend"
   .\.venv\Scripts\activate
   uvicorn main:app --reload --port 8000
   ```
2. **Start Frontend (Terminal 2):**
   ```bash
   cd "D:\Spark RADAR\frontend"
   npm run dev
   ```
3. Open browser at `http://localhost:5173/login`.

---

## 7. Testing Procedure & Checklist

- [x] **Frontend Builds Without Errors:** `npm run build` succeeds (`tsc -b && vite build`).
- [x] **Google Sign-In Button Renders:** Renders official Google Identity button or responsive fallback.
- [x] **Missing Config Error Handling:** If `VITE_GOOGLE_CLIENT_ID` is missing, an informative banner guides configuration without breaking email/password or demo login.
- [x] **Valid Google Credential Login:** POST to `/api/v1/auth/google` returns valid Bearer token and redirects to `/dashboard`.
- [x] **Audience Validation:** Backend rejects tokens where `aud != GOOGLE_CLIENT_ID` with `401 Unauthorized`.
- [x] **Issuer Validation:** Backend enforces issuer in `["accounts.google.com", "https://accounts.google.com"]`.
- [x] **Expiration Check:** Expired tokens return `401 Unauthorized`.
- [x] **Email Verification Enforcement:** Unverified Google accounts (`email_verified != true`) return `400 Bad Request`.
- [x] **CORS Enforcement:** Production Vercel domain and preview URLs (`https://.*\.vercel\.app`) are permitted; wildcards with credentials are disallowed.
- [x] **Existing Auth Unbroken:** Email/password login and Quick Demo Login (`demo@sparkradar.in`) continue working smoothly.

---

## 8. Common OAuth Errors & Troubleshooting

| Error Message | Root Cause | Solution |
| :--- | :--- | :--- |
| **`Failed to fetch`** on login | Frontend calling `127.0.0.1:8000` from HTTPS or missing backend URL | Set `VITE_API_BASE_URL=https://spark-radar-api.onrender.com` in Vercel and redeploy. |
| **`Origin mismatch / GSI 403`** | Origin not whitelisted in Google Cloud Console | Add `https://spark-radar-saas.vercel.app` to **Authorized JavaScript origins** in Google Cloud Console (no trailing slash). |
| **`Google token audience does not match`** | Frontend Client ID and Backend Client ID are different | Ensure `VITE_GOOGLE_CLIENT_ID` on Vercel matches `GOOGLE_CLIENT_ID` on Render. |
| **`CORS policy: No 'Access-Control-Allow-Origin'`** | Backend missing frontend domain in CORS origins | Verify `BACKEND_CORS_ORIGINS` on Render contains your Vercel URL and regex `r"https://.*\.vercel\.app"` is active. |
| **`Google email address has not been verified`** | Google account has unconfirmed email | Log into Google account and complete email verification. |
