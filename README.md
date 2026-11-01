# 🌌 Designify AI

<div align="center">

```
  ██████╗ ███████╗███████╗██╗ ██████╗ ███╗   ██╗██╗███████╗██╗   ██╗     █████╗ ██╗
  ██╔══██╗██╔════╝██╔════╝██║██╔════╝ ████╗  ██║██║██╔════╝╚██╗ ██╔╝    ██╔══██╗██║
  ██║  ██║█████╗  ███████╗██║██║  ███╗██╔██╗ ██║██║█████╗   ╚████╔╝     ███████║██║
  ██║  ██║██╔══╝  ╚════██║██║██║   ██║██║╚██╗██║██║██╔══╝    ╚██╔╝      ██╔══██║██║
  ██████╔╝███████╗███████║██║╚██████╔╝██║ ╚████║██║██║        ██║       ██║  ██║██║
  ╚═════╝ ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝        ╚═╝       ╚═╝  ╚═╝╚═╝
```

### ⚡ The Figma-to-React 19 Spatial Synthesis Engine
**Turn static Figma vector frames into clean, typed, production-ready React components powered by Gemini 2.5 Flash Multimodal Vision & an asynchronous FastAPI compiler.**

<br/>

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F_%26_Drei-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini 2.5](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E44AD?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Async-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<br/>

[3D Spatial Engine](#-the-3d-spatial-canvas-engine) • [Interactive Storyboard](#-6-stage-scroll-storyboard-matrix) • [Architecture](#-system-architecture) • [Live Cockpit](#-interactive-live-studio-cockpit) • [Local Setup](#-local-setup--development) • [API Reference](#-core-api-reference)

</div>

---

## 🔮 What is Designify AI?

Traditional AI code generators struggle with visual fidelity. Raw text LLMs lack spatial geometric reasoning, routinely generating brittle "div soup" with hardcoded pixel coordinates, hallucinated CSS, and broken layouts.

**Designify AI** re-engineers this pipeline from the ground up:

1. **Exact Vector Tree Extraction**: Queries the Figma REST API v1 for precise bounding boxes, autolayout rules, typography scales, colors, and border tokens.
2. **Multimodal Vision Geometric AST**: Passes high-res raster renders and structural nodes to **Google Gemini 2.5 Flash**, synthesizing spatial layout semantics into clean Flexbox, CSS Grid, and responsive Tailwind classes.
3. **High-Throughput ASGI Compiler**: Uses **FastAPI** to compile and stream production-ready React 19 JSX via Server-Sent Events (SSE) with sub-350ms initial AST latency.
4. **Pinned 3D Spatial Storyboard**: A scroll-driven WebGL spatial viewport built with **React Three Fiber (R3F)** and **Three.js** that visually deconstructs Figma frames into floating, exploded layers as you scroll through the product story.

---

## 🌐 The 3D Spatial Canvas Engine

The heart of Designify AI's landing experience is a **pinned 3D WebGL viewport** powered by `@react-three/fiber`, `@react-three/drei` (`ScrollControls`), and smooth cubic damping ($\lambda = 0.22$).

```
             3D ISOMETRIC WIREFRAME & SPATIAL CAMERA FRUSTUM

                     Camera Eye (0, 0, 6.8)  FOV: 42°
                                 \
                                  \  (Frustum Rays)
                                   ▼
              ┌────────────────────────────────────────────────────────┐
             /                                                        /│
            /   [Layer 05: Typography]  Z = +2.35                    / │
           /    ├── font-display text-xl                            /  │
          /                                                        /   │
         /     [Layer 04: Interactive Button]  Z = +1.95          /    │
        /      ├── button:hover:scale-105                        /     │
       /                                                        /      │
      /       [Layer 03: Feature Sparklines]  Z = +1.45        /       │
     /        ├── svg • path • stroke                         /        │
    /                                                        /         │
   /         [Layer 02: Metric Telemetry]  Z = +0.95        /          │
  /          ├── grid-cols-2 • p-4                         /           │
 /                                                        /            │
/           [Layer 01: Flex Navigation]  Z = +0.45       /             │
│           ├── flex-row • space-between                /              │
│                                                      /               │
│          [Layer 00: Canvas Base Frame]  Z = 0.00    /                │
│          └── Artboard Mesh (3.6 × 4.8 × 0.04)      /                 │
└───────────────────────────────────────────────────┘                  │
 │                                                  │                  │
 │      Glowing Vector Connectors (Left & Right)    │                  │
 │      ◄──────────────────────────────────────────►│                  │
 │                                                  │                 /
 │      Rotation Tilt Matrix: [-0.22 rad X, +0.48 rad Y, +0.06 rad Z] /
 └───────────────────────────────────────────────────────────────────┘
```

### 3D Engine Physics & Geometry Specs

```typescript
// Spatial scene constants from frontend/src/components/landing3d/constants.ts
export const FRAME_CONFIG = {
  width: 3.6,                  // Mesh units width
  height: 4.8,                 // Mesh units height
  depth: 0.04,                 // Extruded artboard base depth
  cornerRadius: 0.16,          // Bevel & border radius

  // Exploded view matrix
  maxZSeparation: 0.75,        // Max Z offset between adjacent mesh slices
  explodeTiltX: -0.22,         // X-axis tilt in radians
  explodeTiltY: 0.48,          // Y-axis tilt in radians
  explodeTiltZ: 0.06,          // Z-axis perspective rotation

  // Camera Frustum
  cameraFov: 42,               // Field of view in degrees
  cameraInitialZ: 6.8,         // Initial hero focal length
  cameraPulledBackZ: 8.6,      // Stage 6 comparison pull-back
}
```

---

## 🎬 6-Stage Scroll Storyboard Matrix

The user's scroll position ($t \in [0.0, 1.0]$) dynamically drives camera position, layer explosion factors, neon connector opacity, and code compilation.

```
       SCROLL PROGRESSION TIMELINE (Drei ScrollControls: 13.5 Pages)

  0.00          0.15              0.35              0.55              0.75            0.90          1.00
  ├─── Stage 1 ───┼──── Stage 2 ────┼──── Stage 3 ────┼──── Stage 4 ────┼─── Stage 5 ───┼─── Stage 6 ───┤
    Hero Frame       Layer Explode     Gemini AST        Code Stream      Assembled UI     Pullback + CTA
    (Flat 3D)        (Z-Separation)    (Connectors)      (Streaming TSX)  (Compiled Card)  (Before/After)
```

### Stage Deep Dive

| Stage | Scroll Range | Visual 3D Transformation | Overlay & Code Behavior |
| :---: | :---: | :--- | :--- |
| **01** | `0% - 15%` | **Floating Flat Frame**<br/>The Figma frame floats in a dark void ($Z=0$), exhibiting subtle harmonic floating physics ($\sin(\omega t)$). | Hero Headline fades in: *"Design in. Code out."* Quick launch buttons appear. |
| **02** | `15% - 35%` | **Z-Axis Layer Explosion**<br/>The frame splits into 6 separate floating layers along the Z-axis (up to $Z=2.35$) while rotating $-0.22\text{ rad}$ on X and $+0.48\text{ rad}$ on Y. | Caption 01 fades in: *"Deconstructing visual hierarchy into distinct AST branches."* |
| **03** | `35% - 55%` | **Gemini Layout Analysis**<br/>Glowing cyan neon connector vectors link each layer back to the artboard; 3D HTML tags (`flex-row`, `grid-cols-2`, `button:hover`) materialize in space. | Caption 02: *"Gemini reads the layout."* Live AST coordinate badges illuminate. |
| **04** | `55% - 75%` | **Neural Synthesis Stream**<br/>Layers flow along a glowing energy conduit into a floating 3D code terminal, streaming typed React 19 JSX in real time. | Caption 03: *"FastAPI turns it into components."* Active SSE stream telemetry (~340ms AST latency). |
| **05** | `75% - 90%` | **Clean Component Assembly**<br/>The code compiles; the exploded layers snap back together on the right side of the canvas as a pristine, working interactive UI card. | Caption 04: *"Clean React, ready to ship."* 100% type-safe TypeScript badge verified. |
| **06** | `90% - 100%` | **Camera Pull-Back & CTA**<br/>The camera pulls back from $Z=6.8 \to 8.6$ revealing Before (Figma Frame) and After (Compiled UI) side-by-side. | Interactive Launchpad fades in: input field to paste any Figma URL, plus sample frame triggers and portfolio links. |

---

## 🏛 System Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      User / Figma Design Input                         │
 │           (Figma Frame URL, File Key, or Interactive Preset)           │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   React 19 + Vite Frontend Client                      │
 │  • Pinned 3D Spatial Storyboard Canvas (@react-three/fiber + drei)    │
 │  • Route-Based Code Splitting (React.lazy + Suspense, 104 KB entry)    │
 │  • Interactive Live Preview Cockpit & Hot-State Sandbox               │
 │  • AST Design Token Inspector & Multi-Tab Code Viewer                  │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                    HTTP REST / SSE Event Streams
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      FastAPI Backend Microservice                      │
 │  • Asynchronous ASGI Architecture with Pydantic v2 Validation          │
 │  • JWT Session Management & Google OAuth 2.0 Web Redirection           │
 │  • Dynamic Collection Proxies (Seamless Atlas / In-Memory Fallback)    │
 │  • Server-Sent Events (SSE) Streaming Compiler                         │
 └─────────────┬─────────────────────┬────────────────────┬───────────────┘
               │                     │                    │
               ▼                     ▼                    ▼
 ┌───────────────────────────┐ ┌───────────────┐ ┌────────────────────────┐
 │    Figma REST API v1      │ │ Google Gemini │ │     MongoDB Atlas      │
 │  • Vector node traversal  │ │ • Gemini 2.5  │ │  • Motor Async Driver  │
 │  • Layout bounding boxes  │ │ • Vision AST  │ │  • Dynamic Proxying    │
 │  • Typography & fills     │ │ • TSX Codegen │ │  • Users & Projects    │
 └───────────────────────────┘ └───────────────┘ └────────────────────────┘
```

---

## 🎨 Before vs. After: What Designify AI Generates

```
TRADITIONAL LLM GENERATION                DESIGNIFY AI (SPATIAL VISION AST)
──────────────────────────────────        ─────────────────────────────────────────
❌ Absolute pixel coordinate positioning  ✅ Semantic Flexbox & Responsive CSS Grid
❌ Inflexible nested "div soup"           ✅ Component primitives (<Card>, <Badge>)
❌ Hallucinated styles & colors           ✅ Exact Figma design tokens & Tailwind v3
❌ Broken on mobile viewports             ✅ Fluid responsive layout (Mobile → Desktop)
❌ Untyped plain JavaScript               ✅ Strict TypeScript 5.5 Props interfaces
❌ Zero interactive state                 ✅ Live hooks (useState, motion springs)
```

### Side-by-Side Code Output Preview

```tsx
// ⚡ Generated by Designify AI • Gemini 2.5 AST
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface HeroMetricCardProps {
  title?: string;
  activeCount?: number;
  accuracy?: string;
}

export function HeroMetricCard({
  title = "Neural Synthesis",
  activeCount = 1420,
  accuracy = "99.4% TSX",
}: HeroMetricCardProps) {
  const [activeTab, setActiveTab] = useState<'AST' | 'TSX'>('TSX');

  return (
    <div className="relative p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-2xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{title}</span>
          <h3 className="text-2xl font-bold text-white mt-1 font-display">{activeCount} Components</h3>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          {accuracy}
        </span>
      </div>

      {/* Interactive AST Visualizer */}
      <div className="h-16 flex items-end gap-1.5 pt-2">
        {[40, 65, 45, 80, 55, 95, 75, 100].map((h, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🕹 Interactive Live Studio Cockpit

Directly beneath the 3D scroll experience, the landing page transitions into the **Interactive Live Studio Cockpit**:

1. **Interactive Sandbox Viewport**: Test the synthesized UI live with toggleable states, responsive resize handles (Desktop $1440\text{px}$, Tablet $768\text{px}$, Mobile $375\text{px}$), and dark/light modes.
2. **Tabbed Code Output Viewer**:
   - `Component.tsx`: Complete React 19 JSX component.
   - `Tailwind.css`: Dedicated utility classes and gradients.
   - `Tokens.json`: Extracted typography, colors, border radii, and shadows.
3. **One-Click Actions**:
   - **Copy File Content**: Fast clipboard export.
   - **Download ZIP Bundle**: Complete Vite project with `package.json`, `tsconfig.json`, and Tailwind setup ready to `npm install && npm run dev`.

---

## 🛠 Tech Stack

| Domain | Technology | Version | Purpose |
| :--- | :--- | :---: | :--- |
| **Frontend Framework** | [React](https://react.dev/) | `19.0.0` | Concurrent UI rendering and component hierarchy |
| **Bundler & Tooling** | [Vite](https://vitejs.dev/) | `5.4.x` | Lightning-fast HMR and Rollup code-split production build |
| **Type Safety** | [TypeScript](https://www.typescriptlang.org/) | `5.5.x` | Strict end-to-end type safety across client and models |
| **3D Rendering** | [Three.js](https://threejs.org/) | `0.160.x` | WebGL scene graph, custom meshes, and shaders |
| **3D React Bridge** | [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | `8.17.x` | Declarative Three.js component architecture |
| **3D Controls** | [@react-three/drei](https://github.com/pmndrs/drei) | `9.109.x` | Virtualized `ScrollControls`, HTML overlays, and spatial cameras |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `3.4.x` | Atomic styling, custom cyber-dark theme, and fluid layout |
| **Animation Engine** | [Framer Motion](https://www.framer.com/motion/) | `11.3.x` | Page transitions, accordion docks, and layout spring physics |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) | `0.115.x` | High-throughput asynchronous ASGI microservice |
| **Server Engine** | [Uvicorn](https://www.uvicorn.org/) | `0.32.x` | Production ASGI web server |
| **AI Vision Model** | [Google Gemini 2.5 Flash](https://ai.google.dev/) | `Latest` | Multimodal layout reasoning and AST component synthesis |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) + [Motor](https://motor.readthedocs.io/) | `3.6.x` | Non-blocking async document storage with in-memory fallback |
| **Authentication** | [python-jose](https://github.com/mpdavis/python-jose) + Google OAuth | `3.3.x` | Cryptographic JWT tokens and Google OAuth 2.0 |

---

## 📂 Verified Project Directory Structure

```text
DesinifyAI/
├── backend/
│   ├── app/
│   │   ├── config/             # Pydantic v2 settings & environment parsing
│   │   │   └── settings.py     # Configuration singleton with masked security
│   │   ├── models/             # Database document models
│   │   ├── routers/            # FastAPI REST & SSE endpoints
│   │   │   ├── auth.py         # Email/password authentication & session info
│   │   │   ├── code_generation.py # Gemini AST & code generation routes
│   │   │   ├── figma.py        # Figma API integration & node extraction
│   │   │   ├── oauth_google.py # Google OAuth flow & browser redirection
│   │   │   ├── oauth_discord.py # Discord OAuth integration
│   │   │   ├── projects.py     # User project management CRUD
│   │   │   └── utils/          # HTTPBearer authentication dependency
│   │   ├── schemas/            # Pydantic request & response schemas
│   │   ├── services/           # Business logic & integrations
│   │   │   ├── ai_prompt_builder.py # Multimodal prompt compiler
│   │   │   ├── auth_service.py # User registration & password hashing
│   │   │   ├── figma_service.py # Figma file parsing & tree traversal
│   │   │   ├── gemini_service.py # Gemini API connector
│   │   │   ├── mongo.py        # Motor async client & dynamic proxies
│   │   │   └── zip_service.py  # In-memory ZIP package creation
│   │   └── main.py             # ASGI application initialization & CORS
│   ├── .env.example            # Backend environment template
│   └── requirements.txt        # Python dependency manifest
├── frontend/
│   ├── src/
│   │   ├── api/                # Typed Axios API clients
│   │   ├── components/         # Reusable React components
│   │   │   ├── auth/           # Authentication modals & 3D backdrop
│   │   │   ├── codegen/        # Code generator dashboard & editor controls
│   │   │   ├── figma/          # Figma frame visualizer & project cards
│   │   │   ├── landing3d/      # Pinned 3D Three.js scene & storyboard
│   │   │   │   ├── CodeStreamPanel3D.tsx # 3D streaming code panel mesh
│   │   │   │   ├── Designify3DLanding.tsx # Root Drei Canvas & ScrollControls
│   │   │   │   ├── FallbackStory2D.tsx  # Mobile & reduced-motion fallback
│   │   │   │   ├── FigmaFrame3D.tsx    # 3D exploding artboard mesh layers
│   │   │   │   ├── OverlayStory.tsx    # Synchronized HTML story overlay
│   │   │   │   ├── PostStorySections.tsx # Features, testimonials, architecture
│   │   │   │   ├── Scene3D.tsx         # Camera animation & scroll loop
│   │   │   │   └── constants.ts        # Timings, palette, & 3D coordinates
│   │   │   ├── layout/         # Navigation bar & global footer
│   │   │   └── ui/             # Buttons, cards, modals, & interactive deck
│   │   ├── context/            # AuthContext (token persistence & state)
│   │   ├── hooks/              # Custom hooks (debounce, tab title, media query)
│   │   ├── pages/              # Code-split page views
│   │   │   ├── AuthCallbackPage.tsx # OAuth browser callback receiver
│   │   │   ├── AuthPage.tsx    # Direct sign-in & registration
│   │   │   ├── CodeGenerationPage.tsx # Live code preview & editor
│   │   │   ├── DashboardPage.tsx # User projects dashboard
│   │   │   └── LandingPage.tsx # Root landing page with 3D canvas
│   │   ├── App.tsx             # Route declarations with Suspense
│   │   └── main.tsx            # React 19 concurrent entrypoint
│   ├── .env.example            # Frontend environment template
│   ├── package.json            # Node.js dependencies & scripts
│   ├── tailwind.config.js      # Cyber-dark theme & fluid typography
│   └── vite.config.ts          # Vite bundler config (port 5073 + manual chunks)
└── README.md
```

---

## 🚀 Local Setup & Development

### Prerequisites

- **Node.js**: `v18.17.0` or higher
- **npm** or **pnpm**
- **Python**: `v3.10` or higher
- **Google Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)
- **Figma Personal Access Token** *(Optional)*: Obtain from Figma Settings → Security

---

### 1. Clone the Repository

```bash
git clone https://github.com/Namanraj-0007/Desinify_AI.git
cd DesinifyAI
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate Python virtual environment
# Windows (PowerShell):
python -m venv .venv
.venv\Scripts\Activate.ps1

# macOS / Linux:
# python3 -m venv .venv
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Open `backend/.env` and supply your variables:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=DesinifyAI
DATABASE_NAME=designify_ai
JWT_SECRET=your_super_secret_random_key_64_bytes
API_PREFIX=/api
CORS_ORIGINS=http://localhost:5073,http://localhost:5173

# Frontend Redirection URL (Used by Google OAuth)
FRONTEND_URL=http://localhost:5073

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# AI Vision & Code Synthesis Engine
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Optional: Figma Personal Access Token
FIGMA_ACCESS_TOKEN=your_figma_personal_access_token
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> **Interactive API Documentation**: Explore live Swagger docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Ensure `frontend/.env` points to the local backend:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the Vite development server:

```bash
npm run dev
```

> **Application URL**: The frontend is hosted at [http://localhost:5073](http://localhost:5073).

---

## 🔑 Google OAuth Setup & Cloud Console Guide

Designify AI uses a secure browser redirect flow:

```
[User clicks "Sign in with Google"]
               │
               ▼
   Google Consent Screen
               │
               ▼ (Redirects to backend callback)
http://localhost:8000/api/auth/google/callback?code=...
               │
               ▼ (Backend exchanges code, issues JWT, and 302 redirects)
${FRONTEND_URL}/auth/callback?token=<jwt>
               │
               ▼ (Frontend stores JWT in AuthContext & localStorage)
Dashboard (/dashboard)
```

### Google Cloud Console Configuration

In your [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
1. Navigate to **APIs & Services** → **Credentials**.
2. Under **OAuth 2.0 Client IDs**, select your web application client.
3. Under **Authorized redirect URIs**, ensure you have:
   ```text
   http://localhost:8000/api/auth/google/callback
   ```
4. **Do you need to change the redirect URI in Google Cloud Console?**
   **No!** Google sends the user to the backend callback, which validates the code and seamlessly redirects the browser to `${FRONTEND_URL}/auth/callback?token=...`.

---

## 📡 Core API Reference

All primary routes are prefixed with `/api`.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Register a new user account with email & password | No |
| `POST` | `/api/auth/login` | Authenticate with credentials and receive a JWT access token | No |
| `GET` | `/api/auth/google/start` | Retrieve Google OAuth authorization URL & state | No |
| `GET` | `/api/auth/google/callback` | Google OAuth callback; exchanges code & redirects browser to frontend | No |
| `POST` | `/api/figma/parse` | Parse public Figma file or frame into visual layout AST | Yes |
| `GET` | `/api/projects` | List all saved user generation projects | Yes |
| `POST` | `/api/projects` | Create or save a new code generation project | Yes |
| `POST` | `/api/codegen/generate` | Synthesize React 19 TypeScript component from Figma AST | Yes |
| `POST` | `/api/codegen/stream` | Stream generated code in real time via Server-Sent Events | Yes |
| `POST` | `/api/codegen/export` | Export generation files as a downloadable ZIP package | Yes |

---

## 📦 Production Build & Performance Metrics

To verify that the frontend compiles cleanly for production:

```bash
cd frontend
npm run build
```

The output generates optimized static assets inside `frontend/dist/` with code-split vendor and route chunks:
- `dist/assets/index-*.js`: **~104 KB**
- `dist/assets/vendor-three-*.js`: **~824 KB** (Only loaded when 3D scenes are active)
- `dist/assets/vendor-react-*.js`: **~163 KB**
- `dist/assets/vendor-framer-*.js`: **~123 KB**

---

## 👤 Author & Acknowledgements

**Designify AI** is designed, engineered, and maintained by **Namandip Raj**:
- **GitHub**: [@Namanraj-0007](https://github.com/Namanraj-0007) / [@NamandipRaj](https://github.com/NamandipRaj)
- **Portfolio**: [portfolio-namandip.vercel.app](https://portfolio-namandip.vercel.app)
- **Email**: [namandraj0007@gmail.com](mailto:namandraj0007@gmail.com)

---

## 📄 License

This project is open-source and available under the terms of the [MIT License](LICENSE).
