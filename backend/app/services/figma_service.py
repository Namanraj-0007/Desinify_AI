import re
from typing import Any, Dict, List, Optional

import httpx

from app.config.settings import settings


FIGMA_API_BASE = 'https://api.figma.com/v1'


class FigmaServiceError(Exception):
    pass


def extract_file_key_from_url(url: str) -> str:
    """Extract the <file_key> from URLs like:

    - https://www.figma.com/file/<file_key>/name?node-id=...
    - https://figma.com/file/<file_key>/...
    - https://www.figma.com/design/<file_key>/...
    """
    # Common pattern: /file/<key>/  or /design/<key>/
    m = re.search(r"/(?:file|design)/([a-zA-Z0-9]{15,})", url)
    if not m:
        # Fallback: try shorter keys too
        m = re.search(r"/(?:file|design)/([a-zA-Z0-9]{10,})", url)
    if not m:
        raise ValueError('Invalid Figma URL: could not extract file key')
    return m.group(1)


async def fetch_figma_me(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/me',
            headers={'X-Figma-Token': access_token},
        )
    if r.status_code >= 400:
        raise FigmaServiceError(f'Figma token validation failed: {r.text}')
    return r.json()


async def fetch_file_json(
    *,
    access_token: str,
    file_key: str,
) -> Dict[str, Any]:
    # Geometry keeps width/height and positions useful for parsing.
    params = {
        'geometry': 'paths',
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/files/{file_key}',
            headers={'X-Figma-Token': access_token},
            params=params,
        )

    if r.status_code == 403:
        raise FigmaServiceError(
            'Permission denied: your Figma token does not have access to this file. '
            'Make sure the file is shared with you and your token has the correct scopes.'
        )
    if r.status_code == 404:
        raise FigmaServiceError(
            'File not found: the Figma file key could not be found. '
            'Please verify the URL and ensure the file exists.'
        )
    if r.status_code >= 400:
        raise FigmaServiceError(f'Failed to fetch Figma file JSON: {r.text}')
    return r.json()


async def fetch_image_render(
    *,
    access_token: str,
    file_key: str,
    node_ids: List[str],
    scale: float = 1.0,
    format: str = 'png',
) -> Dict[str, str]:
    """Fetch rendered images for specific nodes from the Figma API.

    Returns a dict mapping node_id -> image_url.
    """
    ids = ','.join(node_ids)
    params = {
        'ids': ids,
        'scale': scale,
        'format': format,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/images/{file_key}',
            headers={'X-Figma-Token': access_token},
            params=params,
        )

    if r.status_code >= 400:
        raise FigmaServiceError(f'Failed to fetch image renders: {r.text}')

    data = r.json()
    images = data.get('images', {}) or {}
    # Filter out null entries (nodes that couldn't be rendered)
    return {k: v for k, v in images.items() if v is not None}


async def fetch_node_info(
    *,
    access_token: str,
    file_key: str,
    node_id: str,
) -> Dict[str, Any]:
    """Fetch details for a specific node by ID."""
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/files/{file_key}/nodes',
            headers={'X-Figma-Token': access_token},
            params={'ids': node_id},
        )

    if r.status_code >= 400:
        raise FigmaServiceError(f'Failed to fetch node info: {r.text}')

    data = r.json()
    nodes_data = data.get('nodes', {})
    return nodes_data.get(node_id, {})

