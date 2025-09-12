import os
import textwrap
from datetime import date as date_cls, datetime, timedelta
from typing import Dict, List, Optional

import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np

def fetch_table(engine, table_name):
    import pandas as pd
    query = f"SELECT * FROM {table_name}"
    return pd.read_sql(query, engine)

# Check if we have a database connection, otherwise use demo mode
def check_database_connection():
    """Check if database is available, otherwise use demo mode"""
    DB_URL = st.secrets.get("DATABASE_URL") or os.getenv("DATABASE_URL")
    if not DB_URL:
        return False, None
    
    try:
        from sqlalchemy import create_engine, text
        
        def make_pg8000_url(url):
            import re
            url = re.sub(r'[?&]schema=[^&]+', '', url)
            if url.startswith("postgresql://"):
                return url.replace("postgresql://", "postgresql+pg8000://", 1)
            elif url.startswith("postgres://"):
                return url.replace("postgres://", "postgresql+pg8000://", 1)
            return url
        
        if DB_URL.startswith("postgresql://") or DB_URL.startswith("postgres://"):
            engine = create_engine(make_pg8000_url(DB_URL), connect_args={})
        else:
            engine = create_engine(DB_URL)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return True, engine
        
    except Exception as e:
        return False, str(e)

# Demo data for when database is not available
def create_demo_data():
    """Create demo data for testing the dashboard"""
    
    # Create demo users
    users_df = pd.DataFrame({
        'id': ['user1', 'user2'],
        'email': ['demo@example.com', 'test@example.com'],
        'name': ['Demo User', 'Test User']
    })
    
    # Create demo physical entries
    dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
    np.random.seed(42)  # For reproducible demo data
    
    physical_data = []
    for i, date in enumerate(dates[:100]):  # Last 100 days
        physical_data.append({
            'id': f'phys_{i}',
            'userId': 'user1',
            'date': date,
            'heartRate': np.random.randint(60, 100),
            'bloodPressureSystolic': np.random.randint(110, 140),
            'bloodPressureDiastolic': np.random.randint(70, 90),
            'weight': 70 + np.random.normal(0, 2),
            'sleepHours': 6 + np.random.exponential(2),
            'sleepQuality': np.random.randint(1, 6),
            'exerciseMinutes': np.random.poisson(30),
            'exerciseType': np.random.choice(['Running', 'Cycling', 'Swimming', 'Gym', 'Walking']),
            'exerciseIntensity': np.random.choice(['Low', 'Moderate', 'High']),
            'steps': np.random.randint(5000, 15000),
            'waterIntake': 1.5 + np.random.exponential(0.5),
            'notes': f'Demo entry for {date.strftime("%Y-%m-%d")}',
            'createdAt': date
        })
    
    physical_df = pd.DataFrame(physical_data)
    physical_df['date'] = pd.to_datetime(physical_df['date'])
    physical_df['createdAt'] = pd.to_datetime(physical_df['createdAt'])
    
    # Create demo mental entries
    mental_data = []
    for i, date in enumerate(dates[:80]):  # Last 80 days
        mental_data.append({
            'id': f'ment_{i}',
            'userId': 'user1',
            'date': date,
            'mood': np.random.randint(1, 6),
            'stressLevel': np.random.randint(1, 6),
            'anxietyLevel': np.random.randint(1, 6),
            'energyLevel': np.random.randint(1, 6),
            'meditationMinutes': np.random.poisson(15),
            'journalingDone': np.random.choice([True, False]),
            'socialConnection': np.random.randint(1, 6),
            'gratitudePractice': np.random.choice([True, False]),
            'notes': f'Mental health note for {date.strftime("%Y-%m-%d")}',
            'createdAt': date
        })
    
    mental_df = pd.DataFrame(mental_data)
    mental_df['date'] = pd.to_datetime(mental_df['date'])
    mental_df['createdAt'] = pd.to_datetime(mental_df['createdAt'])
    
    # Create demo goals
    goals_data = [
        {
            'id': 'goal1',
            'userId': 'user1',
            'title': 'Daily Steps Goal',
            'description': 'Walk 10,000 steps per day',
            'category': 'Fitness',
            'targetValue': 10000,
            'currentValue': 8500,
            'unit': 'steps/day',
            'targetDate': datetime(2024, 12, 31),
            'completed': False,
            'createdAt': datetime(2024, 1, 1),
            'updatedAt': datetime(2024, 9, 12)
        },
        {
            'id': 'goal2',
            'userId': 'user1',
            'title': 'Sleep Improvement',
            'description': 'Get 8 hours of sleep nightly',
            'category': 'Sleep',
            'targetValue': 8.0,
            'currentValue': 7.2,
            'unit': 'hours/night',
            'targetDate': datetime(2024, 12, 31),
            'completed': False,
            'createdAt': datetime(2024, 2, 1),
            'updatedAt': datetime(2024, 9, 12)
        },
        {
            'id': 'goal3',
            'userId': 'user1',
            'title': 'Weight Loss',
            'description': 'Lose 5kg in 6 months',
            'category': 'Weight Loss',
            'targetValue': 65.0,
            'currentValue': 68.5,
            'unit': 'kg',
            'targetDate': datetime(2024, 12, 31),
            'completed': False,
            'createdAt': datetime(2024, 6, 1),
            'updatedAt': datetime(2024, 9, 12)
        }
    ]
    
    goals_df = pd.DataFrame(goals_data)
    goals_df['targetDate'] = pd.to_datetime(goals_df['targetDate'])
    goals_df['createdAt'] = pd.to_datetime(goals_df['createdAt'])
    goals_df['updatedAt'] = pd.to_datetime(goals_df['updatedAt'])
    
    # Create demo profiles
    profiles_df = pd.DataFrame({
        'id': ['profile1'],
        'userId': ['user1'],
        'age': [28],
        'gender': ['Female'],
        'height': [165.0],
        'weight': [70.0],
        'createdAt': [datetime(2024, 1, 1)],
        'updatedAt': [datetime(2024, 9, 12)]
    })
    profiles_df['createdAt'] = pd.to_datetime(profiles_df['createdAt'])
    profiles_df['updatedAt'] = pd.to_datetime(profiles_df['updatedAt'])
    
    return users_df, physical_df, mental_df, goals_df, profiles_df

