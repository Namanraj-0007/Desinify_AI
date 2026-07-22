"""
ZIP Export Service
Creates in-memory ZIP archives of generated projects for download.
"""

from __future__ import annotations

import io
import zipfile
import os
from typing import Dict, List


def create_project_zip(files: List[Dict[str, str]]) -> bytes:
    """
    Create an in-memory ZIP file containing all generated project files.
    
    Args:
        files: List of {"path": "src/App.tsx", "content": "..."} dicts
    
    Returns:
        Bytes of the ZIP file
    """
    buffer = io.BytesIO()
    
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for file_entry in files:
            path = file_entry.get("path", "")
            content = file_entry.get("content", "")
            
            # Normalize path separators
            path = path.replace("\\", "/").lstrip("/")
            
            if not path:
                continue
            
            # Write file
            zf.writestr(path, content)
    
    buffer.seek(0)
    return buffer.getvalue()


def create_tar_archive(files: List[Dict[str, str]]) -> bytes:
    """
    Create an in-memory tar.gz archive containing all generated project files.
    Falls back to ZIP if tar is not available.
    
    Args:
        files: List of {"path": "src/App.tsx", "content": "..."} dicts
    
    Returns:
        Bytes of the tar.gz file
    """
    try:
        import tarfile
        
        buffer = io.BytesIO()
        with tarfile.open(fileobj=buffer, mode='w:gz') as tf:
            for file_entry in files:
                path = file_entry.get("path", "")
                content = file_entry.get("content", "")
                
                path = path.replace("\\", "/").lstrip("/")
                if not path:
                    continue
                
                info = tarfile.TarInfo(name=path)
                content_bytes = content.encode('utf-8')
                info.size = len(content_bytes)
                info.mtime = 0
                
                tf.addfile(info, io.BytesIO(content_bytes))
        
        buffer.seek(0)
        return buffer.getvalue()
    except ImportError:
        # Fallback to ZIP
        return create_project_zip(files)


def get_zip_filename(project_name: str = "designify-project", version: int = 1) -> str:
    """Generate a clean filename for the ZIP download."""
    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in project_name)
    return f"{safe_name}-v{version}.zip"

