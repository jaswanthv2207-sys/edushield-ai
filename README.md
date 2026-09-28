# EduShield AI

**AI-Powered Student Dropout Prediction & Counselling System**

A comprehensive platform for Government of Rajasthan to predict student dropout risk and enable early intervention through counselling and analytics.

## Features

- **Dashboard**: Real-time KPI cards, attendance trends, risk distribution, school comparison
- **Students Module**: Full CRUD operations with search, filter, sort, and pagination
- **AI Prediction**: Bulk CSV upload, manual prediction with animated results
- **Analytics**: Interactive charts (pie, bar, line, area) with filters
- **Counselling**: High-risk student management, counsellor assignment, session tracking
- **Reports**: PDF, Excel, CSV export with print support
- **Authentication**: JWT-based with role-based access control
- **Dark Mode**: Full theme support with system preference detection

## Tech Stack

### Frontend
- React 19 + Vite
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion
- React Hook Form
- Recharts
- Lucide React

### Backend
- Python FastAPI
- SQLAlchemy ORM
- Pydantic
- JWT Authentication
- Scikit-learn (Random Forest)

### Database
- PostgreSQL

## Design System

EduShield AI uses a custom **"Digital Chhatra Shield"** design language that blends
Government of Rajasthan identity with a modern GovTech aesthetic.

| Token | Value | Usage |
|-------|-------|-------|
| Typography | **Sora** (display) + **Inter** (body) | Headings, numbers, UI text |
| Brand blue | `#355ef2 → #0A1633` | Primary actions, gradients, navy chrome |
| Saffron accent | `#f98c07` | Highlights, active indicators, alerts |
| Surfaces | Glass (header), navy (sidebar), hero gradients | Layered depth |
| Motion | Framer Motion page transitions, spring counters, staggered cards | Micro-interactions |

Key conventions:

- **Navy sidebar** (light & dark) with section groups, glowing active pill and collapse
- **Glass header** with breadcrumb, ⌎ search, animated theme toggle and pulsing alerts
- **`PageHeader`** component (eyebrow + display title + actions) is used by every page
- **KPI cards** count up with `AnimatedCounter` and carry a colored top accent + icon tile
- **Empty states** with icon tiles and contextual CTAs (Students, Counselling)
- **Toasts** use spring motion, colored icon tiles and an auto-dismiss progress line
- **WCAG AA** contrast verified across all pages in both themes (Lighthouse: 100 a11y /
  100 best-practices / 100 SEO), `public/robots.txt` included

## Project Structure

```
edushield-ai/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Shadcn UI components
│   │   │   ├── layouts/     # Layout components
│   │   │   └── auth/        # Auth components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── ml/              # Machine learning
│   │   ├── database.py      # Database config
│   │   ├── config.py        # App config
│   │   └── main.py          # App entry point
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Docker (optional)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations and seed data
python -m app.seed

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

### Docker Setup

Production-parity stack (the exact single-service image Render deploys):
Postgres + FastAPI serving the API **and** the built SPA from one origin.

```bash
# Build and run everything
docker compose up --build

# Access application
# App (SPA + API): http://localhost:8000
# API Docs:        http://localhost:8000/docs
# Health check:    http://localhost:8000/health
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edushield.ai | Admin@123 |
| Principal | principal@edushield.ai | Principal@123 |
| Teacher | teacher@edushield.ai | Teacher@123 |
| Counsellor | counsellor@edushield.ai | Counsellor@123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register user (admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update own profile (name, email, phone)
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/users?role={role}` - List users by role (admin/principal)
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students` - List students (paginated, filterable)
- `GET /api/students/{id}` - Get student details
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `GET /api/students/{id}/predictions` - Get prediction history

### Predictions
- `POST /api/predict/{student_id}` - Predict for student
- `POST /api/predict/manual` - Manual prediction
- `POST /api/predict/bulk` - Bulk prediction
- `POST /api/predict/upload-csv` - CSV upload prediction
- `GET /api/predict/history/{student_id}` - Prediction history

### Analytics
- `GET /api/analytics` - Complete analytics data (optional `school_id`, `grade`, `gender` filters)
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/attendance-trend` - Attendance trend
- `GET /api/analytics/risk-distribution` - Risk distribution
- `GET /api/analytics/school-comparison` - School comparison
- `GET /api/analytics/gender-analysis` - Gender analysis

### Counselling
- `GET /api/counselling` - List sessions (`search`, `status`, `priority`, `student_id`, `counsellor_id` filters)
- `POST /api/counselling/assign` - Assign counsellor
- `PUT /api/counselling/{id}` - Update session
- `GET /api/counselling/high-risk-students` - High-risk students
- `DELETE /api/counselling/{id}` - Delete session

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/download/{id}` - Download report
- `GET /api/reports` - List reports

### Schools
- `GET /api/schools` - List schools
- `GET /api/schools/{id}` - Get school
- `POST /api/schools` - Create school
- `PUT /api/schools/{id}` - Update school
- `DELETE /api/schools/{id}` - Delete school

## Machine Learning

The system uses a Random Forest Classifier trained on student data including:
- Academic performance (attendance, grades, failures)
- Socioeconomic factors (family support, income, fee status)
- Personal factors (internet access, medical conditions, distance)
- Educational aspirations

### Model Features
- Risk percentage (0-100%)
- Risk level (low/medium/high)
- Confidence score
- Feature importance for explainability
- AI-generated recommendations

## Deployment

The repo ships with a **Render blueprint** (`render.yaml`): one Docker web
service serves the React SPA and the FastAPI API from a single origin (no
CORS), backed by managed Postgres. On first boot the backend creates tables
and seeds demo data (idempotent — skipped when users already exist).

### Deploy to Render (recommended)

1. Push this repo to GitHub (`gh repo create <name> --private --source . --push`).
2. Render dashboard → **New → Blueprint** → connect the GitHub repo.
3. Render reads `render.yaml` and provisions `edushield-ai` (Docker web
   service) + `edushield-db` (Postgres), wiring `DATABASE_URL` and a
   generated `SECRET_KEY` automatically.
4. Deploy, then open `https://edushield-ai.onrender.com` and log in with
   `admin@edushield.ai / Admin@123`.

> Free-tier services spin down after inactivity — the first request after
> idle takes ~50s (cold start). Health checks use `GET /health`.

### Alternative architectures

- **Static frontend on Vercel + API on Render**: build the frontend with
  `VITE_API_URL=https://<your-api>.onrender.com/api`, deploy `dist/` to
  Vercel, and add the Vercel origin to the backend `CORS_ORIGINS`.
- **Any Docker host**: the root `Dockerfile` runs the whole app —
  provide `DATABASE_URL` and `SECRET_KEY` as environment variables.

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/edushield
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## License

MIT License - Government of Rajasthan
