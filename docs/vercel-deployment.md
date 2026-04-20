# Vercel Deployment Guide

This project is a monorepo with:
- `frontend/` (Next.js app) -> deploy to Vercel
- `backend/` (FastAPI) -> deploy to a Python host (Render/Railway/Fly/Azure), then connect URL

## 1) Deploy Frontend to Vercel

1. Push your latest code to GitHub.
2. In Vercel: **Add New Project** -> import this repository.
3. In project settings before deploy:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Next.js`
4. Deploy.

## 2) Configure Environment Variables (Frontend)

In Vercel -> Project -> **Settings** -> **Environment Variables**:

- `BACKEND_API_URL` = your backend public URL (recommended)
- Optional fallback: `NEXT_PUBLIC_API_URL` = same value

Example:
- `BACKEND_API_URL=https://your-backend-service.onrender.com`

Then redeploy the frontend.

## 3) Backend CORS (Important)

Your backend allows CORS from `BACKEND_CORS_ORIGINS`.
Set this in backend hosting platform to include your Vercel domain:

- `BACKEND_CORS_ORIGINS=https://your-app.vercel.app`

If you use preview deployments, include preview domain(s) too, comma-separated:

- `BACKEND_CORS_ORIGINS=https://your-app.vercel.app,https://your-app-git-main-username.vercel.app`

## 4) Verify Deployment

After deploy:

1. Open your Vercel site.
2. Run planner analysis.
3. Confirm API behavior:
   - If backend is reachable, analysis runs via backend.
   - If backend is unreachable, frontend route falls back to local analyzer logic.

## 5) Where This Is Used in Code

Frontend API route reads backend URL from env vars in:
- `frontend/app/api/analyze/route.ts`

Priority order:
1. `BACKEND_API_URL`
2. `NEXT_PUBLIC_API_URL`
3. `http://localhost:8000` (local fallback)

## Troubleshooting

### Build fails on Vercel

- Ensure **Root Directory** is set to `frontend`.
- Ensure dependencies install with `package-lock.json` in `frontend/`.

### App loads but analysis does not use backend

- Check `BACKEND_API_URL` in Vercel env vars.
- Confirm backend URL is correct and online.
- Redeploy after env var changes.

### CORS error from browser

- Add your Vercel URL to backend `BACKEND_CORS_ORIGINS`.
- Restart/redeploy backend after changing env vars.

## Recommended Production Split

- Frontend: Vercel
- Backend: Render/Railway/Fly/Azure App Service

This is the most reliable setup for this repository structure and FastAPI runtime.
