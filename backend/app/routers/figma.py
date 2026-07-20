from datetime import datetime, timezone
from typing import Any, Dict, List
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, status

from app.routers.utils.auth import get_current_user_id
from app.schemas.figma import (
    FigmaImportPayload,
    FigmaTokenPayload,
    ImportResponse,
    FigmaProjectSummary,
    FigmaProjectsListResponse,
    FigmaProjectDetailResponse,
    FrameDetail,
    ComponentDetail,
    ImageDetail,
    ColorDetail,
    TypographyDetail,
    FrameSelectPayload,
    ImageRenderPayload,
    ImageRenderResponse,
    DesignParserResponse,
)
from app.services.design_parser import parse_design
from app.services.figma_service import (
    FigmaServiceError,
    extract_file_key_from_url,
    fetch_file_json,
    fetch_figma_me,
    fetch_image_render,
    fetch_node_info,
)
from app.services.mongo import get_db

router = APIRouter(prefix='/figma', tags=['figma'])

# Collections (resolved lazily from the singleton DB client)
figma_projects = get_db()['figma_projects']
figma_tokens = get_db()['figma_tokens']


async def _get_user_token(user_id: str) -> str:
    doc = await figma_tokens.find_one({'user_id': user_id})
    if not doc or not doc.get('access_token'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Figma token not connected for this user',
        )
    return doc['access_token']


@router.post('/token', response_model=dict)
async def connect_token(payload: FigmaTokenPayload, user_id: str = Depends(get_current_user_id)):
    try:
        me = await fetch_figma_me(payload.access_token)
    except FigmaServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await figma_tokens.update_one(
        {'user_id': user_id},
        {'$set': {'user_id': user_id, 'access_token': payload.access_token, 'figma_me': me}},
        upsert=True,
    )
    return {'ok': True, 'connected': True}


