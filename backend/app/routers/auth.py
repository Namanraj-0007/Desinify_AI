from fastapi import APIRouter, HTTPException

from app.schemas.auth import (
    LoginRequest,
    SignupRequest,
    SocialLoginRequest,
    TokenResponse,
)
from app.services.auth_service import (
    login_user,
    signup_user,
    get_or_create_social_user,
    issue_token_for_user,
)

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/signup', response_model=TokenResponse)
async def signup(payload: SignupRequest):
    try:
        token = await signup_user(payload.name, payload.email, payload.password)
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/login', response_model=TokenResponse)
async def login(payload: LoginRequest):
    try:
        token = await login_user(payload.email, payload.password)
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/social-login', response_model=TokenResponse)
async def social_login(payload: SocialLoginRequest):
    try:
        user = await get_or_create_social_user(
            provider=payload.provider,
            name=payload.name or f"{payload.provider.title()} User",
            email=payload.email,
            avatar_url=payload.avatar_url,
        )
        token = issue_token_for_user(user)
        return TokenResponse(access_token=token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
