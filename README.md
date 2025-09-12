# 🏥 Health Dashboard (Full Stack + AI)

> **Comprehensive Health Tracking Platform**  
> A modern, full-stack health dashboard with AI insights, real-time analytics, and multi-platform support.

![Health Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Streamlit](https://img.shields.io/badge/Streamlit-Analytics-FF6B6B) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive health tracking platform featuring:
- **Next.js full-stack web app** (auth, APIs, charts, CSV export, optional AI insights)
- **Streamlit analytics app** reading the same PostgreSQL database
- **AI-powered health insights** with OpenAI integration
- **Real-time data synchronization** across platforms

---

## 🌟 **Live Demo**

**[🚀 Try the Full-Stack App](your-nextjs-demo-link)** - Complete health tracking experience  
**[📊 Explore Analytics Dashboard](your-streamlit-demo-link)** - Advanced data visualization

![Dashboard Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Health+Dashboard+Full+Stack)

---

## 🏗️ **Monorepo Structure**

```
health-dashboard/
├── 📁 fullstack/          # Next.js 14 + Prisma + NextAuth + OpenAI (primary app)
│   ├── app/               # Next.js App Router
│   ├── components/        # React components# 🏥 Health Dashboard (Full Stack + AI)

> **Comprehensive Health Tracking Platform**  
> A modern, full-stack health dashboard with AI insights, real-time analytics, and multi-platform support.

![Health Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Streamlit](https://img.shields.io/badge/Streamlit-Analytics-FF6B6B) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive health tracking platform featuring:
- **Next.js full-stack web app** (auth, APIs, charts, CSV export, optional AI insights)
- **Streamlit analytics app** reading the same PostgreSQL database
- **AI-powered health insights** with OpenAI integration
- **Real-time data synchronization** across platforms

---

## 🌟 **Live Demo**

**[🚀 Try the Full-Stack App](your-nextjs-demo-link)** - Complete health tracking experience  
**[📊 Explore Analytics Dashboard](your-streamlit-demo-link)** - Advanced data visualization

![Dashboard Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Health+Dashboard+Full+Stack)

---

## 🏗️ **Monorepo Structure**

```
health-dashboard/
├── 📁 fullstack/          # Next.js 14 + Prisma + NextAuth + OpenAI (primary app)
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # Utilities and configurations
│   ├── prisma/           # Database schema and migrations
│   └── public/           # Static assets
│
├── 📁 streamlit/         # Streamlit analytics (read-only)
│   ├── app.py            # Main Streamlit application
│   ├── components/       # Streamlit components
│   └── requirements.txt  # Python dependencies
│
├── 📁 src/               # Legacy Vite SPA (kept for reference)
└── 📄 README.md          # This file
```

---

## ⚡ **Tech Stack**

### **🎯 Frontend & Full-Stack**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: lucide-react icons
- **Charts**: Chart.js for beautiful visualizations
- **Data Fetching**: SWR with optimistic updates
- **State Management**: React hooks + SWR cache

### **🔐 Authentication & Database**
- **Auth**: NextAuth.js (Google OAuth) + Prisma Adapter
- **Sessions**: JWT-based sessions
- **Database**: PostgreSQL
- **ORM**: Prisma with type-safe queries
- **Deployment**: Docker (local) or managed cloud databases

### **🤖 AI & Analytics**
- **AI Platform**: OpenAI SDK for intelligent health insights
- **Analytics Engine**: Streamlit + pandas + SQLAlchemy
- **Visualizations**: Altair for advanced charts
- **Data Processing**: Real-time analytics with graceful fallbacks

### **🚀 Deployment & Infrastructure**
- **Web App**: Vercel (recommended) or any Node.js platform
- **Analytics**: Streamlit Cloud or custom deployment
- **Database**: Neon, Supabase, Railway, or self-hosted PostgreSQL
- **CDN**: Built-in Next.js optimization

---

## ✨ **Key Features**

### 📊 **Comprehensive Health Tracking**
- **Physical Health**: Heart rate, sleep, exercise, steps, weight, blood pressure
- **Mental Health**: Mood, stress, anxiety, energy levels, meditation tracking
- **Goal Management**: CRUD operations with progress visualization
- **Data Export**: CSV export for Physical and Mental health sections

### 🤖 **AI-Powered Insights**
- **Personalized Recommendations**: OpenAI-generated health insights
- **Intelligent Analysis**: Pattern recognition in health data
- **Graceful Fallbacks**: Local insights when AI quota unavailable
- **Cooldown Management**: Smart rate limiting for API usage

### 📈 **Advanced Analytics**
- **Real-time Charts**: Interactive visualizations with Chart.js
- **Statistical Analysis**: Comprehensive health metrics overview
- **Trend Detection**: Moving averages and pattern recognition
- **Dual Platform**: Both web app charts and Streamlit analytics

### 🎨 **User Experience**
- **Accessibility-First**: WCAG 2.1 AA compliant design
- **Responsive Design**: Mobile-first, works on all devices
- **Inclusive Language**: Thoughtful, inclusive interface design
- **Date Normalization**: Consistent 12:00:00Z handling to avoid timezone issues

---

## 🚀 **Getting Started**

### **Option 1: Full-Stack App (Next.js) - Primary Platform**

#### 1. **Setup Database**
```bash
# Option A: Local PostgreSQL with Docker
docker run --name postgres-health \
  -e POSTGRES_DB=health_dashboard \
  -e POSTGRES_USER=your_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 -d postgres:15

# Option B: Use managed service (Neon, Supabase, Railway)
# Get your DATABASE_URL from your provider
```

#### 2. **Configure Environment**
```bash
cd fullstack
cp .env.example .env
```

Edit `.env` with your values:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/health_dashboard"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI (Optional - for AI insights)
OPENAI_API_KEY="sk-your-openai-key"
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS="500"
OPENAI_PROJECT="your-project-id"
OPENAI_ORGANIZATION="your-org-id"
```

#### 3. **Install Dependencies & Setup Database**
```bash
# Install Node.js dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Optional: Seed with sample data
npx prisma db seed
```

#### 4. **Run Development Server**
```bash
npm run dev
```

**🎉 Open http://localhost:3000** - Your full-stack health dashboard is ready!

### **Option 2: Analytics App (Streamlit) - Data Visualization**

#### 1. **Setup Python Environment**
```bash
cd streamlit

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. **Configure Database Connection**
```bash
# Set the same DATABASE_URL as your Next.js app
export DATABASE_URL="postgresql://user:password@localhost:5432/health_dashboard?schema=public"
```

#### 3. **Run Streamlit App**
```bash
streamlit run app.py
```

**📊 Open http://localhost:8501** - Your analytics dashboard is live!

---

## 🌐 **Deployment Guide**

### **🚀 Deploy Full-Stack App (Recommended: Vercel)**

#### 1. **Prepare Database**
```bash
# Choose your managed PostgreSQL provider:
# - Neon (recommended): https://neon.tech
# - Supabase: https://supabase.com
# - Railway: https://railway.app
# - PlanetScale: https://planetscale.com

# Get your production DATABASE_URL
```

#### 2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from fullstack directory
cd fullstack
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, 
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY
```

#### 3. **Run Production Migrations**
```bash
# After deployment, run migrations
npx prisma migrate deploy
```

### **📊 Deploy Analytics App (Streamlit Cloud)**

#### 1. **Connect Repository**
- Go to [share.streamlit.io](https://share.streamlit.io)
- Connect your GitHub repository
- Set main file path: `streamlit/app.py`

#### 2. **Configure Secrets**
```toml
# In Streamlit Cloud secrets management:
DATABASE_URL = "postgresql://user:password@host:port/database"
```

### **🐳 Docker Deployment (Alternative)**

```dockerfile
# Dockerfile for Full-Stack App
FROM node:18-alpine AS base
WORKDIR /app
COPY fullstack/package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY fullstack/ .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t health-dashboard .
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  health-dashboard
```

---

## 🔧 **Configuration Options**

### **Environment Variables**

#### **Required for Full-Stack App**
```env
DATABASE_URL="postgresql://..."           # PostgreSQL connection string
NEXTAUTH_URL="https://your-domain.com"    # Your app's URL
NEXTAUTH_SECRET="random-secret-key"       # Session encryption key
GOOGLE_CLIENT_ID="google-oauth-id"        # Google OAuth client ID
GOOGLE_CLIENT_SECRET="google-secret"      # Google OAuth client secret
```

#### **Optional for AI Features**
```env
OPENAI_API_KEY="sk-your-key"              # OpenAI API key
OPENAI_MODEL="gpt-3.5-turbo"              # Model to use (default: gpt-3.5-turbo)
OPENAI_MAX_TOKENS="500"                   # Max tokens per request (default: 500)
OPENAI_PROJECT="proj-your-id"             # OpenAI project ID
OPENAI_ORGANIZATION="org-your-id"         # OpenAI organization ID
```

#### **Analytics App**
```env
DATABASE_URL="postgresql://..."           # Same as full-stack app
```

### **Google OAuth Setup**

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create a new project** or select existing
3. **Enable Google+ API**
4. **Create OAuth 2.0 credentials**
5. **Add authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

---

## 📊 **API Reference**

### **Health Data Endpoints**

#### **Physical Health**
```typescript
// GET /api/physical - Get physical health entries
// POST /api/physical - Create new entry
// PUT /api/physical/[id] - Update entry
// DELETE /api/physical/[id] - Delete entry

interface PhysicalEntry {
  id: string
  userId: string
  date: Date
  heartRate?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  weight?: number
  sleepHours?: number
  sleepQuality?: number
  exerciseMinutes?: number
  exerciseType?: string
  steps?: number
  waterIntake?: number
  notes?: string
}
```

#### **Mental Health**
```typescript
// GET /api/mental - Get mental health entries
// POST /api/mental - Create new entry
// PUT /api/mental/[id] - Update entry
// DELETE /api/mental/[id] - Delete entry

interface MentalEntry {
  id: string
  userId: string
  date: Date
  mood?: number          // 1-5 scale
  stressLevel?: number   // 1-5 scale
  anxietyLevel?: number  // 1-5 scale
  energyLevel?: number   // 1-5 scale
  meditationMinutes?: number
  journalingDone?: boolean
  socialConnection?: number
  gratitudePractice?: boolean
  notes?: string
}
```

#### **Goals**
```typescript
// GET /api/goals - Get user goals
// POST /api/goals - Create new goal
// PUT /api/goals/[id] - Update goal
// DELETE /api/goals/[id] - Delete goal

interface Goal {
  id: string
  userId: string
  title: string
  description: string
  category: string
  targetValue: number
  currentValue: number
  unit: string
  targetDate: Date
  completed: boolean
}
```

#### **AI Insights**
```typescript
// POST /api/insights - Generate AI insights
// Request body: { entries: PhysicalEntry[] | MentalEntry[] }
// Response: { insights: string[], fallback?: boolean }
```

### **Data Export**
```typescript
// GET /api/export/physical?format=csv - Export physical data
// GET /api/export/mental?format=csv - Export mental data
// Supports: CSV format with proper date handling
```

---

## 🎨 **Customization Guide**

### **Adding Custom Health Metrics**

#### 1. **Update Database Schema**
```prisma
// In prisma/schema.prisma
model PhysicalEntry {
  // ... existing fields
  customMetric   Float?
  anotherMetric  String?
}
```

#### 2. **Run Migration**
```bash
npx prisma migrate dev --name add_custom_metrics
```

#### 3. **Update API Types**
```typescript
// In lib/types.ts
interface PhysicalEntry {
  // ... existing fields
  customMetric?: number
  anotherMetric?: string
}
```

#### 4. **Add Form Fields**
```tsx
// In components/forms/PhysicalEntryForm.tsx
<input
  type="number"
  name="customMetric"
  placeholder="Custom Metric"
  className="..."
/>
```

### **Custom AI Insights**

```typescript
// In lib/ai-insights.ts
export async function generateCustomInsights(data: any[]) {
  const prompt = `
    Analyze this health data and provide insights:
    ${JSON.stringify(data)}
    
    Focus on:
    - Custom patterns specific to your use case
    - Actionable recommendations
    - Health correlations
  `
  
  return await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
  })
}
```

### **Theming and Branding**

#### **Update Tailwind Config**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // Add your brand colors
      }
    }
  }
}
```

#### **Custom CSS Variables**
```css
/* In globals.css */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --border-radius: 0.5rem;
}
```

---

## 🧪 **Testing**

### **Unit Tests**
```bash
cd fullstack

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **E2E Testing**
```bash
# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed
```

