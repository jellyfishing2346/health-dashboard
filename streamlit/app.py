import os
import textwrap
from datetime import date as date_cls, datetime

import pandas as pd
import streamlit as st
from sqlalchemy import create_engine, text

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

# Database operation functions
def delete_entry(table_name, entry_id):
    """Delete an entry from the specified table"""
    try:
        with engine.connect() as conn:
            query = text(f'DELETE FROM "{table_name}" WHERE "id" = :entry_id')
            result = conn.execute(query, {"entry_id": entry_id})
            conn.commit()
            return result.rowcount > 0
    except Exception as e:
        st.error(f"Error deleting entry: {str(e)}")
        return False

def update_physical_entry(entry_id, data):
    """Update a physical entry"""
    try:
        with engine.connect() as conn:
            # Build update query dynamically based on provided data
            set_clauses = []
            params = {"entry_id": entry_id}
            
            for field, value in data.items():
                if value is not None:
                    set_clauses.append(f'"{field}" = :{field}')
                    params[field] = value
            
            if set_clauses:
                query = text(f'''
                    UPDATE "PhysicalEntry" 
                    SET {", ".join(set_clauses)}
                    WHERE "id" = :entry_id
                ''')
                result = conn.execute(query, params)
                conn.commit()
                return result.rowcount > 0
    except Exception as e:
        st.error(f"Error updating physical entry: {str(e)}")
        return False

def update_mental_entry(entry_id, data):
    """Update a mental entry"""
    try:
        with engine.connect() as conn:
            set_clauses = []
            params = {"entry_id": entry_id}
            
            for field, value in data.items():
                if value is not None:
                    set_clauses.append(f'"{field}" = :{field}')
                    params[field] = value
            
            if set_clauses:
                query = text(f'''
                    UPDATE "MentalEntry" 
                    SET {", ".join(set_clauses)}
                    WHERE "id" = :entry_id
                ''')
                result = conn.execute(query, params)
                conn.commit()
                return result.rowcount > 0
    except Exception as e:
        st.error(f"Error updating mental entry: {str(e)}")
        return False

def update_goal(entry_id, data):
    """Update a goal"""
    try:
        with engine.connect() as conn:
            set_clauses = []
            params = {"entry_id": entry_id, "updated_at": datetime.utcnow()}
            
            for field, value in data.items():
                if value is not None:
                    set_clauses.append(f'"{field}" = :{field}')
                    params[field] = value
            
            # Always update the updatedAt field
            set_clauses.append('"updatedAt" = :updated_at')
            
            if set_clauses:
                query = text(f'''
                    UPDATE "Goal" 
                    SET {", ".join(set_clauses)}
                    WHERE "id" = :entry_id
                ''')
                result = conn.execute(query, params)
                conn.commit()
                return result.rowcount > 0
    except Exception as e:
        st.error(f"Error updating goal: {str(e)}")
        return False

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

# Initialize session state for edit modes
if "edit_mode" not in st.session_state:
    st.session_state.edit_mode = {}

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

# Add view mode selector
view_mode = st.sidebar.selectbox(
    "View Mode",
    options=["Dashboard", "Manage Entries"],
    index=0
)

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

if view_mode == "Dashboard":
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

