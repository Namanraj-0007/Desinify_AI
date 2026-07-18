from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class FigmaTokenPayload(BaseModel):
    access_token: str


class FigmaImportPayload(BaseModel):
    figma_url: str
    project_name: Optional[str] = None


class NodeRef(BaseModel):
    id: str
    name: str
    type: str


class FrameNode(BaseModel):
    id: str
    name: str
    type: str
    children: List["FrameNode"] = []


FrameNode.model_rebuild()


class DesignParserResponse(BaseModel):
    component_tree: Dict[str, Any]
    design_tokens: Dict[str, Any]


class ImportResponse(BaseModel):
    project_id: str
    figma_file_key: str
    pages: List[Dict[str, Any]]
    frames: List[Dict[str, Any]]
    components: List[Dict[str, Any]]
    images: List[Dict[str, Any]]
    typography: List[Dict[str, Any]]
    colors: List[Dict[str, Any]]
    raw_parser: Optional[DesignParserResponse] = None

