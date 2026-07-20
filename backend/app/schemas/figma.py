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
    stats: Dict[str, Any]


class ImportResponse(BaseModel):
    project_id: str
    figma_file_key: str
    pages: List[Dict[str, Any]]
    frames: List[Dict[str, Any]]
    components: List[Dict[str, Any]]
    images: List[Dict[str, Any]]
    typography: List[Dict[str, Any]]
    colors: List[Dict[str, Any]]
    stats: Dict[str, Any]
    raw_parser: Optional[DesignParserResponse] = None


# --- New schemas for Phase 2 ---

class FrameDetail(BaseModel):
    id: str
    name: str
    type: str
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    children_count: int = 0
    backgroundColor: Optional[str] = None
    clipsContent: bool = False


class ComponentDetail(BaseModel):
    id: str
    name: str
    type: str
    componentSet: Optional[str] = None
    width: Optional[float] = None
    height: Optional[float] = None
    children_count: int = 0


class ImageDetail(BaseModel):
    id: str
    name: str
    type: str
    imageRef: Optional[str] = None
    width: Optional[float] = None
    height: Optional[float] = None
    opacity: float = 1.0


class ColorDetail(BaseModel):
    name: str
    hex: str
    rgba: Dict[str, Any]
    usage_count: int = 0
    node_type: str = ''


class TypographyDetail(BaseModel):
    fontFamily: Optional[str] = None
    fontSize: Optional[float] = None
    lineHeightPx: Optional[float] = None
    lineHeightPercent: Optional[float] = None
    fontWeight: Optional[str] = None
    letterSpacing: Optional[float] = None
    textAlignHorizontal: Optional[str] = None
    textAlignVertical: Optional[str] = None
    usage_count: int = 0


class FigmaProjectSummary(BaseModel):
    id: str
    project_name: str
    figma_file_key: str
    created_at: str
    stats: Dict[str, Any]


class FigmaProjectsListResponse(BaseModel):
    projects: List[FigmaProjectSummary]


class FigmaProjectDetailResponse(BaseModel):
    id: str
    project_name: str
    figma_file_key: str
    created_at: str
    stats: Dict[str, Any]
    frames: List[FrameDetail]
    components: List[ComponentDetail]
    images: List[ImageDetail]
    colors: List[ColorDetail]
    typography: List[TypographyDetail]


class FrameSelectPayload(BaseModel):
    frame_id: str


class ImageRenderPayload(BaseModel):
    file_key: str
    node_ids: List[str]
    scale: float = 1.0
    format: str = 'png'


class ImageRenderResponse(BaseModel):
    images: Dict[str, str]  # node_id -> image_url

