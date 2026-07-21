# Auth System & 422 Fix - Completed ✅

## Changes Summary

### Fix 1: Axios Interceptor (401 Fix)
- **File**: `frontend/src/services/api.ts`
- **Problem**: Request interceptor was a no-op — never attached `Authorization` header
- **Fix**: Reads JWT from localStorage (`access_token` → `token` fallback) and attaches `Authorization: Bearer <token>` to every request
- **Also**: Improved response interceptor with user-friendly 401 error messages

### Fix 2: Token Key Consistency (401 Fix)
- **File**: `frontend/src/context/AuthContext.tsx`
- **Files**: `frontend/src/pages/GoogleCallbackPage.tsx`
- **Problem**: Inconsistent localStorage key usage between `token` and `access_token`
- **Fix**: Store JWT under **both** keys, clear both on logout

### Fix 3: Removed Manual Auth Pattern (Cleanup)
- **File**: `frontend/src/api/projects.ts`
- **Problem**: Exposed `AuthConfig` params that let callers manually pass headers
- **Fix**: Removed unused config — all auth now flows through the interceptor

### Fix 4: Figma Endpoint Request Format (422 Fix) ✅
- **File**: `frontend/src/api/figma.ts`
- **Problem**: `connectFigmaToken()` and `importFigmaByUrl()` were sending **form-urlencoded** data via `URLSearchParams` with `Content-Type: application/x-www-form-urlencoded`
- **Backend**: Expects **JSON** — `FigmaTokenPayload` and `FigmaImportPayload` are Pydantic `BaseModel` classes, which FastAPI deserializes from `application/json` body
- **Result**: 422 Unprocessable Entity — FastAPI couldn't parse form data into Pydantic models
- **Fix**: Send plain JSON objects — Axios automatically sets `Content-Type: application/json`

### Field Name Validation
- Backend `FigmaTokenPayload.access_token` ↔ Frontend `{ access_token: "..." }` ✅ Exact match
- Backend `FigmaImportPayload.figma_url` ↔ Frontend `{ figma_url: "..." }` ✅ Exact match
- Backend `FigmaImportPayload.project_name` ↔ Frontend `{ project_name: "..." }` ✅ Exact match

## Verification Checklist
- [x] ✅ Login stores JWT under `access_token` + `token` keys
- [x] ✅ Interceptor reads JWT and attaches `Authorization: Bearer <token>`
- [x] ✅ No more 401 Unauthorized errors
- [x] ✅ `POST /api/figma/token` sends JSON → no more 422
- [x] ✅ `POST /api/figma/import` sends JSON → no more 422
- [x] ✅ Field names match backend Pydantic schemas exactly
- [x] ✅ User-friendly error messages for auth failures
- [x] ✅ Google OAuth stores JWT consistently
- [x] ✅ Logout clears both localStorage keys

