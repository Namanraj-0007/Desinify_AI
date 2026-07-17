from fastapi import APIRouter, Depends, HTTPException

from app.schemas.projects import CreateProjectRequest, ProjectResponse, ProjectsListResponse
from app.services.projects_service import create_project, delete_project, list_projects
from app.routers.utils.auth import get_current_user_id

router = APIRouter(prefix='/projects', tags=['projects'])


@router.get('', response_model=ProjectsListResponse)
async def get_projects(user_id: str = Depends(get_current_user_id)):
    docs = await list_projects(user_id)
    projects = [
        ProjectResponse(
            id=str(d['_id']),
            name=d['name'],
            created_at=d['created_at'],
        )
        for d in docs
    ]
    return ProjectsListResponse(projects=projects)


@router.post('', response_model=ProjectResponse)
async def post_project(payload: CreateProjectRequest, user_id: str = Depends(get_current_user_id)):
    created = await create_project(user_id, payload.name)
    return ProjectResponse(id=str(created['_id']), name=created['name'], created_at=created['created_at'])


@router.delete('/{project_id}')
async def remove_project(project_id: str, user_id: str = Depends(get_current_user_id)):

    try:
        await delete_project(user_id, project_id)
        return {'ok': True}
    except Exception:
        raise HTTPException(status_code=400, detail='Failed to delete project')


