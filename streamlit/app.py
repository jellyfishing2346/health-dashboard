import os
import textwrap
from datetime import date as date_cls

import pandas as pd
import streamlit as st
from sqlalchemy import create_engine, text

# Testing pg8000
def make_pg8000_url(url):
    import re
    url = re.sub(r'[?&]schema=[^&]+', '', url)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+pg8000://", 1)
    elif url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+pg8000://", 1)
    return url


st.set_page_config(page_title="Health Dashboard (Streamlit)", page_icon="💚", layout="wide")

# Prefer secrets over env
DB_URL = st.secrets.get("DATABASE_URL") or os.getenv("DATABASE_URL")
if not DB_URL:
    st.error("DATABASE_URL not set. Add it to your environment or Streamlit secrets.")
    st.stop()

# SQLAlchemy accepts postgresql+psycopg2, but plain postgresql works for psycopg2-binary
if DB_URL.startswith("postgresql://") or DB_URL.startswith("postgres://"):
    engine = create_engine(make_pg8000_url(DB_URL), connect_args={})
else:
    engine = create_engine(DB_URL)

# Early connectivity check with friendly errors
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
except Exception as e:
    msg = str(e)
    if "password authentication failed" in msg:
        st.error("Database password is incorrect. Update the DATABASE_URL secret.")
    elif "could not translate host name" in msg:
        st.error("Database host is invalid. Use the Direct connection host and add sslmode=require.")
    else:
        st.error(f"Database connection failed: {msg}")
    st.stop()

@st.cache_data(ttl=60)
def load_tables():
    with engine.connect() as conn:
        users = pd.read_sql(text('SELECT "id", "email", "name" FROM "User" ORDER BY "email" NULLS LAST'), conn)
        physical = pd.read_sql(text('SELECT * FROM "PhysicalEntry" ORDER BY "date" ASC'), conn)
        mental = pd.read_sql(text('SELECT * FROM "MentalEntry" ORDER BY "date" ASC'), conn)
        goals = pd.read_sql(text('SELECT * FROM "Goal" ORDER BY "createdAt" DESC'), conn)
    # Cast dates
    for df, cols in [
        (physical, ["date", "createdAt"]),
        (mental,   ["date", "createdAt"]),
        (goals,    ["targetDate", "createdAt", "updatedAt"]),
    ]:
        for c in cols:
            if c in df.columns:
                df[c] = pd.to_datetime(df[c], utc=True, errors="coerce")
    return users, physical, mental, goals

# Wrap table load to surface migration/schema issues
try:
    users_df, physical_df, mental_df, goals_df = load_tables()
except Exception as e:
    msg = str(e)
    if "relation" in msg and "does not exist" in msg:
        st.error("Schema not found. Run Prisma migrations against this DATABASE_URL (npx prisma migrate deploy).")
    else:
        st.error(f"Failed to load data: {msg}")
    st.stop()

st.sidebar.header("Filters")
# User filter
user_label = None
if not users_df.empty:
    users_df["label"] = users_df.apply(lambda r: r["email"] or r["name"] or r["id"][:8], axis=1)
    selected_user = st.sidebar.selectbox(
        "User",
        options=["All"] + users_df["label"].tolist(),
        index=0,
    )
    if selected_user != "All":
        user_row = users_df[users_df["label"] == selected_user].iloc[0]
        user_id = user_row["id"]
        user_label = selected_user
    else:
        user_id = None
else:
    st.sidebar.info("No users found. Showing all data.")
    user_id = None

# Date range
min_date = None
max_date = None
for df, col in [(physical_df, "date"), (mental_df, "date")]:
    if not df.empty:
        dmin = df[col].min().date()
        dmax = df[col].max().date()
        min_date = dmin if min_date is None else min(min_date, dmin)
        max_date = dmax if max_date is None else max(max_date, dmax)
if min_date is None:
    min_date = date_cls.today()
    max_date = date_cls.today()

date_input_val = st.sidebar.date_input("Date range", value=(min_date, max_date))
if isinstance(date_input_val, tuple):
    if len(date_input_val) == 2:
        start, end = date_input_val
    elif len(date_input_val) == 1:
        start = end = date_input_val[0]
    else:
        start = end = min_date
else:
    start = end = date_input_val

