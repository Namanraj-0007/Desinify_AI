from pydantic import BaseModel


class UserPublic(BaseModel):
    id: str
    name: str
    email: str