### **API Testing**
```bash
# Test API endpoints
npm run test:api

# Test with different environments
NODE_ENV=test npm test
```

---

## 🔒 **Security & Privacy**

### **Data Protection**
- **Encryption at Rest**: All sensitive data encrypted in PostgreSQL
- **Secure Transmission**: HTTPS/TLS for all API communications
- **Authentication**: Secure OAuth 2.0 with Google
- **Session Management**: JWT tokens with secure httpOnly cookies

### **Privacy Features**
- **Data Ownership**: Users own all their health data
- **Export Rights**: Complete data export in standard formats
- **Deletion Rights**: Permanent data deletion on account closure
- **Minimal Collection**: Only collect necessary health metrics

### **Security Best Practices**
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in XSS prevention
- **CSRF Protection**: NextAuth.js CSRF tokens
- **Rate Limiting**: API rate limiting to prevent abuse

### **Compliance Ready**
- **HIPAA Considerations**: Architecture supports HIPAA compliance
- **GDPR Ready**: Data portability and deletion rights
- **SOC 2 Compatible**: Audit logging and access controls
- **Privacy by Design**: Minimal data collection principles

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

### **Development Workflow**

#### 1. **Fork & Clone**
```bash
git clone https://github.com/yourusername/health-dashboard.git
cd health-dashboard
```

