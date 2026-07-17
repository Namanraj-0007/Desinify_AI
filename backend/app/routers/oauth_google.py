from fastapi import APIRouter, Request

from app.schemas.user import UserPublic
from app.services.auth_service import get_or_create_user_by_google, issue_token_for_user

from app.services.oauth_google_service import build_google_oauth_flow
from app.config.settings import settings


router = APIRouter(prefix='/auth/google', tags=['auth-google'])


@router.get('/start')
async def google_start(request: Request) -> dict:
    # Uses Google OAuth authorization URL with state.
    flow = build_google_oauth_flow(request)
    authorization_url, state = flow.authorization_url(
        settings.google_oauth_authorize_url,
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
    )

    # Store state in session-less way: client will get it back in callback as `state`.
    # For Phase 1, we keep it simple and rely on Google state verification in callback.
    return {'authorization_url': authorization_url, 'state': state}


@router.get('/callback')
async def google_callback(code: str, state: str, request: Request) -> dict:

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

    # Phase-1 contract with frontend: return access_token + user
    return {
        'access_token': token,
        'user': user_public,
    }


