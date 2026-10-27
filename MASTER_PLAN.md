yes# DesignifyAI — Production-Ready Transformation Plan

## Overview
Transform the current DesignifyAI into a production-grade Figma-to-Code AI SaaS platform comparable to Locofy, Builder.io, and Anima.

---

## Phase 0: Cleanup (✅ DONE)
- Removed 24 unnecessary test/fix/temp files

---

## Phase 1: Recursive Figma Parser (backend rewrite)
**Files:** `backend/app/services/design_parser.py`, `backend/app/schemas/figma.py`

### Tasks
- [ ] Rewrite parser to recursively traverse EVERY node in the Figma JSON
- [ ] Extract ALL properties: node_id, name, type, parent, children, absolute/relative position, width/height, rotation, opacity, visibility, corner radius, border, effects (drop shadow, blur), padding, margin, constraints, layout mode, auto layout, item spacing, wrap, grid, stroke, fill (solid, gradient, image), vector paths, SVG data
- [ ] Extract ALL typography: font family, size, weight, letter spacing, line height, text align
- [ ] Extract ALL color data: solid fills, gradient stops, image fills
- [ ] Extract component sets, variants, instances
- [ ] Extract variables, tokens, local styles
- [ ] Extract export settings, responsive constraints
- [ ] Parse design system components and their props
- [ ] Preserve complete node hierarchy with parent-child relationships
- [ ] Generate rich design JSON with all metadata
- [ ] Add proper Pydantic schemas for all parsed node types

---

## Phase 2: AI Prompt Builder + LLM Integration
**New files:** `backend/app/services/ai_prompt_builder.py`, `backend/app/services/llm_service.py`

### Tasks
- [ ] Create structured JSON prompt builder that serializes ALL parsed node data
- [ ] Support for Gemini API and OpenAI API
- [ ] System prompt engineering: "Act as Principal Frontend Engineer at Vercel"
- [ ] Output parsing: split AI response into individual files
- [ ] Handle code block extraction (FILE: path ...)
- [ ] Implement streaming generation (SSE)
- [ ] Implement retry logic with exponential backoff
- [ ] Token usage tracking and rate limiting
- [ ] Caching layer for identical node structures
- [ ] Queue system for concurrent generation requests
- [ ] Incremental/chunked generation for large files

---

## Phase 3: Complete Code Generation Engine Rewrite
**Files:** `backend/app/services/code_generation_service.py` (rewrite)

### Generated Project Structure
```
package.json
vite.config.ts
tsconfig.json
tailwind.config.ts
eslint.config.js
postcss.config.js
index.html
src/
  main.tsx
  App.tsx
  routes/
    index.tsx
  pages/
    HomePage.tsx
    AboutPage.tsx
    NotFoundPage.tsx
  components/
    ui/
      Button.tsx       (shadcn/ui style)
      Card.tsx
      Input.tsx
      Dialog.tsx
      Select.tsx
      Badge.tsx
      Table.tsx
      Tabs.tsx
      Avatar.tsx
      Skeleton.tsx
      Toast.tsx
      Tooltip.tsx
    layout/
      Navbar.tsx
      Footer.tsx
      Sidebar.tsx
    forms/
      FormField.tsx
      FormSelect.tsx
    shared/
      HeroSection.tsx
      PricingCard.tsx
      TestimonialCard.tsx
  layouts/
    MainLayout.tsx
    AuthLayout.tsx
  hooks/
    useAuth.ts
    useMediaQuery.ts
    useIntersectionObserver.ts
    useLocalStorage.ts
  lib/
    utils.ts
    api.ts
  context/
    ThemeContext.tsx
    AuthContext.tsx
  assets/
    images/
    icons/
  styles/
    globals.css
    design-tokens.css
  utils/
    cn.ts
    format.ts
  services/
    api.ts
  types/
    index.ts
    components.ts
```