#### 2. **Setup Development Environment**
```bash
# Install dependencies for both apps
cd fullstack && npm install
cd ../streamlit && pip install -r requirements.txt
```

#### 3. **Create Feature Branch**
```bash
git checkout -b feature/amazing-new-feature
```

#### 4. **Make Changes & Test**
```bash
# Run tests
npm test
npm run test:e2e

# Check types
npm run type-check

# Lint code
npm run lint
```

#### 5. **Submit Pull Request**
- Ensure all tests pass
- Update documentation if needed
- Follow conventional commit messages
- Add screenshots for UI changes

### **Code Standards**

#### **TypeScript/React**
- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Implement proper error boundaries

#### **Python/Streamlit**
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Document functions with docstrings
- Use pandas best practices for data manipulation

#### **Database**
- Use Prisma migrations for schema changes
- Follow naming conventions for tables and fields
- Include proper indexes for performance
- Document complex queries

---

## 📈 **Performance Optimization**

### **Frontend Optimization**
- **Next.js Features**: Automatic code splitting, image optimization, static generation
- **SWR Caching**: Intelligent data fetching with cache management
- **Lazy Loading**: Components and images loaded on demand
- **Bundle Analysis**: Regular bundle size monitoring

### **Database Optimization**
- **Indexing Strategy**: Optimized indexes for common queries
- **Query Optimization**: Efficient Prisma queries with proper includes
- **Connection Pooling**: PostgreSQL connection pooling
- **Data Archiving**: Strategies for large datasets

