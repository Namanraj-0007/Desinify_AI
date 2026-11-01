import sys
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

# Load .env BEFORE importing settings so env_file-based settings are populated reliably.
# NOTE: this project keeps the actual env at backend/.env
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

DOTENV_PATH = (BACKEND_ROOT / '.env').resolve()
load_dotenv(dotenv_path=str(DOTENV_PATH), override=False)

from app.config.settings import settings

from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.oauth_google import router as oauth_google_router
from app.routers.oauth_discord import router as oauth_discord_router
from app.routers.figma import router as figma_router
from app.routers.code_generation import router as code_generation_router

from app.services.mongo_health import ping_mongo
from app.services.mongo import set_mongo_fallback_enabled


def create_app() -> FastAPI:
    app = FastAPI(title='Designify AI API', version='0.1.0')

    # CORS: robust origin list supporting localhost on any port
    cors = (settings.cors_origins or '*').strip()
    local_dev_origins = [
        'http://localhost:5073',
        'http://localhost:5173',
        'http://127.0.0.1:5073',
        'http://127.0.0.1:5173',
    ]
    if cors == '*' or cors.lower() == 'true':
        origins = local_dev_origins
    else:
        origins = [o.strip() for o in cors.split(',') if o.strip()]
        for dev_url in local_dev_origins:
            if dev_url not in origins:
                origins.append(dev_url)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r'^https?://(localhost|127\.0\.0\.1)(:\d+)?$',
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    @app.on_event('startup')
    async def startup_verify_config_and_mongo():
        print('[startup] Initializing app in deployment-safe mode')

        try:
            import os
            print('[startup] os.getcwd() =', os.getcwd())


            masked = settings.masked_config()
            for k in sorted(masked.keys()):
                print(f"  {k}={masked[k]}")
        except Exception as exc:
            print(f"[startup] config logging skipped: {exc}")

        try:
            mongo_err = await ping_mongo(timeout_s=2.5)
            if mongo_err == "ok":
                print(f"[startup] MongoDB connected OK (db={settings.database_name})")
            else:
                set_mongo_fallback_enabled(True)
                print(f"[startup] MongoDB unavailable, continuing in fallback mode: {mongo_err}")
        except Exception as exc:
            set_mongo_fallback_enabled(True)
            print(f"[startup] MongoDB check skipped due to error: {exc}")

    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(projects_router, prefix=settings.api_prefix)
    app.include_router(oauth_google_router, prefix=settings.api_prefix)
    app.include_router(oauth_discord_router, prefix=settings.api_prefix)
    app.include_router(figma_router, prefix=settings.api_prefix)
    app.include_router(code_generation_router, prefix=settings.api_prefix)

    @app.middleware("http")
    async def log_requests(request, call_next):
        try:
            print(f"[request] {request.method} {request.url.path}")
        except Exception:
            pass
        response = await call_next(request)
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        first_error = errors[0] if errors else {}
        msg = first_error.get('msg', 'Validation error')
        if msg.startswith('Value error, '):
            msg = msg[len('Value error, '):]
        return JSONResponse(
            status_code=400,
            content={'detail': msg},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return app


app = create_app()
