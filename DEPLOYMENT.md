# CareerBuddy AI — Production Deployment Guide

This document provides step-by-step instructions for deploying **CareerBuddy AI** to production with **Vercel** (Next.js Frontend), **Render / Railway** (Express AI Backend), **Supabase** (PostgreSQL Database), and **Clerk** (Authentication).

---

## 1. Architecture Overview

```mermaid
graph TD
    Client[Browser / Mobile] -->|HTTPS| Vercel[Next.js 16 Frontend on Vercel]
    Vercel -->|Auth Cookies & JWT| Clerk[Clerk Auth & Google OAuth]
    Vercel -->|Proxy /api/* rewrites| Express[Express AI Backend on Render/Railway]
    Express -->|Prisma 7 & @prisma/adapter-pg| Supabase[(Supabase PostgreSQL)]
    Express -->|Server-side Gemini SDK| Gemini[Google Gemini 2.5 Flash API]
    Express -->|Public REST API| GitHub[GitHub API v3]
    Express -->|Public GraphQL| LeetCode[LeetCode GraphQL]
    Vercel -.->|Optional External Link| MockInterview[External Mock Interview Engine]
```

- **Frontend**: Next.js 16 (App Router, Turbopack, Tailwind CSS v4) hosted on **Vercel**.
- **AI Backend**: Express 5 on **Render**, **Railway**, or any Node.js hosting platform.
- **Database**: Managed PostgreSQL hosted on **Supabase** via **Prisma 7**.
- **Auth**: Clerk with email/password, demo sign-in tokens, and Google OAuth.
- **AI**: Google Gemini API key kept strictly on the Express server (never exposed to client).

---

## 2. Step 1: Create & Configure Supabase PostgreSQL

1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Note your project password and reference ID.
3. In **Project Settings** → **Database**:
   - Locate the **Connection string** section.
   - Select **URI**.
   - Copy the **Transaction pooler** string (Port `6543`) for `DATABASE_URL`:
     ```env
     DATABASE_URL=postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - Copy the **Session mode** or direct connection string (Port `5432`) for `DIRECT_URL`:
     ```env
     DIRECT_URL=postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:5432/postgres
     ```

---

## 3. Step 2: Apply Prisma Schema to Supabase

From your local machine or CI/CD runner:

1. Ensure `DATABASE_URL` and `DIRECT_URL` are set in your local environment or terminal:
   ```bash
   $env:DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   $env:DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   ```
2. Push the Prisma schema directly to your Supabase PostgreSQL instance:
   ```bash
   npx prisma db push
   ```
   *(This creates the tables: `User`, `StudentProfile`, `ResumeAnalysis`, `CareerRoadmap`, `RoadmapPhase`, `LinkedInAnalysis`, `GitHubAnalysis`, `LeetCodeProgress`, `PlacementReadinessResult`, `CareerInsightResult`).*
3. Regenerate Prisma Client:
   ```bash
   npx prisma generate
   ```

---

## 4. Step 3: Deploy the Express Backend (Render / Railway)

You can deploy the backend to Render, Railway, or Fly.io. Example using **Render**:

1. Push your code to your GitHub repository.
2. In [https://dashboard.render.com](https://dashboard.render.com), click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Name**: `careerbuddy-ai-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx tsx server/index.ts`
   - **Plan**: Free or Starter
5. In **Environment Variables**, add:
   | Key | Value / Description |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` (or leave default assigned by Render) |
   | `FRONTEND_URL` | `https://your-careerbuddy.vercel.app` (your Vercel domain) |
   | `DATABASE_URL` | Supabase pooled connection string (port 6543) |
   | `DIRECT_URL` | Supabase direct connection string (port 5432) |
   | `GEMINI_API_KEY` | Your Google Gemini API key from Google AI Studio |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |
   | `CLERK_SECRET_KEY` | Your Clerk Secret Key (`sk_live_...` or `sk_test_...`) |
   | `GITHUB_TOKEN` | *(Optional)* GitHub personal access token for higher rate limits |
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://careerbuddy-ai-server.onrender.com`).
8. Test the health endpoint: `https://careerbuddy-ai-server.onrender.com/api/health` should return `{"status":"ok","service":"careerbuddy-ai-server"}`.

