"""
AI Prompt Builder
Converts parsed Figma data into structured LLM prompts.
Produces complete, production-ready prompts that tell the LLM exactly what to generate.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime


# ─── System Prompt (Vercel-level Principal Frontend Engineer) ──────

SYSTEM_PROMPT = """You are a Principal Frontend Engineer at Vercel. You generate production-ready, immediately runnable code.

## RULES
- NEVER explain the code. NEVER add comments like "// TODO" or "// Add your code here". NEVER use placeholder data.
- Return ONLY the source code files using the format: FILE: path/to/file.tsx\n```\ncode\n```
- Generate EVERY file needed for the project to run immediately with `npm install && npm run dev`
- Use React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React, React Router v6, React Hook Form, Zod
- Every component must be responsive (mobile-first), accessible (ARIA labels, roles, keyboard nav, focus management), and support dark mode
- Use semantic HTML (<nav>, <main>, <section>, <article>, <header>, <footer>, <aside>, <button>, <form>)
- Convert all Figma colors to Tailwind classes or CSS custom properties
- Convert all Figma typography to Tailwind text classes
- Convert all Figma Auto Layout to Tailwind Flexbox/Grid
- All components must accept className for styling overrides
- Export every component as a named export AND default export
- Use `cn()` utility from `@/lib/utils` for className merging
- Import shadcn/ui components from `@/components/ui/*`
- Import Lucide icons from `lucide-react`
- Use Framer Motion for animations (fade in, slide up, scale on hover, stagger children, scroll-triggered reveals)
- Forms use React Hook Form + Zod validation
- Generate proper 404 page, loading states, and error boundaries
- All data flows through props - no hardcoded content unless it's the actual Figma text
- Generated project structure:
  - package.json (with all deps: react, react-dom, react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge, react-hook-form, @hookform/resolvers, zod, recharts)
  - vite.config.ts (with React plugin, path aliases)
  - tsconfig.json (with @/ path alias)
  - tsconfig.node.json
  - postcss.config.js
  - tailwind.config.ts (with shadcn/ui theme extension, dark mode 'class')
  - eslint.config.js
  - index.html
  - src/main.tsx
  - src/App.tsx (with BrowserRouter, Routes, Layout)
  - src/routes/index.tsx
  - src/layouts/RootLayout.tsx
  - src/layouts/MainLayout.tsx
  - src/components/ui/* (button, card, input, dialog, dropdown-menu, avatar, badge, separator, sheet, toast, tooltip, skeleton)
  - src/components/* (each Figma frame becomes a component)
  - src/hooks/useTheme.ts
  - src/hooks/useMediaQuery.ts
  - src/lib/utils.ts (cn function)
  - src/contexts/ThemeContext.tsx
  - src/styles/globals.css (Tailwind directives, @layer base with CSS variables for light/dark)
  - src/types/index.ts
  - src/pages/HomePage.tsx (composes all generated components)
  - src/pages/NotFoundPage.tsx
  - .env.example
  - README.md
"""


# ─── Helper: Convert parsed tree to compact representation ───────

def _compact_tree(node: Dict[str, Any], depth: int = 0, max_depth: int = 8) -> Dict[str, Any]:
    """Convert the full parsed tree into a compact, LLM-friendly format."""
    if depth > max_depth:
        return {"_truncated": True, "name": node.get("name", ""), "type": node.get("type", "")}

    box = node.get("absolute_bounding_box") or {}
    result: Dict[str, Any] = {
        "id": node.get("id", ""),
        "name": node.get("name", "Unnamed"),
        "type": node.get("type", ""),
        "visible": node.get("visible", True),
        "position": {
            "x": box.get("x", 0),
            "y": box.get("y", 0),
            "width": box.get("width", 0),
            "height": box.get("height", 0),
        },
        "rotation": node.get("rotation", 0),
        "opacity": node.get("opacity", 1.0),
        "corner_radius": node.get("corner_radius"),
        "clips_content": node.get("clips_content", False),
    }

    # Layout
    al = node.get("auto_layout")
    if al:
        result["layout"] = {
            "mode": al.get("layout_mode"),
            "spacing": al.get("item_spacing"),
            "padding": {
                "left": al.get("padding_left"),
                "right": al.get("padding_right"),
                "top": al.get("padding_top"),
                "bottom": al.get("padding_bottom"),
            },
            "align_primary": al.get("primary_axis_align_items"),
            "align_cross": al.get("counter_axis_align_items"),
        }

    # Constraints (responsive behavior)
    constraints = node.get("constraints")
    if constraints and (constraints.get("horizontal") or constraints.get("vertical")):
        result["constraints"] = constraints

    # Fills (solid colors, gradients, images)
    fills = node.get("fills", [])
    if fills:
        color_fills = [f for f in fills if isinstance(f, dict) and f.get("type") == "SOLID" and f.get("hex")]
        if color_fills:
            result["fills"] = [{"hex": f["hex"], "opacity": f.get("opacity", 1)} for f in color_fills]
        gradient_fills = [f for f in fills if isinstance(f, dict) and f.get("type", "").startswith("GRADIENT")]
        if gradient_fills:
            result["gradients"] = [{"type": f["type"], "stops": f.get("gradient_stops", [])} for f in gradient_fills]

    # Strokes (borders)
    strokes = node.get("strokes", [])
    if strokes:
        result["borders"] = []
        for s in strokes:
            fill_info = s.get("fill", {})
            if fill_info and fill_info.get("hex"):
                result["borders"].append({
                    "color": fill_info["hex"],
                    "width": s.get("weight", 1),
                    "style": "solid",
                })

    # Effects (shadows, blurs)
    effects = node.get("effects", [])
    if effects:
        shadow_effects = [e for e in effects if e.get("type") in ("DROP_SHADOW", "INNER_SHADOW")]
        if shadow_effects:
            result["shadows"] = [{
                "type": e["type"],
                "color": e.get("hex", "#000"),
                "offset_x": e.get("offset_x", 0),
                "offset_y": e.get("offset_y", 0),
                "radius": e.get("radius", 0),
                "spread": e.get("spread", 0),
            } for e in shadow_effects]

    # Text properties
    if node.get("type") == "TEXT":
        characters = node.get("characters", "")
        style = node.get("style", {}) or {}
        if characters:
            result["text"] = characters
            result["typography"] = {
                "font_family": style.get("font_family") or "Inter",
                "font_size": style.get("font_size") or 16,
                "font_weight": style.get("font_weight") or 400,
                "line_height": style.get("line_height_px"),
                "letter_spacing": style.get("letter_spacing"),
                "text_align": style.get("text_align_horizontal", "LEFT"),
            }

    # Component/instance data
    comp_props = node.get("component_properties")
    if comp_props:
        result["component_properties"] = comp_props

    variant_props = node.get("variant_properties")
    if variant_props:
        result["variant_properties"] = variant_props

    # Vector data
    svg = node.get("svg_string")
    if svg:
        result["svg"] = svg

    # Children
    children = node.get("children", [])
    if children:
        result["children"] = []
        for child in children:
            child_compacted = _compact_tree(child, depth + 1, max_depth)
            if child_compacted:
                result["children"].append(child_compacted)

    return result


# ─── Helper: Summarize design tokens ──────────────────────────────

def _summarize_tokens(design_tokens: Dict[str, Any]) -> Dict[str, Any]:
    """Extract a concise summary of design tokens for the prompt."""
    colors = design_tokens.get("colors", [])
    typography = design_tokens.get("typography", [])
    auto_layout = design_tokens.get("auto_layout", {})

    summary: Dict[str, Any] = {}

    # Color palette
    if colors:
        color_list = []
        for c in colors[:20]:
            color_list.append({
                "hex": c.get("hex", "#000"),
                "usage_count": c.get("usage_count", 1),
                "contexts": c.get("contexts", []),
            })
        summary["colors"] = color_list

    # Typography scale
    if typography:
        type_list = []
        for t in typography[:10]:
            type_list.append({
                "font_family": t.get("font_family", "Inter"),
                "font_size": t.get("font_size", 16),
                "font_weight": t.get("font_weight", 400),
                "sample": t.get("sample_text", "")[:30],
                "usage_count": t.get("usage_count", 1),
            })
        summary["typography"] = type_list

    # Layout mode
    summary["layout_mode"] = "auto" if auto_layout.get("enabled") else "manual"
    summary["total_nodes"] = len(design_tokens.get("frames", [])) + \
        len(design_tokens.get("components", [])) + \
        len(design_tokens.get("vectors", []))

    # Component sets
    component_sets = design_tokens.get("component_sets", [])
    if component_sets:
        summary["component_sets"] = [{
            "name": cs.get("name"),
            "variants": [v.get("name") for v in cs.get("variants", [])],
        } for cs in component_sets[:5]]

    return summary


# ─── Helper: Estimate tokens ──────────────────────────────────────

def _estimate_tokens(text: str) -> int:
    """Rough token estimation (~4 chars per token for code)."""
    return len(text) // 4


# ─── Main Prompt Builder ──────────────────────────────────────────

def build_prompt(
    figma_json: Dict[str, Any],
    project_name: str = "Generated Project",
    framework: str = "react",
    use_typescript: bool = True,
    use_tailwind: bool = True,
    selected_frame_ids: Optional[List[str]] = None,
) -> AIPromptResponse:
    """
    Build a complete LLM prompt from parsed Figma data.

    Returns the system prompt, user prompt with full Figma tree, and token estimate.
    """
    component_tree = figma_json.get("component_tree", {})
    design_tokens = figma_json.get("design_tokens", {})
    stats = figma_json.get("stats", {})

    # Compact the tree to reduce token usage while preserving all layout info
    compact_tree = _compact_tree(component_tree) if component_tree else {}

    # Filter to selected frames if specified
    if selected_frame_ids and selected_frame_ids and compact_tree.get("children"):
        filtered_children = []
        for page in compact_tree.get("children", []):
            filtered_page = _filter_nodes_by_ids(page, selected_frame_ids)
            if filtered_page:
                filtered_children.append(filtered_page)
        if filtered_children:
            compact_tree["children"] = filtered_children

    # Summarize design tokens
    token_summary = _summarize_tokens(design_tokens)

    # Build the user prompt with full Figma data
    figma_json_str = json.dumps(compact_tree, indent=2, default=str)
    tokens_str = json.dumps(token_summary, indent=2, default=str)

    # If the tree is too large, truncate deeply nested children
    MAX_TREE_CHARS = 30000
    if len(figma_json_str) > MAX_TREE_CHARS:
        figma_json_str = _truncate_tree(compact_tree, MAX_TREE_CHARS)

    user_prompt = f"""Generate a complete production-ready {framework.upper()} project from this Figma design.

## Project Name
{project_name}

## Framework & Settings
- Framework: {framework}
- TypeScript: {use_typescript}
- Tailwind CSS: {use_tailwind}
- Includes: shadcn/ui, Framer Motion, Lucide React, React Router, React Hook Form, Zod

## Design Tokens
```json
{tokens_str}
```

## Figma Component Tree (Complete Hierarchy with Positions, Layout, Styles)
```json
{figma_json_str}
```

## Requirements
1. Generate EVERY file required for `npm install && npm run dev` to work
2. Every frame in the Figma tree becomes a React component preserving exact layout
3. Convert Auto Layout to Tailwind Flexbox/Grid with exact spacing and padding
4. Apply all colors as Tailwind classes or CSS variables
5. Apply all typography (font family, size, weight, alignment, letter-spacing)
6. Apply all effects (drop shadows, inner shadows, blur)
7. Apply all corner radii
8. Apply all borders/strokes
9. Make EVERY component responsive (mobile-first with sm:, md:, lg: breakpoints)
10. Add Framer Motion animations: fade-in on mount, hover scale on buttons, stagger children on lists
11. Add ARIA labels, roles, keyboard navigation, focus-visible styles
12. Support dark mode via Tailwind 'dark:' prefix and ThemeContext
13. Generate proper TypeScript interfaces for all props
14. Use React Hook Form + Zod for any forms
15. Each component should accept className prop for override
16. Use cn() from @/lib/utils for className merging
17. Import shadcn/ui components from @/components/ui/

## Output Format
For EVERY file, use this exact format:
FILE: path/to/file.tsx
```tsx
// complete code here
```

Start with package.json, then config files, then source files."""[0:32000]

    system_prompt = SYSTEM_PROMPT
    total_text = system_prompt + user_prompt
    token_estimate = _estimate_tokens(total_text)

    # Import locally to avoid circular imports
    from app.schemas.ai_generation import AIPromptResponse

    return AIPromptResponse(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        token_estimate=token_estimate,
        figma_summary={
            "tree_depth": _get_depth(compact_tree),
            "node_count": stats.get("total_nodes", 0),
            "frame_count": stats.get("total_frames", 0),
            "color_count": len(token_summary.get("colors", [])),
            "typography_count": len(token_summary.get("typography", [])),
            "prompt_chars": len(total_text),
        },
    )


# ─── Helper: Filter tree by node IDs ──────────────────────────────

def _filter_nodes_by_ids(node: Dict[str, Any], target_ids: List[str]) -> Optional[Dict[str, Any]]:
    """Recursively filter tree to only include nodes matching target_ids or their ancestors."""
    node_id = node.get("id", "")
    if node_id in target_ids:
        return node

    children = node.get("children", [])
    filtered_children = []
    for child in children:
        filtered = _filter_nodes_by_ids(child, target_ids)
        if filtered:
            filtered_children.append(filtered)

    if filtered_children:
        result = dict(node)
        result["children"] = filtered_children
        return result

    return None


# ─── Helper: Truncate tree to fit token limits ────────────────────

def _truncate_tree(node: Dict[str, Any], max_chars: int) -> str:
    """Truncate the JSON representation to fit within token limits."""
    # First try stringifying without children detail
    truncated = dict(node)
    children = truncated.get("children", [])
    if children:
        # Keep first 3 children in full, summarize rest
        kept = children[:3]
        remaining = children[3:]
        summary_count = sum(_count_descendants(c) for c in remaining)
        for c in kept:
            c["children"] = []
        truncated["children"] = kept
        truncated["_remaining_children_count"] = len(remaining)
        truncated["_remaining_descendants_count"] = summary_count
        truncated["_truncated"] = True

    result = json.dumps(truncated, indent=2, default=str)
    if len(result) > max_chars:
        # Aggressive truncation: keep only top-level structure
        aggressive = {
            "id": node.get("id"),
            "name": node.get("name"),
            "type": node.get("type"),
            "position": node.get("position"),
            "fills": node.get("fills"),
            "layout": node.get("layout"),
            "typography": node.get("typography"),
            "text": node.get("text"),
            "children_count": len(children),
            "_truncated": True,
        }
        result = json.dumps(aggressive, indent=2, default=str)
        if len(result) > max_chars:
            result = result[:max_chars] + '\n  "_truncated": true\n}'

    return result


def _count_descendants(node: Dict[str, Any]) -> int:
    """Count total descendants of a node."""
    count = 0
    for child in node.get("children", []):
        count += 1 + _count_descendants(child)
    return count


def _get_depth(node: Dict[str, Any]) -> int:
    """Get max depth of the tree."""
    children = node.get("children", [])
    if not children:
        return 0
    return 1 + max(_get_depth(c) for c in children)

