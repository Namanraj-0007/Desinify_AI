from datetime import datetime, timezone
from typing import Any, Dict, Optional


from bson import ObjectId

from app.services.mongo import users_collection
from app.utils.jwt import create_access_token
from app.utils.security import hash_password, verify_password


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return await users_collection().find_one({'email': email})


async def signup_user(name: str, email: str, password: str) -> str:
    existing = await get_user_by_email(email)
    if existing:
        raise ValueError('Email already registered')

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        'name': name,
        'email': email,
        'hashed_password': hash_password(password),
        'created_at': now,
    }

    res = await users_collection().insert_one(doc)
    user_id = str(res.inserted_id)
    token = create_access_token({'sub': user_id})
    return token


async def login_user(email: str, password: str) -> str:
    user = await get_user_by_email(email)
    if not user:
        raise ValueError('Invalid email or password')

    if not verify_password(password, user['hashed_password']):
        raise ValueError('Invalid email or password')

    token = create_access_token({'sub': str(user['_id'])})
    return token


async def get_or_create_user_by_google(*, name: str, email: str) -> Dict[str, Any]:
    existing = await get_user_by_email(email)
    if existing:
        return existing

    now = datetime.now(timezone.utc).isoformat()
    # Store hashed password as empty string because Phase 1 Google auth is OAuth-only.
    doc = {
        'name': name,
        'email': email,
        'hashed_password': '',
        'created_at': now,
    }
    res = await users_collection().insert_one(doc)
    user_id = str(res.inserted_id)
    created = await users_collection().find_one({'_id': ObjectId(user_id)})
    return created


def issue_token_for_user(user: Dict[str, Any]) -> str:
    return create_access_token({'sub': str(user['_id'])})


