# Tech Stack Recommendation

## Goal

Choose a tech stack that is easy to build now, but flexible enough to expand later into a real student-facing product.

This project needs to support:

- a clean student dashboard
- structured weekly task input
- burnout-risk prediction
- optional AI-generated recommendations
- future expansion into authentication, analytics, and notifications

## Recommended Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui or a lightweight component library
- React Hook Form
- Zod
- Recharts

Why this is a good fit:

- Next.js is modern, widely used, and easy to grow from prototype to production.
- TypeScript helps keep the project maintainable as it gets larger.
- Tailwind CSS makes it fast to build polished UI screens.
- React Hook Form and Zod make forms easier to manage and validate.
- Recharts is simple for workload and risk visualizations.

### Backend

- FastAPI
- Python
- Pydantic
- SQLAlchemy or Prisma via a separate Node service if needed later

Why this is a good fit:

- FastAPI is lightweight and works naturally with Python machine learning code.
- Python keeps the ML workflow simple because most beginner-friendly ML tools already live there.
- Pydantic gives you clean request and response validation.

For this project, FastAPI is easier than splitting the ML logic into a separate microservice too early.

### Machine Learning

- scikit-learn
- pandas
- numpy
- joblib

Why this is a good fit:

- scikit-learn is perfect for an undergraduate project.
- It supports logistic regression, decision trees, and random forests without extra complexity.
- You can train quickly on simulated or survey-based data.
- joblib makes it easy to save and load a trained model.

### Database

- PostgreSQL for long-term growth
- SQLite for a first prototype if you want less setup

Why this is a good fit:

- PostgreSQL scales much better when the project grows.
- SQLite is fine for demos and local testing.
- You can start with SQLite and migrate later if your schema stays clean.

### Authentication

- Add later only if needed
- Recommended options: NextAuth.js or Clerk

Why this is a good fit:

- You do not need auth for the earliest prototype.
- If you later want real student accounts, these options are easier than building auth yourself.

### Optional LLM Layer

- OpenAI API or another hosted LLM API
- Use it only for recommendation generation, not for risk prediction

Why this is a good fit:

- Keep the burnout score explainable with traditional ML.
- Use the LLM only to turn risk and schedule data into friendly advice.
- This separation keeps the system easier to evaluate and defend in a research setting.

### Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: Neon or Supabase Postgres later if needed

Why this is a good fit:

- These services are beginner-friendly and fast to deploy.
- They are good enough for a prototype and still reasonable if the project grows.

## Recommended Architecture

### Version 1

- Next.js frontend
- FastAPI backend
- scikit-learn model
- SQLite database

This is the easiest setup for a prototype.

### Version 2

- Next.js frontend
- FastAPI backend
- PostgreSQL database
- optional LLM recommendation service
- user authentication

This is the better structure if you later want to turn it into a real app for students.

## Suggested Folder Structure

```text
burnout-sentinel/
  docs/
  frontend/
  backend/
  ml/
  shared/
```

Recommended meaning:

- `frontend/`: Next.js app
- `backend/`: FastAPI app and API routes
- `ml/`: model training notebooks, scripts, and saved models
- `shared/`: shared schemas, constants, or planning rules

## Best Practical Choice

If you want the easiest stack that still scales later, use this:

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: FastAPI + Python
- ML: scikit-learn
- Database: SQLite first, PostgreSQL later
- Charts: Recharts
- Validation: Zod + Pydantic

## Why I Recommend This Over Other Options

Compared with a full Node.js-only stack:

- Python is much easier for machine learning.
- FastAPI works better for model serving.

Compared with a pure Python full stack:

- Next.js gives you a much better UI path for a student planner.
- TypeScript makes frontend growth cleaner.

Compared with using only an LLM:

- traditional ML is easier to explain in Expo and safer for structured prediction.
- LLMs are best used for natural-language suggestions, not the main risk score.

## Expansion Ideas Later

This stack can grow into:

- personalized weekly notifications
- Canvas or Google Calendar integration
- trend analysis across multiple weeks
- group dashboards for advisors or mentors
- A/B testing for recommendation quality
- a mobile app later using React Native

## Final Recommendation

Build the first version with:

- Next.js
- TypeScript
- Tailwind CSS
- FastAPI
- Python
- scikit-learn
- SQLite

Then expand later to:

- PostgreSQL
- authentication
- hosted LLM recommendations
- analytics and notifications
