import os
import textwrap
from datetime import date as date_cls

import pandas as pd
import streamlit as st
from sqlalchemy import create_engine, text

st.set_page_config(page_title="Health Dashboard (Streamlit)", page_icon="💚", layout="wide")

DB_URL = os.getenv("DATABASE_URL") or st.secrets.get("DATABASE_URL")
if not DB_URL:
    st.error("DATABASE_URL not set. Add it to your environment or Streamlit secrets.")
    st.stop()

# SQLAlchemy accepts postgresql+psycopg2, but plain postgresql works for psycopg2-binary
if DB_URL.startswith("postgresql://"):
    engine = create_engine(DB_URL)
elif DB_URL.startswith("postgres://"):
    engine = create_engine(DB_URL.replace("postgres://", "postgresql://", 1))
else:
    engine = create_engine(DB_URL)

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

users_df, physical_df, mental_df, goals_df = load_tables()

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

start, end = st.sidebar.date_input("Date range", value=(min_date, max_date))
if isinstance(start, tuple):
    # Streamlit might return a single date in some versions
    start, end = start

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
    st.metric("Avg Mood", f"{mood.mean():.1f}/5" if not mood.empty else "0/5")

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
