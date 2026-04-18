# Backend Run Guide

This backend uses FastAPI and must run in a Python virtual environment.

## Purpose

This backend provides the burnout analysis API used by the frontend planner.

It currently does three main jobs:

- accepts weekly workload and recovery inputs
- returns a burnout risk score, label, summary, insights, and recommendations
- keeps the scoring logic explainable so the project is easy to demo and defend

## Prerequisites

- macOS/Linux shell
- Python 3.12 available as `python3.12`

## First-Time Setup

From the backend folder:

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/backend
python3.12 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

## Run Backend API

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/backend
source .venv/bin/activate
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

After startup:

- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs

### Example Analyze Request

```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
	-H "Content-Type: application/json" \
	-d '{
		"week_name": "Week 7",
		"task_count": 18,
		"high_priority_task_count": 5,
		"estimated_task_hours": 22,
		"exam_count": 2,
		"clinical_hours": 14,
		"average_sleep_hours": 6.7,
		"stress_level": 7,
		"free_hours": 10
	}'
```

The response includes:

- `risk_label`
- `risk_score`
- `summary`
- `contributing_factors`
- `insights`
- `score_breakdown`
- `recommendations`

## Run Tests

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/backend
source .venv/bin/activate
python3 -m pytest -q tests
```

Run a single test file:

```bash
python3 -m pytest -q tests/test_predictor.py
```

If you only want to verify the API behavior and not the frontend, backend tests are the quickest check.

## Notes

- Always activate `.venv` before running backend commands.
- Prefer `python3 -m uvicorn ...` instead of `uvicorn ...` to avoid stale launcher/shebang issues.
- Use Python 3.12 for the backend virtual environment. Python 3.14 caused dependency build failures during install.
- If you moved/renamed project folders and commands break, recreate the venv:

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/backend
rm -rf .venv
python3.12 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

If you later restore the machine-learning packages, install them from `requirements-ml.txt` separately.

## Common Errors

### `No module named uvicorn`

Your virtual environment is not active or dependencies are not installed.

Fix:

```bash
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

### `bad interpreter` in `.venv/bin/uvicorn`

Old path cached in script launcher after moving folders.

Fix:

```bash
source .venv/bin/activate
python3 -m pip install --force-reinstall "uvicorn[standard]==0.30.6"
```

Or use `python3 -m uvicorn ...` directly.

### Build/install errors with Python 3.14

This project currently pins versions that are safer on Python 3.12.

Fix:

- recreate `.venv` with `python3.12`
- reinstall dependencies from `requirements.txt`
