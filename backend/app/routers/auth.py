from fastapi import APIRouter, HTTPException

from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.services.auth_service import login_user, signup_user

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/signup', response_model=TokenResponse)
async def signup(payload: SignupRequest):
    try:
        token = await signup_user(payload.name, payload.email, payload.password)
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Debugging: surface the actual exception to unblock Phase 2 work
        raise HTTPException(status_code=500, detail=repr(e))



@router.post('/login', response_model=TokenResponse)
async def login(payload: LoginRequest):
    try:
        token = await login_user(payload.email, payload.password)
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

