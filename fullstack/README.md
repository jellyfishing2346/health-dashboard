# Health Dashboard – Fullstack (Next.js + Prisma + NextAuth + OpenAI)

A full-stack health dashboard with authenticated CRUD APIs, charts, CSV export, and optional AI insights.

## Tech Stack
- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS, lucide-react, Chart.js (via react-chartjs-2)
- SWR for data fetching with optimistic updates
- NextAuth (Google) + Prisma Adapter (JWT sessions)
- Prisma ORM + PostgreSQL (Docker local or managed)
- OpenAI SDK for insights (optional; graceful fallback when quota/keys unavailable)

## Features
- Authenticated CRUD for Physical, Mental, Goals, and Profile data (`/api/*` routes)
- Date handling normalized to 12:00:00Z to avoid off-by-one
- Dashboard with KPIs, Trends charts, and Goals
- CSV export for Physical and Mental sections
- AI Insights panel driven by `/api/insights` with env-configurable model

## Environment Variables
Create `./.env` (do not commit). See `./.env.example` as a reference.

Required:
- DATABASE_URL
- NEXTAUTH_URL, NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

AI (optional):
- OPENAI_API_KEY
- OPENAI_MODEL (default: gpt-4o-mini)
- OPENAI_MAX_TOKENS (default: 300)
- OPENAI_PROJECT, OPENAI_ORGANIZATION (only if your account/project requires them)

## Local Development
1. Copy env: `cp .env.example .env` and fill in values.
2. Start Postgres (local or managed). For local Docker:
   - `docker compose up -d` (from this folder if a compose file is present)
3. Install deps: `npm install`
4. Prisma: `npx prisma generate` then `npx prisma migrate dev --name init`
5. Run: `npm run dev` and open http://localhost:3000

## AI Insights
- The endpoint `/api/insights` uses OpenAI Chat Completions.
- If quota is exceeded or no key is set, a local fallback returns helpful tips and the UI shows a short cooldown.
- Tuning via env: `OPENAI_MODEL`, `OPENAI_MAX_TOKENS`.

## Deployment
- Database: Provision managed Postgres (Neon/Supabase/Railway) and set `DATABASE_URL`.
- Prisma: `npx prisma migrate deploy` on the server or a CI step.
- Hosting (e.g., Vercel): Configure Environment Variables: `DATABASE_URL`, `NEXTAUTH_*`, Google OAuth, `OPENAI_*`.
- Streamlit (optional): deploy `streamlit/app.py` separately and point it to the same `DATABASE_URL`.

## Notes
- `.env` and `.env.*` are gitignored. Never commit real secrets.
- The legacy Vite SPA exists at the repo root; the production app is under `fullstack/`.
