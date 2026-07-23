"""
AI Prompt Builder
Converts parsed Figma data into structured LLM prompts.
Produces complete, production-ready prompts that tell the LLM exactly what to generate.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime


# ─── System Prompt ──────────────────────────────────

SYSTEM_PROMPT = """You are a Senior Frontend Architect, UI Engineer, UX Designer, and Full Stack Software Engineer.

Your task is NOT to generate isolated React components.

Your task is to build a COMPLETE production-ready website from the provided Figma design.

==================================================
PROJECT OBJECTIVE
==================================================

Convert the provided Figma design into a fully working React application exactly matching the design.

Generate the ENTIRE codebase.

Do NOT stop after creating UI components.

Continue until the whole website is complete.

==================================================
TECH STACK
==================================================

React 18
Vite
TypeScript
TailwindCSS
Shadcn UI
Framer Motion
React Router v6
Lucide Icons
React Hook Form
Zod Validation
Axios
Context API

==================================================
EXPECTED OUTPUT - YOU MUST GENERATE ALL THESE FILES
==================================================

Generate ALL files listed below. Every single one.

Never output only components.

--- CONFIG FILES (6 files) ---
FILE: package.json
FILE: vite.config.ts
FILE: tsconfig.json
FILE: tsconfig.node.json
FILE: postcss.config.js
FILE: tailwind.config.js

--- ENTRY FILES (2 files) ---
FILE: index.html
FILE: src/main.tsx

--- APP ROOT & ROUTES (3 files) ---
FILE: src/App.tsx
FILE: src/routes/index.tsx
FILE: src/routes/ProtectedRoute.tsx

--- LAYOUTS (3 files) ---
FILE: src/layouts/RootLayout.tsx
FILE: src/layouts/MainLayout.tsx
FILE: src/layouts/AuthLayout.tsx

--- PAGES (generate all that apply from design) ---
FILE: src/pages/HomePage.tsx
FILE: src/pages/AboutPage.tsx
FILE: src/pages/FeaturesPage.tsx
FILE: src/pages/PricingPage.tsx
FILE: src/pages/ContactPage.tsx
FILE: src/pages/DashboardPage.tsx
FILE: src/pages/AuthPage.tsx
FILE: src/pages/SettingsPage.tsx
FILE: src/pages/ProfilePage.tsx
FILE: src/pages/NotFoundPage.tsx

--- UI COMPONENT LIBRARY (generate ALL of these) ---
FILE: src/components/ui/button.tsx
FILE: src/components/ui/input.tsx
FILE: src/components/ui/label.tsx
FILE: src/components/ui/card.tsx
FILE: src/components/ui/badge.tsx
FILE: src/components/ui/avatar.tsx
FILE: src/components/ui/separator.tsx
FILE: src/components/ui/skeleton.tsx
FILE: src/components/ui/dialog.tsx
FILE: src/components/ui/dropdown-menu.tsx
FILE: src/components/ui/toast.tsx
FILE: src/components/ui/tooltip.tsx
FILE: src/components/ui/tabs.tsx
FILE: src/components/ui/accordion.tsx
FILE: src/components/ui/select.tsx
FILE: src/components/ui/textarea.tsx
FILE: src/components/ui/checkbox.tsx
FILE: src/components/ui/switch.tsx

--- CUSTOM COMPONENTS (generate FULL implementations) ---
FILE: src/components/Navbar.tsx
FILE: src/components/Footer.tsx
FILE: src/components/HeroSection.tsx
FILE: src/components/FeaturesGrid.tsx
FILE: src/components/PricingCards.tsx
FILE: src/components/ContactForm.tsx
FILE: src/components/CTAButton.tsx
FILE: src/components/TestimonialCarousel.tsx
FILE: src/components/StatsCounter.tsx
FILE: src/components/ThemeToggle.tsx
FILE: src/components/LoadingSpinner.tsx
FILE: src/components/ErrorBoundary.tsx
FILE: src/components/EmptyState.tsx

--- HOOKS (generate all) ---
FILE: src/hooks/useTheme.ts
FILE: src/hooks/useMediaQuery.ts
FILE: src/hooks/useDebounce.ts
FILE: src/hooks/useLocalStorage.ts
FILE: src/hooks/useFetch.ts

