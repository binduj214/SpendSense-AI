# SpendSense AI 💰

**Spend Wisely, Save Confidently**

SpendSense AI is a full-stack AI-powered personal finance and predictive savings assistant built with FastAPI, Python, React, and SQLite.

---

## Features

### Core Finance
- **Dashboard** — Real-time overview of income, expenses, balance, budget utilization, savings goals, and recent transactions
- **Expense Management** — Add, edit, delete, search, and filter transactions by category, date, and payment method
- **Income Tracking** — Record salary, freelance, business, and other income sources
- **Budget Management** — Set monthly category budgets with visual utilization indicators and overspend alerts
- **Savings Goals** — Create goals with target amounts and dates, track progress with visual progress bars

### AI Features (all local, no external API required)
- **Auto-Categorization** — Automatically suggests expense categories from transaction descriptions (rule-based engine, replaceable with ML)
- **Spending Pattern Analysis** — Identifies your highest spending categories, monthly trends, and behavioral patterns
- **Expense Prediction** — Detects recurring expenses and estimates upcoming costs from historical data
- **Anomaly Detection** — Uses statistical z-score analysis to flag unusual spending spikes
- **AI Recommendations** — Personalized saving tips based on actual spending vs. budgets and historical averages
- **AI Financial Assistant** — Natural language Q&A using your own transaction data (intent detection, no external LLM needed)

---

## Technology Stack

| Layer | Technology |
|---|---|
| API | FastAPI + Uvicorn |
| Backend Logic | Python services layer |
| Validation | Pydantic v2 |
| Database ORM | SQLAlchemy |
| Database | SQLite |
| Frontend | React 18 + Vite |
| Charts | Recharts |
| HTTP Client | Axios |
| Icons | Lucide React |

---

## Folder Structure

```
spendsense-ai/
├── api/                        # FastAPI application
│   ├── main.py                 # App entry point, CORS, startup
│   ├── routes/                 # Route handlers (transactions, income, budgets, savings, AI)
│   ├── schemas/                # Pydantic request/response models
│   └── dependencies/           # Shared FastAPI dependencies (DB session)
│
├── backend/                    # Core Python business logic
│   ├── models/                 # SQLAlchemy ORM models
│   ├── services/               # Business logic services (per entity + dashboard + AI)
│   ├── ai/                     # AI modules
│   │   ├── categorizer.py      # Rule-based expense categorization
│   │   ├── pattern_analyzer.py # Spending pattern analysis
│   │   ├── predictor.py        # Predictive expense engine
│   │   ├── anomaly_detector.py # Statistical anomaly detection (z-score)
│   │   ├── recommender.py      # AI savings recommendations
│   │   └── assistant.py        # Natural language financial assistant
│   ├── database/               # DB engine, session, init
│   ├── config/                 # App settings
│   └── utils/                  # Utility helpers
│
├── frontend/                   # React application (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Dashboard, Transactions, Income, Budgets, Savings, Analytics, AI pages
│   │   ├── services/           # Centralized API service (axios)
│   │   ├── hooks/              # useApi, useMutation hooks
│   │   └── utils/              # formatters, constants
│   └── public/
│
├── database/
│   ├── spendsense.db           # SQLite database (auto-created)
│   └── seed/                   # Realistic sample data seeder
│
├── requirements.txt
└── README.md
```

---

## Database Schema

| Table | Key Fields |
|---|---|
| `transactions` | id, amount, category, description, date, payment_method, type, created_at |
| `income` | id, amount, source, date, description, created_at |
| `budgets` | id, category, monthly_limit, month, created_at |
| `savings_goals` | id, name, target_amount, current_savings, target_date, is_completed |
| `ai_insights` | id, insight_type, title, message, severity, category, is_read |

---

## API Endpoints

### Transactions
```
GET    /api/transactions/           List with filters (category, type, date range, search, sort)
POST   /api/transactions/           Create new transaction
GET    /api/transactions/{id}       Get by ID
PUT    /api/transactions/{id}       Update
DELETE /api/transactions/{id}       Delete
POST   /api/transactions/categorize Auto-categorize by description
```

### Income
```
GET    /api/income/                 List all income
POST   /api/income/                 Add income
GET    /api/income/{id}             Get by ID
PUT    /api/income/{id}             Update
DELETE /api/income/{id}             Delete
```

