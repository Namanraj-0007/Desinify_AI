import re
from typing import Any, Dict, Optional

import httpx

from app.config.settings import settings


FIGMA_API_BASE = 'https://api.figma.com/v1'


class FigmaServiceError(Exception):
    pass


def extract_file_key_from_url(url: str) -> str:
    """Extract the <file_key> from URLs like:

    - https://www.figma.com/file/<file_key>/name?node-id=...
    - https://figma.com/file/<file_key>/...
    """
    # Common pattern: /file/<key>/
    m = re.search(r"/file/([a-zA-Z0-9]{10,})", url)
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
        # Some geometry options improve fidelity; keep basic.
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/files/{file_key}',
            headers={'X-Figma-Token': access_token},
            params=params,
        )
    if r.status_code >= 400:
        raise FigmaServiceError(f'Failed to fetch Figma file JSON: {r.text}')
    return r.json()

