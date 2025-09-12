# 📊 Health Dashboard - Analytics App

> **Advanced Analytics & Visualization Platform**  
> A Streamlit-powered analytics dashboard for comprehensive health data analysis and insights.

![Streamlit](https://img.shields.io/badge/Streamlit-1.28-FF6B6B) ![Python](https://img.shields.io/badge/Python-3.8%2B-blue) ![Pandas](https://img.shields.io/badge/Pandas-2.0-green) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-orange)

This is the **analytics companion app** to the main Next.js health dashboard. It provides advanced data visualization, statistical analysis, and insights using the same PostgreSQL database.

---

## ✨ **Features**

### 📈 **Advanced Analytics**
- **Statistical Analysis**: Comprehensive health metrics overview with descriptive statistics
- **Correlation Analysis**: Discover relationships between physical and mental health metrics
- **Trend Analysis**: Moving averages, pattern recognition, and forecasting
- **Health Scoring**: Weighted health scores based on multiple factors

### 📊 **Interactive Visualizations**
- **Multi-metric Dashboards**: Physical and mental health trend charts
- **Correlation Heatmaps**: Visual correlation matrices with Altair
- **Progress Tracking**: Goal achievement and streak analysis
- **Time Series Analysis**: Historical trends with moving averages

### 🎯 **User Management**
- **Multi-user Support**: Filter data by specific users
- **Date Range Filtering**: Flexible date range selection
- **Real-time Updates**: Live data from the main application database
- **Export Capabilities**: Data export functionality

---

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.8 or higher
- Access to the same PostgreSQL database as the main Next.js app
- Virtual environment (recommended)

### **Installation**

#### 1. **Setup Environment**
```bash
# Navigate to streamlit directory
cd streamlit

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip
```

#### 2. **Install Dependencies**
```bash
# Install all required packages
pip install -r requirements.txt

# Or install manually:
pip install streamlit pandas plotly altair sqlalchemy pg8000 numpy scipy
```

#### 3. **Configure Database Connection**
```bash
# Set environment variable (same as your Next.js app)
export DATABASE_URL="postgresql://user:password@localhost:5432/health_dashboard?schema=public"

# Or create .env file (not committed to git)
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/health_dashboard"' > .env
```

#### 4. **Run the Application**
```bash
streamlit run app.py
```

**🎉 Open http://localhost:8501** - Your analytics dashboard is ready!

---

## 📋 **Requirements**

### **Python Dependencies**
```txt
streamlit>=1.28.0
pandas>=2.0.0
plotly>=5.15.0
altair>=5.0.0
sqlalchemy>=2.0.0
pg8000>=1.30.0
numpy>=1.24.0
scipy>=1.10.0
```

### **Database Requirements**
- **PostgreSQL**: Same database as the main Next.js application
- **Schema Access**: Read access to all health data tables
- **Connection**: Direct database connection (not through API)

---

## 🏗️ **Architecture**

```
streamlit/
├── 📄 app.py                    # Main Streamlit application
├── 📁 components/               # Reusable Streamlit components
│   ├── dashboard.py             # Dashboard view components
│   ├── analytics.py             # Analytics visualizations
│   ├── insights.py              # Health insights generation
│   └── charts.py                # Chart creation utilities
├── 📁 data/                     # Data processing modules
│   ├── database.py              # Database connection and queries
│   ├── processors.py            # Data processing utilities
│   └── validators.py            # Data validation functions
├── 📁 utils/                    # Utility functions
│   ├── health_calculations.py   # Health metric calculations
│   ├── statistical_analysis.py # Statistical analysis functions
│   └── export_utils.py          # Data export utilities
├── 📄 requirements.txt          # Python dependencies
└── 📄 README.md                # This file
```

---

## 📊 **Data Models**

The analytics app reads from the same database schema as the main application:

### **Physical Health Data**
```python
# PhysicalEntry table structure
{
    'id': str,
    'userId': str,
    'date': datetime,
    'heartRate': Optional[int],
    'bloodPressureSystolic': Optional[int],
    'bloodPressureDiastolic': Optional[int],
    'weight': Optional[float],
    'sleepHours': Optional[float],
    'sleepQuality': Optional[int],
    'exerciseMinutes': Optional[int],
    'exerciseType': Optional[str],
    'steps': Optional[int],
    'waterIntake': Optional[float],
    'notes': Optional[str]
}
```

### **Mental Health Data**
```python
# MentalEntry table structure
{
    'id': str,
    'userId': str,
    'date': datetime,
    'mood': Optional[int],           # 1-5 scale
    'stressLevel': Optional[int],    # 1-5 scale
    'anxietyLevel': Optional[int],   # 1-5 scale
    'energyLevel': Optional[int],    # 1-5 scale
    'meditationMinutes': Optional[int],
    'journalingDone': Optional[bool],
    'socialConnection': Optional[int],
    'gratitudePractice': Optional[bool],
    'notes': Optional[str]
}
```

---

## 🎨 **Customization**

### **Adding Custom Analytics**

#### 1. **Create New Analysis Function**
```python
# In utils/custom_analysis.py
import pandas as pd
import streamlit as st

def custom_health_analysis(data: pd.DataFrame) -> dict:
    """
    Perform custom analysis on health data
    """
    results = {
        'avg_metric': data['custom_metric'].mean(),
        'trend': calculate_trend(data),
        'insights': generate_insights(data)
    }
    return results

def display_custom_analysis(data: pd.DataFrame):
    """
    Display custom analysis in Streamlit
    """
    st.subheader("Custom Health Analysis")
    
    results = custom_health_analysis(data)
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Average Custom Metric", f"{results['avg_metric']:.1f}")
    with col2:
        st.metric("Trend", results['trend'])
    
    st.write("**Insights:**")
    for insight in results['insights']:
        st.info(insight)
```

#### 2. **Add to Main App**
```python
# In app.py
from utils.custom_analysis import display_custom_analysis

# Add to your main app logic
if selected_mode == "custom_analytics":
    display_custom_analysis(filtered_data)
```

### **Custom Visualizations**

```python
# Custom chart creation
import altair as alt

def create_custom_chart(data: pd.DataFrame, x_col: str, y_col: str):
    """
    Create custom Altair chart
    """
    chart = alt.Chart(data).mark_circle(size=100).encode(
        x=alt.X(x_col, title=x_col.replace('_', ' ').title()),
        y=alt.Y(y_col, title=y_col.replace('_', ' ').title()),
        color=alt.Color('userId:N', legend=alt.Legend(title="User")),
        tooltip=[x_col, y_col, 'date', 'userId']
    ).interactive()
    
    return chart
```

### **Custom Insights Generation**

```python
# Generate custom health insights
def generate_custom_insights(physical_data: pd.DataFrame, mental_data: pd.DataFrame) -> list:
    """
    Generate custom health insights based on data patterns
    """
    insights = []
    
    # Custom sleep analysis
    if not physical_data.empty and 'sleepHours' in physical_data.columns:
        avg_sleep = physical_data['sleepHours'].mean()
        if avg_sleep < 7:
            insights.append("💤 Your average sleep is below the recommended 7-9 hours")
        elif avg_sleep > 9:
            insights.append("😴 You're getting plenty of sleep - great for recovery!")
    
    # Custom exercise analysis
    if not physical_data.empty and 'exerciseMinutes' in physical_data.columns:
        weekly_exercise = physical_data['exerciseMinutes'].sum() / len(physical_data) * 7
        if weekly_exercise < 150:
            insights.append("🏃‍♂️ Consider increasing weekly exercise to meet WHO recommendations (150min)")
    
    return insights
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required
DATABASE_URL="postgresql://user:password@host:port/database"

# Optional
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS=localhost
```

### **Streamlit Configuration**
Create `.streamlit/config.toml`:
```toml
[server]
port = 8501
enableCORS = false
enableXsrfProtection = false

[theme]
primaryColor = "#667eea"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#f0f2f6"
textColor = "#262730"
font = "sans serif"

[browser]
gatherUsageStats = false
```

---

## 🌐 **Deployment**

### **Streamlit Cloud (Recommended)**

#### 1. **Prepare Repository**
```bash
# Ensure your streamlit/ directory has:
# - app.py (main file)
# - requirements.txt (dependencies)
# - .streamlit/config.toml (optional configuration)
```

#### 2. **Deploy to Streamlit Cloud**
1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Connect your GitHub repository
3. Set main file path: `streamlit/app.py`
4. Configure secrets in the dashboard

#### 3. **Configure Secrets**
In Streamlit Cloud secrets management:
```toml
DATABASE_URL = "postgresql://user:password@host:port/database"
```

### **Docker Deployment**

```dockerfile
# Dockerfile for Streamlit app
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8501

# Health check
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health

# Run the application
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

```bash
# Build and run
docker build -t health-analytics .
docker run -p 8501:8501 \
  -e DATABASE_URL="your-database-url" \
  health-analytics
```

### **Local Development with Docker Compose**

```yaml
# docker-compose.yml (in project root)
version: '3.8'
services:
  streamlit:
    build:
      context: ./streamlit
      dockerfile: Dockerfile
    ports:
      - "8501:8501"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./streamlit:/app
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: health_dashboard
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Database Connection Failed**
```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Test connection with psql
psql $DATABASE_URL -c "SELECT 1;"

# Check if the schema exists
psql $DATABASE_URL -c "\dt"
```

#### **Missing Dependencies**
```bash
# Reinstall requirements
pip install --upgrade -r requirements.txt

# Check for version conflicts
pip check

# Create fresh virtual environment
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### **Streamlit Port Issues**
```bash
# Check if port 8501 is in use
lsof -i :8501

# Run on different port
streamlit run app.py --server.port 8502

# Kill existing Streamlit processes
pkill -f streamlit
```

#### **Data Loading Issues**
```python
# Debug data loading in the app
import streamlit as st
import pandas as pd

@st.cache_data
def debug_data_loading():
    try:
        # Test database connection
        from data.database import get_connection
        conn = get_connection()
        
        # Test simple query
        result = pd.read_sql("SELECT COUNT(*) FROM \"User\"", conn)
        st.write("Users count:", result.iloc[0, 0])
        
        return True
    except Exception as e:
        st.error(f"Database error: {str(e)}")
        return False

# Add to your app for debugging
if st.checkbox("Debug Mode"):
    debug_data_loading()
```

---

## 📚 **API Integration**

### **Reading from Main App Database**

```python
# Database connection utility
from sqlalchemy import create_engine, text
import pandas as pd
import os

def get_database_connection():
    """
    Get database connection using same DATABASE_URL as main app
    """
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    # Handle different PostgreSQL URL formats
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+pg8000://", 1)
    elif database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+pg8000://", 1)
    
    engine = create_engine(database_url)
    return engine

def load_health_data(user_id: str = None, start_date: str = None, end_date: str = None):
    """
    Load health data with optional filtering
    """
    engine = get_database_connection()
    
    # Base queries
    physical_query = 'SELECT * FROM "PhysicalEntry"'
    mental_query = 'SELECT * FROM "MentalEntry"'
    goals_query = 'SELECT * FROM "Goal"'
    
    # Add filters
    conditions = []
    params = {}
    
    if user_id:
        conditions.append('"userId" = :user_id')
        params['user_id'] = user_id
    
    if start_date:
        conditions.append('"date" >= :start_date')
        params['start_date'] = start_date
    
    if end_date:
        conditions.append('"date" <= :end_date')
        params['end_date'] = end_date
    
    if conditions:
        where_clause = ' WHERE ' + ' AND '.join(conditions)
        physical_query += where_clause
        mental_query += where_clause
    
    # Load data
    with engine.connect() as conn:
        physical_df = pd.read_sql(text(physical_query), conn, params=params)
        mental_df = pd.read_sql(text(mental_query), conn, params=params)
        goals_df = pd.read_sql(text(goals_query), conn, params=params)
    
    return physical_df, mental_df, goals_df
```

---

## 🤝 **Contributing**

### **Development Setup**
```bash
# Clone the main repository
git clone https://github.com/yourusername/health-dashboard.git
cd health-dashboard/streamlit

# Create development environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies with development extras
pip install -r requirements.txt
pip install -r requirements-dev.txt  # If you have dev dependencies

# Run in development mode
streamlit run app.py --logger.level debug
```

### **Code Style**
- Follow PEP 8 for Python code
- Use type hints where appropriate
- Add docstrings to all functions
- Use pandas best practices for data manipulation
- Follow Streamlit conventions for UI components

### **Testing**
```bash
# Run tests (if you add them)
pytest tests/

# Check code style
flake8 .

# Format code
black .
```

---

## 📄 **License**

This analytics app is part of the Health Dashboard project and is licensed under the **MIT License**.

---

## 🔗 **Related Links**

- **[Main Health Dashboard](../README.md)** - Full-stack Next.js application
- **[API Documentation](../docs/api.md)** - REST API reference
- **[Database Schema](../docs/database.md)** - Database structure and relationships
- **[Deployment Guide](../docs/deployment.md)** - Complete deployment instructions

---

<div align="center">

**Part of the Health Dashboard Ecosystem**

[🏠 Main App](../README.md) • [📊 This Analytics App](.) • [🐛 Report Issues](https://github.com/yourusername/health-dashboard/issues) • [💡 Discussions](https://github.com/yourusername/health-dashboard/discussions)

</div>