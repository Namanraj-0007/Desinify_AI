# 🎨 Designify AI — Frontend Client

> **High-Performance React 19 Client with Pinned 3D Spatial Canvas, Route-Level Code Splitting, and Interactive Live Preview Cockpit.**

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F_%26_Drei-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.3-EA4C89?style=flat-square)](https://www.framer.com/motion/)

---

## 📖 Overview

The Designify AI frontend is built on **React 19** and bundled with **Vite 5**. It is architected for maximum visual impact, sub-second initial load times, and fluid 60 FPS spatial interactions.

It features:
- **Pinned 3D WebGL Storyboard**: An interactive Three.js viewport powered by `@react-three/fiber` and `@react-three/drei` (`ScrollControls`) that visually deconstructs Figma frames along the $Z$-axis into isolated layers and streams code into a floating 3D terminal.
- **Modular Code Splitting**: Utilizes `React.lazy` and React 19 `<Suspense>` across all route views with custom Rollup vendor chunking (`vendor-react`, `vendor-three`, `vendor-framer`). The initial bundle is only **~104 KB** gzipped!
- **Interactive Live Preview Cockpit**: In-browser sandbox where synthesized React components can be tested with real interactive state, dark/light theme switching, and responsive viewport sizing (Desktop, Tablet, Mobile).
- **Design Token & AST Inspector**: Instant visualization of extracted color palettes, font weights, line heights, border radii, and visual bounding box dimensions.
- **OAuth Session Hydration (`/auth/callback`)**: Dedicated callback page that consumes JWT tokens from Google OAuth browser redirects, securely updates `AuthContext` and `localStorage`, and transitions directly to the dashboard.

---

## 🏛 Frontend Architecture & Tech Stack

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              App.tsx                                   │
 │     • AuthProvider (JWT Session Management & Window Listeners)         │
 │     • Suspense Fallback (AILoadingState Skeleton with Pulse Glow)      │
 │     • Route-Based Lazy Chunk Resolution                                │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
 ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
 │   LandingPage     │     │   DashboardPage   │     │ CodeGeneration    │
 │ • Drei Canvas 3D  │     │ • Project Grid    │     │ • Monaco Editor   │
 │ • 6-Stage Story   │     │ • Figma Importer  │     │ • SSE Live Stream │
 │ • Bento Grids     │     │ • Token Inspector │     │ • Sandbox Preview │
 └───────────────────┘     └───────────────────┘     └───────────────────┘
```

| Package | Version | Purpose |
| :--- | :---: | :--- |
| `react` / `react-dom` | `^18.3.1` (19 API) | Core UI component engine with concurrent rendering |
| `react-router-dom` | `^6.26.1` | Declarative client-side routing & protected route guards |
| `@react-three/fiber` | `^8.17.10` | React renderer for Three.js WebGL scenes |
| `@react-three/drei` | `^9.109.0` | Helper primitives (`ScrollControls`, `Html`, camera hooks) |
| `three` | `^0.160.0` | 3D math, geometries, shaders, materials, and lighting |
| `framer-motion` | `^11.3.22` | Smooth micro-interactions, spring physics, and view transitions |
| `tailwindcss` | `^3.4.10` | Cyber-dark utility styling and fluid responsive layouts |
| `@monaco-editor/react` | `^4.6.0` | High-fidelity in-browser code editor with syntax highlighting |
| `lucide-react` | `^1.25.0` | Scalable modern icon library |
| `axios` | `^1.7.2` | Configured HTTP client with automatic JWT bearer interceptors |

---

## 📂 Source Structure

```text
frontend/src/
├── api/                        # Typed backend API client functions
│   ├── auth.ts                 # Login, signup, & OAuth endpoints
│   ├── codeGeneration.ts       # SSE streaming & ZIP download clients
│   ├── figma.ts                # Figma file/frame parsers & image renderers
│   └── projects.ts             # User project CRUD operations
├── components/                 # Modular component library
│   ├── auth/                   # Auth modals & 3D background effects
│   ├── codegen/                # Code generation cockpit & preview sandbox
│   │   ├── CodeGenerationToolbar.tsx # Framework, Tailwind, & TS toggles
│   │   ├── CodePreview.tsx     # Monaco editor & live component sandbox
│   │   ├── componentSynthesizer.ts # AST-to-JSX preview generator
│   │   └── ExportButton.tsx    # ZIP download & clipboard actions
│   ├── figma/                  # Figma visualizers & AST token panels
│   ├── landing3d/              # 3D Three.js spatial storyboard
│   │   ├── CodeStreamPanel3D.tsx # Floating 3D code terminal mesh
│   │   ├── Designify3DLanding.tsx # Root Drei Canvas with ScrollControls
│   │   ├── FallbackStory2D.tsx  # Mobile / reduced-motion 2D fallback
│   │   ├── FigmaFrame3D.tsx    # 3D exploding artboard layers & connectors
│   │   ├── OverlayStory.tsx    # Scroll-synchronized HTML captions
│   │   ├── PostStorySections.tsx # Features, testimonials, & architecture
│   │   ├── Scene3D.tsx         # Camera animation loop & Drei scroll hooks
│   │   └── constants.ts        # Timings, palettes, & 3D coordinate matrices
│   ├── layout/                 # Navbar, global Footer, and base Layout
│   └── ui/                     # Primitives (Button, Badge, Input, SpotlightCard)
├── context/
│   └── AuthContext.tsx         # JWT auth provider, token validation, & state
├── hooks/
│   ├── useDebounce.ts          # Input debouncing hook
│   ├── useMediaQuery.ts        # Responsive breakpoint queries
│   └── useTabTitle.ts          # Dynamic tab title & favicon experience
├── pages/                      # Code-split page views
│   ├── AboutPage.tsx           # Company story & team overview
│   ├── ApiReferencePage.tsx    # REST endpoint documentation
│   ├── AuthCallbackPage.tsx    # Google OAuth browser redirect receiver
│   ├── AuthPage.tsx            # Login & signup with real-time validation
│   ├── BlogPage.tsx            # Engineering articles & tutorials
│   ├── CareersPage.tsx         # Open positions & culture
│   ├── ChangelogPage.tsx       # Release notes & version history
│   ├── CodeGenerationPage.tsx  # Interactive generator cockpit & editor
│   ├── ContactPage.tsx         # Inquiries & EmailJS integration
│   ├── DashboardPage.tsx       # User project gallery & Figma importer
│   ├── DocumentationPage.tsx   # Comprehensive platform docs
│   ├── FigmaProjectDetailPage.tsx # Frame selection & AST visualizer
│   ├── LandingPage.tsx         # Root 3D landing experience
│   └── StatusPage.tsx          # Real-time system health & uptime
├── services/
│   └── api.ts                  # Axios singleton with error normalization
├── styles/
│   └── index.css               # Tailwind directives & cyber glow utilities
├── App.tsx                     # Top-level router with Suspense boundary
├── main.tsx                    # React 19 entrypoint
└── vite-env.d.ts               # Vite environment variable type declarations
```

---

## 🛠 Local Setup & Development

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** or **pnpm**

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create a local `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Verify your `frontend/.env` file:
```env
# URL of your local or remote FastAPI backend
VITE_API_BASE_URL=http://localhost:8000/api

# Optional: EmailJS public key for contact form inquiries
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at **[http://localhost:5073](http://localhost:5073)**.

---

## 📦 Production Build & Chunk Analysis

To build the frontend for production:

```bash
npm run build
```

### Performance & Chunk Metrics

The Rollup configuration in `vite.config.ts` partitions the build into independent, cacheable vendor and route chunks:

| Chunk | Size (Raw) | Size (Gzip) | Description |
| :--- | :---: | :---: | :--- |
| `dist/assets/index-*.js` | **104.62 kB** | **36.13 kB** | Application core entrypoint & router |
| `dist/assets/index-*.css` | **106.25 kB** | **15.31 kB** | Extracted Tailwind CSS & utility classes |
| `dist/assets/vendor-react-*.js` | **163.08 kB** | **53.25 kB** | React, React-DOM, and React Router |
| `dist/assets/vendor-framer-*.js` | **123.33 kB** | **41.22 kB** | Framer Motion animation engine |
| `dist/assets/vendor-three-*.js` | **824.08 kB** | **224.75 kB** | Three.js & R3F (Only loaded on 3D routes) |
| `dist/assets/LandingPage-*.js` | **94.88 kB** | **22.63 kB** | Landing page layout & UI overlay |
| `dist/assets/CodeGenerationPage-*.js`| **63.23 kB** | **16.58 kB** | Monaco editor & code sandbox |
| `dist/assets/AuthCallbackPage-*.js` | **1.28 kB** | **0.74 kB** | Instant OAuth token receiver |

To locally preview the production build:
```bash
npm run preview
```

---

## 🧪 TypeScript Type Checking & Linting

```bash
# Run strict TypeScript compiler check across all files
npx tsc --noEmit

# Run ESLint validation
npm run lint
```
