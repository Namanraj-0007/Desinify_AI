<<<<<<< Updated upstream
Phase - 1  Is Succesfully Cleared and Completed 
Work :- completed Phase 1 foundation and authentication
=======
# TODO.md — Phase 2 (Figma Integration & AI Parsing)

## Backend
- [x] Add Figma router: `backend/app/routers/figma.py`

- [x] Add Figma service: `backend/app/services/figma_service.py`
- [x] Add design parser: `backend/app/services/design_parser.py`

- [x] Add token normalization (design tokens) into parser output

- [ ] Persist parsed projects/tokens in Mongo (extend models/services/schemas)
- [ ] Add API endpoints for:
  - [ ] store/validate Figma access token
  - [ ] import by Figma URL (extract file key + fetch JSON)
  - [ ] return pages/frames/components
  - [ ] return extracted tokens
- [x] Add structured error handling scaffolding (planned in implementation)
- [x] Connect Figma token + import URL + basic parsing + frontend display wiring



## Frontend
- [x] Add `frontend/src/api/figma.ts`
- [ ] Update `DashboardPage` upload area UI:
  - [ ] Figma token connect UI
  - [ ] Figma URL import UI
  - [ ] Loading states
  - [ ] Error states
- [ ] Add UI to display:
  - [ ] Pages
  - [ ] Frames
  - [ ] Components
  - [ ] Images
  - [ ] Typography
  - [ ] Colors
- [ ] Wire UI to backend endpoints

## Tests
- [ ] Unit tests for file key extraction & JSON parsing
- [ ] Unit tests for token normalization determinism
- [ ] Endpoint tests for figma token import & parsing responses

## Verification
- [ ] Run backend + frontend
- [ ] Validate full flow end-to-end

>>>>>>> Stashed changes
