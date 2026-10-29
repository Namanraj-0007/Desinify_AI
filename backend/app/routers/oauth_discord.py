import secrets
import urllib.parse
from fastapi import APIRouter, Request, HTTPException
import httpx

from app.schemas.user import UserPublic
from app.services.auth_service import get_or_create_social_user, issue_token_for_user
from app.config.settings import settings


router = APIRouter(prefix='/auth/discord', tags=['auth-discord'])


@router.get('/start')
async def discord_start(request: Request) -> dict:
    if not settings.discord_client_id:
        return {
            'configured': False,
            'authorization_url': None,
            'message': 'Discord OAuth is not configured in .env'
        }

    state = secrets.token_urlsafe(24)
    params = {
        'client_id': settings.discord_client_id,
        'redirect_uri': settings.discord_redirect_uri,
        'response_type': 'code',
        'scope': settings.discord_scope,
        'state': state,
    }
    authorization_url = f"{settings.discord_authorize_url}?{urllib.parse.urlencode(params)}"
    return {
        'configured': True,
        'authorization_url': authorization_url,
        'state': state
    }


@router.get('/callback')
async def discord_callback(code: str, state: str, request: Request) -> dict:
    if not settings.discord_client_id or not settings.discord_client_secret:
        raise HTTPException(status_code=400, detail="Discord OAuth is not configured")

    data = {
        'client_id': settings.discord_client_id,
        'client_secret': settings.discord_client_secret,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': settings.discord_redirect_uri,
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(settings.discord_token_url, data=data, headers=headers)
        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to exchange Discord authorization code: {token_resp.text}"
            )
        tokens = token_resp.json()
        access_token = tokens.get('access_token')

        user_resp = await client.get(
            settings.discord_userinfo_url,
            headers={'Authorization': f"Bearer {access_token}"}
        )
        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Discord user info")
        userinfo = user_resp.json()

    user_id = str(userinfo.get('id', 'discord_user'))
    username = userinfo.get('global_name') or userinfo.get('username') or 'Discord User'
    email = userinfo.get('email') or f"{user_id}@discord.user"
    avatar = userinfo.get('avatar')
    avatar_url = f"https://cdn.discordapp.com/avatars/{user_id}/{avatar}.png" if avatar else None

    user = await get_or_create_social_user(
        provider='discord',
        name=username,
        email=email,
        avatar_url=avatar_url
    )
    token = issue_token_for_user(user)
    user_public = UserPublic(id=str(user['_id']), name=user['name'], email=user['email'])

    return {
        'access_token': token,
        'user': user_public,
    }

