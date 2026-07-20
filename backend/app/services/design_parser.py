from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from collections import Counter


def _safe_float(x: Any) -> Optional[float]:
    try:
        if x is None:
            return None
        return float(x)
    except Exception:
        return None


def _hex_from_rgba(r: float, g: float, b: float, a: float = 1.0) -> str:
    # r,g,b are usually 0..1
    rr = max(0, min(255, int(round(r * 255))))
    gg = max(0, min(255, int(round(g * 255))))
    bb = max(0, min(255, int(round(b * 255))))
    if a is None:
        a = 1.0
    aa = max(0, min(255, int(round(float(a) * 255))))
    if aa == 255:
        return f'#{rr:02x}{gg:02x}{bb:02x}'
    return f'#{rr:02x}{gg:02x}{bb:02x}{aa:02x}'


def _traverse_all_nodes(obj: Any) -> List[Dict[str, Any]]:
    """Walk the entire Figma JSON tree and yield every node dict."""
    nodes: List[Dict[str, Any]] = []

    def _walk(n: Any):
        if isinstance(n, dict):
            if 'id' in n and 'type' in n and 'name' in n:
                nodes.append(n)
            for v in n.values():
                _walk(v)
        elif isinstance(n, list):
            for item in n:
                _walk(item)

    _walk(obj)
    return nodes


