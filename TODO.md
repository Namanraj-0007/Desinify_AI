# Auth Fix Plan

- [x] 1. Fix `frontend/src/services/api.ts` - Axios interceptor to attach Authorization header ✅
- [x] 2. Fix `frontend/src/context/AuthContext.tsx` - Support both token key names, clear both on logout ✅
- [x] 3. Fix `frontend/src/api/projects.ts` - Remove unused AuthConfig manual header pattern ✅

# JSX Fix Plan

- [x] 4. Fix `frontend/src/pages/FigmaProjectDetailPage.tsx` - Balanced 6/6 div tags ✅
- [x] 5. Fix `frontend/src/pages/CodeGenerationPage.tsx` - Fixed 3 missing `</div>` closures + `</>` fragment ✅
