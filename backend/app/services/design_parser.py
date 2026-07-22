"""
Phase 1: Recursive Figma Design Parser
Completely rewritten to extract EVERY property from EVERY node in the Figma JSON.
Preserves full hierarchy and generates rich design metadata for AI prompt building.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple
from collections import Counter
from dataclasses import dataclass, field


# ─── Helpers ───────────────────────────────────────────────────────

def _safe_float(x: Any) -> Optional[float]:
    try:
        if x is None:
            return None
        return float(x)
    except (ValueError, TypeError):
        return None


def _safe_int(x: Any) -> Optional[int]:
    try:
        if x is None:
            return None
        return int(x)
    except (ValueError, TypeError):
        return None


def _hex_from_rgba(r: float, g: float, b: float, a: float = 1.0) -> str:
    rr = max(0, min(255, int(round(float(r) * 255))))
    gg = max(0, min(255, int(round(float(g) * 255))))
    bb = max(0, min(255, int(round(float(b) * 255))))
    aa = max(0, min(255, int(round(float(a) * 255))))
    if aa == 255:
        return f'#{rr:02x}{gg:02x}{bb:02x}'
    return f'#{rr:02x}{gg:02x}{bb:02x}{aa:02x}'


def _rgba_dict(r: float, g: float, b: float, a: float = 1.0) -> Dict[str, float]:
    return {"r": float(r), "g": float(g), "b": float(b), "a": float(a)}


def _get_safe(obj: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Get a value from a dict, returning default if not present or None."""
    v = obj.get(key)
    return v if v is not None else default


# ─── Recursive Node Traversal ──────────────────────────────────────

def _collect_all_nodes(obj: Any) -> List[Dict[str, Any]]:
    """
    Recursively traverse the ENTIRE Figma JSON tree and yield every node dict.
    This catches nodes at ALL nesting levels — inside documents, pages, frames,
    groups, components, instances, etc.
    """
    nodes: List[Dict[str, Any]] = []

    def _walk(n: Any):
        if isinstance(n, dict):
            if 'id' in n and 'type' in n:
                nodes.append(n)
            for v in n.values():
                _walk(v)
        elif isinstance(n, list):
            for item in n:
                _walk(item)

    _walk(obj)
    return nodes


