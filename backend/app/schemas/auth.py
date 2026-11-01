from typing import Optional
import re
from pydantic import BaseModel, EmailStr, field_validator


EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)


def validate_and_normalize_email(v: str) -> str:
    if not isinstance(v, str):
        raise ValueError("Email must be a string")
    v = v.strip().lower()
    if not v:
        raise ValueError("Email address cannot be empty")
    if not EMAIL_REGEX.match(v) or '@' not in v:
        raise ValueError("Invalid email address format. Please enter a valid email (e.g. user@gmail.com)")

    parts = v.split('@')
    if len(parts) != 2:
        raise ValueError("Invalid email format")
    domain = parts[1]
    if '.' not in domain or domain.startswith('.') or domain.endswith('.'):
        raise ValueError("Email domain must contain a valid top-level domain (e.g. gmail.com)")
    tld = domain.split('.')[-1]
    if len(tld) < 2:
        raise ValueError("Email top-level domain is invalid (e.g. .com, .org, .net)")
    return v


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator('name')
    @classmethod
    def check_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v

    @field_validator('email', mode='before')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_and_normalize_email(v)

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator('email', mode='before')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_and_normalize_email(v)

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class SocialLoginRequest(BaseModel):
    provider: str  # 'google' | 'discord'
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator('email', mode='before')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_and_normalize_email(v)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
