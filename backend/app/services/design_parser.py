from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple


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


def _collect_colors(figma: Dict[str, Any]) -> List[Dict[str, Any]]:
    colors: List[Dict[str, Any]] = []
    seen = set()

    def add(c: Dict[str, Any], name: str = 'color'):
        r, g, b = c.get('r'), c.get('g'), c.get('b')
        a = c.get('a', 1)
        if r is None or g is None or b is None:
            return
        hexv = _hex_from_rgba(float(r), float(g), float(b), float(a or 1))
        key = (name, hexv)
        if key in seen:
            return
        seen.add(key)
        colors.append({'name': name, 'hex': hexv, 'rgba': {'r': r, 'g': g, 'b': b, 'a': a}})

    def visit_styles(obj: Any):
        if isinstance(obj, dict):
            if 'fills' in obj and isinstance(obj['fills'], list):
                for f in obj['fills']:
                    if isinstance(f, dict) and f.get('type') == 'SOLID' and 'color' in f:
                        if isinstance(f['color'], dict):
                            add(f['color'], obj.get('name') or 'fill')
            for v in obj.values():
                visit_styles(v)
        elif isinstance(obj, list):
            for it in obj:
                visit_styles(it)

    # Traverse nodes quickly
    visit_styles(figma.get('document', figma))
    visit_styles(figma)
    return colors


def _collect_typography(figma: Dict[str, Any]) -> List[Dict[str, Any]]:
    typography: List[Dict[str, Any]] = []
    seen = set()

    def add(t: Dict[str, Any]):
        key = (
            t.get('fontFamily'),
            t.get('fontSize'),
            t.get('lineHeight'),
            t.get('fontWeight'),
            t.get('letterSpacing'),
            t.get('textAlign'),
        )
        if key in seen:
            return
        seen.add(key)
        typography.append(t)

    def visit(obj: Any):
        if isinstance(obj, dict):
            if obj.get('type') in {'TEXT', 'text'} or 'characterStyleOverrides' in obj:
                # Character data can vary; fall back to style node keys
                font = obj.get('fontName') or obj.get('style', {}).get('fontName')
                if isinstance(font, dict):
                    family = font.get('family')
                    weight = font.get('style')
                else:
                    family, weight = None, None

                style = obj.get('style') or {}
                font_family = family or style.get('fontFamily')
                font_size = _safe_float(style.get('fontSize') or obj.get('fontSize'))
                line_height = _safe_float(style.get('lineHeightPercent') or style.get('lineHeight'))
                letter_spacing = _safe_float(style.get('letterSpacing'))

                if font_family and font_size is not None:
                    add(
                        {
                            'fontFamily': font_family,
                            'fontSize': font_size,
                            'lineHeight': line_height,
                            'fontWeight': weight,
                            'letterSpacing': letter_spacing,
                        }
                    )

            for v in obj.values():
                visit(v)
        elif isinstance(obj, list):
            for it in obj:
                visit(it)

    visit(figma)
    return typography


def _build_component_tree(figma: Dict[str, Any]) -> Dict[str, Any]:
    # Figma "document" is typically: { children: [pages], ... }
    # Each page has children (frames/sections/components)
    doc = figma.get('document', {})
    pages = doc.get('children') or []

    def node_summary(n: Dict[str, Any]) -> Dict[str, Any]:
        t = n.get('type')
        return {
            'id': n.get('id'),
            'name': n.get('name') or n.get('id'),
            'type': t,
        }

    def convert(n: Dict[str, Any]) -> Dict[str, Any]:
        # Keep hierarchy but don’t attempt perfect parsing yet.
        children = n.get('children') or []
        out = node_summary(n)
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
    component_tree = _build_component_tree(figma_json)

    colors = _collect_colors(figma_json)
    typography = _collect_typography(figma_json)

    design_tokens: Dict[str, Any] = {
        'colors': colors,
        'typography': typography,
        'shadows': [],
        'borderRadius': [],
        # placeholders for Phase 2 extraction features
        'layout': {},
        'autoLayout': {},
        'constraints': {},
        'grid': {},
        'flex': {},
        'images': [],
        'icons': [],
        'buttons': [],
        'forms': [],
        'cards': [],
    }

    return {
        'component_tree': component_tree,
        'design_tokens': design_tokens,
    }

