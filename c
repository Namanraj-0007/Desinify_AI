from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime


class GenerateCodeRequest(BaseModel):
    """Request payload for code generation."""
    project_id: str
    frame_ids: List[str]
    framework: str = "react"  # "react" | "nextjs" | "html"
    typescript: bool = True
    tailwind: bool = True
    optimization_level: str = "standard"  # "standard" | "aggressive"


class FileOutput(BaseModel):
    path: str
    content: str


class GeneratedCodeResponse(BaseModel):
    generation_id: str
    project_id: str
    framework: str
    typescript: bool
    tailwind: bool
    files: List[FileOutput]
    folder_structure: List[str]
    stats: Dict[str, Any]
    created_at: str


class GenerationVersion(BaseModel):
    id: str
    project_id: str
    project_name: str
    figma_file_key: str
    version_number: int
    framework: str
    typescript: bool
    tailwind: bool
    optimization_level: str
    files: List[FileOutput]
    folder_structure: List[str]
    stats: Dict[str, Any]
    created_at: str


class VersionHistoryResponse(BaseModel):
    versions: List[GenerationVersion]


class OptimizeCodeRequest(BaseModel):
    generation_id: str
    improvement_type: str  # "structure" | "accessibility" | "responsiveness" | "tailwind" | "naming"
    framework: str = "react"


class ExportRequest(BaseModel):
    generation_id: str
    format: str = "react"  # "react" | "nextjs" | "html"
