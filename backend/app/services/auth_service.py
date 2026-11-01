from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId

from app.services.mongo import users_collection
from app.utils.jwt import create_access_token
from app.utils.security import hash_password, verify_password


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    clean_email = email.strip().lower()
    return await users_collection().find_one({'email': clean_email})


async def signup_user(name: str, email: str, password: str) -> str:
    clean_email = email.strip().lower()
    clean_name = name.strip()

    existing = await get_user_by_email(clean_email)
    if existing:
        raise ValueError('An account with this email already exists. Please sign in instead.')

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        'name': clean_name,
        'email': clean_email,
        'hashed_password': hash_password(password),
        'provider': 'credentials',
        'created_at': now,
    }

    res = await users_collection().insert_one(doc)
    user_id = str(res.inserted_id)
    return create_access_token({'sub': user_id})


async def login_user(email: str, password: str) -> str:
    clean_email = email.strip().lower()
    user = await get_user_by_email(clean_email)
    if not user:
        raise ValueError(
            'No account registered with this email. Please check your email or switch to "Create Account".'
        )

    if not user.get('hashed_password'):
        provider_name = user.get('provider', 'social login').title()
        raise ValueError(
            f'This account was created via {provider_name}. Please sign in with {provider_name}.'
        )

    if not verify_password(password, user['hashed_password']):
        raise ValueError('Incorrect password. Please verify your credentials and try again.')

    return create_access_token({'sub': str(user['_id'])})


async def get_or_create_user_by_google(*, name: str, email: str) -> Dict[str, Any]:
    return await get_or_create_social_user(provider='google', name=name, email=email)


async def get_or_create_social_user(
    *,
    provider: str,
    name: str,
    email: str,
    avatar_url: Optional[str] = None
) -> Dict[str, Any]:
    clean_email = email.strip().lower()
    existing = await get_user_by_email(clean_email)
    if existing:
        return existing

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        'name': name.strip() or f'{provider.title()} User',
        'email': clean_email,
        'hashed_password': '',
        'provider': provider,
        'avatar_url': avatar_url or '',
        'created_at': now,
    }
    res = await users_collection().insert_one(doc)
    user_id = str(res.inserted_id)
    created = await users_collection().find_one({'_id': ObjectId(user_id)})
    return created or doc


def issue_token_for_user(user: Dict[str, Any]) -> str:
    user_id = str(user.get('_id', user.get('id', 'default_user')))
    return create_access_token({'sub': user_id})