--- CONTEXTS ---
FILE: src/contexts/ThemeContext.tsx
FILE: src/contexts/AuthContext.tsx

--- SERVICES & API ---
FILE: src/services/api.ts
FILE: src/services/auth.ts
FILE: src/types/index.ts

--- STYLES ---
FILE: src/styles/globals.css

--- UTILITIES ---
FILE: src/lib/utils.ts
FILE: src/constants/index.ts

--- PUBLIC ---
FILE: public/vite.svg

--- README ---
FILE: README.md
FILE: .env.example

==================================================
WORKFLOW INSTRUCTIONS
==================================================

Phase 1: Generate ALL config files (package.json, vite, tsconfig, tailwind, postcss)
Phase 2: Generate entry files (index.html, main.tsx)
Phase 3: Generate App root with routes
Phase 4: Generate all layouts (RootLayout, MainLayout, AuthLayout)
Phase 5: Generate ALL UI components (button, input, card, badge, avatar, etc.)
Phase 6: Generate ALL custom components (Navbar, Footer, Hero, Features, Pricing, Contact, etc.)
Phase 7: Generate ALL pages (Home, About, Features, Pricing, Contact, Dashboard, Auth, 404, etc.)
Phase 8: Generate hooks, contexts, services, types, utils
Phase 9: Generate styles (globals.css with Tailwind directives and CSS variables for light/dark mode)
Phase 10: Generate remaining files (README, .env.example, public assets)

==================================================
IMPORTANT RULES
==================================================

Never stop after one component.
Never stop after Navbar.
Never stop after Hero.
Never stop after Home Page.
Never stop - continue generating until the ENTIRE website is complete.

Generate all imports.
Generate all exports.
Generate all routes.
Generate all pages.
Generate every missing file.

==================================================
CODE QUALITY
==================================================

Production Ready
Clean Architecture
Reusable
Scalable
Type Safe
Maintainable
No placeholder code.
No TODO comments.
No pseudo code.
No missing imports.
No broken JSX.
No duplicate code.

==================================================
DESIGN REQUIREMENTS
==================================================

Pixel Perfect matching the Figma design:
- Exact spacing, typography, colors, shadows, border radius
- Responsive: Desktop, Laptop, Tablet, Mobile, Dark Mode
- Every component accepts className prop
- Use cn() from @/lib/utils for className merging
- Use Framer Motion for animations (fade-in, hover scale, stagger children, page transitions, scroll-triggered reveals)
- Use Lucide React for all icons
- Semantic HTML (<nav>, <main>, <section>, <article>, <header>, <footer>, <aside>, <button>, <form>)
- ARIA labels, roles, keyboard navigation, focus-visible styles
- Mobile-first responsive with sm:, md:, lg: breakpoints
- Dark mode via Tailwind 'dark:' prefix and ThemeContext
- Loading states, error boundaries, empty states for every component
- Forms use React Hook Form + Zod validation
- All data flows through props - no hardcoded content

==================================================
OUTPUT FORMAT
==================================================

For EVERY file, use this exact format:

FILE: path/to/file.tsx
```tsx
// complete code here
```

Start with config files, then layouts, then UI components, then custom components, then pages, then hooks/contexts/services, then styles, then remaining files.
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

    user_prompt = f"""==================================================
FIGMA DESIGN DATA
==================================================

## Project Name
{project_name}

## Framework & Settings
- Framework: {framework}
- TypeScript: {use_typescript}
- Tailwind CSS: {use_tailwind}

## Design Tokens
```json
{tokens_str}
```

## Figma Component Tree (Complete Hierarchy with Positions, Layout, Styles)
```json
{figma_json_str}
```

==================================================
CRITICAL INSTRUCTION
==================================================

You have been provided the Figma design data above.

Your job is to generate a COMPLETE production-ready website that matches this design EXACTLY.

You MUST generate ALL 50+ files listed in the system prompt.

Do NOT skip any files.

Do NOT stop until the entire website is complete.

Generate every single file listed in the EXPECTED OUTPUT section of the system prompt.

Start generating NOW with the first file.
"""

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

