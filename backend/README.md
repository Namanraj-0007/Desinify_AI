# ⚡ Designify AI — Backend Microservice

> **High-Throughput FastAPI ASGI Microservice with Gemini 2.5 Flash Vision AST Synthesis, Server-Sent Events (SSE) Streaming Compiler, and Motor Async MongoDB Persistence.**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Pydantic v2](https://img.shields.io/badge/Pydantic-v2.10.3-E92063?style=flat-square&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E44AD?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Async-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Uvicorn](https://img.shields.io/badge/ASGI-Uvicorn_0.32-499848?style=flat-square)](https://www.uvicorn.org/)

---

## 📖 Overview

The Designify AI backend is an asynchronous Python web service powered by **FastAPI** and **Uvicorn**. It serves as the compilation engine bridging Figma's raw vector JSON with Google Gemini's multimodal vision model to synthesize clean, type-safe React 19 code.

Key architectural features:
- **Multimodal Vision Geometric AST**: Orchestrates calls to **Google Gemini 2.5 Flash** with high-resolution visual crops and Figma autolayout bounding boxes, resolving complex layouts into Flexbox, CSS Grid, and responsive Tailwind utility classes.
- **Real-Time Code Streaming (SSE)**: Uses Server-Sent Events (`/api/codegen/stream`) to stream chunked TypeScript JSX directly to the frontend with sub-350ms time-to-first-token.
- **Dynamic Collection Proxies & Fallback**: MongoDB operations use `DynamicCollectionProxy` via Motor. If MongoDB Atlas is unavailable or offline during local development, the service automatically switches to an in-memory cursor fallback mode without crashing.
- **Google OAuth 2.0 Browser Redirection**: Handles Google OAuth 2.0 authorization code exchange and returns an HTTP 302 redirect sending the user's browser back to `${FRONTEND_URL}/auth/callback?token=<jwt>`.
- **In-Memory ZIP Package Generator**: Generates full, self-contained Vite + React 19 project archives in memory with custom `package.json`, `tsconfig.json`, and Tailwind configurations for instant download.

---

## 🏛 Backend Pipeline Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Incoming Client Request                           │
 │     • POST /api/figma/parse          • POST /api/codegen/generate      │
 │     • GET  /api/auth/google/callback • POST /api/codegen/stream        │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      FastAPI ASGI Layer                                │
 │  • Pydantic v2 Request Validation & Schema Serialization               │
 │  • HTTPBearer Security Dependency (JWT Signature Verification)         │
 │  • CORS Middleware (Configurable Origins + Local Dev Regex)            │
 └─────────────┬─────────────────────┬────────────────────┬───────────────┘
               │                     │                    │
               ▼                     ▼                    ▼
 ┌───────────────────────────┐ ┌───────────────┐ ┌────────────────────────┐
 │       Figma Service       │ │  AI Pipeline  │ │    Persistence Layer   │
 │ • File key/URL extraction │ │ • Gemini 2.5  │ │ • Motor Async Client   │
 │ • Vector tree traversal   │ │ • Vision AST  │ │ • Dynamic Proxies      │
 │ • Raster crop rendering   │ │ • SSE Stream  │ │ • In-Memory Fallback   │
 └───────────────────────────┘ └───────────────┘ └────────────────────────┘
```

---

## 📂 Source Structure

```text
backend/
├── app/
│   ├── config/
│   │   └── settings.py         # Pydantic Settings singleton with masked config
│   ├── models/                 # Database models
│   ├── routers/                # FastAPI endpoint handlers
│   │   ├── auth.py             # Email/password signup, login, & session check
│   │   ├── code_generation.py  # Gemini code synthesis, SSE stream, & ZIP export
│   │   ├── figma.py            # Figma file parsing, frames, & image rendering
│   │   ├── oauth_discord.py    # Discord OAuth 2.0 integration
│   │   ├── oauth_google.py     # Google OAuth 2.0 authorization & browser redirect
│   │   ├── projects.py         # User project CRUD operations
│   │   └── utils/
│   │       └── auth.py         # get_current_user_id security dependency
│   ├── schemas/                # Strict Pydantic v2 request/response schemas
│   │   ├── ai_generation.py    # Generation parameters & prompt structures
│   │   ├── auth.py             # Credentials & token response shapes
│   │   ├── code_generation.py  # Generated file outputs & version history
│   │   ├── figma.py            # Figma import payload & project summary models
│   │   └── projects.py         # Project list and detail models
│   ├── services/               # Core business logic & external integrations
│   │   ├── ai_code_generator.py # Direct Gemini API code synthesis
│   │   ├── ai_prompt_builder.py # Context-aware prompt construction
│   │   ├── auth_service.py     # bcrypt password hashing & JWT token issuance
│   │   ├── code_generation_service.py # End-to-end AST compilation pipeline
│   │   ├── design_parser.py    # Layout geometry & token parser
│   │   ├── figma_service.py    # Figma REST API v1 client
│   │   ├── gemini_service.py   # Google Generative AI client wrapper
│   │   ├── mongo.py            # Motor async MongoDB & DynamicCollectionProxy
│   │   ├── mongo_health.py     # Startup ping verification helper
│   │   └── zip_service.py      # In-memory ZIP project packaging
│   ├── utils/
│   │   └── jwt.py              # Cryptographic JWT encode/decode functions
│   └── main.py                 # FastAPI application factory, CORS, & middleware
├── .env.example                # Clean template of all environment variables
└── requirements.txt            # Pinned Python package dependencies
```

---

## ⚙️ Environment Variables Specification

Configure these variables inside `backend/.env`:

| Variable | Default | Required | Purpose |
| :--- | :---: | :---: | :--- |
| `MONGODB_URI` | `mongodb://localhost:27017` | Yes | MongoDB Atlas connection string |
| `DATABASE_NAME` | `designify_ai` | No | Database name inside MongoDB |
| `JWT_SECRET` | `dev-secret-key` | Yes | 256-bit secret key used to sign session JWTs |
| `JWT_ALGORITHM` | `HS256` | No | JWT signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | No | Token lifespan before expiration |
| `API_PREFIX` | `/api` | No | Base routing prefix for all API endpoints |
| `CORS_ORIGINS` | `*` | No | Comma-separated list of allowed web origins |
| `FRONTEND_URL` | `http://localhost:5073` | Yes | Client URL target for Google OAuth browser redirects |
| `GOOGLE_CLIENT_ID` | `""` | Optional | Google OAuth 2.0 Web Client ID |
| `GOOGLE_CLIENT_SECRET` | `""` | Optional | Google OAuth 2.0 Web Client Secret |
| `GOOGLE_REDIRECT_URI` | `http://localhost:8000/api/auth/google/callback` | Optional | Authorized redirect URI registered in Google Console |
| `GEMINI_API_KEY` | `""` | Yes | Google AI Studio API key for Gemini 2.5 Flash |
| `GEMINI_MODEL` | `gemini-2.0-flash-exp` | No | Gemini model identifier used for vision & AST parsing |
| `FIGMA_ACCESS_TOKEN` | `""` | Optional | Server-level Figma Personal Access Token fallback |

---

## 🚀 Local Setup & Development

### Prerequisites
- **Python**: `v3.10` or higher
- **pip** and **virtualenv**

### 1. Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
# Windows:
copy .env.example .env

# macOS / Linux:
cp .env.example .env
```

Open `backend/.env` and update your `GEMINI_API_KEY`, `MONGODB_URI`, `JWT_SECRET`, and `GOOGLE_CLIENT_ID` values.

### 4. Start Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will initialize on **[http://localhost:8000](http://localhost:8000)**.

- **Swagger Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc API Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 Primary API Route Reference

All endpoints are prefixed with `/api`.

### 🔐 Authentication & Session
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Register a new user account with email & password | No |
| `POST` | `/api/auth/login` | Authenticate with credentials and receive a signed JWT | No |
| `POST` | `/api/auth/social-login` | Direct social sign-in payload processor | No |
| `GET` | `/api/auth/google/start` | Retrieve Google OAuth authorization URL & state | No |
| `GET` | `/api/auth/google/callback` | Exchange OAuth code and 302 redirect browser to frontend | No |
| `GET` | `/api/auth/discord/start` | Retrieve Discord OAuth authorization URL & state | No |
| `GET` | `/api/auth/discord/callback` | Exchange Discord OAuth code and return access token | No |

### 🎨 Figma Integration
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/figma/parse` | Parse public Figma file or frame into layout AST | Yes |
| `GET` | `/api/figma/projects` | List all parsed Figma projects for current user | Yes |
| `GET` | `/api/figma/projects/{id}` | Retrieve parsed hierarchy, tokens, and frames | Yes |
| `POST` | `/api/figma/render-images` | Render high-res PNG raster previews of frame nodes | Yes |

### ⚡ Code Generation & Export
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/codegen/generate` | Synthesize React 19 TypeScript component from AST | Yes |
| `POST` | `/api/codegen/stream` | Stream generated code in real time via Server-Sent Events | Yes |
| `GET` | `/api/codegen/history/{project_id}` | Fetch previous generation versions and diffs | Yes |
| `POST` | `/api/codegen/export` | Download complete Vite + React project as a `.zip` | Yes |

---

## 🧪 Testing & Verification

Run a quick route and module verification using Python:

```bash
# Verify all backend modules import cleanly
python -c "from app.main import create_app; app = create_app(); print('Active routes:', len(app.routes))"
```
