# Backend (Phase 1)

FastAPI + MongoDB + JWT.

## Prerequisites
- Python 3.10+

## Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Environment
Create `backend/.env` from `backend/.env.example`.

```bash
copy .env.example .env
```

## Run
```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`.