# Add Physical Entry form
st.sidebar.header("Add Physical Entry")
with st.sidebar.form(key="add_phys_form"):
    entry_date = st.date_input("Date", value=date_cls.today())
    heart_rate = st.number_input("Heart Rate (bpm)", min_value=30, max_value=220, value=70)
    steps = st.number_input("Steps", min_value=0, max_value=50000, value=5000)
    sleep_hours = st.number_input("Sleep Hours", min_value=0.0, max_value=24.0, value=7.0, step=0.1)
    submitted = st.form_submit_button("Add Entry")
    if submitted:
        target_user_id = user_id or (users_df["id"].iloc[0] if not users_df.empty else None)
        if not target_user_id:
            st.error("No user selected or available to add entry.")
        else:
            try:
                with engine.connect() as conn:
                    conn.execute(text('''
                        INSERT INTO "PhysicalEntry" ("userId", "date", "heartRate", "steps", "sleepHours")
                        VALUES (:userId, :date, :heartRate, :steps, :sleepHours)
                    '''), {
                        "userId": target_user_id,
                        "date": entry_date,
                        "heartRate": heart_rate,
                        "steps": steps,
                        "sleepHours": sleep_hours
                    })
                st.success("Physical entry added!")
                st.experimental_rerun()
            except Exception as e:
                st.error(f"Failed to add entry: {e}")

# Filter data
phys = physical_df.copy()
ment = mental_df.copy()
if user_id is not None:
    phys = phys[phys["userId"] == user_id]
    ment = ment[ment["userId"] == user_id]
    goals_view = goals_df[goals_df["userId"] == user_id].copy()
else:
    goals_view = goals_df.copy()

phys = phys[(phys["date"].dt.date >= start) & (phys["date"].dt.date <= end)]
ment = ment[(ment["date"].dt.date >= start) & (ment["date"].dt.date <= end)]

st.title("Health Dashboard (Streamlit)")
if user_label:
    st.caption(f"User: {user_label}")

# KPIs
col1, col2, col3, col4 = st.columns(4)
with col1:
    hr = phys["heartRate"].dropna()
    st.metric("Avg Heart Rate", f"{int(hr.mean()) if not hr.empty else 0} bpm")
with col2:
    steps = phys["steps"].dropna()
    st.metric("Avg Steps", f"{int(steps.mean()) if not steps.empty else 0}")
with col3:
    sleep = phys["sleepHours"].dropna()
    st.metric("Avg Sleep", f"{sleep.mean():.1f} h" if not sleep.empty else "0 h")
with col4:
    mood = ment["mood"].dropna()
    st.metric("Avg Mood", f"{mood.mean():.1f}/5" if not ment.empty else "0/5")

st.divider()

# Charts
import altair as alt

if not phys.empty:
    line_hr = alt.Chart(phys).mark_line(point=True).encode(
        x=alt.X('date:T', title='Date'),
        y=alt.Y('heartRate:Q', title='Heart Rate (bpm)')
    ).properties(height=250)
    line_sleep = alt.Chart(phys).mark_line(point=True, color='#22c55e').encode(
        x=alt.X('date:T', title='Date'),
        y=alt.Y('sleepHours:Q', title='Sleep (h)')
    ).properties(height=250)
    st.altair_chart(line_hr, use_container_width=True)
    st.altair_chart(line_sleep, use_container_width=True)
else:
    st.info("No physical data in the selected range.")

if not ment.empty:
    line_mood = alt.Chart(ment).mark_line(point=True, color='#6366f1').encode(
        x=alt.X('date:T', title='Date'),
        y=alt.Y('mood:Q', title='Mood (1-5)')
    ).properties(height=250)
    st.altair_chart(line_mood, use_container_width=True)
else:
    st.info("No mental data in the selected range.")

st.divider()

# Goals
st.subheader("Goals")
if goals_view.empty:
    st.info("No goals found.")
else:
    def pct(row):
        t = row.get("targetValue") or 0
        c = row.get("currentValue") or 0
        return int(max(0, min(100, round((c / t) * 100)))) if t > 0 else 0

    goals_view = goals_view.copy()
    goals_view["progress"] = goals_view.apply(pct, axis=1)

    for _, g in goals_view.iterrows():
        with st.container(border=True):
            st.write(f"**{g['title']}**  ")
            st.write(textwrap.shorten(g.get("description") or "", width=120))
            cols = st.columns([3,1])
            with cols[0]:
                st.progress(int(g["progress"]))
            with cols[1]:
                st.write(f"{g['currentValue']}/{g['targetValue']} {g.get('unit') or ''}")