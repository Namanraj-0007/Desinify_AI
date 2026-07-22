"""
Phase 1: Rich Figma Design Schemas
Complete Pydantic models for every Figma node property.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from enum import Enum


# ─── Geometry & Position ──────────────────────────────────────────

class BoundingBox(BaseModel):
    x: float = 0
    y: float = 0
    width: float = 0
    height: float = 0


class Constraints(BaseModel):
    horizontal: Optional[str] = None  # "MIN", "MAX", "CENTER", "STRETCH", "SCALE"
    vertical: Optional[str] = None    # "MIN", "MAX", "CENTER", "STRETCH", "SCALE"


class LayoutGrid(BaseModel):
    pattern: str = "COLUMNS"  # "COLUMNS", "ROWS", "GRID"
    section_size: float = 0
    visible: bool = True
    color: Optional[str] = None
    gutter_size: float = 0
    alignment: Optional[str] = None  # "MIN", "CENTER", "MAX", "STRETCH"
    count: Optional[int] = None
    offset: float = 0


# ─── Fills ─────────────────────────────────────────────────────────

class ColorRGBA(BaseModel):
    r: float = 0
    g: float = 0
    b: float = 0
    a: float = 1.0


class GradientStop(BaseModel):
    position: float = 0
    color: ColorRGBA


class GradientColor(BaseModel):
    gradient_type: str = "GRADIENT_LINEAR"  # GRADIENT_LINEAR, GRADIENT_RADIAL, GRADIENT_ANGULAR, GRADIENT_DIAMOND
    gradient_handle_positions: List[Dict[str, float]] = Field(default_factory=list)
    gradient_stops: List[GradientStop] = Field(default_factory=list)
    opacity: float = 1.0
    visible: bool = True


class SolidColor(BaseModel):
    hex: str = "#000000"
    rgba: ColorRGBA
    opacity: float = 1.0
    visible: bool = True


class ImageFill(BaseModel):
    image_ref: Optional[str] = None
    image_hash: Optional[str] = None
    scale_mode: str = "FILL"  # "FILL", "FIT", "CROP", "TILE"
    opacity: float = 1.0
    visible: bool = True
    rotation: float = 0


class Fill(BaseModel):
    type: str = "SOLID"  # "SOLID", "GRADIENT", "IMAGE", "EMOJI"
    solid: Optional[SolidColor] = None
    gradient: Optional[GradientColor] = None
    image: Optional[ImageFill] = None


# ─── Strokes ───────────────────────────────────────────────────────

class Stroke(BaseModel):
    fill: Fill
    weight: float = 1.0
    stroke_align: str = "INSIDE"  # "INSIDE", "OUTSIDE", "CENTER"
    stroke_join: Optional[str] = None  # "MITER", "BEVEL", "ROUND"
    stroke_cap: Optional[str] = None   # "ROUND", "SQUARE", "LINE_ARROW"
    dash_pattern: List[float] = Field(default_factory=list)
    visible: bool = True


# ─── Effects ───────────────────────────────────────────────────────

class ShadowEffect(BaseModel):
    type: str = "DROP_SHADOW"  # "DROP_SHADOW", "INNER_SHADOW"
    color: ColorRGBA
    offset_x: float = 0
    offset_y: float = 4
    radius: float = 4
    spread: float = 0
    visible: bool = True
    blend_mode: str = "NORMAL"


class BlurEffect(BaseModel):
    type: str = "LAYER_BLUR"  # "LAYER_BLUR", "BACKGROUND_BLUR"
    radius: float = 4
    visible: bool = True


class Effect(BaseModel):
    type: str = "DROP_SHADOW"
    shadow: Optional[ShadowEffect] = None
    blur: Optional[BlurEffect] = None


# ─── Typography ────────────────────────────────────────────────────

class TypeStyle(BaseModel):
    font_family: str = "Inter"
    font_size: float = 16
    font_weight: Union[int, str] = 400
    line_height_px: Optional[float] = None
    line_height_percent: Optional[float] = None
    line_height_unit: Optional[str] = None  # "PIXELS", "PERCENT"
    letter_spacing: float = 0
    letter_spacing_unit: Optional[str] = None  # "PIXELS", "PERCENT"
    text_align_horizontal: str = "LEFT"  # "LEFT", "CENTER", "RIGHT", "JUSTIFIED"
    text_align_vertical: str = "TOP"   # "TOP", "CENTER", "BOTTOM"
    text_case: Optional[str] = None     # "UPPER", "LOWER", "TITLE"
    text_decoration: Optional[str] = None  # "UNDERLINE", "STRIKETHROUGH"
    italic: bool = False
    list_spacing: float = 0
    paragraph_indent: float = 0
    paragraph_spacing: float = 0
    hanging_punctuation: bool = False
    hyperlink: Optional[Dict[str, str]] = None  # {"type": "URL", "url": "..."}


class TextNode(BaseModel):
    characters: str = ""
    style: Optional[TypeStyle] = None


# ─── Layout ────────────────────────────────────────────────────────

class AutoLayout(BaseModel):
    layout_mode: Optional[str] = None  # "HORIZONTAL", "VERTICAL"
    primary_axis_align_items: Optional[str] = None  # "MIN", "CENTER", "MAX", "SPACE_BETWEEN"
    counter_axis_align_items: Optional[str] = None  # "MIN", "CENTER", "MAX"
    primary_axis_sizing_mode: Optional[str] = None  # "FIXED", "AUTO"
    counter_axis_sizing_mode: Optional[str] = None  # "FIXED", "AUTO"
    item_spacing: float = 0
    counter_axis_spacing: float = 0
    padding_left: float = 0
    padding_right: float = 0
    padding_top: float = 0
    padding_bottom: float = 0
    item_reverse_order: bool = False
    stroke_align: Optional[str] = None
    wrap: bool = False


# ─── Vector Data ───────────────────────────────────────────────────

class VectorVertex(BaseModel):
    x: float = 0
    y: float = 0
    stroke_cap: Optional[str] = None
    stroke_join: Optional[str] = None
    corner_radius: Optional[float] = None
    handle_mirroring: Optional[str] = None  # "NONE", "ANGLE", "ANGLE_AND_LENGTH"


class VectorPath(BaseModel):
    winding_rule: str = "NONZERO"  # "NONZERO", "EVENODD"
    data: str = ""  # Path data (SVG-like commands)


class VectorNetwork(BaseModel):
    vertices: List[VectorVertex] = Field(default_factory=list)
    segments: List[Dict[str, Any]] = Field(default_factory=list)
    regions: List[Dict[str, Any]] = Field(default_factory=list)


# ─── Export ────────────────────────────────────────────────────────

class ExportSetting(BaseModel):
    suffix: str = ""
    format: str = "PNG"  # "PNG", "JPG", "SVG", "PDF"
    constraint_type: str = "SCALE"
    constraint_value: float = 1.0


# ─── Node Properties ───────────────────────────────────────────────

class NodeProperties(BaseModel):
    """Every extractable property from a Figma node."""
    id: str = ""
    name: str = "Unnamed"
    type: str = "RECTANGLE"
    visible: bool = True
    locked: bool = False
    opacity: float = 1.0
    blend_mode: str = "PASS_THROUGH"
    rotation: float = 0
    absolute_bounding_box: Optional[BoundingBox] = None
    constraints: Optional[Constraints] = None
    clips_content: bool = False
    layout_grow: Optional[int] = None
    layout_position: Optional[str] = None  # "ABSOLUTE", "RELATIVE"
    corner_radius: Optional[float] = None
    corner_smoothing: float = 0
    rectangle_corner_radii: Optional[List[float]] = None  # [tl, tr, br, bl]
    fills: List[Fill] = Field(default_factory=list)
    strokes: List[Stroke] = Field(default_factory=list)
    stroke_weight: float = 0
    stroke_align: str = "INSIDE"
    stroke_dashes: Optional[List[float]] = None
    stroke_cap: Optional[str] = None
    stroke_join: Optional[str] = None
    effects: List[Effect] = Field(default_factory=list)
    auto_layout: Optional[AutoLayout] = None
    layout_grids: List[LayoutGrid] = Field(default_factory=list)
    export_settings: List[ExportSetting] = Field(default_factory=list)
    is_mask: bool = False
    is_masked: bool = False
    is_hidden: Optional[bool] = None
    children: List[NodeProperties] = Field(default_factory=list)
    depth: int = 0
    absolute_position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})
    relative_position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})

    # Type-specific properties
    characters: Optional[str] = None
    style: Optional[TypeStyle] = None
    component_set_id: Optional[str] = None
    component_properties: Optional[Dict[str, Any]] = None
    variant_properties: Optional[Dict[str, str]] = None
    vector_network: Optional[VectorNetwork] = None
    svg_string: Optional[str] = None

    # Metadata
    parent_id: Optional[str] = None
    parent_type: Optional[str] = None
    page_id: Optional[str] = None
    page_name: Optional[str] = None


# ─── Collection Types ──────────────────────────────────────────────

class DesignTokenCollection(BaseModel):
    colors: List[Dict[str, Any]] = Field(default_factory=list)
    typography: List[Dict[str, Any]] = Field(default_factory=list)
    frames: List[Dict[str, Any]] = Field(default_factory=list)
    components: List[Dict[str, Any]] = Field(default_factory=list)
    images: List[Dict[str, Any]] = Field(default_factory=list)
    effects: List[Dict[str, Any]] = Field(default_factory=list)
    gradients: List[Dict[str, Any]] = Field(default_factory=list)
    shadows: List[Dict[str, Any]] = Field(default_factory=list)
    text_styles: List[Dict[str, Any]] = Field(default_factory=list)
    layout_grids: List[Dict[str, Any]] = Field(default_factory=list)
    constraints: Dict[str, Any] = Field(default_factory=dict)
    auto_layout: Dict[str, Any] = Field(default_factory=dict)
    vectors: List[Dict[str, Any]] = Field(default_factory=list)
    svgs: List[Dict[str, Any]] = Field(default_factory=list)
    component_sets: List[Dict[str, Any]] = Field(default_factory=list)
    variants: List[Dict[str, Any]] = Field(default_factory=list)
    instances: List[Dict[str, Any]] = Field(default_factory=list)
    export_settings: List[Dict[str, Any]] = Field(default_factory=list)
    icons: List[Dict[str, Any]] = Field(default_factory=list)
    buttons: List[Dict[str, Any]] = Field(default_factory=list)
    forms: List[Dict[str, Any]] = Field(default_factory=list)
    cards: List[Dict[str, Any]] = Field(default_factory=list)
    navbars: List[Dict[str, Any]] = Field(default_factory=list)
    inputs: List[Dict[str, Any]] = Field(default_factory=list)
    layout: Dict[str, Any] = Field(default_factory=dict)
    grid: Dict[str, Any] = Field(default_factory=dict)
    flex: Dict[str, Any] = Field(default_factory=dict)
    padding: Dict[str, Any] = Field(default_factory=dict)


class ParsedDesign(BaseModel):
    """Complete output of the Figma design parser."""
    component_tree: Dict[str, Any] = Field(default_factory=dict)
    design_tokens: DesignTokenCollection = Field(default_factory=DesignTokenCollection)
    stats: Dict[str, Any] = Field(default_factory=dict)
    node_count: int = 0
    all_nodes_flat: List[Dict[str, Any]] = Field(default_factory=list)
    pages: List[Dict[str, Any]] = Field(default_factory=list)

