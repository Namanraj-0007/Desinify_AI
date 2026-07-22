from __future__ import annotations

from typing import Any, Dict, Optional
from types import SimpleNamespace

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import settings


class InMemoryCursor:
    def __init__(self, docs: list[Dict[str, Any]], filter_fn=None, projection=None):
        self._docs = docs
        self._filter_fn = filter_fn
        self._projection = projection
        self._sorted = False

    def sort(self, field: str, direction: int = 1):
        self._docs = sorted(
            self._docs,
            key=lambda doc: doc.get(field, ''),
            reverse=direction < 0,
        )
        self._sorted = True
        return self

    def _matches(self, doc: Dict[str, Any]) -> bool:
        if self._filter_fn is None:
            return True
        return self._filter_fn(doc)

    async def __aiter__(self):
        for doc in self._docs:
            if self._matches(doc):
                yield self._project(doc)

    def _project(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        if self._projection is None:
            return dict(doc)
        return {k: doc[k] for k in self._projection if k in doc}


class InMemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self._docs: list[Dict[str, Any]] = []

    def _matches(self, doc: Dict[str, Any], filter_spec: Optional[Dict[str, Any]]) -> bool:
        if not filter_spec:
            return True
        for key, expected in filter_spec.items():
            if key == '$or':
                if any(self._matches(doc, part) for part in expected):
                    return True
                continue
            if key == '_id':
                if doc.get('_id') != expected:
                    return False
                continue
            if doc.get(key) != expected:
                return False
        return True

    async def find_one(self, filter_spec: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        for doc in self._docs:
            if self._matches(doc, filter_spec):
                return self._project(doc, projection)
        return None

    async def insert_one(self, document: Dict[str, Any]):
        doc = dict(document)
        doc.setdefault('_id', ObjectId())
        self._docs.append(doc)
        return SimpleNamespace(inserted_id=doc['_id'])

    async def update_one(self, filter_spec: Optional[Dict[str, Any]], update: Dict[str, Any], upsert: bool = False):
        match = None
        for doc in self._docs:
            if self._matches(doc, filter_spec):
                match = doc
                break

        if match is None:
            if not upsert:
                return SimpleNamespace(matched_count=0, modified_count=0)
            doc = {}
            if filter_spec:
                for key, val in filter_spec.items():
                    if key != '$or':
                        doc[key] = val
            new_doc = {**doc, **update.get('$set', {})}
            new_doc.setdefault('_id', ObjectId())
            self._docs.append(new_doc)
            return SimpleNamespace(matched_count=1, modified_count=1)

        for key, value in update.get('$set', {}).items():
            match[key] = value
        return SimpleNamespace(matched_count=1, modified_count=1)

    async def delete_one(self, filter_spec: Optional[Dict[str, Any]]):
        for idx, doc in enumerate(self._docs):
            if self._matches(doc, filter_spec):
                del self._docs[idx]
                return SimpleNamespace(deleted_count=1)
        return SimpleNamespace(deleted_count=0)

    async def count_documents(self, filter_spec: Optional[Dict[str, Any]] = None):
        return sum(1 for doc in self._docs if self._matches(doc, filter_spec))

    def find(self, filter_spec: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        docs = [self._project(doc, projection) for doc in self._docs if self._matches(doc, filter_spec)]
        return InMemoryCursor(docs)

    def _project(self, doc: Dict[str, Any], projection: Optional[Dict[str, Any]]):
        if projection is None:
            return dict(doc)
        return {k: doc[k] for k in projection if k in doc}


class InMemoryDatabase:
    def __init__(self):
        self._collections: Dict[str, InMemoryCollection] = {}

    def __getitem__(self, name: str) -> InMemoryCollection:
        if name not in self._collections:
            self._collections[name] = InMemoryCollection(name)
        return self._collections[name]


class InMemoryClient:
    def __init__(self):
        self._db = InMemoryDatabase()

    def __getitem__(self, name: str):
        return self._db[name]

    class Admin:
        async def command(self, *args, **kwargs):
            return {'ok': 1}

    @property
    def admin(self):
        return self.Admin()


_client: Optional[AsyncIOMotorClient | InMemoryClient] = None
_db: Optional[AsyncIOMotorDatabase | InMemoryDatabase] = None
_fallback_enabled = False


def set_mongo_fallback_enabled(enabled: bool) -> None:
    global _fallback_enabled
    _fallback_enabled = enabled


def get_client() -> AsyncIOMotorClient | InMemoryClient:
    """Return a singleton Motor client or the in-memory fallback client."""
    global _client, _db
    if _fallback_enabled:
        if _client is None:
            _client = InMemoryClient()
            _db = _client['default']
        return _client

    if _client is None:
        try:
            _client = AsyncIOMotorClient(settings.mongodb_uri)
            _db = _client[settings.database_name]
        except Exception:
            set_mongo_fallback_enabled(True)
            _client = InMemoryClient()
            _db = _client['default']
    return _client


def get_db() -> AsyncIOMotorDatabase | InMemoryDatabase:
    global _db
    if _db is None:
        get_client()
    return _db  # type: ignore[return-value]


def users_collection():
    return get_db()['users']


def projects_collection():
    return get_db()['projects']


