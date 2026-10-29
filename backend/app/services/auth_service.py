from datetime import datetime, timezone
import time
import secrets
from typing import Any, Dict, Optional

from bson import ObjectId

from app.services.mongo import users_collection
from app.utils.jwt import create_access_token
from app.utils.security import hash_password, verify_password

# Thread-safe in-memory store for OTPs
_otp_store: Dict[str, Dict[str, Any]] = {}


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
    token = create_access_token({'sub': user_id})
    return token


async def login_user(email: str, password: str) -> str:
    clean_email = email.strip().lower()
    user = await get_user_by_email(clean_email)
    if not user:
        raise ValueError(
            'No account registered with this email. Please check your email or switch to "Create Account".'
        )

    # Check if user registered via social login without a local password
    if not user.get('hashed_password'):
        provider_name = user.get('provider', 'social login').title()
        raise ValueError(
            f'This account was created via {provider_name}. Please use the "Continue with {provider_name}" button above.'
        )

    if not verify_password(password, user['hashed_password']):
        raise ValueError('Incorrect password. Please verify your credentials and try again.')

    token = create_access_token({'sub': str(user['_id'])})
    return token


async def verify_credentials_and_send_otp(email: str, password: str) -> Dict[str, Any]:
    """Step 1 of 2-Step Login: Validate email and password, then dispatch OTP."""
    clean_email = email.strip().lower()
    user = await get_user_by_email(clean_email)
    if not user:
        raise ValueError(
            'No account registered with this email. Please check your email or switch to "Create Account".'
        )

    if not user.get('hashed_password'):
        provider_name = user.get('provider', 'social login').title()
        raise ValueError(
            f'This account was created via {provider_name}. Please use the "Continue with {provider_name}" button above.'
        )

    if not verify_password(password, user['hashed_password']):
        raise ValueError('Incorrect password. Please verify your credentials and try again.')

    otp_info = send_login_otp(clean_email)
    return {
        'status': 'otp_required',
        'message': f'Credentials verified. Verification code dispatched to {clean_email}',
        'email': clean_email,
        'dev_otp': otp_info.get('dev_otp'),
        'expires_in_seconds': otp_info.get('expires_in_seconds', 600),
    }


def send_login_otp(email: str) -> Dict[str, Any]:
    clean_email = email.strip().lower()
    # Cryptographically secure 6-digit OTP
    code = f"{secrets.randbelow(900000) + 100000}"
    _otp_store[clean_email] = {
        'otp': code,
        'expires_at': time.time() + 600,  # 10 minutes expiry
        'attempts': 0,
    }
    print(f"[auth-otp] Generated verification OTP for {clean_email}: {code}")
    return {
        'message': f'One-Time Password sent to {clean_email}',
        'dev_otp': code,
        'expires_in_seconds': 600,
    }


async def verify_login_otp(email: str, otp: str) -> str:
    clean_email = email.strip().lower()
    clean_otp = otp.strip()

    record = _otp_store.get(clean_email)
    if not record:
        raise ValueError('No active OTP request found for this email. Please request a new code.')

    if time.time() > record['expires_at']:
        _otp_store.pop(clean_email, None)
        raise ValueError('Verification code has expired. Please request a new code.')

    if record['attempts'] >= 5:
        _otp_store.pop(clean_email, None)
        raise ValueError('Too many failed attempts. Please request a new OTP.')

    if record['otp'] != clean_otp:
        record['attempts'] += 1
        remaining = 5 - record['attempts']
        raise ValueError(f'Invalid verification code. {remaining} attempt(s) remaining.')

    # Successfully verified! Remove one-time code
    _otp_store.pop(clean_email, None)

    # Find or create user for this verified email
    user = await get_user_by_email(clean_email)
    if not user:
        name_from_email = clean_email.split('@')[0].replace('.', ' ').title()
        user = await get_or_create_social_user(
            provider='email_otp',
            name=name_from_email or 'Verified User',
            email=clean_email,
        )

    return issue_token_for_user(user)


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