def _get_children(n: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Get children list from a node, safely."""
    return n.get('children') or []


# ─── Geometry Extraction ───────────────────────────────────────────

def _extract_bounding_box(n: Dict[str, Any]) -> Optional[Dict[str, float]]:
    rect = n.get('absoluteBoundingBox') or n.get('absolute_bounding_box')
    if not rect:
        return None
    x = _safe_float(rect.get('x'))
    y = _safe_float(rect.get('y'))
    w = _safe_float(rect.get('width'))
    h = _safe_float(rect.get('height'))
    if w is None or h is None:
        return None
    return {
        "x": x or 0,
        "y": y or 0,
        "width": w,
        "height": h,
    }


def _extract_relative_position(
    n: Dict[str, Any], parent_box: Optional[Dict[str, float]] = None
) -> Dict[str, float]:
    """Calculate relative position of node within its parent."""
    box = _extract_bounding_box(n)
    if not box:
        return {"x": 0, "y": 0}
    if parent_box:
        return {
            "x": round(box["x"] - parent_box["x"], 2),
            "y": round(box["y"] - parent_box["y"], 2),
        }
    return {"x": box["x"], "y": box["y"]}


def _extract_constraints(n: Dict[str, Any]) -> Dict[str, Optional[str]]:
    c = n.get('constraints') or {}
    return {
        "horizontal": c.get('horizontal'),
        "vertical": c.get('vertical'),
    }


# ─── Fill Extraction ──────────────────────────────────────────────

def _extract_color_from_fill(fill: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Extract color info from a fill object (solid, gradient, image)."""
    fill_type = fill.get('type', 'SOLID')
    opacity = fill.get('opacity', 1.0)
    visible = fill.get('visible', True)

    if fill_type == 'SOLID':
        c = fill.get('color') or {}
        r, g, b = float(c.get('r', 0)), float(c.get('g', 0)), float(c.get('b', 0))
        a = float(c.get('a', 1)) * opacity
        return {
            "type": "SOLID",
            "hex": _hex_from_rgba(r, g, b, a),
            "rgba": _rgba_dict(r, g, b, a),
            "opacity": opacity,
            "visible": visible,
        }

    elif fill_type in ('GRADIENT_LINEAR', 'GRADIENT_RADIAL', 'GRADIENT_ANGULAR', 'GRADIENT_DIAMOND'):
        stops = []
        for gs in fill.get('gradientStops') or []:
            pos = gs.get('position', 0)
            gc = gs.get('color') or {}
            stops.append({
                "position": pos,
                "color": _rgba_dict(
                    float(gc.get('r', 0)),
                    float(gc.get('g', 0)),
                    float(gc.get('b', 0)),
                    float(gc.get('a', 1)) * opacity,
                ),
                "hex": _hex_from_rgba(
                    float(gc.get('r', 0)),
                    float(gc.get('g', 0)),
                    float(gc.get('b', 0)),
                    float(gc.get('a', 1)) * opacity,
                ),
            })

        handle_positions = []
        for h in fill.get('gradientHandlePositions') or []:
            handle_positions.append({
                "x": h.get('x', 0),
                "y": h.get('y', 0),
            })

        return {
            "type": fill_type,
            "gradient_stops": stops,
            "gradient_handle_positions": handle_positions,
            "opacity": opacity,
            "visible": visible,
        }

    elif fill_type == 'IMAGE':
        return {
            "type": "IMAGE",
            "image_ref": fill.get('imageRef'),
            "image_hash": fill.get('imageHash'),
            "scale_mode": fill.get('scaleMode', 'FILL'),
            "opacity": opacity,
            "visible": visible,
            "rotation": fill.get('rotation', 0),
        }

    return {
        "type": fill_type,
        "opacity": opacity,
        "visible": visible,
    }


def _extract_fills(n: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract all fills from a node."""
    fills = n.get('fills') or []
    if not isinstance(fills, list):
        return []
    return [_extract_color_from_fill(f) for f in fills]


# ─── Stroke Extraction ─────────────────────────────────────────────

def _extract_strokes(n: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract all strokes from a node."""
    strokes = n.get('strokes') or []
    if not isinstance(strokes, list):
        return []

    result = []
    for s in strokes:
        fill_info = _extract_color_from_fill(s)
        result.append({
            "fill": fill_info,
            "weight": _safe_float(s.get('strokeWeight')) or 1.0,
            "stroke_align": s.get('strokeAlign', 'INSIDE'),
            "stroke_join": s.get('strokeJoin'),
            "stroke_cap": s.get('strokeCap'),
            "dash_pattern": s.get('dashPattern', []),
            "visible": s.get('visible', True),
        })
    return result


# ─── Effect Extraction ─────────────────────────────────────────────

def _extract_effects(n: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract all effects (shadows, blurs) from a node."""
    effects = n.get('effects') or []
    if not isinstance(effects, list):
        return []

    result = []
    for e in effects:
        etype = e.get('type', '')
        visible = e.get('visible', True)
        radius = _safe_float(e.get('radius')) or 0

        if etype in ('DROP_SHADOW', 'INNER_SHADOW'):
            offset_x = _safe_float(e.get('offset', {}).get('x')) or 0
            offset_y = _safe_float(e.get('offset', {}).get('y')) or 0
            spread = _safe_float(e.get('spread')) or 0
            color = e.get('color') or {}
            result.append({
                "type": etype,
                "color": _rgba_dict(
                    float(color.get('r', 0)),
                    float(color.get('g', 0)),
                    float(color.get('b', 0)),
                    float(color.get('a', 1)),
                ),
                "hex": _hex_from_rgba(
                    float(color.get('r', 0)),
                    float(color.get('g', 0)),
                    float(color.get('b', 0)),
                    float(color.get('a', 1)),
                ),
                "offset_x": offset_x,
                "offset_y": offset_y,
                "radius": radius,
                "spread": spread,
                "visible": visible,
                "blend_mode": e.get('blendMode', 'NORMAL'),
            })
        elif etype in ('LAYER_BLUR', 'BACKGROUND_BLUR'):
            result.append({
                "type": etype,
                "radius": radius,
                "visible": visible,
            })
        else:
            result.append({
                "type": etype,
                "radius": radius,
                "visible": visible,
            })

    return result


# ─── Layout Extraction ─────────────────────────────────────────────

def _extract_auto_layout(n: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Extract auto-layout properties from a node."""
    if not n.get('layoutMode'):
        return None

    return {
        "layout_mode": n.get('layoutMode'),  # "HORIZONTAL" or "VERTICAL"
        "primary_axis_align_items": n.get('primaryAxisAlignItems'),
        "counter_axis_align_items": n.get('counterAxisAlignItems'),
        "primary_axis_sizing_mode": n.get('primaryAxisSizingMode'),
        "counter_axis_sizing_mode": n.get('counterAxisSizingMode'),
        "item_spacing": _safe_float(n.get('itemSpacing')) or 0,
        "counter_axis_spacing": _safe_float(n.get('counterAxisSpacing')) or 0,
        "padding_left": _safe_float(n.get('paddingLeft')) or 0,
        "padding_right": _safe_float(n.get('paddingRight')) or 0,
        "padding_top": _safe_float(n.get('paddingTop')) or 0,
        "padding_bottom": _safe_float(n.get('paddingBottom')) or 0,
        "item_reverse_order": n.get('itemReverseOrder', False),
        "wrap": n.get('layoutWrap', False),
    }


def _extract_layout_grids(n: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract layout grids from a node."""
    grids = n.get('layoutGrids') or []
    if not isinstance(grids, list):
        return []

    result = []
    for g in grids:
        color = g.get('color') or {}
        c = {
            "pattern": g.get('pattern', 'COLUMNS'),
            "section_size": _safe_float(g.get('sectionSize')) or 0,
            "visible": g.get('visible', True),
            "color": _hex_from_rgba(
                float(color.get('r', 0)),
                float(color.get('g', 0)),
                float(color.get('b', 0)),
                float(color.get('a', 1)),
            ) if color.get('r') is not None else None,
            "gutter_size": _safe_float(g.get('gutterSize')) or 0,
            "alignment": g.get('alignment'),
            "count": _safe_int(g.get('count')),
            "offset": _safe_float(g.get('offset')) or 0,
        }
        result.append(c)

    return result


# ─── Typography Extraction ─────────────────────────────────────────

def _extract_type_style(n: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Extract typography style from a text node."""
    style = n.get('style') or {}
    if not style and not n.get('characters'):
        return None

    font_name = n.get('fontName') or style.get('fontName') or {}

    return {
        "font_family": font_name.get('family') or style.get('fontFamily') or 'Inter',
        "font_size": _safe_float(style.get('fontSize') or n.get('fontSize')) or 16,
        "font_weight": style.get('fontWeight') or font_name.get('style') or 400,
        "line_height_px": _safe_float(style.get('lineHeightPx')),
        "line_height_percent": _safe_float(style.get('lineHeightPercentFontSize')),
        "line_height_unit": style.get('lineHeightUnit'),
        "letter_spacing": _safe_float(style.get('letterSpacing')) or 0,
        "letter_spacing_unit": style.get('letterSpacingUnit'),
        "text_align_horizontal": style.get('textAlignHorizontal') or 'LEFT',
        "text_align_vertical": style.get('textAlignVertical') or 'TOP',
        "text_case": style.get('textCase'),
        "text_decoration": style.get('textDecoration'),
        "italic": style.get('italic', False),
        "paragraph_spacing": _safe_float(style.get('paragraphSpacing')) or 0,
        "paragraph_indent": _safe_float(style.get('paragraphIndent')) or 0,
    }


# ─── Vector Extraction ─────────────────────────────────────────────

def _extract_vector_data(n: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Extract vector network/path data from a node."""
    if n.get('type') not in ('VECTOR', 'BOOLEAN', 'ELLIPSE', 'POLYGON', 'STAR', 'LINE'):
        return None

    return {
        "vector_network": n.get('vectorNetwork'),
        "vector_paths": n.get('vectorPaths') or [],
        "children": n.get('children') or [],
    }


def _extract_svg(n: Dict[str, Any]) -> Optional[str]:
    """Extract SVG string if available via export settings or direct."""
    return n.get('svgString') or n.get('svg')


# ─── Export Settings Extraction ────────────────────────────────────

def _extract_export_settings(n: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract export settings from a node."""
    settings = n.get('exportSettings') or []
    if not isinstance(settings, list):
        return []

    return [
        {
            "suffix": s.get('suffix', ''),
            "format": s.get('format', 'PNG'),
            "constraint_type": (s.get('constraint') or {}).get('type', 'SCALE'),
            "constraint_value": (s.get('constraint') or {}).get('value', 1.0),
        }
        for s in settings
    ]


# ─── Component / Instance Extraction ───────────────────────────────

def _extract_component_properties(n: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Extract component property definitions from a component/instance node."""
    props = n.get('componentPropertyDefinitions') or n.get('componentProperties')
    if not props:
        return None

    result = {}
    for key, val in props.items():
        if isinstance(val, dict):
            result[key] = {
                "type": val.get('type'),
                "value": val.get('value'),
                "default_value": val.get('defaultValue'),
            }
        else:
            result[key] = val
    return result


def _extract_variant_properties(n: Dict[str, Any]) -> Optional[Dict[str, str]]:
    """Extract variant properties from a VARIANT node."""
    props = n.get('variantProperties') or n.get('variantGroupProperties')
    if isinstance(props, dict):
        return {k: str(v) for k, v in props.items()}
    return None


# ─── Full Style Extraction ─────────────────────────────────────────

def _extract_all_styles(n: Dict[str, Any]) -> Dict[str, Any]:
    """Extract ALL visual style properties from a node."""
    box = _extract_bounding_box(n)
    parent_box = None  # Will be set during tree building

    return {
        "id": n.get('id', ''),
        "name": n.get('name', 'Unnamed'),
        "type": n.get('type', 'UNKNOWN'),
        "visible": n.get('visible', True),
        "locked": n.get('locked', False),
        "opacity": _safe_float(n.get('opacity')) or 1.0,
        "blend_mode": n.get('blendMode', 'PASS_THROUGH'),
        "rotation": _safe_float(n.get('rotation')) or 0,
        "absolute_bounding_box": box,
        "absolute_position": {"x": box["x"], "y": box["y"]} if box else {"x": 0, "y": 0},
        "constraints": _extract_constraints(n),
        "clips_content": n.get('clipsContent', False),
        "layout_grow": _safe_int(n.get('layoutGrow')),
        "layout_position": n.get('layoutPosition'),
        "layout_align": n.get('layoutAlign'),
        "corner_radius": _safe_float(n.get('cornerRadius')),
        "corner_smoothing": _safe_float(n.get('cornerSmoothing')) or 0,
        "rectangle_corner_radii": n.get('rectangleCornerRadii'),
        "fills": _extract_fills(n),
        "strokes": _extract_strokes(n),
        "stroke_weight": _safe_float(n.get('strokeWeight')) or 0,
        "stroke_align": n.get('strokeAlign', 'INSIDE'),
        "stroke_dashes": n.get('strokeDashes'),
        "stroke_cap": n.get('strokeCap'),
        "stroke_join": n.get('strokeJoin'),
        "effects": _extract_effects(n),
        "auto_layout": _extract_auto_layout(n),
        "layout_grids": _extract_layout_grids(n),
        "export_settings": _extract_export_settings(n),
        "is_mask": n.get('isMask', False),
        "is_masked": n.get('isMaskOutline', False),

        # Type-specific
        "characters": n.get('characters'),
        "style": _extract_type_style(n),
        "component_properties": _extract_component_properties(n),
        "variant_properties": _extract_variant_properties(n),
        "vector_data": _extract_vector_data(n),
        "svg_string": _extract_svg(n),
    }


# ─── Tree Builder ──────────────────────────────────────────────────

def _build_full_tree(
    root: Dict[str, Any],
    depth: int = 0,
    parent_id: Optional[str] = None,
    page_id: Optional[str] = None,
    page_name: Optional[str] = None,
    parent_box: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Recursively build a complete tree preserving the Figma hierarchy.
    Every node gets ALL its properties extracted.
    """
    node = _extract_all_styles(root)
    node['depth'] = depth
    node['parent_id'] = parent_id
    node['page_id'] = page_id
    node['page_name'] = page_name

    # Calculate relative position
    node['relative_position'] = _extract_relative_position(root, parent_box)

    # Recursively process children
    children_raw = _get_children(root)
    node['children'] = []

    if children_raw:
        for child in children_raw:
            child_node = _build_full_tree(
                child,
                depth=depth + 1,
                parent_id=node['id'],
                page_id=page_id or node['id'],
                page_name=page_name or node['name'],
                parent_box=_extract_bounding_box(root),
            )
            node['children'].append(child_node)

    return node


# ─── Collection Builders ───────────────────────────────────────────

def _collect_frames(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Collect all FRAME, GROUP, SECTION nodes with full data."""
    frames: List[Dict[str, Any]] = []
    seen_ids = set()

    def _walk(n: Dict[str, Any]):
        nid = n.get('id')
        if nid and nid not in seen_ids:
            ntype = n.get('type', '')
            if ntype in ('FRAME', 'GROUP', 'SECTION', 'COMPONENT_SET'):
                seen_ids.add(nid)
                frames.append({
                    "id": nid,
                    "name": n.get('name', 'Unnamed'),
                    "type": ntype,
                    "absolute_bounding_box": n.get('absolute_bounding_box'),
                    "children_count": len(n.get('children', [])),
                    "fills": n.get('fills', []),
                    "auto_layout": n.get('auto_layout'),
                    "corner_radius": n.get('corner_radius'),
                    "effects": n.get('effects', []),
                    "clips_content": n.get('clips_content', False),
                    "opacity": n.get('opacity', 1.0),
                    "rotation": n.get('rotation', 0),
                    "constraints": n.get('constraints'),
                })
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)
    return frames


def _collect_components(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Collect all COMPONENT, INSTANCE, VARIANT nodes with full data."""
    components: List[Dict[str, Any]] = []
    seen_ids = set()

    def _walk(n: Dict[str, Any]):
        nid = n.get('id')
        if nid and nid not in seen_ids:
            ntype = n.get('type', '')
            if ntype in ('COMPONENT', 'INSTANCE', 'VARIANT'):
                seen_ids.add(nid)
                comp = {
                    "id": nid,
                    "name": n.get('name', 'Unnamed'),
                    "type": ntype,
                    "absolute_bounding_box": n.get('absolute_bounding_box'),
                    "children_count": len(n.get('children', [])),
                    "component_properties": n.get('component_properties'),
                    "variant_properties": n.get('variant_properties'),
                    "fills": n.get('fills', []),
                    "strokes": n.get('strokes', []),
                    "effects": n.get('effects', []),
                    "auto_layout": n.get('auto_layout'),
                    "corner_radius": n.get('corner_radius'),
                    "opacity": n.get('opacity', 1.0),
                    "rotation": n.get('rotation', 0),
                }
                # Determine if it's a main component or instance
                if ntype == 'COMPONENT':
                    comp['is_main'] = True
                    comp['component_set_id'] = None
                elif ntype == 'VARIANT':
                    comp['is_main'] = True
                elif ntype == 'INSTANCE':
                    comp['is_main'] = False
                    comp['component_set_id'] = n.get('componentId')

                components.append(comp)
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)
    return components


def _collect_images(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Collect all nodes with image fills."""
    images: List[Dict[str, Any]] = []
    seen_ids = set()

    def _walk(n: Dict[str, Any]):
        nid = n.get('id')
        if nid and nid not in seen_ids:
            fills = n.get('fills', [])
            has_image = any(
                isinstance(f, dict) and f.get('type') == 'IMAGE'
                for f in fills
            )
            if has_image:
                seen_ids.add(nid)
                box = n.get('absolute_bounding_box')
                images.append({
                    "id": nid,
                    "name": n.get('name', 'Image'),
                    "type": n.get('type', 'RECTANGLE'),
                    "absolute_bounding_box": box,
                    "opacity": n.get('opacity', 1.0),
                    "fills": fills,
                    "effects": n.get('effects', []),
                })
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)
    return images


def _collect_colors(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract ALL colors: solid fills, stroke colors, gradient stops, shadow colors."""
    colors: List[Dict[str, Any]] = []
    usage_counter: Counter = Counter()
    seen_hexes: Dict[str, int] = {}
    color_contexts: Dict[str, List[str]] = {}

    def _extract_color(hexv: str, rgba: Dict[str, float], context: str, name: str = ''):
        if hexv in seen_hexes:
            idx = seen_hexes[hexv]
            usage_counter[hexv] += 1
            if context not in color_contexts.get(hexv, []):
                color_contexts.setdefault(hexv, []).append(context)
            return
        seen_hexes[hexv] = len(colors)
        usage_counter[hexv] = 1
        color_contexts[hexv] = [context]
        colors.append({
            "name": name,
            "hex": hexv,
            "rgba": rgba,
            "usage_count": 1,
            "contexts": [context],
        })

    def _walk(n: Dict[str, Any]):
        """Walk the tree and extract colors from fills, strokes, effects."""
        node_type = n.get('type', '')
        node_name = n.get('name', '')

        # Fills
        for f in n.get('fills', []):
            if isinstance(f, dict):
                if f.get('type') == 'SOLID':
                    c = f.get('color', {})
                    if c.get('r') is not None:
                        rgba = _rgba_dict(float(c['r']), float(c['g']), float(c['b']), float(c.get('a', 1)))
                        hexv = _hex_from_rgba(float(c['r']), float(c['g']), float(c['b']), float(c.get('a', 1)))
                        _extract_color(hexv, rgba, f"fill:{node_type}", node_name)
                elif f.get('type', '').startswith('GRADIENT'):
                    for gs in f.get('gradientStops') or []:
                        gc = gs.get('color', {})
                        if gc.get('r') is not None:
                            rgba = _rgba_dict(float(gc['r']), float(gc['g']), float(gc['b']), float(gc.get('a', 1)))
                            hexv = _hex_from_rgba(float(gc['r']), float(gc['g']), float(gc['b']), float(gc.get('a', 1)))
                            _extract_color(hexv, rgba, f"gradient:{node_type}", node_name)

        # Strokes
        for s in n.get('strokes', []):
            if isinstance(s, dict):
                sc = s.get('color', {})
                if sc.get('r') is not None:
                    rgba = _rgba_dict(float(sc['r']), float(sc['g']), float(sc['b']), float(sc.get('a', 1)))
                    hexv = _hex_from_rgba(float(sc['r']), float(sc['g']), float(sc['b']), float(sc.get('a', 1)))
                    _extract_color(hexv, rgba, f"stroke:{node_type}", node_name)

        # Effects (shadows)
        for e in n.get('effects', []):
            if isinstance(e, dict) and e.get('type') in ('DROP_SHADOW', 'INNER_SHADOW'):
                ec = e.get('color', {})
                if ec.get('r') is not None:
                    rgba = _rgba_dict(float(ec['r']), float(ec['g']), float(ec['b']), float(ec.get('a', 1)))
                    hexv = _hex_from_rgba(float(ec['r']), float(ec['g']), float(ec['b']), float(ec.get('a', 1)))
                    _extract_color(hexv, rgba, f"shadow:{e['type']}", node_name)

        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)

    # Update usage counts
    for c in colors:
        c['usage_count'] = usage_counter.get(c['hex'], 1)
        c['contexts'] = color_contexts.get(c['hex'], [])

    colors.sort(key=lambda x: x['usage_count'], reverse=True)
    return colors


def _collect_typography(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract ALL typography styles with usage counts."""
    typography: List[Dict[str, Any]] = []
    usage_counter: Counter = Counter()
    seen_styles: Dict[str, int] = {}

    def _walk(n: Dict[str, Any]):
        if n.get('type') == 'TEXT' and n.get('characters') and n.get('style'):
            style = n.get('style', {})
            # Handle both raw Figma format and processed format
            family = (style.get('font_family') or style.get('fontFamily') or
                      n.get('fontName', {}).get('family') or 'Inter')
            size = (style.get('font_size') or style.get('fontSize') or 16)
            weight = (style.get('font_weight') or style.get('fontWeight') or
                      n.get('fontName', {}).get('style') or 400)
            lh_px = style.get('line_height_px') or style.get('lineHeightPx')
            lh_pct = style.get('line_height_percent') or style.get('lineHeightPercentFontSize')
            lh_unit = style.get('line_height_unit') or style.get('lineHeightUnit')
            ls = style.get('letter_spacing') or style.get('letterSpacing') or 0
            ls_unit = style.get('letter_spacing_unit') or style.get('letterSpacingUnit')
            align_h = style.get('text_align_horizontal') or style.get('textAlignHorizontal') or 'LEFT'
            align_v = style.get('text_align_vertical') or style.get('textAlignVertical') or 'TOP'
            tcase = style.get('text_case') or style.get('textCase')
            tdec = style.get('text_decoration') or style.get('textDecoration')
            italic = style.get('italic', False)
            para_sp = style.get('paragraph_spacing') or style.get('paragraphSpacing') or 0
            para_ind = style.get('paragraph_indent') or style.get('paragraphIndent') or 0

            # Create a signature for deduplication
            sig = f"{family}:{size}:{weight}:{lh_px}:{ls}:{align_h}"

            if sig in seen_styles:
                usage_counter[sig] += 1
            else:
                seen_styles[sig] = len(typography)
                usage_counter[sig] = 1
                typography.append({
                    "font_family": family,
                    "font_size": size,
                    "font_weight": weight,
                    "line_height_px": lh_px,
                    "line_height_percent": lh_pct,
                    "line_height_unit": lh_unit,
                    "letter_spacing": ls,
                    "letter_spacing_unit": ls_unit,
                    "text_align_horizontal": align_h,
                    "text_align_vertical": align_v,
                    "text_case": tcase,
                    "text_decoration": tdec,
                    "italic": italic,
                    "paragraph_spacing": para_sp,
                    "paragraph_indent": para_ind,
                    "usage_count": 1,
                    "sample_text": n.get('characters', '')[:80],
                })

        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)

    for t in typography:
        sig = f"{t['font_family']}:{t['font_size']}:{t['font_weight']}:{t.get('line_height_px')}:{t.get('letter_spacing')}:{t.get('text_align_horizontal')}"
        t['usage_count'] = usage_counter.get(sig, 1)

    typography.sort(key=lambda x: x['usage_count'], reverse=True)
    return typography


def _collect_effects_flat(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Collect all shadow and blur effects across the tree."""
    effects_list: List[Dict[str, Any]] = []
    seen = set()

    def _walk(n: Dict[str, Any]):
        for e in n.get('effects', []):
            etype = e.get('type', '')
            if etype in ('DROP_SHADOW', 'INNER_SHADOW', 'LAYER_BLUR', 'BACKGROUND_BLUR'):
                key = f"{etype}:{e.get('radius')}:{e.get('offset', {}).get('x')}:{e.get('offset', {}).get('y')}"
                if key not in seen:
                    seen.add(key)
                    effects_list.append(e)
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)
    return effects_list


def _collect_gradients(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Collect all gradient fills across the tree."""
    gradients: List[Dict[str, Any]] = []
    seen = set()

    def _walk(n: Dict[str, Any]):
        for f in n.get('fills', []):
            if isinstance(f, dict) and f.get('type', '').startswith('GRADIENT'):
                gtype = f.get('type', '')
                stops = tuple(
                    (s.get('position', 0), s.get('color', {}).get('r', 0), s.get('color', {}).get('g', 0), s.get('color', {}).get('b', 0))
                    for s in f.get('gradientStops') or []
                )
                key = f"{gtype}:{stops}"
                if key not in seen:
                    seen.add(key)
                    gradients.append({
                        "type": gtype,
                        "gradient_stops": f.get('gradientStops', []),
                        "gradient_handle_positions": f.get('gradientHandlePositions', []),
                        "node_name": n.get('name', ''),
                        "node_type": n.get('type', ''),
                    })
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)
    return gradients


def _collect_component_sets(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Collect all COMPONENT_SET nodes and their variants."""
    sets: List[Dict[str, Any]] = []
    seen_ids = set()

    def _walk(n: Dict[str, Any]):
        nid = n.get('id')
        if nid and nid not in seen_ids and n.get('type') == 'COMPONENT_SET':
            seen_ids.add(nid)
            variants = []
            for c in n.get('children', []):
                if c.get('type') == 'VARIANT':
                    variants.append({
                        "id": c.get('id'),
                        "name": c.get('name'),
                        "variant_properties": c.get('variant_properties'),
                        "absolute_bounding_box": c.get('absolute_bounding_box'),
                    })
            sets.append({
                "id": nid,
                "name": n.get('name'),
                "variants": variants,
                "variant_count": len(variants),
            })
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)
    return sets


def _collect_vectors(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Collect all vector-type nodes (VECTOR, BOOLEAN, LINE, etc.)."""
    vectors: List[Dict[str, Any]] = []
    seen_ids = set()

    def _walk(n: Dict[str, Any]):
        nid = n.get('id')
        if nid and nid not in seen_ids:
            ntype = n.get('type', '')
            if ntype in ('VECTOR', 'BOOLEAN', 'LINE', 'ELLIPSE', 'POLYGON', 'STAR'):
                seen_ids.add(nid)
                vectors.append({
                    "id": nid,
                    "name": n.get('name', 'Vector'),
                    "type": ntype,
                    "absolute_bounding_box": n.get('absolute_bounding_box'),
                    "fills": n.get('fills', []),
                    "strokes": n.get('strokes', []),
                    "vector_data": n.get('vector_data'),
                    "svg_string": n.get('svg_string'),
                    "rotation": n.get('rotation', 0),
                    "opacity": n.get('opacity', 1.0),
                })
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)
    return vectors


def _collect_auto_layouts(tree_root: Dict[str, Any]) -> Dict[str, Any]:
    """Aggregate auto-layout statistics across the tree."""
    auto_layout_nodes = []
    manual_nodes = 0

    def _walk(n: Dict[str, Any]):
        nonlocal manual_nodes
        if n.get('auto_layout'):
            auto_layout_nodes.append({
                "id": n.get('id'),
                "name": n.get('name'),
                "type": n.get('type'),
                "auto_layout": n.get('auto_layout'),
            })
        else:
            manual_nodes += 1
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)

    return {
        "enabled": len(auto_layout_nodes) > 0,
        "auto_layout_count": len(auto_layout_nodes),
        "manual_count": manual_nodes,
        "auto_layout_nodes": auto_layout_nodes[:20],  # Limit for performance
    }


def _collect_constraints(tree_root: Dict[str, Any]) -> Dict[str, Any]:
    """Aggregate constraint statistics."""
    constrained_nodes = 0
    total_nodes = 0
    constraint_types: Counter = Counter()

    def _walk(n: Dict[str, Any]):
        nonlocal constrained_nodes, total_nodes
        total_nodes += 1
        c = n.get('constraints', {})
        if c.get('horizontal') or c.get('vertical'):
            constrained_nodes += 1
            constraint_types[f"{c.get('horizontal', 'NONE')}/{c.get('vertical', 'NONE')}"] += 1
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)

    return {
        "responsive": constrained_nodes > 0,
        "constrained_nodes": constrained_nodes,
        "total_nodes": total_nodes,
        "constraint_breakdown": dict(constraint_types.most_common(10)),
    }


def _collect_pages(tree_root: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract page-level nodes with their metadata."""
    pages = []
    for child in tree_root.get('children', []):
        if child.get('type') == 'CANVAS':
            rect = child.get('absolute_bounding_box') or {}
            pages.append({
                "id": child.get('id'),
                "name": child.get('name', 'Unnamed Page'),
                "type": "CANVAS",
                "width": _safe_float(rect.get('width')),
                "height": _safe_float(rect.get('height')),
                "children_count": len(child.get('children', [])),
                "background_color": child.get('backgroundColor'),
            })
    return pages


# ─── Node Count ────────────────────────────────────────────────────

def _count_all_nodes(tree_root: Dict[str, Any]) -> int:
    """Count total nodes in the tree."""
    count = 0

    def _walk(n: Dict[str, Any]):
        nonlocal count
        count += 1
        for child in n.get('children', []):
            _walk(child)

    _walk(tree_root)
    return count


# ─── Main Entry Point ──────────────────────────────────────────────

def parse_design(figma_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Full recursive design parser.

    Takes the raw Figma file JSON and produces a rich, structured design representation
    with ALL node properties preserved, complete hierarchy, and aggregated design tokens.

    Args:
        figma_json: Raw JSON from the Figma API (files/:key endpoint)

    Returns:
        Dict with:
        - component_tree: Full recursive tree with all nodes and properties
        - design_tokens: Aggregated colors, typography, components, etc.
        - stats: Summary statistics
        - pages: List of pages/canvases
        - all_nodes_flat: Flat list of all nodes for quick access
        - node_count: Total number of nodes parsed
    """
    doc = figma_json.get('document') or figma_json.get('document', {})
    if not doc:
        doc = figma_json  # Fallback: use the entire JSON

    # Build the complete recursive tree
    component_tree = _build_full_tree(doc)

    # Extract pages
    pages = _collect_pages(component_tree)

    # Use the raw Figma JSON for color/typography/effects extraction
    # (since the processed tree has rich parsed fills)
    raw_doc = figma_json.get('document') or figma_json
    raw_tree_root = component_tree  # For structure-based collectors

    # Extract aggregated design tokens
    frames = _collect_frames(raw_tree_root)
    components = _collect_components(raw_tree_root)
    images = _collect_images(raw_tree_root)
    colors = _collect_colors(raw_doc)
    typography = _collect_typography(raw_doc)
    effects = _collect_effects_flat(raw_doc)
    gradients = _collect_gradients(raw_doc)
    component_sets = _collect_component_sets(raw_tree_root)
    vectors = _collect_vectors(raw_tree_root)
    auto_layout = _collect_auto_layouts(raw_tree_root)
    constraints = _collect_constraints(raw_tree_root)

    # Count nodes
    node_count = _count_all_nodes(component_tree)

    # Flatten all nodes for quick indexed access
    all_nodes_flat = _collect_all_nodes(component_tree)

    # Stats
    stats = {
        "total_frames": len(frames),
        "total_components": len(components),
        "total_images": len(images),
        "total_colors": len(colors),
        "total_typography_styles": len(typography),
        "total_effects": len(effects),
        "total_gradients": len(gradients),
        "total_component_sets": len(component_sets),
        "total_vectors": len(vectors),
        "total_nodes": node_count,
        "total_pages": len(pages),
        "has_auto_layout": auto_layout["enabled"],
        "has_constraints": constraints["responsive"],
        "node_types": {},
    }

    # Node type distribution
    type_counter: Counter = Counter()
    for n in all_nodes_flat:
        if isinstance(n, dict):
            type_counter[n.get('type', 'UNKNOWN')] += 1
    stats["node_types"] = dict(type_counter.most_common())

    # Build design tokens structure
    design_tokens = {
        "colors": colors,
        "typography": typography,
        "frames": frames,
        "components": components,
        "images": images,
        "effects": effects,
        "gradients": gradients,
        "shadows": [e for e in effects if e.get('type') in ('DROP_SHADOW', 'INNER_SHADOW')],
        "text_styles": typography,
        "layout_grids": [],
        "component_sets": component_sets,
        "variants": [],
        "instances": [c for c in components if c.get('type') == 'INSTANCE'],
        "vectors": vectors,
        "svgs": [v for v in vectors if v.get('svg_string')],
        "export_settings": [],
        "icons": [],
        "buttons": [],
        "forms": [],
        "cards": [],
        "navbars": [],
        "inputs": [],
        "layout": {
            "mode": "auto" if auto_layout["enabled"] else "manual",
            "nodes": node_count,
            "auto_layout_count": auto_layout["auto_layout_count"],
            "manual_count": auto_layout["manual_count"],
        },
        "auto_layout": auto_layout,
        "constraints": constraints,
        "grid": {
            "enabled": False,
            "nodes": 0,
        },
        "flex": {
            "enabled": auto_layout["enabled"],
            "nodes": auto_layout["auto_layout_count"],
        },
        "padding": {},
    }

    return {
        "component_tree": component_tree,
        "design_tokens": design_tokens,
        "stats": stats,
        "node_count": node_count,
        "all_nodes_flat": all_nodes_flat,
        "pages": pages,
    }

