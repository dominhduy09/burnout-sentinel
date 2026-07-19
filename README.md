<img width="1710" height="1204" alt="Screenshot 2026-07-18 at 01 59 32" src="https://github.com/user-attachments/assets/708ede9c-5137-48e6-a88c-90f99fb43107" />

<div align="center">

# Burnout Sentinel

**An Early Warning System for Student Burnout Using Workload and Recovery Indicators**

[![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)](README.md)
[![Frontend](https://img.shields.io/badge/frontend-Next.js%2014-black.svg)](frontend/package.json)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688.svg)](backend/app/main.py)
[![Status](https://img.shields.io/badge/status-MVP-green.svg)](README.md)
[![Deployment](https://img.shields.io/badge/deployment-live-success.svg)](https://burnout-sentinel-omega.vercel.app/)
[![Video Demo](https://img.shields.io/badge/video-demo-red.svg?logo=youtube)](https://www.youtube.com/watch?v=gzJWwboo6fU)

[Overview](#overview) - [Live Demo & Presentation](#live-demo--presentation) - [Features](#features) - [Quick Start](#quick-start) - [Project Structure](#project-structure) - [Roadmap](#roadmap)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Live Demo & Presentation](#live-demo--presentation)
- [Project Status](#project-status)
- [Features](#features)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Research Question](#research-question)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Privacy Policy](#privacy-policy)

---

## Live Demo & Presentation

- 🚀 **Live Web Application:** [https://burnout-sentinel-omega.vercel.app/](https://burnout-sentinel-omega.vercel.app/)
- 🎥 **Video Demo & Presentation:** [YouTube Link](https://www.youtube.com/watch?v=gzJWwboo6fU)
- ⚙️ **API Documentation (Swagger UI):** [https://burnout-sentinel-omega.vercel.app/docs](https://burnout-sentinel-omega.vercel.app/docs)
- 🩺 **API Health Check:** [https://burnout-sentinel-omega.vercel.app/health](https://burnout-sentinel-omega.vercel.app/health)

---

## Overview

Burnout Sentinel is a student wellness project focused on helping students detect overload early and rebalance their week before stress becomes burnout.

Instead of acting like a basic to-do list, the app combines planning inputs with explainable risk scoring, personalized recommendations, and trend tracking.

The current implementation is an MVP prototype with a polished UI, backend analysis API, and competition-ready demo flow.

## Project Status

- Project title: Burnout Sentinel
- Research subtitle: An Early Warning System for Student Burnout Using Workload and Recovery Indicators
- Version: 0.4.0
- Last updated: April 19, 2026
- Scope: MVP prototype
- Current focus: frontend experience, research feed, and explainable burnout analysis

## Features

### Core Planner
- Weekly workload and recovery input form
- Preset weeks (Balanced, Heavy, Overloaded)
- Live workload summary while editing
- Collapse/expand controls for planner sections and analysis panels

### Analysis and Guidance
- Burnout risk score (0-100) with Low/Moderate/High labels
- Explainable score breakdown and contributing factors
- What-if simulation for schedule adjustments
- Personalized recommendation generation

### Visualization and Interaction
- Workload snapshot metrics
- Risk trend chart with saved snapshots
- Drag-and-drop panel reordering
- State-aware UI feedback for preset and risk interactions

### Research and Product Experience
- Research Signal page with external links and infinite scrolling
- Help popup for formula and usage instructions
- Lightweight cookie-session login/signup flow

## How It Works

1. Student enters weekly workload and recovery indicators.
2. Frontend validates payload and posts to `POST /api/v1/analyze`.
3. Backend computes explainable risk and recommendations.
4. Frontend renders risk summary, breakdown, what-if panel, and trend insights.
5. If backend is unavailable, frontend can fall back to local analyzer logic.

## Quick Start

### Backend

For full setup, tests, and troubleshooting, see [backend/README.md](backend/README.md).

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/backend
source .venv/bin/activate
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend endpoints:
- Health: http://localhost:8000/health
- Docs: http://localhost:8000/docs

### Frontend

```bash
cd /Users/dominhduy/Documents/Playground/burnout-sentinel/frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend app:
- http://localhost:3000

### Vercel Deployment

See [docs/vercel-deployment.md](docs/vercel-deployment.md) for monorepo/Vercel setup.

## Project Structure

- [frontend/](frontend): Next.js application (UI, client logic, API route bridge)
- [backend/](backend): FastAPI burnout scoring and recommendation API
- [backend/README.md](backend/README.md): backend run/test/troubleshooting guide
- [docs/](docs): proposal, pitch notes, build plan, deployment notes
- [ml/](ml): future machine-learning workspace
- [shared/](shared): future shared schemas/constants/prompts

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Forms/Validation: React Hook Form, Zod
- Charts: Recharts
- Backend: FastAPI, Pydantic
- Modeling approach: explainable rules-based risk scoring (ML-ready architecture)
- Deployment target: Vercel (frontend) + Render/Railway/Fly/Azure (backend)

## Research Question

Can a machine learning-supported planning tool help students identify overload and reduce burnout risk by providing personalized weekly planning recommendations?

## Roadmap

- Replace explainable rules with trained model once dataset is available
- Add persistence for long-term schedule and trend history
- Expand recommendation quality and personalization
- Add optional account system for multi-device continuity

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to set up the development environment, coding standards, and submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy Policy

We respect your data privacy. Please read our [Privacy.md](Privacy.md) file to understand how we process planner inputs and cookies.
