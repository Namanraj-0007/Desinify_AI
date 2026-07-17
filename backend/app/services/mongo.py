from motor.motor_asyncio import AsyncIOMotorClient

from app.config.settings import settings


client: AsyncIOMotorClient = AsyncIOMotorClient(settings.mongodb_uri)

db = client[settings.database_name]



def users_collection():
    return db['users']


def projects_collection():
    return db['projects']

