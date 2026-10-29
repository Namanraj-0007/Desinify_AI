from fastapi import APIRouter, Request, HTTPException

from app.schemas.user import UserPublic
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
async def google_callback(code: str, state: str, request: Request) -> dict:
    if not settings.google_oauth_client_id:
        raise HTTPException(status_code=400, detail='Google OAuth is not configured on this server')

    flow = build_google_oauth_flow(request)
    # Exchange code for tokens
    await flow.fetch_token(code=code)
    credentials = flow.credentials

    # Get user info
    userinfo = await flow.get_userinfo(credentials)

    email = userinfo.get('email')
    name = userinfo.get('name') or (userinfo.get('given_name') or 'Google User')

    if not email:
        raise HTTPException(status_code=400, detail='Google did not return email')

    user = await get_or_create_user_by_google(name=name, email=email)
    token = issue_token_for_user(user)

    user_public = UserPublic(id=str(user['_id']), name=user['name'], email=user['email'])

    return {
        'access_token': token,
        'user': user_public,
    }