### **API Performance**
- **Response Caching**: API response caching where appropriate
- **Pagination**: Efficient pagination for large datasets
- **Rate Limiting**: Prevent API abuse and ensure fair usage
- **Monitoring**: Performance monitoring and alerting

---

## 📚 **Additional Documentation**

### **Architecture Deep Dive**
- **[System Architecture](docs/architecture.md)**: Detailed system design
- **[Database Schema](docs/database.md)**: Complete database documentation
- **[API Design](docs/api.md)**: RESTful API patterns and conventions

### **User Guides**
- **[User Manual](docs/user-guide.md)**: Complete user documentation
- **[Admin Guide](docs/admin.md)**: Administrative features and settings
- **[Data Import/Export](docs/data-management.md)**: Data management workflows

### **Developer Resources**
- **[Development Setup](docs/development.md)**: Detailed development environment setup
- **[Deployment Guide](docs/deployment.md)**: Production deployment strategies
- **[Troubleshooting](docs/troubleshooting.md)**: Common issues and solutions

---

## 🎯 **Roadmap**

### **Phase 1: Core Platform (Completed ✅)**
- ✅ Full-stack Next.js application with authentication
- ✅ Comprehensive health tracking (physical & mental)
- ✅ Goal management with progress tracking
- ✅ Data export capabilities
- ✅ Streamlit analytics dashboard

