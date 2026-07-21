# Phase 3: AI Code Generation Engine - Implementation Plan

## Architecture Overview

### Backend (FastAPI)
The code generation engine lives in `backend/app/services/code_generation_service.py` — a deterministic, rule-based engine that transforms parsed Figma data into production-ready frontend code. It detects UI patterns, generates components, and creates a smart folder structure.

### Frontend (React)
A new Code Generation page accessible from the Figma project detail view. Features include split-screen live preview, Monaco code editor, version history, export, and optimization controls.

---

## Files to Create

### Backend
1. `backend/app/schemas/code_generation.py` — Pydantic request/response schemas
2. `backend/app/services/code_generation_service.py` — Core generation engine
3. `backend/app/routers/code_generation.py` — API endpoints

### Frontend
1. `frontend/src/api/codeGeneration.ts` — API client functions
2. `frontend/src/pages/CodeGenerationPage.tsx` — Main page (split-screen layout)
3. `frontend/src/components/codegen/CodePreview.tsx` — Live iframe preview
4. `frontend/src/components/codegen/CodeEditor.tsx` — Monaco editor wrapper
5. `frontend/src/components/codegen/VersionHistory.tsx` — Version list/comparison
6. `frontend/src/components/codegen/ExportButton.tsx` — ZIP export
7. `frontend/src/components/codegen/OptimizationPanel.tsx` — Optimization controls
8. `frontend/src/components/codegen/CodeGenerationToolbar.tsx` — Top toolbar
9. `frontend/src/components/codegen/ErrorBoundary.tsx` — Error boundary

## Files to Modify
1. `backend/app/main.py` — Register code generation router
2. `frontend/src/App.tsx` — Add CodeGenerationPage route
3. `frontend/src/pages/FigmaProjectDetailPage.tsx` — Add "Generate Code" button to frame selection
4. `backend/requirements.txt` — Add `jsbeautifier` for code formatting

## Design Decisions

### Code Generation Engine
- **Rule-based** (no LLM dependency) — detects UI patterns by analyzing Figma node structure
- **Pattern detection**: Buttons (small, interactive children), Cards (containers with padding), Navbars (horizontal bars with links), etc.
- **Output formats**: React+TSX, Next.js App Router, HTML/CSS
- **Component reuse**: Identical node structures generate a single component with props
- **Responsive**: Tailwind breakpoints (sm:, md:, lg:, xl:) added based on layout analysis
- **Accessibility**: aria-labels, roles, keyboard handlers, semantic HTML by default

### Generation Pipeline
1. Analyze figma nodes → detect patterns
2. Build component tree
3. Generate folder structure
4. Generate each component file
5. Generate index/main entry files
6. Format output

### Storage
- Generated code stored in MongoDB `code_generations` collection
- Version history tracked per project with timestamps
- Each version stores: framework, settings, optimization level, full output