---

## 5. Step 4: Deploy the Next.js Frontend (Vercel)

1. Go to [https://vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Set the Framework Preset to **Next.js**.
4. In **Environment Variables**, add the frontend variables:
   | Key | Value / Description |
   |---|---|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` from Clerk Dashboard |
   | `CLERK_SECRET_KEY` | `sk_live_...` or `sk_test_...` from Clerk Dashboard |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`| `/dashboard` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`| `/profile` |
   | `AI_SERVER_URL` | `https://careerbuddy-ai-server.onrender.com` (from Step 3) |
   | `NEXT_PUBLIC_MOCK_INTERVIEW_URL` | *(Optional)* URL of external mock interview application |
5. Click **Deploy**.
6. Once deployed, note your production domain (e.g. `https://your-careerbuddy.vercel.app`).

---

## 6. Step 5: Configure Clerk Authentication & Google OAuth

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) and select your application.
2. In **User & Authentication** → **Social Connections**:
   - Enable **Google**.
   - For production, configure custom Google Cloud credentials with authorized redirect URI provided by Clerk.
3. In **Configure** → **Paths**:
   - Ensure Sign-in path is `/sign-in` and Sign-up path is `/sign-up`.
4. In **Configure** → **Domains**:
   - Add your production domain: `your-careerbuddy.vercel.app`.
5. *(Optional Webhooks)*: If using Clerk user sync webhooks, configure `https://your-careerbuddy.vercel.app/api/webhooks/clerk` with your signing secret in `CLERK_WEBHOOK_SECRET`.

---

## 7. Step 6: Environment Variables Host Checklist

| Variable | Frontend (Vercel) | Backend (Render/Railway) |
|---|:---:|:---:|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | ❌ |
| `CLERK_SECRET_KEY` | ✅ | ✅ |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | ❌ |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | ❌ |
| `AI_SERVER_URL` | ✅ *(points to Backend URL)* | ❌ |
| `FRONTEND_URL` | ❌ | ✅ *(points to Vercel URL for CORS)* |
| `DATABASE_URL` | ❌ | ✅ |
| `DIRECT_URL` | ❌ | ✅ |
| `GEMINI_API_KEY` | ❌ *(Never expose to frontend!)* | ✅ |
| `GEMINI_MODEL` | ❌ | ✅ |
| `GITHUB_TOKEN` | ❌ | ✅ *(Optional)* |
| `NEXT_PUBLIC_MOCK_INTERVIEW_URL` | ✅ *(Optional)* | ❌ |

---

## 8. Step 7: Final Deployment Verification Checklist

After deploying both services, verify the production site:

- [ ] **Health Endpoint**: Navigate to `https://[backend-host]/api/health` → returns status `ok`.
- [ ] **Landing Page**: Navigate to `https://[frontend-host]/` → displays clean hero, feature cards, and navigation.
- [ ] **Authentication**:
  - Sign in as a regular user or click **"Sign In as Demo Student"**.
  - Verify redirect to `/dashboard`.
- [ ] **Resume Analysis**:
  - Upload a PDF or DOCX file at `/resume-analysis`.
  - Confirm ATS score calculation, tab displays, and history persistence.
- [ ] **Career Roadmap**:
  - Select any of the 6 roles (e.g. Software Developer, AI Engineer) at `/career-roadmap`.
  - Confirm resource links are clickable and phase status toggle updates.
- [ ] **Developer Progress**:
  - Enter a GitHub username at `/developer-progress` and click **Sync**.
  - Log problem solving counts via the **Log** modal and confirm streak and weekly chart update.
- [ ] **LinkedIn Analysis**:
  - Test profile evaluation and original vs AI-suggested 1-click copy buttons.
- [ ] **Placement Readiness**:
  - Confirm overall index reflects documented weights and adaptive normalization.
  - Click **Generate Insights** to confirm Gemini-powered career guidance.