### Budgets
```
GET    /api/budgets/                List budgets (filter by month)
POST   /api/budgets/                Create budget
GET    /api/budgets/{id}            Get by ID
PUT    /api/budgets/{id}            Update
DELETE /api/budgets/{id}            Delete
GET    /api/budgets/utilization     Budget utilization for a month
```

### Savings Goals
```
GET    /api/savings-goals/               List all goals
POST   /api/savings-goals/               Create goal
GET    /api/savings-goals/{id}           Get by ID
PUT    /api/savings-goals/{id}           Update
DELETE /api/savings-goals/{id}           Delete
POST   /api/savings-goals/{id}/add-savings  Add money to goal
```

### Dashboard & Analytics
```
GET    /api/dashboard/              Full dashboard summary
GET    /api/analytics/              Spending patterns and monthly comparison
```

### AI
```
GET    /api/ai/insights             Patterns + anomalies + recommendations
GET    /api/ai/predictions          Predicted upcoming expenses
POST   /api/ai/assistant            Natural language query { "query": "..." }
POST   /api/ai/categorize           Auto-categorize { "description": "..." }
```

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone / open the project

```bash
cd spendsense-ai
```

### 2. Set up Python environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Start the FastAPI backend

```bash
uvicorn api.main:app --reload
```

The backend starts at: **http://localhost:8000**  
API docs (Swagger UI): **http://localhost:8000/docs**

> The SQLite database is created automatically on first run.  
> Sample data is seeded automatically if the database is empty.

### 4. Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at: **http://localhost:5173**

---

## How Frontend Communicates with Backend

```
React (localhost:5173)
    ↓  axios HTTP requests
FastAPI (localhost:8000)
    ↓  service layer calls
Python Backend Services
    ↓  SQLAlchemy ORM
SQLite (database/spendsense.db)
```

- All API calls are centralized in `frontend/src/services/api.js`
- CORS is configured in FastAPI to allow requests from localhost:3000 and localhost:5173
- The Vite dev server proxies `/api` requests to the backend during development

---

## AI Feature Details

### Expense Categorizer (`backend/ai/categorizer.py`)
Uses a keyword-scoring ruleset across 200+ keywords to map transaction descriptions to categories like Food, Transport, Shopping, etc. Designed to be swapped with an ML classifier later.

### Spending Pattern Analyzer (`backend/ai/pattern_analyzer.py`)
Aggregates historical transaction data to find highest-spend categories, monthly trends, frequency patterns, and generates plain-language insights.

### Predictive Expense Engine (`backend/ai/predictor.py`)
Groups normalized transaction descriptions across months to identify recurring expenses. Estimates the next occurrence date and predicted amount. Also predicts per-category monthly spending using historical averages.

### Anomaly Detector (`backend/ai/anomaly_detector.py`)
Compares current month category spending against historical mean and standard deviation. Flags categories where the z-score exceeds 1.5 or spending is 50%+ above average.

### Savings Recommender (`backend/ai/recommender.py`)
Generates personalized recommendations by combining budget utilization, spending increases, savings goal requirements, and category-specific tips.

### AI Assistant (`backend/ai/assistant.py`)
Intent-detection based Q&A engine that understands questions like:
- "How much did I spend this month?"
- "Where am I spending the most?"
- "Can I save ₹5,000 this month?"
- "What category increased the most?"
- "If I reduce shopping by ₹2000, how much can I save?"

No external LLM API required. The architecture is modular — swap `assistant.py` with an LLM integration later.

---

## Sample Data

On first run, realistic Indian-currency sample data is seeded automatically:

| Type | Examples |
|---|---|
| Income | Salary ₹45,000, Freelance ₹8,500 |
| Expenses | Rent ₹15,000, Food ₹7,000, Shopping ₹5,800, Transport ₹2,800 |
| Budgets | Food ₹8,000, Shopping ₹5,000, Entertainment ₹2,500 |
| Savings Goals | New Laptop ₹60,000, Emergency Fund ₹1,50,000 |

To start fresh, delete `database/spendsense.db` and restart the server.

---

## Future Improvements

- User authentication (JWT / OAuth)
- Multi-user support
- Bank statement CSV/PDF import
- Real ML-based categorizer (scikit-learn or transformers)
- LLM integration for the AI assistant (OpenAI, Gemini, local Ollama)
- Mobile app (React Native)
- Email/WhatsApp spending alerts
- Recurring transaction automation
- Export to PDF/Excel
- Investment portfolio tracking