### Tasks
- [ ] Generate complete package.json with React 19, Vite, Tailwind, shadcn/ui, Framer Motion, Lucide, React Router, React Hook Form, Zod
- [ ] Generate all config files (vite, tailwind, postcss, eslint, tsconfig)
- [ ] Generate full app shell with routing (React Router)
- [ ] Generate page components from Figma frames
- [ ] Generate reusable UI components from Figma components
- [ ] Generate layout components (Navbar, Footer, Sidebar)
- [ ] Generate form components with React Hook Form + Zod validation
- [ ] Generate Framer Motion animations matching Figma transitions
- [ ] Generate responsive Tailwind classes (sm:, md:, lg:, xl:)
- [ ] Generate dark mode support
- [ ] Generate accessibility attributes (aria-labels, roles, semantic HTML)
- [ ] Generate loading states and error boundaries
- [ ] Generate barrel exports (index.ts files)
- [ ] Convert Figma auto layout → Flexbox
- [ ] Convert Figma grid → CSS Grid
- [ ] Convert Figma variants → reusable component props
- [ ] Convert Figma images → proper asset imports
- [ ] Convert Figma vectors → SVG components
- [ ] Convert Figma icons → Lucide React equivalents
- [ ] Convert Figma buttons → Button component with variants
- [ ] Detect and generate reusable patterns (duplicate detection)

---

## Phase 4: Backend Infrastructure Upgrades
**Files:** Various backend services

### Tasks
- [ ] Streaming generation endpoint (SSE/WebSocket)
- [ ] Generation progress tracking (percentage, current step)
- [ ] Queue system with priority (Celery or asyncio queue)
- [ ] Retry logic with exponential backoff
- [ ] Caching layer (Redis or in-memory)
- [ ] Token usage tracking and billing prep
- [ ] Comprehensive logging (structured logging)
- [ ] ZIP export service (zipfile + streaming)
- [ ] Preview API (serve generated HTML)
- [ ] MongoDB persistence for all generations
- [ ] Version history with diff view support
- [ ] Generation history with filters and search
- [ ] Rate limiting middleware
- [ ] Error handling for: invalid URL, expired token, rate limits, large files, unsupported nodes, network errors, AI failures, timeouts

---

## Phase 5: Frontend Rewrite
**Files:** Various frontend components

### Tasks
- [ ] Modern Dashboard with project list, search, filters, sorting
- [ ] Real-time generation progress with streaming logs
- [ ] In-browser code editor (Monaco) with syntax highlighting
- [ ] Live iframe preview of generated site
- [ ] File tree explorer for generated project
- [ ] Download ZIP button
- [ ] Copy individual file content button
- [ ] Theme switch (light/dark)
- [ ] Version history slider/timeline
- [ ] Command palette (Cmd+K)
- [ ] Notifications system
- [ ] Recent projects sidebar
- [ ] Settings page (default framework, options)
- [ ] Beautiful animations (Framer Motion page transitions)
- [ ] Responsive UI for all screen sizes
- [ ] Loading skeletons everywhere
- [ ] Error boundaries with recovery

---

## Phase 6: Performance & Error Handling

### Tasks
- [ ] Support large Figma files (>100MB) with chunked processing
- [ ] Handle deeply nested components (10+ levels)
- [ ] Handle Figma design systems (component libraries)
- [ ] Handle multiple pages/canvases in one file
- [ ] Avoid duplicated components via structural signatures
- [ ] Minimize AI token usage with smart batching
- [ ] Optimize prompts to reduce output tokens
- [ ] Frontend lazy loading and code splitting
- [ ] Backend response compression
- [ ] Image optimization for generated assets

---

## Dependencies to Add

### Backend (requirements.txt)
```
# Already have: fastapi, uvicorn, pydantic, motor, httpx, python-jose, passlib, bcrypt, python-multipart, python-dotenv
google-genai          # Gemini SDK
openai                # OpenAI SDK
celery                # Task queue
redis                 # Cache/queue backend
zipstream             # Streaming ZIP generation
structlog             # Structured logging
tenacity              # Retry logic
```

### Frontend (package.json)
```
# Already have: react, react-dom, react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge
@monaco-editor/react  # Code editor
react-hook-form       # Forms
@hookform/resolvers   # Zod resolver
zod                   # Validation
@radix-ui/*           # shadcn/ui primitives
class-variance-authority  # CVA for variants
tailwindcss-animate    # Tailwind animations
lucide-react          # Icons
react-hot-toast       # Notifications
cmdk                  # Command palette
date-fns              # Date formatting
```

