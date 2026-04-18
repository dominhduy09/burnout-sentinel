# Backend Run Guide

This backend uses FastAPI and must run in a Python virtual environment.

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

## Notes

- Always activate `.venv` before running backend commands.
- Prefer `python3 -m uvicorn ...` instead of `uvicorn ...` to avoid stale launcher/shebang issues.
- If you moved/renamed project folders and commands break, recreate the venv:

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/backend
rm -rf .venv
python3.12 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

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
