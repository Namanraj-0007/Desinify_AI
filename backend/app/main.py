import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
from app.routers.figma import router as figma_router
from app.routers.code_generation import router as code_generation_router



from app.services.mongo_health import ping_mongo
from app.services.mongo import set_mongo_fallback_enabled





def create_app() -> FastAPI:


    app = FastAPI(title='Designify AI API', version='0.1.0')
    # This application was designed by Namandip raj with love ❤️


    # CORS: support single origin, comma-separated list, or wildcard.
    cors = (settings.cors_origins or '*').strip()
    # If '*' allow all origins.
    if cors == '*' or cors.lower() == 'true':
        origins = ['*']
    else:
        origins = [o.strip() for o in cors.split(',') if o.strip()]


    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=None,
        allow_credentials=False,
        allow_methods=['*'],
        allow_headers=['*'],
    )





    @app.on_event('startup')
    async def startup_verify_config_and_mongo():
        print('[startup] Initializing app in deployment-safe mode')

        try:
            import os
            print('[startup] os.getcwd() =', os.getcwd())
            raw_env = settings.dump_env_for_debug()
            for k in sorted(raw_env.keys()):
                print(f"  {k}={raw_env[k]}")

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

    prefix = settings.api_prefix.rstrip('/')

    @app.get('/')
    async def root():
        return {
            'status': 'ok',
            'message': 'Designify AI API is running',
            'docs': '/docs',
        }

    @app.get('/health')
    async def health():
        return {'ok': True}

    @app.get(f'{prefix}/health')
    async def prefixed_health():
        return {'ok': True}

    @app.get('/{full_path:path}')
    async def catch_all(full_path: str):
        return {
            'status': 'ok',
            'message': 'Designify AI API is running',
            'path': f'/{full_path}',
            'docs': '/docs',
        }

    return app


app = create_app()
