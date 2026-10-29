from fastapi import APIRouter, HTTPException

from app.schemas.auth import (
    LoginRequest,
    LoginStep1Response,
    SignupRequest,
    SocialLoginRequest,
    SendOtpRequest,
    VerifyOtpRequest,
    OtpResponse,
    TokenResponse,
)
from app.services.auth_service import (
    login_user,
    signup_user,
    verify_credentials_and_send_otp,
    send_login_otp,
    verify_login_otp,
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
        # Always return consistent error detail (frontend expects `detail`)
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


@router.post('/login-step1', response_model=LoginStep1Response)
async def login_step1(payload: LoginRequest):
    """Step 1: Verify email & password credentials, then generate & dispatch OTP."""
    try:
        result = await verify_credentials_and_send_otp(payload.email, payload.password)
        return LoginStep1Response(**result)
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


@router.post('/otp/send', response_model=OtpResponse)
async def send_otp(payload: SendOtpRequest):
    try:
        result = send_login_otp(payload.email)
        return OtpResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post('/otp/verify', response_model=TokenResponse)
async def verify_otp(payload: VerifyOtpRequest):
    try:
        token = await verify_login_otp(payload.email, payload.otp)
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
