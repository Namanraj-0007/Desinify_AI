from pydantic import BaseModel
from typing import List


class CreateProjectRequest(BaseModel):
    name: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    created_at: str


class ProjectsListResponse(BaseModel):
    projects: List[ProjectResponse]

