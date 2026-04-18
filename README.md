# Burnout Sentinel

## An Early Warning System for Student Burnout Using Workload and Recovery Indicators

Burnout Sentinel is a student wellness project focused on helping students manage heavy weekly workloads before stress becomes burnout.

The idea is to build a smart planner that does more than track assignments. It estimates overload risk, highlights unhealthy weeks, and suggests better planning choices using explainable scoring, research signals, and optional AI-assisted guidance later.

## Project Status

- Project title: `Burnout Sentinel`
- Research subtitle: `An Early Warning System for Student Burnout Using Workload and Recovery Indicators`
- Version: `0.4.0`
- Last updated: `April 18, 2026`
- Scope: `MVP prototype`
- Current focus: `Frontend experience, research feed, and explainable burnout analysis`

## Project Goal

Nursing students often juggle classes, labs, clinical shifts, exams, assignments, and personal responsibilities. This project explores whether a planning tool can help students identify overload early and make healthier weekly decisions.

## What Is In This Folder

- `docs/project-proposal.md`: full research and project proposal
- `docs/expo-pitch.md`: short summary and talking points for Expo
- `docs/build-plan.md`: practical implementation roadmap
- `docs/tech-stack.md`: recommended scalable tech stack
- `frontend/`: Next.js app for the student planner UI
- `backend/`: FastAPI burnout scoring API and recommendations service
- `backend/README.md`: backend run, test, and troubleshooting guide
- `ml/`: future home for training scripts and saved models
- `shared/`: future home for shared schemas and constants

## What The App Does Now

- lets students enter weekly workload and recovery inputs
- shows a live burnout risk summary while planning
- provides drag-and-drop dashboard panels with collapse/expand controls
- includes collapsible Workload and Recovery input sections (collapsed by default)
- adds a `?` instruction popup with usage steps and scoring-formula explanation
- displays a workload snapshot, what-if simulator, and trend chart
- plays visual and audio feedback for presets and risk states
- includes a daily Research Signal page with valid external links and infinite scrolling
- includes lightweight cookie-session auth with Login and Signup pages
- offers footer actions for login, reading research, sending feedback, donating, and GitHub project access

## Core Idea

The planner will let students:

- enter weekly tasks and time commitments
- view a workload dashboard
- receive a burnout risk score
- get suggestions for balancing their schedule

The current implementation also emphasizes a more readable, glass-style interface with compact action buttons and research-focused context.

## Proposed Tech Direction

The recommended stack is documented in `docs/tech-stack.md`.

Short version:

- Frontend: Next.js with TypeScript
- Backend API: FastAPI with Python
- Machine learning: scikit-learn
- Database: PostgreSQL
- ORM: Prisma
- Auth: NextAuth.js or Clerk later if needed
- Charts: Recharts
- Styling: Tailwind CSS
- Validation: Zod on the frontend and Pydantic on the backend
- Deployment: Vercel for frontend and Render or Railway for backend

## Research Question

Can a machine learning-supported planning tool help students identify overload and reduce burnout risk by providing personalized weekly planning recommendations?

## Next Steps

1. Review the proposal and adjust wording to match your class or mentor expectations.
2. Choose whether you want this to be a research prototype, a full app prototype, or both.
3. Decide what data you want to use first: survey data, simulated data, or pilot user input.
4. Start wireframing the planner interface.

## Run The App

### Backend

See the full guide in [backend/README.md](backend/README.md) for setup, run, test, and troubleshooting steps.

Quick start:

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/backend
source .venv/bin/activate
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will run at `http://localhost:8000`.

### Frontend

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/frontend
cp .env.example .env.local
npm install
npm run dev
```

The app will run at `http://localhost:3000`.

## MVP That Is Already Built

The current codebase includes:

- a landing page with a research rotator and footer action links
- a planner form for a student schedule
- collapsible input groups for Workload and Recovery
- a planner help popup (`?`) with usage instructions and burnout-formula explanation
- a FastAPI endpoint at `/api/v1/analyze`
- an explainable risk-scoring engine
- recommendation generation based on workload, sleep, exams, and stress
- a frontend dashboard with a risk panel, metric snapshot, what-if simulator, and trend chart
- drag-and-drop panel reordering with drop-zone hints
- collapsible dashboard cards for risk details, what-if simulator, workload snapshot, and trend chart
- state-specific audio and visual feedback for risk outcomes and preset actions
- a daily Research Signal feed page with valid source links
- infinite scroll loading for Research Signal content
- cookie-session login/logout flow with dedicated `/login` and `/signup` pages
- a backend guide for setup, running, tests, and common fixes

## Notes For Contributors

- The frontend is the main active area for UI and interaction changes right now.
- The Research Signal feed uses paged API loading and link fallbacks so external sources stay usable.
- Auth is currently lightweight and session-cookie based (not OAuth or password auth yet).
- Footer feedback currently opens an email draft to `dominhduy09@gmail.com`.
- The backend currently serves an explainable rules-based scoring API; future ML work can keep the same contract.

## Recommended Build Order From Here

1. Run the current MVP locally.
2. Replace the explainable scoring logic with a trained scikit-learn model if you collect data.
3. Add schedule persistence with SQLite.
4. Add user accounts and multi-week trend tracking.
