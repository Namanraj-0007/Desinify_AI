import urllib.parse
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse

from app.services.auth_service import get_or_create_user_by_google, issue_token_for_user
from app.services.oauth_google_service import build_google_oauth_flow
from app.config.settings import settings


router = APIRouter(prefix='/auth/google', tags=['auth-google'])


@router.get('/start')
async def google_start(request: Request) -> dict:
    if not settings.google_oauth_client_id:
        return {
            'configured': False,
            'authorization_url': None,
            'message': 'Google OAuth client ID is not configured in .env'
        }

    flow = build_google_oauth_flow(request)
    authorization_url, state = flow.authorization_url(
        settings.google_oauth_authorize_url,
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
    )

    return {
        'configured': True,
        'authorization_url': authorization_url,
        'state': state
    }


@router.get('/callback')
async def google_callback(
    request: Request,
    code: str = '',
    state: str = '',
    error: str = '',
) -> RedirectResponse:
    frontend_url = settings.frontend_url.rstrip('/')

    if error:
        err_msg = urllib.parse.quote(f"Google login failed: {error}")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?error={err_msg}", status_code=302)

    if not settings.google_oauth_client_id:
        err_msg = urllib.parse.quote("Google OAuth is not configured on this server")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?error={err_msg}", status_code=302)

    if not code:
        err_msg = urllib.parse.quote("Missing Google authorization code")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?error={err_msg}", status_code=302)

    try:
        flow = build_google_oauth_flow(request)
        # Exchange code for tokens
        await flow.fetch_token(code=code)
        credentials = flow.credentials

        # Get user info
        userinfo = await flow.get_userinfo(credentials)

        email = userinfo.get('email')
        name = userinfo.get('name') or (userinfo.get('given_name') or 'Google User')

        if not email:
            err_msg = urllib.parse.quote("Google did not return an email address")
            return RedirectResponse(url=f"{frontend_url}/auth/callback?error={err_msg}", status_code=302)

        user = await get_or_create_user_by_google(name=name, email=email)
        token = issue_token_for_user(user)

        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}", status_code=302)
    except Exception as exc:
        err_msg = urllib.parse.quote(f"Google sign-in failed: {str(exc)}")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?error={err_msg}", status_code=302)
