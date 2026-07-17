from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.utils.jwt import decode_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_token_from_auth_header(credentials: HTTPAuthorizationCredentials | None):
    if not credentials:
        return None
    return credentials.credentials


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    token = get_token_from_auth_header(credentials)
    if not token:
        raise HTTPException(status_code=401, detail='Not authenticated')

    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid token')

    sub = payload.get('sub')
    if not sub:
        raise HTTPException(status_code=401, detail='Invalid token')

    return str(sub)