def _collect_frames(figma: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract all FRAME nodes with dimensions and background info."""
    frames: List[Dict[str, Any]] = []
    seen_ids = set()

    for node in _traverse_all_nodes(figma):
        if node.get('type') != 'FRAME':
            continue
        nid = node.get('id')
        if nid in seen_ids:
            continue
        seen_ids.add(nid)

        rect = node.get('absoluteBoundingBox') or {}
        children = node.get('children') or []
        bg_raw = node.get('backgroundColor') or {}

        frame_entry: Dict[str, Any] = {
            'id': nid,
            'name': node.get('name') or 'Unnamed Frame',
            'type': 'FRAME',
            'x': _safe_float(rect.get('x')),
            'y': _safe_float(rect.get('y')),
            'width': _safe_float(rect.get('width')),
            'height': _safe_float(rect.get('height')),
            'children_count': len(children),
            'backgroundColor': _hex_from_rgba(
                float(bg_raw.get('r', 0)),
                float(bg_raw.get('g', 0)),
                float(bg_raw.get('b', 0)),
                float(bg_raw.get('a', 1)),
            ) if bg_raw.get('r') is not None else None,
            'clipsContent': node.get('clipsContent', False),
        }
        frames.append(frame_entry)

    return frames


def _collect_components(figma: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract COMPONENT and INSTANCE nodes with properties."""
    components: List[Dict[str, Any]] = []
    seen_ids = set()

    for node in _traverse_all_nodes(figma):
        ntype = node.get('type')
        if ntype not in ('COMPONENT', 'INSTANCE'):
            continue
        nid = node.get('id')
        if nid in seen_ids:
            continue
        seen_ids.add(nid)

        rect = node.get('absoluteBoundingBox') or {}
        children = node.get('children') or []

        comp_entry: Dict[str, Any] = {
            'id': nid,
            'name': node.get('name') or 'Unnamed Component',
            'type': ntype,
            'componentSet': node.get('componentSetId'),
            'width': _safe_float(rect.get('width')),
            'height': _safe_float(rect.get('height')),
            'children_count': len(children),
        }
        components.append(comp_entry)

    return components


def _collect_images(figma: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract nodes that have image fills or are image-like types."""
    images: List[Dict[str, Any]] = []
    seen_ids = set()

    for node in _traverse_all_nodes(figma):
        nid = node.get('id')
        if nid in seen_ids:
            continue

        has_image_fill = False
        image_ref = None

        fills = node.get('fills') or []
        if isinstance(fills, list):
            for f in fills:
                if isinstance(f, dict) and f.get('type') == 'IMAGE':
                    has_image_fill = True
                    image_ref = f.get('imageRef') or f.get('imageHash')
                    break

        if node.get('type') in ('RECTANGLE', 'VECTOR', 'ELLIPSE') and has_image_fill:
            seen_ids.add(nid)
            rect = node.get('absoluteBoundingBox') or {}
            images.append({
                'id': nid,
                'name': node.get('name') or 'Image',
                'type': node.get('type'),
                'imageRef': image_ref,
                'width': _safe_float(rect.get('width')),
                'height': _safe_float(rect.get('height')),
                'opacity': node.get('opacity', 1),
            })

    return images


def _collect_colors(figma: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract all solid fill colors with usage counts and context."""
    colors: List[Dict[str, Any]] = []
    seen = set()
    usage_counter: Counter = Counter()

    def add(c: Dict[str, Any], name: str = 'color', node_type: str = ''):
        r, g, b = c.get('r'), c.get('g'), c.get('b')
        a = c.get('a', 1)
        if r is None or g is None or b is None:
            return
        hexv = _hex_from_rgba(float(r), float(g), float(b), float(a or 1))
        key = hexv
        if key in seen:
            usage_counter[key] += 1
            return
        seen.add(key)
        usage_counter[key] = 1
        colors.append({
            'name': name,
            'hex': hexv,
            'rgba': {'r': r, 'g': g, 'b': b, 'a': a},
            'usage_count': 0,
            'node_type': node_type,
        })

    def visit_styles(obj: Any, parent_type: str = ''):
        if isinstance(obj, dict):
            node_type = obj.get('type', parent_type)
            if 'fills' in obj and isinstance(obj['fills'], list):
                for f in obj['fills']:
                    if isinstance(f, dict) and f.get('type') == 'SOLID' and 'color' in f:
                        if isinstance(f['color'], dict):
                            add(f['color'], obj.get('name') or 'fill', node_type)
            for v in obj.values():
                visit_styles(v, node_type)
        elif isinstance(obj, list):
            for it in obj:
                visit_styles(it, parent_type)

    visit_styles(figma.get('document', figma))
    visit_styles(figma)

    # Update usage counts
    for color_entry in colors:
        color_entry['usage_count'] = usage_counter.get(color_entry['hex'], 0)

    # Sort by usage count descending
    colors.sort(key=lambda x: x['usage_count'], reverse=True)
    return colors


def _collect_typography(figma: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract all text styles with usage counts."""
    typography: List[Dict[str, Any]] = []
    seen = set()
    usage_counter: Counter = Counter()

    def add(t: Dict[str, Any]):
        key = (
            t.get('fontFamily'),
            t.get('fontSize'),
            t.get('lineHeight'),
            t.get('fontWeight'),
            t.get('letterSpacing'),
            t.get('textAlignHorizontal'),
            t.get('textAlignVertical'),
        )
        if key in seen:
            usage_counter[key] += 1
            return
        seen.add(key)
        usage_counter[key] = 1
        t['usage_count'] = 0
        typography.append(t)

    def visit(obj: Any):
        if isinstance(obj, dict):
            if obj.get('type') in {'TEXT', 'text'} or 'characterStyleOverrides' in obj:
                font = obj.get('fontName') or obj.get('style', {}).get('fontName')
                if isinstance(font, dict):
                    family = font.get('family')
                    weight = font.get('style')
                else:
                    family, weight = None, None

                style = obj.get('style') or {}
                font_family = family or style.get('fontFamily')
                font_size = _safe_float(style.get('fontSize') or obj.get('fontSize'))
                line_height_px = _safe_float(style.get('lineHeightPx') or style.get('lineHeight'))
                line_height_percent = _safe_float(style.get('lineHeightPercent'))
                letter_spacing = _safe_float(style.get('letterSpacing'))
                text_align_h = style.get('textAlignHorizontal') or style.get('textAlign')
                text_align_v = style.get('textAlignVertical')

                if font_family and font_size is not None:
                    add({
                        'fontFamily': font_family,
                        'fontSize': font_size,
                        'lineHeightPx': line_height_px,
                        'lineHeightPercent': line_height_percent,
                        'fontWeight': weight,
                        'letterSpacing': letter_spacing,
                        'textAlignHorizontal': text_align_h,
                        'textAlignVertical': text_align_v,
                    })

            for v in obj.values():
                visit(v)
        elif isinstance(obj, list):
            for it in obj:
                visit(it)

    visit(figma)

    # Update usage counts
    for typ_entry in typography:
        key = (
            typ_entry.get('fontFamily'),
            typ_entry.get('fontSize'),
            typ_entry.get('lineHeight'),
            typ_entry.get('fontWeight'),
            typ_entry.get('letterSpacing'),
            typ_entry.get('textAlignHorizontal'),
            typ_entry.get('textAlignVertical'),
        )
        typ_entry['usage_count'] = usage_counter.get(key, 0)

    # Sort by usage count descending
    typography.sort(key=lambda x: x['usage_count'], reverse=True)
    return typography


def _build_component_tree(figma: Dict[str, Any]) -> Dict[str, Any]:
    """Build hierarchical tree of pages -> frames -> children."""
    doc = figma.get('document', {})
    pages = doc.get('children') or []

    def node_summary(n: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'id': n.get('id'),
            'name': n.get('name') or n.get('id'),
            'type': n.get('type'),
        }

    def convert(n: Dict[str, Any]) -> Dict[str, Any]:
        children = n.get('children') or []
        out = node_summary(n)
        rect = n.get('absoluteBoundingBox') or {}
        out['width'] = _safe_float(rect.get('width'))
        out['height'] = _safe_float(rect.get('height'))
        if children:
            out['children'] = [convert(c) for c in children]
        else:
            out['children'] = []
        return out

    return {
        'type': 'FIGMA_DOCUMENT',
        'pages': [convert(p) for p in pages],
    }


def parse_design(figma_json: Dict[str, Any]) -> Dict[str, Any]:
    """Full design parser: extract tokens, frames, components, images, and hierarchy."""

    # Extract flat lists for dedicated panels
    frames = _collect_frames(figma_json)
    components = _collect_components(figma_json)
    images = _collect_images(figma_json)
    colors = _collect_colors(figma_json)
    typography = _collect_typography(figma_json)

    # Hierarchy (for tree view)
    component_tree = _build_component_tree(figma_json)

    # Summary stats
    stats = {
        'total_frames': len(frames),
        'total_components': len(components),
        'total_images': len(images),
        'total_colors': len(colors),
        'total_typography_styles': len(typography),
    }

    design_tokens: Dict[str, Any] = {
        'colors': colors,
        'typography': typography,
        'frames': frames,
        'components': components,
        'images': images,
        'shadows': [],
        'borderRadius': [],
        'layout': {},
        'autoLayout': {},
        'constraints': {},
        'grid': {},
        'flex': {},
        'icons': [],
        'buttons': [],
        'forms': [],
        'cards': [],
    }

    return {
        'component_tree': component_tree,
        'design_tokens': design_tokens,
        'stats': stats,
    }

