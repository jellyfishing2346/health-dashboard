# Health Dashboard (Full Stack + AI)

A comprehensive health tracking platform with:
- Next.js full-stack web app (auth, APIs, charts, CSV export, optional AI insights)
- Streamlit analytics app reading the same Postgres database

## Monorepo Structure
- `fullstack/` – Next.js 14 + Prisma + NextAuth + OpenAI (primary app)
- `streamlit/` – Streamlit analytics (read-only)
- `src/` – Legacy Vite SPA (kept for reference)

## Tech Stack
- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind, lucide-react, Chart.js
- Data fetching: SWR with optimistic updates
- Auth: NextAuth (Google) + Prisma Adapter (JWT sessions)
- Database/ORM: Prisma + PostgreSQL (Docker local or managed)
- AI: OpenAI SDK for `/api/insights` (with graceful fallback and cooldown)
- Analytics: Streamlit + pandas + SQLAlchemy + Altair

## Key Features
- Physical and Mental health tracking with filters and charts
- Goals CRUD and progress
- CSV export for Physical and Mental sections
- AI Insights panel (configurable via env; falls back when quota unavailable)
- Accessibility-first, responsive UI; inclusive language and colors
- Date handling normalized to 12:00:00Z to avoid off-by-one

## Getting Started

### Fullstack App (Next.js)
1) `cd fullstack`
2) Copy env and fill secrets: `cp .env.example .env`
3) Start Postgres (local Docker or use managed)
4) Install deps: `npm install`
5) Prisma: `npx prisma generate` then `npx prisma migrate dev --name init`
6) Run: `npm run dev` → http://localhost:3000

Env vars (required): DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
AI (optional): OPENAI_API_KEY, OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_PROJECT, OPENAI_ORGANIZATION

### Streamlit App
1) `cd streamlit`
2) Create venv and install: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
3) `export DATABASE_URL="postgresql://<user>:<pass>@<host>:<port>/<db>?schema=public"`
4) `streamlit run app.py`

## Deployment
- Database: provision managed Postgres (Neon/Supabase/Railway) and set DATABASE_URL
- Next.js (Vercel): set envs (`DATABASE_URL`, `NEXTAUTH_*`, Google, `OPENAI_*`) and deploy; run `npx prisma migrate deploy`
- Streamlit Cloud: point to `streamlit/app.py` and set `DATABASE_URL` secret

## Notes
- `.env` and `.env.*` are gitignored. Never commit real secrets.
- For insights, if quota or key is unavailable, the UI shows local fallback tips and a short cooldown.
