# Health Dashboard - Streamlit App

This Streamlit app reads your Postgres database (used by the Next.js app via Prisma) and renders an analytics dashboard for Physical, Mental, and Goals data.

See the full-stack app in `../fullstack/` for the main web application, APIs, authentication, and AI insights.

## Local run

1. Python 3.10+ recommended.
2. Create a virtual env and install deps:
   - macOS/Linux (zsh):
     - `python3 -m venv .venv && source .venv/bin/activate`
     - `pip install -r requirements.txt`
3. Export the same DATABASE_URL used by the Next.js app:
   - `export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/health_dashboard?schema=public"`
4. Run:
   - `streamlit run app.py`

## Streamlit Community Cloud

- Push this repo to GitHub.
- Create a new app on streamlit.io and point to `streamlit/app.py`.
- In App Settings → Secrets, add:

```
DATABASE_URL = "postgresql://<user>:<pass>@<host>:<port>/<db>?schema=public"
```

- Deploy.

## How it fits with the full stack
- The Next.js app (in `../fullstack/`) handles auth (Google via NextAuth), APIs (`/api/physical`, `/api/mental`, `/api/goals`, `/api/profile`), and AI insights (`/api/insights`).
- Prisma migrations create the tables: `User`, `PhysicalEntry`, `MentalEntry`, `Goal`, etc.
- Streamlit is read-only and uses pandas + SQLAlchemy + Altair to visualize the same data.

## Notes
- Dates are shown in your local timezone; use the date range picker to filter.
- No authentication inside Streamlit; filter by your user or email.
