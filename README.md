# Expense Tracker (Full Stack)

A minimal but production-minded expense tracker with:
- Python backend (FastAPI + SQLite)
- Next.js frontend (TypeScript)
- JWT auth (signup/login)
- Idempotent expense creation for retry safety

## Why this design

- **SQLite + SQLAlchemy**: small operational footprint, strong consistency for single-node deployments, and enough structure for future migration to Postgres.
- **Idempotency-Key on POST /expenses**: protects against duplicate inserts when users double-click submit, refresh, or retry after network failures.
- **Decimal money type**: uses fixed-point numeric values to avoid floating-point rounding errors.

## Core Features Delivered

- Signup and login
- Create expense with `amount`, `category`, `description`, `date`
- View expenses
- Filter by category
- Sort by date (`date_desc`)
- Total for currently visible list

## API

### POST /auth/signup
Body:
```json
{
  "email": "john@example.com",
  "full_name": "John",
  "password": "strongpass1"
}
```

### POST /auth/login
Body:
```json
{
  "email": "john@example.com",
  "password": "strongpass1"
}
```

### POST /expenses
Headers:
- `Authorization: Bearer <token>`
- `Idempotency-Key: <stable-unique-key>`

Body:
```json
{
  "amount": "499.99",
  "category": "Travel",
  "description": "Taxi",
  "date": "2026-04-26"
}
```

### GET /expenses
Headers:
- `Authorization: Bearer <token>`

Optional query params:
- `category=<category>`
- `sort=date_desc`

Response:
```json
{
  "expenses": [...],
  "total": "1499.49"
}
```

## Run Locally (Docker Compose)

From project root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Run Locally (Without Docker)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment (Render)

This repo includes a `render.yaml` blueprint:
- `expense-tracker-api` as Docker web service
- `expense-tracker-frontend` as Node web service

On Render:
1. Create a new Blueprint instance from this repo.
2. Confirm generated `JWT_SECRET` and service URLs.
3. Ensure frontend `NEXT_PUBLIC_API_BASE_URL` points to deployed backend.
4. Ensure backend `ALLOWED_ORIGINS` includes deployed frontend URL.

If you create services manually (not via Blueprint):
1. For backend Docker service, either set Root Directory to `backend` and Dockerfile Path to `Dockerfile`, or leave Root Directory as repo root and use root `Dockerfile`.
2. For frontend service, set Root Directory to `frontend` with build `npm install && npm run build` and start `npm run start`.

## Timebox Trade-offs

- Used `Base.metadata.create_all(...)` instead of full migrations for faster setup.
- Kept frontend auth state in `localStorage` (simple, not SSR cookie-based).
- Added one focused backend integration test; test coverage is intentionally small.

## Intentionally Not Done Yet

- Refresh-token flow and password reset.
- Per-category summary chart in UI.
- Full CI pipeline and broader test suite.
- Advanced role/permission model.
