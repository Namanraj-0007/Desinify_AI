from __future__ import annotations

from typing import Any, Dict
from pathlib import Path
from dotenv import load_dotenv

from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BACKEND_DIR.parent
ENV_FILES = [
    str(BACKEND_DIR / '.env'),
    str(ROOT_DIR / '.env'),
    '.env',
]

for _p in ENV_FILES:
    if Path(_p).is_file():
        load_dotenv(dotenv_path=_p, override=False)


class Settings(BaseSettings):
    """Application configuration.

    Single source of truth: all values must come from environment variables / .env.
    """

    # MongoDB
    mongodb_uri: str = 'mongodb://localhost:27017'
    database_name: str = 'designify_ai'

    # JWT
    jwt_secret: str = 'dev-secret-key'
    jwt_algorithm: str = 'HS256'
    jwt_access_token_expire_minutes: int = 60

    # CORS
    # Supports: '*' or comma-separated origins: 'https://a.com,https://b.com'
    cors_origins: str = '*'

    api_prefix: str = '/api'
    frontend_url: str = Field(
        default='http://localhost:5073',
        validation_alias=AliasChoices('frontend_url', 'client_url', 'app_url')
    )

    # Google OAuth
    google_oauth_client_id: str = Field(
        default='',
        validation_alias=AliasChoices('google_oauth_client_id', 'google_client_id')
    )
    google_oauth_client_secret: str = Field(
        default='',
        validation_alias=AliasChoices('google_oauth_client_secret', 'google_client_secret')
    )
    google_oauth_redirect_uri: str = Field(
        default='http://localhost:5173/auth/google/callback',
        validation_alias=AliasChoices('google_oauth_redirect_uri', 'google_redirect_uri')
    )

    # Defaults correct for Google OAuth; safe to override via env
    google_oauth_scope: str = 'openid email profile'
    google_oauth_authorize_url: str = 'https://accounts.google.com/o/oauth2/v2/auth'
    google_oauth_token_url: str = 'https://oauth2.googleapis.com/token'
    google_oauth_userinfo_url: str = 'https://www.googleapis.com/oauth2/v2/userinfo'

    # Discord OAuth
    discord_client_id: str = Field(
        default='',
        validation_alias=AliasChoices('discord_client_id', 'discord_oauth_client_id')
    )
    discord_client_secret: str = Field(
        default='',
        validation_alias=AliasChoices('discord_client_secret', 'discord_oauth_client_secret')
    )
    discord_redirect_uri: str = Field(
        default='http://localhost:5173/auth/discord/callback',
        validation_alias=AliasChoices('discord_redirect_uri', 'discord_oauth_redirect_uri')
    )
    discord_scope: str = 'identify email'
    discord_authorize_url: str = 'https://discord.com/api/oauth2/authorize'
    discord_token_url: str = 'https://discord.com/api/oauth2/token'
    discord_userinfo_url: str = 'https://discord.com/api/users/@me'

    # AI / LLM Provider
    gemini_api_key: str = ''
    gemini_model: str = 'gemini-2.0-flash-exp'
    openai_api_key: str = ''
    openai_model: str = 'gpt-4o'

    # Figma Integration
    figma_access_token: str = ''

    model_config = SettingsConfigDict(
        # Allow environment variables even if .env isn't loadable in some runners.
        env_file=ENV_FILES,
        env_file_encoding='utf-8',
        extra='ignore',
        case_sensitive=False,
    )

    def masked_config(self) -> Dict[str, Any]:
        """Return loaded config with secrets masked for safe startup logging."""
        raw: Dict[str, Any] = self.model_dump()

        def _mask(value: Any) -> Any:
            if value is None:
                return None
            s = str(value)
            if not s:
                return ''
            if len(s) <= 6:
                return '***'
            return s[:2] + '***' + s[-2:]

        secret_keys = {
            'mongodb_uri',
            'jwt_secret',
            'google_oauth_client_secret',
            'discord_client_secret',
            'gemini_api_key',
            'openai_api_key',
            'figma_access_token',
        }

        for k in list(raw.keys()):
            if k in secret_keys:
                raw[k] = _mask(raw[k])

        return raw

    def required_non_empty(self, key: str) -> None:
        val = getattr(self, key, None)
        if not isinstance(val, str) or not val.strip():
            raise RuntimeError(f"Invalid configuration: {key} is empty. Set it in .env")

    def dump_env_for_debug(self) -> Dict[str, Any]:
        """Return raw os.environ values for keys we care about."""
        import os

        keys = [
            'MONGODB_URI',
            'DATABASE_NAME',
            'DB_NAME',
            'JWT_SECRET',
            'JWT_ALGORITHM',
            'JWT_ACCESS_TOKEN_EXPIRE_MINUTES',
            'CORS_ORIGINS',
            'API_PREFIX',
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_REDIRECT_URI',
            'DISCORD_CLIENT_ID',
            'DISCORD_CLIENT_SECRET',
            'DISCORD_REDIRECT_URI',
            'GEMINI_API_KEY',
            'GEMINI_MODEL',
            'OPENAI_API_KEY',
            'OPENAI_MODEL',
            'FIGMA_ACCESS_TOKEN',
            'FIGMA_API_KEY',
        ]

        return {k: os.environ.get(k, '') for k in keys}


# Instantiate once at import time.
settings = Settings()
