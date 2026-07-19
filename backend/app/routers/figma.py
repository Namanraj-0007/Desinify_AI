from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.routers.utils.auth import get_current_user_id
from app.schemas.figma import (
    FigmaImportPayload,
    FigmaTokenPayload,
    ImportResponse,
)
from app.services.design_parser import parse_design
from app.services.figma_service import (
    FigmaServiceError,
    extract_file_key_from_url,
    fetch_file_json,
    fetch_figma_me,
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
    # Validate token immediately
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
    # Token can be provided per request later; Phase 2 uses connected user token
    try:
        token = await _get_user_token(user_id)
        file_key = extract_file_key_from_url(payload.figma_url)

        raw = await fetch_file_json(access_token=token, file_key=file_key)
        parsed = parse_design(raw)

        # Store a minimal representation now; can extend with more parsed fields later.
        now_payload: Dict[str, Any] = {
            'user_id': user_id,
            'project_name': payload.project_name or 'Figma Import',
            'figma_file_key': file_key,
            'raw_json': raw,
            'parsed': parsed,
        }

        res = await figma_projects.insert_one(now_payload)
        inserted_id = str(res.inserted_id)

        # Best-effort page/frame/component extraction: full parsing is Phase 2 target.
        # For now return high-level summaries from parser.
        component_tree = parsed.get('component_tree') or {}
        pages = component_tree.get('pages') or []

        return ImportResponse(
            project_id=inserted_id,
            figma_file_key=file_key,
            pages=pages,
            frames=[],
            components=[],
            images=parsed.get('design_tokens', {}).get('images', []),
            typography=parsed.get('design_tokens', {}).get('typography', []),
            colors=parsed.get('design_tokens', {}).get('colors', []),
            raw_parser={'component_tree': component_tree, 'design_tokens': parsed.get('design_tokens', {})},
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