@router.post('/import', response_model=ImportResponse)
async def import_by_url(
    payload: FigmaImportPayload,
    user_id: str = Depends(get_current_user_id),
):
    try:
        token = await _get_user_token(user_id)
        file_key = extract_file_key_from_url(payload.figma_url)

        raw = await fetch_file_json(access_token=token, file_key=file_key)
        parsed = parse_design(raw)

        design_tokens = parsed.get('design_tokens', {})
        component_tree = parsed.get('component_tree', {})
        stats = parsed.get('stats', {})

        now_payload: Dict[str, Any] = {
            'user_id': user_id,
            'project_name': payload.project_name or 'Figma Import',
            'figma_file_key': file_key,
            'raw_json': raw,
            'parsed': parsed,
            'created_at': datetime.now(timezone.utc).isoformat(),
        }

        res = await figma_projects.insert_one(now_payload)
        inserted_id = str(res.inserted_id)

        pages = component_tree.get('pages') or []

        return ImportResponse(
            project_id=inserted_id,
            figma_file_key=file_key,
            pages=pages,
            frames=design_tokens.get('frames', []),
            components=design_tokens.get('components', []),
            images=design_tokens.get('images', []),
            typography=design_tokens.get('typography', []),
            colors=design_tokens.get('colors', []),
            stats=stats,
            raw_parser=DesignParserResponse(
                component_tree=component_tree,
                design_tokens=design_tokens,
                stats=stats,
            ),
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FigmaServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Import failed: {e}')


@router.get('/connected', response_model=dict)
async def connected(user_id: str = Depends(get_current_user_id)):
    doc = await figma_tokens.find_one({'user_id': user_id}, {'access_token': 1})
    return {'connected': bool(doc)}


# --- New endpoints for Phase 2 ---

@router.get('/projects', response_model=FigmaProjectsListResponse)
async def list_figma_projects(user_id: str = Depends(get_current_user_id)):
    """List all Figma projects for the current user."""
    cursor = figma_projects.find(
        {'user_id': user_id},
        {'project_name': 1, 'figma_file_key': 1, 'created_at': 1, 'parsed.stats': 1},
    ).sort('created_at', -1)

    projects: List[FigmaProjectSummary] = []
    async for doc in cursor:
        stats = (doc.get('parsed') or {}).get('stats', {}) or {}
        projects.append(FigmaProjectSummary(
            id=str(doc['_id']),
            project_name=doc.get('project_name', 'Figma Import'),
            figma_file_key=doc.get('figma_file_key', ''),
            created_at=doc.get('created_at', ''),
            stats=stats,
        ))

    return FigmaProjectsListResponse(projects=projects)


@router.get('/projects/{project_id}', response_model=FigmaProjectDetailResponse)
async def get_figma_project_detail(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get full detail for a single Figma project."""
    try:
        doc = await figma_projects.find_one(
            {'_id': ObjectId(project_id), 'user_id': user_id},
        )
    except Exception:
        raise HTTPException(status_code=404, detail='Project not found')

    if not doc:
        raise HTTPException(status_code=404, detail='Project not found')

    parsed = doc.get('parsed', {})
    design_tokens = parsed.get('design_tokens', {})
    stats = parsed.get('stats', {}) or {}

    # Convert raw dicts to typed schemas
    frames = [FrameDetail(**f) for f in design_tokens.get('frames', [])]
    components = [ComponentDetail(**c) for c in design_tokens.get('components', [])]
    images = [ImageDetail(**i) for i in design_tokens.get('images', [])]
    colors = [ColorDetail(**c) for c in design_tokens.get('colors', [])]
    typography = [TypographyDetail(**t) for t in design_tokens.get('typography', [])]

    return FigmaProjectDetailResponse(
        id=str(doc['_id']),
        project_name=doc.get('project_name', 'Figma Import'),
        figma_file_key=doc.get('figma_file_key', ''),
        created_at=doc.get('created_at', ''),
        stats=stats,
        frames=frames,
        components=components,
        images=images,
        colors=colors,
        typography=typography,
    )


@router.get('/projects/{project_id}/frames', response_model=List[FrameDetail])
async def get_project_frames(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get all frames from a Figma project."""
    try:
        doc = await figma_projects.find_one(
            {'_id': ObjectId(project_id), 'user_id': user_id},
            {'parsed.design_tokens.frames': 1},
        )
    except Exception:
        raise HTTPException(status_code=404, detail='Project not found')

    if not doc:
        raise HTTPException(status_code=404, detail='Project not found')

    frames_data = (
        doc.get('parsed', {})
        .get('design_tokens', {})
        .get('frames', [])
    )
    return [FrameDetail(**f) for f in frames_data]


@router.get('/projects/{project_id}/frames/{frame_id}', response_model=FrameDetail)
async def get_single_frame(
    project_id: str,
    frame_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a specific frame by its node ID from a Figma project."""
    try:
        doc = await figma_projects.find_one(
            {'_id': ObjectId(project_id), 'user_id': user_id},
            {'parsed.design_tokens.frames': 1},
        )
    except Exception:
        raise HTTPException(status_code=404, detail='Project not found')

    if not doc:
        raise HTTPException(status_code=404, detail='Project not found')

    frames_data = (
        doc.get('parsed', {})
        .get('design_tokens', {})
        .get('frames', [])
    )

    for f in frames_data:
        if f.get('id') == frame_id:
            return FrameDetail(**f)

    raise HTTPException(status_code=404, detail='Frame not found')


@router.get('/projects/{project_id}/components', response_model=List[ComponentDetail])
async def get_project_components(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get all components from a Figma project."""
    try:
        doc = await figma_projects.find_one(
            {'_id': ObjectId(project_id), 'user_id': user_id},
            {'parsed.design_tokens.components': 1},
        )
    except Exception:
        raise HTTPException(status_code=404, detail='Project not found')

    if not doc:
        raise HTTPException(status_code=404, detail='Project not found')

    components_data = (
        doc.get('parsed', {})
        .get('design_tokens', {})
        .get('components', [])
    )
    return [ComponentDetail(**c) for c in components_data]


@router.get('/projects/{project_id}/images', response_model=List[ImageDetail])
async def get_project_images(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get all images from a Figma project."""
    try:
        doc = await figma_projects.find_one(
            {'_id': ObjectId(project_id), 'user_id': user_id},
            {'parsed.design_tokens.images': 1},
        )
    except Exception:
        raise HTTPException(status_code=404, detail='Project not found')

    if not doc:
        raise HTTPException(status_code=404, detail='Project not found')

    images_data = (
        doc.get('parsed', {})
        .get('design_tokens', {})
        .get('images', [])
    )
    return [ImageDetail(**i) for i in images_data]


@router.post('/image-render', response_model=ImageRenderResponse)
async def render_figma_images(
    payload: ImageRenderPayload,
    user_id: str = Depends(get_current_user_id),
):
    """Fetch rendered image URLs for specific nodes from the Figma API."""
    try:
        token = await _get_user_token(user_id)
        images = await fetch_image_render(
            access_token=token,
            file_key=payload.file_key,
            node_ids=payload.node_ids,
            scale=payload.scale,
            format=payload.format,
        )
        return ImageRenderResponse(images=images)
    except FigmaServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Image render failed: {e}')


@router.post('/projects/{project_id}/select-frame', response_model=dict)
async def select_frame(
    project_id: str,
    payload: FrameSelectPayload,
    user_id: str = Depends(get_current_user_id),
):
    """Mark a specific frame as selected for a project."""
    try:
        result = await figma_projects.update_one(
            {'_id': ObjectId(project_id), 'user_id': user_id},
            {'$set': {'selected_frame_id': payload.frame_id}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail='Project not found')
        return {'ok': True, 'selected_frame_id': payload.frame_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to select frame: {e}')


@router.delete('/projects/{project_id}', response_model=dict)
async def delete_figma_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a Figma project."""
    try:
        result = await figma_projects.delete_one(
            {'_id': ObjectId(project_id), 'user_id': user_id},
        )
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail='Project not found')
        return {'ok': True, 'deleted': True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to delete project: {e}')

