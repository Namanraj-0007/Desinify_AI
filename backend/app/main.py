from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.oauth_google import router as oauth_google_router
from app.routers.figma import router as figma_router


from app.services.mongo import client





def create_app() -> FastAPI:

    app = FastAPI(title='Designify AI API', version='0.1.0')


    origins = [o.strip() for o in settings.cors_origins.split(',') if o.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=['*'],
        allow_headers=['*'],
    )


    @app.on_event('startup')
    async def startup_verify_mongo():
        # Verify Mongo is reachable on server startup
        try:
            from app.services.mongo import client
            await client.admin.command('ping')
            db_name = getattr(settings, 'database_name', None) or 'default'
            print(f"[startup] MongoDB connected OK (db={db_name})")
        except Exception as e:
            print(f"[startup] MongoDB connection FAILED: {e}")  
            # Let server still start so you can see the error; endpoints will fail.

    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(projects_router, prefix=settings.api_prefix)
    app.include_router(oauth_google_router, prefix=settings.api_prefix)
    app.include_router(figma_router, prefix=settings.api_prefix)





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