else:  # Manage Entries mode
    tab1, tab2, tab3 = st.tabs(["Physical Entries", "Mental Entries", "Goals"])
    
    with tab1:
        st.subheader("Physical Entries")
        if phys.empty:
            st.info("No physical entries found.")
        else:
            for idx, entry in phys.iterrows():
                entry_key = f"phys_{entry['id']}"
                
                with st.expander(f"Entry from {entry['date'].strftime('%Y-%m-%d')}"):
                    col1, col2 = st.columns([3, 1])
                    
                    with col2:
                        if st.button("Delete", key=f"del_{entry_key}", type="secondary"):
                            if st.session_state.get(f"confirm_del_{entry_key}", False):
                                if delete_entry("PhysicalEntry", entry['id']):
                                    st.success("Entry deleted successfully!")
                                    st.cache_data.clear()
                                    st.rerun()
                                else:
                                    st.error("Failed to delete entry")
                            else:
                                st.session_state[f"confirm_del_{entry_key}"] = True
                                st.rerun()
                        
                        if st.session_state.get(f"confirm_del_{entry_key}", False):
                            st.warning("Click Delete again to confirm")
                            if st.button("Cancel", key=f"cancel_{entry_key}"):
                                st.session_state[f"confirm_del_{entry_key}"] = False
                                st.rerun()
                    
                    with col1:
                        if entry_key not in st.session_state.edit_mode:
                            st.session_state.edit_mode[entry_key] = False
                        
                        if not st.session_state.edit_mode[entry_key]:
                            # Display mode
                            st.write(f"**Heart Rate:** {entry['heartRate']} bpm" if pd.notna(entry['heartRate']) else "**Heart Rate:** Not recorded")
                            st.write(f"**Steps:** {entry['steps']}" if pd.notna(entry['steps']) else "**Steps:** Not recorded")
                            st.write(f"**Sleep Hours:** {entry['sleepHours']}" if pd.notna(entry['sleepHours']) else "**Sleep Hours:** Not recorded")
                            st.write(f"**Weight:** {entry['weight']} kg" if pd.notna(entry['weight']) else "**Weight:** Not recorded")
                            st.write(f"**Exercise:** {entry['exerciseMinutes']} min ({entry['exerciseType']})" if pd.notna(entry['exerciseMinutes']) else "**Exercise:** Not recorded")
                            if st.button("Edit", key=f"edit_{entry_key}"):
                                st.session_state.edit_mode[entry_key] = True
                                st.rerun()
                        else:
                            # Edit mode
                            with st.form(key=f"form_{entry_key}"):
                                new_heart_rate = st.number_input("Heart Rate (bpm)", value=float(entry['heartRate']) if pd.notna(entry['heartRate']) else None, min_value=0.0, step=1.0)
                                new_steps = st.number_input("Steps", value=int(entry['steps']) if pd.notna(entry['steps']) else None, min_value=0, step=1)
                                new_sleep = st.number_input("Sleep Hours", value=float(entry['sleepHours']) if pd.notna(entry['sleepHours']) else None, min_value=0.0, step=0.1)
                                new_weight = st.number_input("Weight (kg)", value=float(entry['weight']) if pd.notna(entry['weight']) else None, min_value=0.0, step=0.1)
                                new_exercise_min = st.number_input("Exercise Minutes", value=int(entry['exerciseMinutes']) if pd.notna(entry['exerciseMinutes']) else None, min_value=0, step=1)
                                new_exercise_type = st.text_input("Exercise Type", value=entry['exerciseType'] if pd.notna(entry['exerciseType']) else "")
                                
                                col_save, col_cancel = st.columns(2)
                                with col_save:
                                    if st.form_submit_button("Save Changes"):
                                        update_data = {
                                            "heartRate": int(new_heart_rate) if new_heart_rate else None,
                                            "steps": int(new_steps) if new_steps else None,
                                            "sleepHours": float(new_sleep) if new_sleep else None,
                                            "weight": float(new_weight) if new_weight else None,
                                            "exerciseMinutes": int(new_exercise_min) if new_exercise_min else None,
                                            "exerciseType": new_exercise_type if new_exercise_type else None,
                                        }
                                        if update_physical_entry(entry['id'], update_data):
                                            st.success("Entry updated successfully!")
                                            st.session_state.edit_mode[entry_key] = False
                                            st.cache_data.clear()
                                            st.rerun()
                                        else:
                                            st.error("Failed to update entry")
                                
                                with col_cancel:
                                    if st.form_submit_button("Cancel"):
                                        st.session_state.edit_mode[entry_key] = False
                                        st.rerun()
    
    with tab2:
        st.subheader("Mental Entries")
        if ment.empty:
            st.info("No mental entries found.")
        else:
            for idx, entry in ment.iterrows():
                entry_key = f"ment_{entry['id']}"
                
                with st.expander(f"Entry from {entry['date'].strftime('%Y-%m-%d')}"):
                    col1, col2 = st.columns([3, 1])
                    
                    with col2:
                        if st.button("Delete", key=f"del_{entry_key}", type="secondary"):
                            if st.session_state.get(f"confirm_del_{entry_key}", False):
                                if delete_entry("MentalEntry", entry['id']):
                                    st.success("Entry deleted successfully!")
                                    st.cache_data.clear()
                                    st.rerun()
                                else:
                                    st.error("Failed to delete entry")
                            else:
                                st.session_state[f"confirm_del_{entry_key}"] = True
                                st.rerun()
                        
                        if st.session_state.get(f"confirm_del_{entry_key}", False):
                            st.warning("Click Delete again to confirm")
                            if st.button("Cancel", key=f"cancel_{entry_key}"):
                                st.session_state[f"confirm_del_{entry_key}"] = False
                                st.rerun()
                    
                    with col1:
                        if entry_key not in st.session_state.edit_mode:
                            st.session_state.edit_mode[entry_key] = False
                        
                        if not st.session_state.edit_mode[entry_key]:
                            # Display mode
                            st.write(f"**Mood:** {entry['mood']}/5" if pd.notna(entry['mood']) else "**Mood:** Not recorded")
                            st.write(f"**Stress Level:** {entry['stressLevel']}/5" if pd.notna(entry['stressLevel']) else "**Stress Level:** Not recorded")
                            st.write(f"**Anxiety Level:** {entry['anxietyLevel']}/5" if pd.notna(entry['anxietyLevel']) else "**Anxiety Level:** Not recorded")
                            st.write(f"**Energy Level:** {entry['energyLevel']}/5" if pd.notna(entry['energyLevel']) else "**Energy Level:** Not recorded")
                            if st.button("Edit", key=f"edit_{entry_key}"):
                                st.session_state.edit_mode[entry_key] = True
                                st.rerun()
                        else:
                            # Edit mode
                            with st.form(key=f"form_{entry_key}"):
                                new_mood = st.slider("Mood", min_value=1, max_value=5, value=int(entry['mood']) if pd.notna(entry['mood']) else 3)
                                new_stress = st.slider("Stress Level", min_value=1, max_value=5, value=int(entry['stressLevel']) if pd.notna(entry['stressLevel']) else 3)
                                new_anxiety = st.slider("Anxiety Level", min_value=1, max_value=5, value=int(entry['anxietyLevel']) if pd.notna(entry['anxietyLevel']) else 3)
                                new_energy = st.slider("Energy Level", min_value=1, max_value=5, value=int(entry['energyLevel']) if pd.notna(entry['energyLevel']) else 3)
                                new_meditation = st.number_input("Meditation Minutes", value=int(entry['meditationMinutes']) if pd.notna(entry['meditationMinutes']) else 0, min_value=0, step=1)
                                
                                col_save, col_cancel = st.columns(2)
                                with col_save:
                                    if st.form_submit_button("Save Changes"):
                                        update_data = {
                                            "mood": new_mood,
                                            "stressLevel": new_stress,
                                            "anxietyLevel": new_anxiety,
                                            "energyLevel": new_energy,
                                            "meditationMinutes": new_meditation,
                                        }
                                        if update_mental_entry(entry['id'], update_data):
                                            st.success("Entry updated successfully!")
                                            st.session_state.edit_mode[entry_key] = False
                                            st.cache_data.clear()
                                            st.rerun()
                                        else:
                                            st.error("Failed to update entry")
                                
                                with col_cancel:
                                    if st.form_submit_button("Cancel"):
                                        st.session_state.edit_mode[entry_key] = False
                                        st.rerun()
    
    with tab3:
        st.subheader("Goals")
        if goals_view.empty:
            st.info("No goals found.")
        else:
            for idx, goal in goals_view.iterrows():
                goal_key = f"goal_{goal['id']}"
                
                with st.expander(f"{goal['title']} (Created: {goal['createdAt'].strftime('%Y-%m-%d')})"):
                    col1, col2 = st.columns([3, 1])
                    
                    with col2:
                        if st.button("Delete", key=f"del_{goal_key}", type="secondary"):
                            if st.session_state.get(f"confirm_del_{goal_key}", False):
                                if delete_entry("Goal", goal['id']):
                                    st.success("Goal deleted successfully!")
                                    st.cache_data.clear()
                                    st.rerun()
                                else:
                                    st.error("Failed to delete goal")
                            else:
                                st.session_state[f"confirm_del_{goal_key}"] = True
                                st.rerun()
                        
                        if st.session_state.get(f"confirm_del_{goal_key}", False):
                            st.warning("Click Delete again to confirm")
                            if st.button("Cancel", key=f"cancel_{goal_key}"):
                                st.session_state[f"confirm_del_{goal_key}"] = False
                                st.rerun()
                    
                    with col1:
                        if goal_key not in st.session_state.edit_mode:
                            st.session_state.edit_mode[goal_key] = False
                        
                        if not st.session_state.edit_mode[goal_key]:
                            # Display mode
                            st.write(f"**Description:** {goal['description']}")
                            st.write(f"**Category:** {goal['category']}")
                            st.write(f"**Progress:** {goal['currentValue']}/{goal['targetValue']} {goal['unit']}")
                            st.write(f"**Target Date:** {goal['targetDate'].strftime('%Y-%m-%d')}")
                            st.write(f"**Status:** {'Completed' if goal['completed'] else 'In Progress'}")
                            if st.button("Edit", key=f"edit_{goal_key}"):
                                st.session_state.edit_mode[goal_key] = True
                                st.rerun()
                        else:
                            # Edit mode
                            with st.form(key=f"form_{goal_key}"):
                                new_title = st.text_input("Title", value=goal['title'])
                                new_description = st.text_area("Description", value=goal['description'])
                                new_category = st.text_input("Category", value=goal['category'])
                                new_current = st.number_input("Current Value", value=float(goal['currentValue']), min_value=0.0, step=0.1)
                                new_target = st.number_input("Target Value", value=float(goal['targetValue']), min_value=0.0, step=0.1)
                                new_unit = st.text_input("Unit", value=goal['unit'])
                                new_completed = st.checkbox("Completed", value=bool(goal['completed']))
                                
                                col_save, col_cancel = st.columns(2)
                                with col_save:
                                    if st.form_submit_button("Save Changes"):
                                        update_data = {
                                            "title": new_title,
                                            "description": new_description,
                                            "category": new_category,
                                            "currentValue": new_current,
                                            "targetValue": new_target,
                                            "unit": new_unit,
                                            "completed": new_completed,
                                        }
                                        if update_goal(goal['id'], update_data):
                                            st.success("Goal updated successfully!")
                                            st.session_state.edit_mode[goal_key] = False
                                            st.cache_data.clear()
                                            st.rerun()
                                        else:
                                            st.error("Failed to update goal")
                                
                                with col_cancel:
                                    if st.form_submit_button("Cancel"):
                                        st.session_state.edit_mode[goal_key] = False
                                        st.rerun()