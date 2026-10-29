import re
import urllib.parse
from typing import Any, Dict, List, Optional

import httpx

from app.config.settings import settings


FIGMA_API_BASE = 'https://api.figma.com/v1'


class FigmaServiceError(Exception):
    pass


def _get_figma_headers(access_token: str) -> Dict[str, str]:
    """Build proper headers for Figma API based on token format."""
    token = access_token.strip()
    if token.lower().startswith('bearer '):
        token = token[7:].strip()

    if token.startswith('figd_'):
        # Figma personal access tokens
        return {'X-Figma-Token': token}
    # OAuth access token or alternative format
    return {'X-Figma-Token': token, 'Authorization': f'Bearer {token}'}


def extract_file_key_from_url(url: str) -> str:
    """Extract the Figma file/design key from any Figma URL or raw file key.

    Supports:
    - https://www.figma.com/file/<key>/<name>
    - https://www.figma.com/design/<key>/<name>
    - https://www.figma.com/design/<key>
    - https://www.figma.com/proto/<key>/<name>
    - https://www.figma.com/board/<key>/<name>
    - https://www.figma.com/community/file/<key>/<name>
    - Branch URLs: .../design/branch/<key>/... or .../branch/<key>/...
    - Raw file keys: e.g. 'aBcDeFgHiJkLmNoP123456' (10-45 alphanumeric/dash chars)
    """
    if not url or not isinstance(url, str):
        raise ValueError('Invalid Figma URL or file key: empty input')

    cleaned = url.strip().strip('"\'')
    try:
        cleaned = urllib.parse.unquote(cleaned)
    except Exception:
        pass

    # 1. Pattern: /design/branch/<key> or /file/branch/<key>
    m = re.search(r"/(?:file|design|proto|board)/branch/([a-zA-Z0-9_\-]{10,})", cleaned)
    if m:
        return m.group(1)

    # 2. Standard pattern: /(file|design|proto|board)/<key>
    m = re.search(r"/(?:file|design|proto|board)/([a-zA-Z0-9_\-]{10,})", cleaned)
    if m:
        return m.group(1)

    # 3. Community file pattern: /community/file/<key>
    m = re.search(r"/community/file/([0-9a-zA-Z_\-]{10,})", cleaned)
    if m:
        return m.group(1)

    # 4. Any generic /<key>/ where key matches 22-char base62 Figma pattern
    m = re.search(r"/([a-zA-Z0-9]{22})(?:[/?#]|$)", cleaned)
    if m:
        return m.group(1)

    # 5. Direct file key provided (no http/figma.com domain)
    cleaned_key = cleaned.split('?')[0].split('#')[0].strip('/')
    if re.fullmatch(r"[a-zA-Z0-9_\-]{10,45}", cleaned_key) and not cleaned_key.startswith(('http', 'www', 'figma')):
        return cleaned_key

    # 6. Fallback: scan URL path segments for a candidate Figma key
    parts = [p for p in re.split(r"[/\\?#&]", cleaned) if p]
    for part in parts:
        if part.lower() not in {
            'file', 'design', 'proto', 'board', 'community', 'figma.com',
            'www.figma.com', 'https:', 'http:', 'branch'
        }:
            if re.fullmatch(r"[a-zA-Z0-9_\-]{16,36}", part):
                return part

    raise ValueError(
        'Could not extract Figma file key from URL. '
        'Please ensure you paste a valid Figma URL (e.g. https://www.figma.com/design/... or https://www.figma.com/file/...) '
        'or the 22-character file key.'
    )


def extract_node_id_from_url(url: str) -> Optional[str]:
    """Extract optional node-id from Figma URL query parameters.

    Converts URL encoded 101%3A202 or 101-202 to Figma API colon format '101:202'.
    """
    if not url or not isinstance(url, str):
        return None
    try:
        parsed = urllib.parse.urlparse(url.strip())
        qs = urllib.parse.parse_qs(parsed.query)
        if 'node-id' in qs and qs['node-id']:
            raw_node = qs['node-id'][0]
            return raw_node.replace('-', ':')
    except Exception:
        pass
    return None


async def fetch_figma_me(access_token: str) -> Dict[str, Any]:
    headers = _get_figma_headers(access_token)
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/me',
            headers=headers,
        )
    if r.status_code == 401 or r.status_code == 403:
        raise FigmaServiceError(
            'Figma token validation failed: Invalid or expired access token. '
            'Please generate a new Personal Access Token in your Figma Account Settings.'
        )
    if r.status_code >= 400:
        raise FigmaServiceError(f'Figma token validation failed ({r.status_code}): {r.text}')
    return r.json()


async def fetch_file_json(
    *,
    access_token: str,
    file_key: str,
    node_id: Optional[str] = None,
) -> Dict[str, Any]:
    # Geometry keeps width/height and positions useful for parsing.
    params: Dict[str, Any] = {
        'geometry': 'paths',
    }
    if node_id:
        params['ids'] = node_id

    headers = _get_figma_headers(access_token)

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/files/{file_key}',
            headers=headers,
            params=params,
        )
        if r.status_code == 401 and 'Authorization' not in headers:
            # Fallback retry with Authorization Bearer header
            r = await client.get(
                f'{FIGMA_API_BASE}/files/{file_key}',
                headers={'Authorization': f'Bearer {access_token.strip()}'},
                params=params,
            )

    if r.status_code == 401:
        raise FigmaServiceError(
            'Figma authentication failed (401 Unauthorized): '
            'Your Figma Personal Access Token is invalid or expired. '
            'Please verify your token in the dashboard or regenerate it in Figma Settings.'
        )
    if r.status_code == 403:
        raise FigmaServiceError(
            f'Permission denied (403 Forbidden): Your Figma token does not have access to file "{file_key}". '
            'Make sure the Figma file is shared with your account or has public link-sharing enabled.'
        )
    if r.status_code == 404:
        raise FigmaServiceError(
            f'File not found (404 Not Found): Figma file key "{file_key}" could not be found. '
            'Please verify the URL is correct and the file exists.'
        )
    if r.status_code == 429:
        raise FigmaServiceError(
            'Figma API rate limit exceeded (429). Please wait a few seconds and try again.'
        )
    if r.status_code >= 400:
        raise FigmaServiceError(f'Failed to fetch Figma file JSON ({r.status_code}): {r.text}')
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

    headers = _get_figma_headers(access_token)

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/images/{file_key}',
            headers=headers,
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
    headers = _get_figma_headers(access_token)
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(
            f'{FIGMA_API_BASE}/files/{file_key}/nodes',
            headers=headers,
            params={'ids': node_id},
        )

    if r.status_code >= 400:
        raise FigmaServiceError(f'Failed to fetch node info: {r.text}')

    data = r.json()
    nodes_data = data.get('nodes', {})
    return nodes_data.get(node_id, {})
