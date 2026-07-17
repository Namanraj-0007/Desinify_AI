from datetime import datetime, timezone
from typing import Any, Dict, List

from bson import ObjectId

from app.services.mongo import projects_collection


async def list_projects(user_id: str) -> List[Dict[str, Any]]:
    cursor = projects_collection().find({'user_id': user_id}).sort('created_at', -1)
    return await cursor.to_list(length=100)



async def create_project(user_id: str, name: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        'user_id': user_id,
        'name': name,
        'created_at': now,
    }
    res = await projects_collection().insert_one(doc)
    created = await projects_collection().find_one({'_id': res.inserted_id})
    return created


async def delete_project(user_id: str, project_id: str) -> None:
    await projects_collection().delete_one({'user_id': user_id, '_id': ObjectId(project_id)})

