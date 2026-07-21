from fastapi import FastAPI

from pathlib import Path

from fastapi.middleware.cors import CORSMiddleware

# Load .env BEFORE importing settings so env_file-based settings are populated reliably.
# NOTE: this project keeps the actual env at backend/.env
from dotenv import load_dotenv
from pathlib import Path

DOTENV_PATH = (Path(__file__).resolve().parents[1] / '.env').resolve()
load_dotenv(dotenv_path=str(DOTENV_PATH), override=False)

from app.config.settings import settings

from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.oauth_google import router as oauth_google_router
from app.routers.figma import router as figma_router
from app.routers.code_generation import router as code_generation_router



from app.services.mongo_health import ping_mongo





def create_app() -> FastAPI:


    app = FastAPI(title='Designify AI API', version='0.1.0')


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
        # Confirm Settings is reading from the backend .env file.
        # (The Settings class uses env_file='.env' relative to its import root.)
        print(f"[startup] Expected settings.env_file: .env (resolved relative to project root)")

        # Fail-fast: validate required config.
        settings.required_non_empty('jwt_secret')
        settings.required_non_empty('mongodb_uri')
        settings.required_non_empty('database_name')
        settings.required_non_empty('jwt_algorithm')
        settings.required_non_empty('cors_origins')
        settings.required_non_empty('api_prefix')

        # Google OAuth is required only if the OAuth routes are being used.
        # Also ensure we show operators where the env came from.


        # Fail-fast hardening here can break local dev if GOOGLE_* vars are not set.
        # We validate it conditionally.
        google_required_keys = {
            'google_oauth_client_id': settings.google_oauth_client_id,
            'google_oauth_client_secret': settings.google_oauth_client_secret,
            'google_oauth_redirect_uri': settings.google_oauth_redirect_uri,
        }
        google_any_set = any(v is not None and str(v).strip() for v in google_required_keys.values())
        google_all_set = all(v is not None and str(v).strip() for v in google_required_keys.values())

        if google_any_set and not google_all_set:
            missing = [k for k, v in google_required_keys.items() if not (v is not None and str(v).strip())]
            raise RuntimeError(f"Invalid configuration: missing Google OAuth env vars: {', '.join(missing)}")

        if google_all_set:
            # Validate redirect route path (code contract):
            # Backend callback route is: /api/auth/google/callback
            expected_route_path = f"{settings.api_prefix}/auth/google/callback"
            if settings.google_oauth_redirect_uri.rstrip('/') != expected_route_path.rstrip('/'):
                raise RuntimeError(
                    'Invalid configuration: GOOGLE_REDIRECT_URI does not match the backend callback route. '
                    f'Expected: {expected_route_path}, Got: {settings.google_oauth_redirect_uri}'
                )


        # Print env source diagnostics
        import os

        print('[startup] os.getcwd() =', os.getcwd())
        print('[startup] backend/app/config/settings.py uses env_file=.env (relative to process cwd)')
        print('[startup] os.environ (raw) for critical keys:')
        raw_env = settings.dump_env_for_debug()
        for k in sorted(raw_env.keys()):
            print(f"  {k}={raw_env[k]}")

        # Print loaded configuration with secrets masked.
        masked = settings.masked_config()
        print('[startup] Settings model (masked):')
        for k in sorted(masked.keys()):
            print(f"  {k}={masked[k]}")


        # Verify Mongo is reachable on server startup (short timeout)
        mongo_err = await ping_mongo(timeout_s=2.5)
        if mongo_err == "ok":
            print(f"[startup] MongoDB connected OK (db={settings.database_name})")
        else:
            raise RuntimeError(f"Invalid configuration or connectivity: MongoDB ping failed: {mongo_err}")





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

    @app.get(f"{settings.api_prefix}/health")


    async def health():
        return {'ok': True}


    return app


app = create_app()
