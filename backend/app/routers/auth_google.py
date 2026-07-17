from fastapi import APIRouter

from app.routers.oauth_google import router as oauth_google_router

# Re-export under a stable name (clean architecture convenience)
router = APIRouter(prefix='/auth')
router.include_router(oauth_google_router, prefix='')


