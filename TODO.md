# Designify AI - Phase 1 TODO

## Step 1: Scaffold repo structure
- [ ] Create `frontend/` (Vite + React + Tailwind + React Router)
- [ ] Create `backend/` (FastAPI clean architecture)
- [ ] Add `.env.example` for both

## Step 2: Backend core (FastAPI + MongoDB + JWT)
- [ ] Implement MongoDB connection layer
- [ ] Create Pydantic schemas for auth + projects
- [ ] Create JWT utils (create + verify)
- [ ] Implement auth routes: signup + login
- [ ] Implement projects routes: list + create + delete (protected)
- [ ] Add CORS + settings via env

## Step 3: Frontend auth + protected routes
- [ ] Create layout components: Navbar, Sidebar, Footer
- [ ] Create pages: Landing, Login, Signup, Dashboard (protected)
- [ ] Implement AuthContext + localStorage token handling
- [ ] Implement `ProtectedRoute`
- [ ] Implement dashboard project listing + delete action

## Step 4: Project config + scripts
- [ ] Add `package.json` scripts (frontend)
- [ ] Add requirements.txt (backend)
- [ ] Provide install/run commands

## Step 5: Smoke testing checklist
- [ ] Run backend
- [ ] Run frontend
- [ ] Verify: signup -> login -> dashboard access -> project CRUD

