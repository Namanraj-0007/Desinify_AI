from __future__ import annotations

from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import settings


_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def get_client() -> AsyncIOMotorClient:
    """Return a singleton Motor client."""
    global _client, _db
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongodb_uri)
        _db = _client[settings.database_name]
    return _client


def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        get_client()
    # mypy: _db is initialized by get_client()
    return _db  # type: ignore[return-value]


def users_collection():
    return get_db()['users']


def projects_collection():
    return get_db()['projects']


