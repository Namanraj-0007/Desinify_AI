from __future__ import annotations

from typing import Any

from fastapi import Request

from app.config.settings import settings


def build_google_oauth_flow(request: Request):
    """Build a lightweight Google OAuth helper.

    For Phase 1 we avoid adding heavy dependencies and instead use the raw OAuth endpoints.
    """

    # Lazy import of Google endpoints and JWT validation libraries.
    # Implement token exchange + userinfo fetch using httpx.
    return _GoogleOAuthFlow(request=request)


class _GoogleOAuthFlow:
    def __init__(self, request: Request):
        self.request = request
        self.credentials: Any = None

    def authorization_url(
        self,
        authorize_url: str,
        access_type: str = 'offline',
        include_granted_scopes: str = 'true',
        prompt: str = 'consent',
    ):
        import secrets
        import urllib.parse

        state = secrets.token_urlsafe(24)
        params = {
            'client_id': settings.google_oauth_client_id,
            'redirect_uri': settings.google_oauth_redirect_uri,
            'response_type': 'code',
            'scope': settings.google_oauth_scope,
            'state': state,
            'access_type': access_type,
            'include_granted_scopes': include_granted_scopes,
            'prompt': prompt,
        }
        return f"{authorize_url}?{urllib.parse.urlencode(params)}", state

    def fetch_token(self, code: str):
        import urllib.parse
        import httpx

        async def _do():
            data = {
                'client_id': settings.google_oauth_client_id,
                'client_secret': settings.google_oauth_client_secret,
                'redirect_uri': settings.google_oauth_redirect_uri,
                'grant_type': 'authorization_code',
                'code': code,
            }
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.post(settings.google_oauth_token_url, data=data)
                r.raise_for_status()
                self.credentials = r.json()



        # Note: caller is async; just store coroutine and run with await from callback.
        return _do()

    async def get_userinfo(self, credentials: Any):
        import httpx

        access_token = credentials.get('access_token')
        if not access_token:
            # Sometimes token exchange response may include id_token only.
            raise Exception('Google OAuth token exchange missing access_token')

        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(settings.google_oauth_userinfo_url, headers={'Authorization': f'Bearer {access_token}'})
            r.raise_for_status()
            return r.json()