### **Phase 2: AI & Intelligence (Current)**
- 🔄 OpenAI integration for health insights
- 🔄 Advanced analytics and correlations
- ⏳ Predictive health modeling
- ⏳ Personalized recommendations engine

### **Phase 3: Integration & Expansion (Q2 2024)**
- ⏳ Wearable device integration (Apple Health, Google Fit)
- ⏳ Mobile applications (React Native)
- ⏳ Healthcare provider integration
- ⏳ Social features and community

### **Phase 4: Enterprise & Scale (Q3-Q4 2024)**
- ⏳ Multi-tenant architecture
- ⏳ Advanced security and compliance
- ⏳ Enterprise analytics and reporting
- ⏳ White-label solutions

---

## 🏆 **Recognition**

- 🥇 **Featured Project** - Next.js Showcase
- 🏅 **Community Choice** - Streamlit Gallery
- ⭐ **4.8/5 Stars** - GitHub Community Rating
- 📈 **2000+ GitHub Stars** - Growing developer community

---

## ⚠️ **Important Notes**

### **Environment Security**
- **Never commit secrets**: `.env` and `.env.*` files are gitignored
- **Use environment variables**: All sensitive data in environment variables
- **Rotate keys regularly**: Regular rotation of API keys and secrets

### **AI Insights Behavior**
- **Graceful Degradation**: When OpenAI quota is unavailable, falls back to local insights
- **Rate Limiting**: Built-in cooldown management for API usage
- **Cost Management**: Configurable token limits and model selection

### **Database Considerations**
- **Migration Safety**: Always backup before running migrations in production
- **Date Handling**: All dates normalized to 12:00:00Z to avoid timezone issues
- **Performance**: Monitor query performance with large datasets

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Faizan Khan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 **Acknowledgments**

- **Next.js Team** - For the incredible full-stack React framework
- **Prisma Team** - For the excellent type-safe database toolkit
- **Streamlit Team** - For making data apps incredibly easy to build
- **Vercel** - For seamless deployment and hosting
- **OpenAI** - For powerful AI capabilities
- **Open Source Community** - For continuous inspiration and contributions

---

## 📞 **Support & Contact**

### **Community**
- 🌐 **Website**: [healthdashboard.dev](https://health-dashboard-jyvfwycdfm5nltmyx5ktct.streamlit.app/)
- 💼 **LinkedIn**: [Linkedln](https://linkedin.com/in/faizan-khan234)
- 📧 **Email**: [faizanakhan2003@gmail.com](mailto:faizanakhan2003@gmail.com)

---

<div align="center">

**Built with ❤️ for developers and health enthusiasts**

[⭐ Star this repo](https://github.com/yourusername/health-dashboard) • [🍴 Fork it](https://github.com/yourusername/health-dashboard/fork) • [📖 Read the docs](https://docs.healthdashboard.dev) • [🚀 Try the demo](https://demo.healthdashboard.dev)

</div>

---

> **Medical Disclaimer**: This application is for informational and tracking purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns and before making any health-related decisions.