# Custom CSS for better appearance
st.markdown("""
<style>
/* Custom styling */
.main-header {
    text-align: center;
    padding: 1rem 0;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 10px;
    margin-bottom: 2rem;
}

.metric-card {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin: 0.5rem 0;
}

.demo-banner {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    text-align: center;
}

.stTabs [data-baseweb="tab-list"] {
    gap: 2px;
}

.stTabs [data-baseweb="tab"] {
    height: 50px;
    white-space: pre-wrap;
    background-color: #f0f2f6;
    border-radius: 4px 4px 0px 0px;
    gap: 1px;
    padding-top: 10px;
    padding-bottom: 10px;
}

.stTabs [aria-selected="true"] {
    background-color: #1f77b4;
    color: white;
}
</style>
""", unsafe_allow_html=True)

# Page configuration
st.set_page_config(
    page_title="Health Dashboard", 
    page_icon="💚", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# Check database connection
has_database, db_engine = check_database_connection()

if not has_database:
    st.markdown("""
    <div class="demo-banner">
        🚧 <strong>Demo Mode</strong> - Database not connected. Using sample data for demonstration.
        <br>To use with real data, configure your DATABASE_URL in Streamlit secrets or environment variables.
    </div>
    """, unsafe_allow_html=True)

# Load data (demo or real)
if has_database:
    st.info("Database connected! Real data loaded from Neon/Postgres.")
    users_df = fetch_table(db_engine, "User")
    physical_df = fetch_table(db_engine, "PhysicalEntry")
    mental_df = fetch_table(db_engine, "MentalEntry")
    goals_df = fetch_table(db_engine, "Goal")
    profiles_df = fetch_table(db_engine, "Profile")
else:
    users_df, physical_df, mental_df, goals_df, profiles_df = create_demo_data()

# Initialize session state
if "user_preferences" not in st.session_state:
    st.session_state.user_preferences = {
        "theme": "light",
        "dashboard_widgets": ["kpis", "trends", "goals"],
        "notifications": True
    }

if "edit_mode" not in st.session_state:
    st.session_state.edit_mode = {}

# Header
st.markdown("""
<div class="main-header">
    <h1>🏥 Health Dashboard</h1>
    <p>Track, analyze, and improve your health journey</p>
</div>
""", unsafe_allow_html=True)

# Sidebar
st.sidebar.header("🎛️ Dashboard Controls")

# User selection
user_label = None
if not users_df.empty:
    users_df["label"] = users_df.apply(lambda r: r["email"] or r["name"] or f"User {r['id'][:8]}", axis=1)
    selected_user = st.sidebar.selectbox(
        "👤 Select User",
        options=["All Users"] + users_df["label"].tolist(),
        index=1 if len(users_df) > 0 else 0,  # Default to first user in demo
        help="Choose a specific user or view all users' data"
    )
    if selected_user != "All Users":
        user_row = users_df[users_df["label"] == selected_user].iloc[0]
        user_id = user_row["id"]
        user_label = selected_user
    else:
        user_id = None
else:
    st.sidebar.info("No users found.")
    user_id = None

# Date range selection
st.sidebar.subheader("📅 Date Range")
date_ranges = {
    "Last 7 days": 7,
    "Last 30 days": 30,
    "Last 3 months": 90,
    "Custom range": None
}

quick_range = st.sidebar.selectbox(
    "Quick Range",
    options=list(date_ranges.keys()),
    index=1
)

if date_ranges[quick_range] is not None:
    end_date = date_cls.today()
    start_date = end_date - timedelta(days=date_ranges[quick_range])
else:
    col1, col2 = st.sidebar.columns(2)
    with col1:
        start_date = st.date_input("Start", value=date_cls.today() - timedelta(days=30))
    with col2:
        end_date = st.date_input("End", value=date_cls.today())

# View mode selection
st.sidebar.subheader("🎯 View Mode")
view_modes = {
    "📊 Dashboard": "dashboard",
    "⚙️ Manage Data": "manage",
    "📈 Analytics": "analytics", 
    "👤 Profile": "profile"
}

view_mode = st.sidebar.selectbox(
    "Choose View",
    options=list(view_modes.keys()),
    index=0
)

# Filter data
phys = physical_df.copy()
ment = mental_df.copy()
goals_view = goals_df.copy()

if user_id:
    phys = phys[phys["userId"] == user_id]
    ment = ment[ment["userId"] == user_id]
    goals_view = goals_view[goals_view["userId"] == user_id]

# Apply date filters
phys = phys[(phys["date"].dt.date >= start_date) & (phys["date"].dt.date <= end_date)]
ment = ment[(ment["date"].dt.date >= start_date) & (ment["date"].dt.date <= end_date)]

# Current user info
if user_label:
    st.info(f"👤 **Current User:** {user_label} | 📅 **Date Range:** {start_date} to {end_date}")

# Main content based on selected view mode
selected_mode = view_modes[view_mode]

if selected_mode == "dashboard":
    # Main Dashboard View
    st.header("📊 Health Overview")
    
    # KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if not phys.empty and 'heartRate' in phys.columns:
            avg_hr = int(phys["heartRate"].dropna().mean()) if not phys["heartRate"].dropna().empty else 0
            st.metric("💓 Avg Heart Rate", f"{avg_hr} bpm", help="Average resting heart rate")
        else:
            st.metric("💓 Avg Heart Rate", "No data")
    
    with col2:
        if not phys.empty and 'steps' in phys.columns:
            avg_steps = int(phys["steps"].dropna().mean()) if not phys["steps"].dropna().empty else 0
            st.metric("🚶 Avg Steps", f"{avg_steps:,}", help="Average daily steps")
        else:
            st.metric("🚶 Avg Steps", "No data")
    
    with col3:
        if not phys.empty and 'sleepHours' in phys.columns:
            avg_sleep = phys["sleepHours"].dropna().mean() if not phys["sleepHours"].dropna().empty else 0
            st.metric("😴 Avg Sleep", f"{avg_sleep:.1f}h", help="Average sleep per night")
        else:
            st.metric("😴 Avg Sleep", "No data")
    
    with col4:
        if not ment.empty and 'mood' in ment.columns:
            avg_mood = ment["mood"].dropna().mean() if not ment["mood"].dropna().empty else 0
            st.metric("😊 Avg Mood", f"{avg_mood:.1f}/5", help="Average mood rating")
        else:
            st.metric("😊 Avg Mood", "No data")
    
    # Charts Section
    st.header("📈 Health Trends")
    
    chart_tabs = st.tabs(["Physical Health", "Mental Health", "Sleep & Exercise"])
    
    with chart_tabs[0]:
        if not phys.empty and len(phys) > 0:
            # Heart Rate and Steps Chart
            fig = make_subplots(
                rows=2, cols=1,
                subplot_titles=("Heart Rate Over Time", "Daily Steps"),
                vertical_spacing=0.1
            )
            
            if 'heartRate' in phys.columns and len(phys['heartRate'].dropna()) > 0:
                fig.add_trace(
                    go.Scatter(x=phys['date'], y=phys['heartRate'], mode='lines+markers', 
                             name='Heart Rate', line=dict(color='red')),
                    row=1, col=1
                )
            
            if 'steps' in phys.columns and len(phys['steps'].dropna()) > 0:
                fig.add_trace(
                    go.Scatter(x=phys['date'], y=phys['steps'], mode='lines+markers',
                             name='Steps', line=dict(color='blue')),
                    row=2, col=1
                )
            
            fig.update_layout(height=500, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("📊 Physical health data will appear here once you have entries in your selected date range.")
            st.markdown("""
            **💡 Try this:**
            - Expand your date range to "Last 90 days" to see demo data
            - Or go to "Manage Data" → "Add Entry" to create new entries
            """)
    
    with chart_tabs[1]:
        if not ment.empty and len(ment) > 0:
            # Mental Health Metrics
            mental_metrics = ['mood', 'stressLevel', 'anxietyLevel', 'energyLevel']
            available_metrics = [m for m in mental_metrics if m in ment.columns and len(ment[m].dropna()) > 0]
            
            if available_metrics:
                fig = go.Figure()
                
                colors = ['purple', 'red', 'orange', 'green']
                for i, metric in enumerate(available_metrics):
                    fig.add_trace(go.Scatter(
                        x=ment['date'], 
                        y=ment[metric],
                        mode='lines+markers',
                        name=metric.replace('Level', '').title(),
                        line=dict(color=colors[i % len(colors)])
                    ))
                
                fig.update_layout(
                    title="Mental Health Trends",
                    xaxis_title="Date",
                    yaxis_title="Rating (1-5)",
                    height=400,
                    yaxis=dict(range=[1, 5])
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No mental health metrics available for charting.")
        else:
            st.info("📊 Mental health trends will appear here once you have entries in your selected date range.")
            st.markdown("""
            **💡 Try this:**
            - Expand your date range to "Last 90 days" to see demo data
            - Or go to "Manage Data" → "Add Entry" to create mood entries
            """)
    
    with chart_tabs[2]:
        if not phys.empty and len(phys) > 0:
            col1, col2 = st.columns(2)
            
            with col1:
                if 'sleepHours' in phys.columns and len(phys['sleepHours'].dropna()) > 0:
                    fig_sleep = px.line(phys, x='date', y='sleepHours', 
                                      title='Sleep Hours', 
                                      labels={'sleepHours': 'Hours', 'date': 'Date'})
                    fig_sleep.update_layout(height=300)
                    st.plotly_chart(fig_sleep, use_container_width=True)
                else:
                    st.info("No sleep data available")
            
            with col2:
                if 'exerciseMinutes' in phys.columns and len(phys['exerciseMinutes'].dropna()) > 0:
                    fig_exercise = px.line(phys, x='date', y='exerciseMinutes',
                                         title='Exercise Minutes',
                                         labels={'exerciseMinutes': 'Minutes', 'date': 'Date'})
                    fig_exercise.update_layout(height=300)
                    st.plotly_chart(fig_exercise, use_container_width=True)
                else:
                    st.info("No exercise data available")
        else:
            st.info("📊 Sleep and exercise trends will appear here with data.")
            st.markdown("💡 **Tip:** Try expanding your date range to see more data!")
    
    # Goals Section
    st.header("🎯 Goals Progress")
    if not goals_view.empty:
        for _, goal in goals_view.iterrows():
            progress = min(100, max(0, (goal['currentValue'] / goal['targetValue']) * 100)) if goal['targetValue'] > 0 else 0
            
            col1, col2 = st.columns([3, 1])
            with col1:
                st.subheader(goal['title'])
                st.progress(progress / 100)
                st.caption(f"{goal['currentValue']:.1f} / {goal['targetValue']:.1f} {goal['unit']}")
            
            with col2:
                status = "✅ Complete" if goal['completed'] else f"{progress:.1f}% Done"
                st.metric("Status", status)
    else:
        st.info("No goals set yet. Go to Profile section to create goals!")

elif selected_mode == "manage":
    st.header("⚙️ Data Management")
    
    manage_tabs = st.tabs(["📊 View Data", "➕ Add Entry", "🗑️ Delete Data"])
    
    with manage_tabs[0]:
        st.subheader("Your Health Data")
        
        data_type = st.selectbox("Select data type to view:", ["Physical Entries", "Mental Entries", "Goals"])
        
        if data_type == "Physical Entries" and not phys.empty:
            st.dataframe(phys[['date', 'heartRate', 'steps', 'sleepHours', 'exerciseMinutes', 'weight']].sort_values('date', ascending=False), use_container_width=True)
        
        elif data_type == "Mental Entries" and not ment.empty:
            st.dataframe(ment[['date', 'mood', 'stressLevel', 'anxietyLevel', 'energyLevel']].sort_values('date', ascending=False), use_container_width=True)
        
        elif data_type == "Goals" and not goals_view.empty:
            goals_display = goals_view[['title', 'category', 'currentValue', 'targetValue', 'unit', 'completed']].copy()
            st.dataframe(goals_display, use_container_width=True)
        
        else:
            st.info(f"No {data_type.lower()} found for the selected period.")
    
    with manage_tabs[1]:
        st.subheader("Add New Health Entry")
        
        if not has_database:
            st.warning("⚠️ Demo mode - entries won't be saved to database")
        
        entry_type = st.selectbox("Entry Type:", ["Physical Health", "Mental Health", "Goal"])
        
        if entry_type == "Physical Health":
            with st.form("add_physical"):
                st.markdown("**Physical Health Entry**")
                col1, col2 = st.columns(2)
                
                with col1:
                    entry_date = st.date_input("Date:", value=date_cls.today())
                    heart_rate = st.number_input("Heart Rate (bpm):", min_value=40, max_value=200, value=None)
                    weight = st.number_input("Weight (kg):", min_value=20.0, max_value=300.0, step=0.1, value=None)
                    sleep_hours = st.number_input("Sleep Hours:", min_value=0.0, max_value=24.0, step=0.1, value=None)
                
                with col2:
                    steps = st.number_input("Steps:", min_value=0, max_value=100000, value=None)
                    exercise_minutes = st.number_input("Exercise Minutes:", min_value=0, max_value=600, value=None)
                    exercise_type = st.text_input("Exercise Type:")
                    water_intake = st.number_input("Water Intake (L):", min_value=0.0, max_value=10.0, step=0.1, value=None)
                
                notes = st.text_area("Notes:")
                
                if st.form_submit_button("Add Entry"):
                    if has_database:
                        st.info("Database functionality not implemented yet")
                    else:
                        st.success("✅ Entry would be added (demo mode)")
        
        elif entry_type == "Mental Health":
            with st.form("add_mental"):
                st.markdown("**Mental Health Entry**")
                col1, col2 = st.columns(2)
                
                with col1:
                    entry_date = st.date_input("Date:", value=date_cls.today())
                    mood = st.slider("Mood (1-5):", min_value=1, max_value=5, value=3)
                    stress_level = st.slider("Stress Level (1-5):", min_value=1, max_value=5, value=3)
                
                with col2:
                    anxiety_level = st.slider("Anxiety Level (1-5):", min_value=1, max_value=5, value=3)
                    energy_level = st.slider("Energy Level (1-5):", min_value=1, max_value=5, value=3)
                    meditation_minutes = st.number_input("Meditation Minutes:", min_value=0, max_value=300, value=0)
                
                notes = st.text_area("Mental Health Notes:")
                
                if st.form_submit_button("Add Entry"):
                    if has_database:
                        st.info("Database functionality not implemented yet")
                    else:
                        st.success("✅ Entry would be added (demo mode)")
    
    with manage_tabs[2]:
        st.subheader("🗑️ Delete Data")
        st.warning("⚠️ This feature is only available with database connection")
        st.info("In demo mode, no data can be permanently deleted")

elif selected_mode == "analytics":
    st.header("📈 Advanced Analytics")
    
    analytics_tabs = st.tabs(["📊 Statistics", "🔗 Correlations", "📈 Trends"])
    
    with analytics_tabs[0]:
        st.subheader("Health Statistics Summary")
        
        if not phys.empty or not ment.empty:
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("**Physical Health Stats**")
                if not phys.empty:
                    numeric_cols = phys.select_dtypes(include=[np.number]).columns
                    if len(numeric_cols) > 0:
                        stats_df = phys[numeric_cols].describe().round(2)
                        st.dataframe(stats_df)
                    else:
                        st.info("No numeric physical data available")
                else:
                    st.info("No physical data available")
            
            with col2:
                st.markdown("**Mental Health Stats**")
                if not ment.empty:
                    numeric_cols = ment.select_dtypes(include=[np.number]).columns
                    if len(numeric_cols) > 0:
                        stats_df = ment[numeric_cols].describe().round(2)
                        st.dataframe(stats_df)
                    else:
                        st.info("No numeric mental health data available")
                else:
                    st.info("No mental health data available")
        else:
            st.info("No data available for statistical analysis")
    
    with analytics_tabs[1]:
        st.subheader("Health Metrics Correlations")
        
        if not phys.empty and not ment.empty:
            # Merge physical and mental data for correlation analysis
            try:
                merged = pd.merge(
                    phys[['date', 'heartRate', 'sleepHours', 'exerciseMinutes', 'steps']],
                    ment[['date', 'mood', 'stressLevel', 'energyLevel']],
                    on='date', how='inner'
                )
                
                if len(merged) > 5:
                    # Calculate correlation matrix
                    numeric_cols = merged.select_dtypes(include=[np.number]).columns
                    corr_matrix = merged[numeric_cols].corr()
                    
                    # Create correlation heatmap
                    fig = px.imshow(
                        corr_matrix,
                        labels=dict(color="Correlation"),
                        color_continuous_scale="RdBu",
                        aspect="auto",
                        title="Health Metrics Correlation Matrix"
                    )
                    fig.update_layout(height=500)
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Show strongest correlations
                    st.subheader("Strongest Correlations")
                    correlations = []
                    for i in range(len(corr_matrix.columns)):
                        for j in range(i+1, len(corr_matrix.columns)):
                            col1, col2 = corr_matrix.columns[i], corr_matrix.columns[j]
                            corr_value = corr_matrix.iloc[i, j]
                            if pd.notna(corr_value) and abs(corr_value) > 0.3:
                                correlations.append((col1, col2, corr_value))
                    
                    correlations.sort(key=lambda x: abs(x[2]), reverse=True)
                    
                    for col1, col2, corr_value in correlations[:5]:
                        strength = "Strong" if abs(corr_value) > 0.7 else "Moderate"
                        direction = "positive" if corr_value > 0 else "negative"
                        st.info(f"**{col1}** and **{col2}**: {strength} {direction} correlation ({corr_value:.3f})")
                
                else:
                    st.info("Need more matching data points for correlation analysis")
            
            except Exception as e:
                st.error(f"Error in correlation analysis: {str(e)}")
        else:
            st.info("Need both physical and mental health data for correlation analysis")
    
    with analytics_tabs[2]:
        st.subheader("Trend Analysis")
        
        if not phys.empty:
            trend_metric = st.selectbox("Select metric for trend analysis:", 
                                      ['heartRate', 'sleepHours', 'steps', 'exerciseMinutes'])
            
            if trend_metric in phys.columns:
                trend_data = phys[['date', trend_metric]].dropna()
                
                if len(trend_data) > 5:
                    # Create trend chart with moving average
                    trend_data = trend_data.sort_values('date')
                    trend_data['7_day_avg'] = trend_data[trend_metric].rolling(window=7, min_periods=1).mean()
                    
                    fig = go.Figure()
                    
                    # Raw data
                    fig.add_trace(go.Scatter(
                        x=trend_data['date'],
                        y=trend_data[trend_metric],
                        mode='markers',
                        name='Daily Values',
                        opacity=0.6
                    ))
                    
                    # 7-day moving average
                    fig.add_trace(go.Scatter(
                        x=trend_data['date'],
                        y=trend_data['7_day_avg'],
                        mode='lines',
                        name='7-Day Average',
                        line=dict(width=3)
                    ))
                    
                    fig.update_layout(
                        title=f"{trend_metric.title()} Trend Analysis",
                        xaxis_title="Date",
                        yaxis_title=trend_metric.replace('_', ' ').title(),
                        height=400
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Basic trend statistics
                    recent_avg = trend_data[trend_metric].tail(7).mean()
                    overall_avg = trend_data[trend_metric].mean()
                    trend_direction = "↗️ Increasing" if recent_avg > overall_avg else "↘️ Decreasing" if recent_avg < overall_avg else "➡️ Stable"
                    
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Recent Average", f"{recent_avg:.1f}")
                    with col2:
                        st.metric("Overall Average", f"{overall_avg:.1f}")
                    with col3:
                        st.metric("Trend Direction", trend_direction)
                
                else:
                    st.info("Need more data points for trend analysis")
        else:
            st.info("No physical data available for trend analysis")

elif selected_mode == "profile":
    st.header("👤 User Profile & Goals")
    
    profile_tabs = st.tabs(["👤 Personal Info", "🎯 Goals Management"])
    
    with profile_tabs[0]:
        st.subheader("Personal Health Profile")
        
        if user_id:
            # Display profile if exists
            user_profile = profiles_df[profiles_df['userId'] == user_id]
            
            if not user_profile.empty:
                profile = user_profile.iloc[0]
                
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("Age", f"{profile['age']} years")
                    st.metric("Gender", profile['gender'])
                
                with col2:
                    st.metric("Height", f"{profile['height']} cm")
                    st.metric("Weight", f"{profile['weight']} kg")
                
                with col3:
                    # Calculate BMI
                    bmi = profile['weight'] / ((profile['height']/100) ** 2)
                    bmi_category = ("Underweight" if bmi < 18.5 else 
                                  "Normal" if bmi < 25 else 
                                  "Overweight" if bmi < 30 else "Obese")
                    st.metric("BMI", f"{bmi:.1f}")
                    st.metric("BMI Category", bmi_category)
                
                if not has_database:
                    st.info("💡 Profile editing available with database connection")
            
            else:
                st.info("No profile found for this user")
                if not has_database:
                    st.info("💡 Profile creation available with database connection")
        else:
            st.warning("Please select a user to view profile")
    
    with profile_tabs[1]:
        st.subheader("🎯 Goals Management")
        
        if user_id:
            if not goals_view.empty:
                st.markdown("**Your Goals**")
                
                for _, goal in goals_view.iterrows():
                    progress = min(100, max(0, (goal['currentValue'] / goal['targetValue']) * 100)) if goal['targetValue'] > 0 else 0
                    
                    with st.expander(f"🎯 {goal['title']} ({progress:.1f}% complete)"):
                        col1, col2 = st.columns([2, 1])
                        
                        with col1:
                            st.write(f"**Description:** {goal['description']}")
                            st.write(f"**Category:** {goal['category']}")
                            st.write(f"**Progress:** {goal['currentValue']:.1f} / {goal['targetValue']:.1f} {goal['unit']}")
                            st.write(f"**Target Date:** {goal['targetDate'].strftime('%Y-%m-%d')}")
                            st.write(f"**Status:** {'✅ Completed' if goal['completed'] else '🔄 In Progress'}")
                        
                        with col2:
                            st.progress(progress / 100)
                            
                            if not has_database:
                                st.info("Goal editing available with database")
            else:
                st.info("No goals set yet")
            
            # Goal creation form
            st.markdown("---")
            st.markdown("**🎯 Create New Goal**")
            
            if not has_database:
                st.warning("⚠️ Demo mode - goals won't be saved")
            
            goal_templates = {
                "Custom Goal": None,
                "Daily Steps (10,000)": {"target": 10000, "unit": "steps/day", "category": "Fitness"},
                "Sleep Goal (8 hours)": {"target": 8, "unit": "hours/night", "category": "Sleep"},
                "Exercise Weekly (5 days)": {"target": 5, "unit": "days/week", "category": "Fitness"},
                "Weight Loss (5 kg)": {"target": 5, "unit": "kg", "category": "Weight Loss"}
            }
            
            selected_template = st.selectbox("Choose a goal template:", list(goal_templates.keys()))
            
            with st.form("create_goal"):
                col1, col2 = st.columns(2)
                
                with col1:
                    if selected_template != "Custom Goal":
                        template = goal_templates[selected_template]
                        goal_title = st.text_input("Goal Title:", value=selected_template.replace(" (", " - ").replace(")", ""))
                        goal_category = st.selectbox("Category:", 
                                                   ["Fitness", "Sleep", "Weight Loss", "Mental Health", "Nutrition"],
                                                   index=["Fitness", "Sleep", "Weight Loss", "Mental Health", "Nutrition"].index(template["category"]))
                        target_value = st.number_input("Target Value:", value=float(template["target"]), min_value=0.1)
                        unit = st.text_input("Unit:", value=template["unit"])
                    else:
                        goal_title = st.text_input("Goal Title:")
                        goal_category = st.selectbox("Category:", ["Fitness", "Sleep", "Weight Loss", "Mental Health", "Nutrition"])
                        target_value = st.number_input("Target Value:", min_value=0.1)
                        unit = st.text_input("Unit:")
                
                with col2:
                    goal_description = st.text_area("Description:")
                    current_value = st.number_input("Starting Value:", min_value=0.0)
                    target_date = st.date_input("Target Date:", value=date_cls.today() + timedelta(days=30))
                
                if st.form_submit_button("🎯 Create Goal"):
                    if goal_title and target_value:
                        if has_database:
                            st.info("Database goal creation not implemented yet")
                        else:
                            st.success("✅ Goal would be created (demo mode)")
                    else:
                        st.warning("Please fill in title and target value")
        else:
            st.warning("Please select a user to manage goals")

# Sidebar additional info
with st.sidebar:
    st.markdown("---")
    st.markdown("### 📊 Quick Stats")
    
    if user_id and (not phys.empty or not ment.empty):
        # Today's entries
        today_physical = len(phys[phys['date'].dt.date == date_cls.today()])
        today_mental = len(ment[ment['date'].dt.date == date_cls.today()])
        
        col1, col2 = st.columns(2)
        with col1:
            st.metric("📝 Today", f"{today_physical + today_mental}")
        with col2:
            st.metric("📅 Total", f"{len(phys) + len(ment)}")
        
        # Goals progress
        if not goals_view.empty:
            completed_goals = len(goals_view[goals_view['completed'] == True])
            st.metric("🎯 Goals", f"{completed_goals}/{len(goals_view)} completed")
    
    st.markdown("---")
    st.markdown("### ❓ Quick Help")
    
    with st.expander("🆘 Getting Started"):
        st.markdown("""
        **Quick Guide:**
        1. 👤 Select a user (Demo User available)
        2. 📅 Choose your date range
        3. 📊 Explore the Dashboard
        4. ⚙️ Add new health entries
        5. 📈 View analytics and trends
        6. 🎯 Set and track goals
        
        **Demo Mode:**
        - Using sample data for demonstration
        - Connect a database for real data persistence
        - All features fully functional in demo
        """)
    
    # Database status
    st.markdown("---")
    if has_database:
        st.success("🟢 Database Connected")
    else:
        st.warning("🟡 Demo Mode")
        st.caption("Using sample data")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; padding: 20px; color: #666;">
    <p><strong>🏥 Health Dashboard</strong> | Track your wellness journey</p>
    <p><small>⚕️ This app is for tracking purposes only. Consult healthcare professionals for medical advice.</small></p>
    <p><small>Built with ❤️ using Streamlit | Version 1.0</small></p>
</div>
""", unsafe_allow_html=True)