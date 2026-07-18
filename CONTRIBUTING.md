# Contributing to Burnout Sentinel

Thank you for your interest in contributing to **Burnout Sentinel**! Whether you are fixing a bug, improving the scoring formula, or working on frontend visual assets, your support is welcome.

Please review the following guidelines before you get started.

---

## Codebase Architecture

This project is organized as a monorepo:
* **`/frontend`**: Next.js 14 Web Application (React, TypeScript, Tailwind CSS, Recharts)
* **`/backend`**: FastAPI score calculator (Python 3.12, Uvicorn, pytest)
* **`/ml`**: Future machine learning resources and model templates
* **`/shared`**: Common schemas and type definitions
* **`/docs`**: Project proposal, pitch slides, and deployment instructions

---

## Getting Started

### 1. Fork and Clone
Fork the repository on GitHub and clone your fork locally:
```bash
git clone https://github.com/your-username/burnout-sentinel.git
cd burnout-sentinel
```

### 2. Frontend Local Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
The frontend will be active at [http://localhost:3000](http://localhost:3000).

### 3. Backend Local Setup
Ensure you have **Python 3.12** installed:
```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend API documentation will be active at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Development Guidelines

### Pull Request Process
1. Create a descriptive branch for your edits:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```
2. Make your edits and ensure everything compiles locally.
3. Commit your changes using clear commit messages:
   ```bash
   git commit -m "feat: add score breakdown description"
   ```
4. Push your branch and open a Pull Request (PR) against the `main` branch.

### Frontend Style and Quality
* Ensure TypeScript type checks pass before committing:
  ```bash
  npm run typecheck
  ```
* Ensure production build completes without warnings or errors:
  ```bash
  npm run build
  ```

### Backend Testing and Quality
* We use **pytest** for backend unit tests. Run the test suite using `PYTHONPATH`:
  ```bash
  PYTHONPATH=. pytest
  ```
* Ensure you add relevant unit tests in the `/backend/tests/` directory for any new scoring calculations or API pathways.
