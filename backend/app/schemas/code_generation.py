"""
Phase 3: AI Code Generation Engine - Pydantic Schemas
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class FileOutput(BaseModel):
    path: str
    content: str
    language: str = "tsx"

    class Config:
        from_attributes = True


class ComponentDetected(BaseModel):
    type: str
    name: str
    confidence: float
    source_node_id: str


class VersionStats(BaseModel):
    total_files: int = 0
    total_components: int = 0
    total_lines: int = 0
    total_functions: int = 0
    total_hooks: int = 0
    total_props_interfaces: int = 0
    component_breakdown: Dict[str, int] = Field(default_factory=dict)


class GenerateCodeRequest(BaseModel):
    project_id: str
    frame_ids: List[str] = Field(default_factory=list)
    framework: str = "react"
    typescript: bool = True
    tailwind: bool = True
    optimization_level: str = "standard"

    class Config:
        from_attributes = True


class GeneratedCodeResponse(BaseModel):
    generation_id: str
    project_id: str
    framework: str
    typescript: bool
    tailwind: bool
    files: List[FileOutput]
    folder_structure: List[str]
    stats: VersionStats
    frame_ids: List[str] = Field(default_factory=list)
    created_at: str

    class Config:
        from_attributes = True


class OptimizeCodeRequest(BaseModel):
    generation_id: str
    improvement_type: str = "structure"
    framework: str = "react"

    class Config:
        from_attributes = True


class ExportRequest(BaseModel):
    generation_id: str
    format: str = "zip"

    class Config:
        from_attributes = True


class GenerationVersion(BaseModel):
    id: str
    project_id: str
    project_name: str = ""
    figma_file_key: str = ""
    version_number: int
    framework: str = "react"
    typescript: bool = True
    tailwind: bool = True
    optimization_level: str = "standard"
    files: List[FileOutput] = Field(default_factory=list)
    folder_structure: List[str] = Field(default_factory=list)
    stats: Dict[str, Any] = Field(default_factory=dict)
    frame_ids: List[str] = Field(default_factory=list)
    created_at: str = ""

    class Config:
        from_attributes = True


class VersionHistoryResponse(BaseModel):
    versions: List[GenerationVersion]

    class Config:
        from_attributes = True
