"""
AI-Powered Code Generation Engine
Transforms parsed Figma data into production-ready frontend code using LLMs.

Pipeline: Parse → Detect Components → Build AI Prompt → Call LLM → Parse Output → Save Files

Supports: React + TypeScript + Tailwind CSS, Next.js App Router, HTML/CSS
Generates: Complete projects runnable with `npm install && npm run dev`
"""

from __future__ import annotations

import re
import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple
from datetime import datetime
from collections import Counter

from app.schemas.ai_generation import (
    AIPromptResponse,
    LLMResponse,
    LLMProviderConfig,
    StreamEvent,
    GenerationProgress,
)
from app.services.ai_prompt_builder import build_prompt
from app.services.ai_code_generator import call_llm_with_retry, stream_generation, _parse_file_output

logger = logging.getLogger(__name__)


# ─── Pattern Detection ─────────────────────────────────────────────

def detect_components(figma_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Analyze Figma node tree and detect reusable UI component patterns.
    This is used for prompt enrichment and file splitting hints.
    """
    components = []
    seen_patterns: Dict[str, int] = Counter()

    def traverse(node: Dict[str, Any], depth: int = 0):
        if depth > 10:
            return
        name = node.get('name', 'Unnamed').lower()
        width = node.get('width') or node.get('absolute_bounding_box', {}).get('width', 0)
        height = node.get('height') or node.get('absolute_bounding_box', {}).get('height', 0)
        children = node.get('children', [])

        comp_type = _detect_component_type(node, name, width, height, children)
        sig = _structural_signature(node)
        seen_patterns[sig] += 1

        components.append({
            "id": node.get('id', ''),
            "name": node.get('name', 'Unnamed'),
            "type": comp_type,
            "width": width,
            "height": height,
            "children_count": len(children),
            "signature": sig,
            "depth": depth,
            "pattern_reuse_count": seen_patterns[sig],
            "is_reusable": seen_patterns[sig] > 1,
        })

        for child in children:
            traverse(child, depth + 1)

    pages = []
    if figma_data.get('document'):
        pages = figma_data.get('document', {}).get('children', [])
    elif figma_data.get('component_tree'):
        pages = figma_data.get('component_tree', {}).get('pages', [])

    for page in pages:
        traverse(page)

    return components


def _detect_component_type(
    node: Dict[str, Any],
    name: str,
    width: Optional[float],
    height: Optional[float],
    children: List,
) -> str:
    """Detect UI component type from node properties."""
    node_type = node.get('type', '')
    if node_type == 'TEXT':
        return 'text'
    if node_type in ('VECTOR', 'BOOLEAN_OPERATION'):
        return 'vector'
    if node_type == 'INSTANCE':
        return 'instance'
    if node_type == 'COMPONENT':
        return 'component'
    if node_type == 'COMPONENT_SET':
        return 'component_set'

    auto_layout = node.get('auto_layout', {}) or {}
    layout_mode = auto_layout.get('layout_mode', '')

    if width and height:
        if 40 <= height <= 80 and width >= 600 and ('nav' in name or 'header' in name or 'topbar' in name):
            return 'navbar'
        if height <= 250 and width >= 600 and ('footer' in name or 'bottom' in name):
            return 'footer'
        if 150 <= width <= 400 and height >= 400 and ('sidebar' in name or 'aside' in name or 'drawer' in name):
            return 'sidebar'
        if width >= 600 and height >= 350 and ('hero' in name or 'banner' in name or 'cover' in name):
            return 'hero'
        if children and width >= 150 and height >= 100:
            if 'card' in name or 'tile' in name or 'panel' in name:
                return 'card'
            if width >= 200 and height >= 150:
                return 'card'

    if layout_mode == 'HORIZONTAL' and children and len(children) <= 5:
        if all(_is_button_like(c) for c in children):
            return 'button_group'
        return 'row'

    if layout_mode == 'VERTICAL' and children:
        return 'column'

    if name and children and len(children) <= 3:
        text_children = sum(1 for c in children if c.get('type') == 'TEXT')
        if text_children == len(children):
            return 'text_block'

    if _is_button_like(node) and name and ('button' in name or 'btn' in name or 'cta' in name):
        return 'button'

    if height and 30 <= height <= 60 and width and width >= 100:
        if 'input' in name or 'field' in name or 'search' in name:
            return 'input'

    return 'section'


def _is_button_like(node: Dict[str, Any]) -> bool:
    """Check if a node resembles a button."""
    width = node.get('width') or node.get('absolute_bounding_box', {}).get('width', 0)
    height = node.get('height') or node.get('absolute_bounding_box', {}).get('height', 0)
    if height and width:
        return 30 <= height <= 70 and 60 <= width <= 300
    return False


def _structural_signature(node: Dict[str, Any]) -> str:
    """Create a structural fingerprint for detecting reusable patterns."""
    children = node.get('children', [])
    width = node.get('width') or node.get('absolute_bounding_box', {}).get('width', 0)
    height = node.get('height') or node.get('absolute_bounding_box', {}).get('height', 0)
    w_bucket = round(width / 20) * 20 if width else 0
    h_bucket = round(height / 20) * 20 if height else 0
    return f"{_detect_component_type(node, node.get('name','').lower(), width, height, children)}:{w_bucket}x{h_bucket}:{len(children)}"


# ─── Main Generation Pipeline ──────────────────────────────────────

async def generate_code(
    figma_data: Dict[str, Any],
    project_id: str,
    frame_ids: List[str],
    framework: str = "react",
    use_typescript: bool = True,
    use_tailwind: bool = True,
    optimization_level: str = "standard",
) -> Dict[str, Any]:
    """
    Main entry point for AI-powered code generation.

    Pipeline:
    1. Detect components from Figma data
    2. Build a structured LLM prompt from the parsed data
    3. Call the LLM (Gemini/OpenAI) with retry logic
    4. Parse the LLM output into file entries
    5. Save generation record to MongoDB
    6. Return structured output with files, folder structure, and metadata
    """
    start_time = datetime.utcnow()

    components = detect_components(figma_data)

    if frame_ids:
        components = [c for c in components if c.get('id') in frame_ids]

    prompt = build_prompt(
        figma_json=figma_data,
        project_name="Designify AI Generated",
        framework=framework,
        use_typescript=use_typescript,
        use_tailwind=use_tailwind,
        selected_frame_ids=frame_ids if frame_ids else None,
    )

    llm_result = await call_llm_with_retry(
        system_prompt=prompt.system_prompt,
        user_prompt=prompt.user_prompt,
    )

    if not llm_result.success:
        logger.warning(f"LLM generation failed: {llm_result.error}. Falling back to template generation.")
        return await _fallback_generate(components, framework, use_typescript, use_tailwind)

    files = llm_result.files
    files = _validate_generated_files(files, framework)
    folder_structure = _build_folder_structure(files)

    comp_types = Counter(c.get('type', 'unknown') for c in components)
    generation_stats = {
        "total_components": len(components),
        "reusable_components": sum(1 for c in components if c.get('is_reusable')),
        "unique_types": len(comp_types),
        "files_generated": len(files),
        "total_lines": sum(len(f.get('content', '').split('\n')) for f in files),
        "component_breakdown": dict(comp_types),
        "has_tailwind": use_tailwind,
        "has_typescript": use_typescript,
        "optimization_level": optimization_level,
        "llm_token_usage": llm_result.token_usage,
        "generation_time_ms": int((datetime.utcnow() - start_time).total_seconds() * 1000),
        "generation_method": "ai",
    }

    return {
        "files": files,
        "folder_structure": folder_structure,
        "stats": generation_stats,
    }


async def generate_code_streaming(
    figma_data: Dict[str, Any],
    project_id: str,
    frame_ids: List[str],
    framework: str = "react",
    use_typescript: bool = True,
    use_tailwind: bool = True,
) -> AsyncGenerator[StreamEvent, None]:
    """
    Stream the code generation process for real-time UI updates.
    Yields progress events, logs, and file entries as they're generated.
    """
    yield StreamEvent(
        type="progress",
        data={"step": 1, "message": "Analyzing Figma design...", "percentage": 5},
        done=False,
    )

    components = detect_components(figma_data)
    if frame_ids:
        components = [c for c in components if c.get('id') in frame_ids]

    yield StreamEvent(
        type="progress",
        data={
            "step": 2,
            "message": f"Detected {len(components)} components. Building AI prompt...",
            "percentage": 15,
        },
        done=False,
    )

    prompt = build_prompt(
        figma_json=figma_data,
        selected_frame_ids=frame_ids if frame_ids else None,
    )

    yield StreamEvent(
        type="progress",
        data={
            "step": 3,
            "message": f"Prompt ready (~{prompt.token_estimate} tokens). Calling LLM...",
            "percentage": 25,
        },
        done=False,
    )

    full_text = ""
    async for event in stream_generation(prompt.system_prompt, prompt.user_prompt):
        if event.type == "log":
            full_text += event.data
            yield event
        elif event.type == "file_generated":
            yield event
        elif event.type == "error":
            yield event
            return

    yield StreamEvent(
        type="progress",
        data={"step": 4, "message": "Processing generated files...", "percentage": 85},
        done=False,
    )

    files = _parse_file_output(full_text)
    files = _validate_generated_files(files, framework)
    folder_structure = _build_folder_structure(files)

    yield StreamEvent(
        type="progress",
        data={
            "step": 5,
            "message": f"Generated {len(files)} files. Generation complete!",
            "percentage": 100,
        },
        done=True,
    )

    yield StreamEvent(
        type="complete",
        data={
            "files": files,
            "folder_structure": folder_structure,
        },
        done=True,
    )


# ─── File Validation & Fixing ──────────────────────────────────────

def _validate_generated_files(files: List[Dict[str, str]], framework: str) -> List[Dict[str, str]]:
    """
    Validate and fix generated files to ensure they form a runnable project.
    Adds missing essential files if the LLM didn't generate them.
    """
    existing_paths = {f.get("path", "") for f in files}
    validated = list(files)

    if "index.html" not in existing_paths:
        validated.append({"path": "index.html", "content": _generate_index_html()})
    if "package.json" not in existing_paths:
        validated.append({"path": "package.json", "content": _generate_package_json()})
    if framework == "react" and "vite.config.ts" not in existing_paths:
        validated.append({"path": "vite.config.ts", "content": _generate_vite_config()})
    if framework == "react" and "tsconfig.json" not in existing_paths:
        validated.append({"path": "tsconfig.json", "content": _generate_tsconfig()})

    has_tailwind = any("tailwind" in f.get("content", "").lower() for f in files)
    if has_tailwind:
        if "postcss.config.js" not in existing_paths:
            validated.append({"path": "postcss.config.js", "content": _generate_postcss_config()})
        if "tailwind.config.js" not in existing_paths and "tailwind.config.ts" not in existing_paths:
            validated.append({"path": "tailwind.config.js", "content": _generate_tailwind_config()})

    if "src/main.tsx" not in existing_paths and "src/App.tsx" in existing_paths:
        validated.append({"path": "src/main.tsx", "content": _generate_main_tsx()})
    if "README.md" not in existing_paths:
        validated.append({"path": "README.md", "content": _generate_readme()})

    seen: Dict[str, int] = {}
    deduped: List[Dict[str, str]] = []
    for f in validated:
        path = f["path"]
        if path in seen:
            idx = seen[path]
            if len(f["content"]) > len(deduped[idx]["content"]):
                deduped[idx] = f
        else:
            seen[path] = len(deduped)
            deduped.append(f)

    return deduped


def _build_folder_structure(files: List[Dict[str, str]]) -> List[str]:
    """Extract folder structure from generated file paths."""
    folders: set = set()
    file_paths: set = set()

    for f in files:
        path = f.get("path", "").replace("\\", "/")
        if not path:
            continue
        file_paths.add(path)
        parts = path.split("/")
        for i in range(1, len(parts)):
            folders.add("/".join(parts[:i]))

    return sorted(folders | file_paths)


# ─── Fallback Template Generation ──────────────────────────────────

async def _fallback_generate(
    components: List[Dict[str, Any]],
    framework: str,
    use_typescript: bool,
    use_tailwind: bool,
) -> Dict[str, Any]:
    """Fallback generator when LLM is unavailable. Produces a basic but functional project."""
    files = []

    files.append({"path": "index.html", "content": _generate_index_html()})
    files.append({"path": "package.json", "content": _generate_package_json()})

    if framework == "react":
        files.append({"path": "vite.config.ts", "content": _generate_vite_config()})
        files.append({"path": "tsconfig.json", "content": _generate_tsconfig()})
        files.append({"path": "postcss.config.js", "content": _generate_postcss_config()})
        files.append({"path": "tailwind.config.js", "content": _generate_tailwind_config()})

    files.append({"path": "README.md", "content": _generate_readme()})
    files.append({"path": "src/main.tsx", "content": _generate_main_tsx()})
    files.append({"path": "src/App.tsx", "content": _generate_app_tsx()})
    files.append({"path": "src/lib/utils.ts", "content": _generate_utils()})
    files.append({"path": "src/styles/globals.css", "content": _generate_globals_css()})
    files.append({"path": "src/layouts/RootLayout.tsx", "content": _generate_root_layout()})
    files.append({"path": "src/pages/HomePage.tsx", "content": _generate_home_page(components)})
    files.append({"path": "src/pages/NotFoundPage.tsx", "content": _generate_not_found()})
    files.append({"path": "src/contexts/ThemeContext.tsx", "content": _generate_theme_context()})
    files.append({"path": "src/components/ui/button.tsx", "content": _generate_shadcn_button()})
    files.append({"path": "src/components/ui/card.tsx", "content": _generate_shadcn_card()})

    folder_structure = _build_folder_structure(files)
    comp_types = Counter(c.get('type', 'unknown') for c in components)

    return {
        "files": files,
        "folder_structure": folder_structure,
        "stats": {
            "total_components": len(components),
            "files_generated": len(files),
            "component_breakdown": dict(comp_types),
            "has_tailwind": use_tailwind,
            "has_typescript": use_typescript,
            "generation_method": "fallback",
        },
    }


# ─── Optimization ──────────────────────────────────────────────────

async def optimize_generation(
    previous_generation: Dict[str, Any],
    improvement_type: str,
    framework: str = "react",
) -> Dict[str, Any]:
    """Optimize or regenerate previously generated code using LLM."""
    files = previous_generation.get('files', [])
    current_content = ""
    for f in files:
        current_content += f"FILE: {f['path']}\n```\n{f['content']}\n```\n\n"

    system_prompt = f"""You are a Principal Frontend Engineer reviewing and optimizing generated React code.

Current improvement request: {improvement_type}

Apply these optimizations and return the complete updated files using the same FILE: path format.

Return ALL files that need changes."""

    user_prompt = f"Optimize the following code for '{improvement_type}':\n\n{current_content[:30000]}"

    llm_result = await call_llm_with_retry(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    if llm_result.success and llm_result.files:
        optimized = llm_result.files
    else:
        optimized = _apply_rule_optimizations(files, improvement_type)

    return {
        "files": optimized,
        "folder_structure": previous_generation.get("folder_structure", []),
        "stats": {
            **previous_generation.get("stats", {}),
            "optimized": True,
            "improvement_type": improvement_type,
            "optimization_method": "ai" if llm_result.success else "rule",
        },
    }


def _apply_rule_optimizations(
    files: List[Dict[str, str]],
    improvement_type: str,
) -> List[Dict[str, str]]:
    """Apply rule-based optimizations as fallback."""
    optimized = []
    for f in files:
        content = f["content"]
        path = f["path"]

        if improvement_type == "accessibility":
            content = content.replace('<nav ', '<nav aria-label="Navigation" ')
            content = content.replace('<button ', '<button type="button" ')
            content = re.sub(r'<img ', '<img alt="" ', content)
            content = content.replace(
                'transition-colors',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )

        elif improvement_type == "responsiveness":
            content = content.replace('w-full', 'w-full sm:w-auto lg:w-full')
            content = content.replace('flex-col', 'flex-col md:flex-row lg:flex-col')
            content = content.replace('px-6', 'px-4 sm:px-6 lg:px-8')
            content = content.replace('py-8', 'py-6 sm:py-8 lg:py-12')

        elif improvement_type == "tailwind":
            content = re.sub(r'style=\{.*?\}', '', content)

        optimized.append({"path": path, "content": content})

    return optimized


# ─── Export ────────────────────────────────────────────────────────

async def export_code(
    generation: Dict[str, Any],
    export_format: str,
) -> Dict[str, Any]:
    """Prepare generated code for export."""
    files = generation.get('files', [])
    folder_structure = generation.get('folder_structure', [])

    if export_format == "html":
        html_content = (
            '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
            '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            '<title>Generated Design</title>\n'
            '<script src="https://cdn.tailwindcss.com"></script>\n</head>\n'
            '<body class="bg-background text-foreground">\n<div id="root">\n'
        )
        for f in files:
            if f["path"].endswith((".tsx", ".jsx", ".html")):
                body_match = re.search(r'return\s*\((.*?)\);', f["content"], re.DOTALL)
                if body_match:
                    html_content += body_match.group(1) + "\n"
        html_content += "</div>\n</body>\n</html>"
        files = [{"path": "index.html", "content": html_content}]

    return {
        "files": files,
        "folder_structure": folder_structure,
        "export_format": export_format,
        "total_files": len(files),
    }


# ─── Template Generators ───────────────────────────────────────────

def _generate_index_html() -> str:
    return (
        '<!DOCTYPE html>\n'
        '<html lang="en">\n'
        '  <head>\n'
        '    <meta charset="UTF-8" />\n'
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
        '    <title>Designify AI Generated</title>\n'
        '    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n'
        '  </head>\n'
        '  <body>\n'
        '    <div id="root"></div>\n'
        '    <script type="module" src="/src/main.tsx"></script>\n'
        '  </body>\n'
        '</html>'
    )


def _generate_package_json() -> str:
    return json.dumps({
        "name": "designify-ai-generated",
        "private": True,
        "version": "0.1.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "tsc && vite build",
            "preview": "vite preview",
            "lint": "eslint ."
        },
        "dependencies": {
            "react": "^18.3.1",
            "react-dom": "^18.3.1",
            "react-router-dom": "^6.26.1",
            "framer-motion": "^11.3.22",
            "lucide-react": "^0.468.0",
            "clsx": "^2.1.1",
            "tailwind-merge": "^2.4.1",
            "react-hook-form": "^7.53.0",
            "@hookform/resolvers": "^3.9.0",
            "zod": "^3.23.8",
            "recharts": "^2.12.7",
            "class-variance-authority": "^0.7.0"
        },
        "devDependencies": {
            "@types/react": "^18.3.5",
            "@types/react-dom": "^18.3.0",
            "@vitejs/plugin-react": "^4.3.1",
            "autoprefixer": "^10.4.20",
            "eslint": "^9.9.1",
            "eslint-plugin-react": "^7.34.0",
            "eslint-plugin-react-hooks": "^5.1.0-rc.0",
            "globals": "^15.9.0",
            "postcss": "^8.4.41",
            "tailwindcss": "^3.4.10",
            "typescript": "^5.5.4",
            "vite": "^5.4.2"
        }
    }, indent=2)


def _generate_vite_config() -> str:
    return (
        "import { defineConfig } from 'vite'\n"
        "import react from '@vitejs/plugin-react'\n"
        "import path from 'path'\n"
        "\n"
        "export default defineConfig({\n"
        "  plugins: [react()],\n"
        "  resolve: {\n"
        "    alias: {\n"
        "      '@': path.resolve(__dirname, './src'),\n"
        "    },\n"
        "  },\n"
        "})"
    )


def _generate_tsconfig() -> str:
    return json.dumps({
        "compilerOptions": {
            "target": "ES2020",
            "useDefineForClassFields": True,
            "lib": ["DOM", "DOM.Iterable", "ES2020"],
            "allowJs": False,
            "skipLibCheck": True,
            "esModuleInterop": True,
            "allowSyntheticDefaultImports": True,
            "strict": True,
            "forceConsistentCasingInFileNames": True,
            "module": "ESNext",
            "moduleResolution": "Bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "react-jsx",
            "noEmit": True,
            "baseUrl": ".",
            "paths": {
                "@/*": ["src/*"]
            }
        },
        "include": ["src"],
        "references": [{"path": "./tsconfig.node.json"}]
    }, indent=2)


def _generate_postcss_config() -> str:
    return "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n"


def _generate_tailwind_config() -> str:
    return (
        "/** @type {import('tailwindcss').Config} */\n"
        "export default {\n"
        "  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n"
        "  darkMode: 'class',\n"
        "  theme: {\n"
        "    extend: {\n"
        "      colors: {\n"
        "        border: 'hsl(var(--border))',\n"
        "        input: 'hsl(var(--input))',\n"
        "        ring: 'hsl(var(--ring))',\n"
        "        background: 'hsl(var(--background))',\n"
        "        foreground: 'hsl(var(--foreground))',\n"
        "        primary: {\n"
        "          DEFAULT: 'hsl(var(--primary))',\n"
        "          foreground: 'hsl(var(--primary-foreground))',\n"
        "        },\n"
        "        secondary: {\n"
        "          DEFAULT: 'hsl(var(--secondary))',\n"
        "          foreground: 'hsl(var(--secondary-foreground))',\n"
        "        },\n"
        "        destructive: {\n"
        "          DEFAULT: 'hsl(var(--destructive))',\n"
        "          foreground: 'hsl(var(--destructive-foreground))',\n"
        "        },\n"
        "        muted: {\n"
        "          DEFAULT: 'hsl(var(--muted))',\n"
        "          foreground: 'hsl(var(--muted-foreground))',\n"
        "        },\n"
        "        accent: {\n"
        "          DEFAULT: 'hsl(var(--accent))',\n"
        "          foreground: 'hsl(var(--accent-foreground))',\n"
        "        },\n"
        "        card: {\n"
        "          DEFAULT: 'hsl(var(--card))',\n"
        "          foreground: 'hsl(var(--card-foreground))',\n"
        "        },\n"
        "      },\n"
        "      borderRadius: {\n"
        "        lg: 'var(--radius)',\n"
        "        md: 'calc(var(--radius) - 2px)',\n"
        "        sm: 'calc(var(--radius) - 4px)',\n"
        "      },\n"
        "    },\n"
        "  },\n"
        "  plugins: [],\n"
        "}"
    )


def _generate_main_tsx() -> str:
    return (
        "import React from 'react'\n"
        "import ReactDOM from 'react-dom/client'\n"
        "import { BrowserRouter } from 'react-router-dom'\n"
        "import App from './App'\n"
        "import './styles/globals.css'\n"
        "\n"
        "ReactDOM.createRoot(document.getElementById('root')!).render(\n"
        "  <React.StrictMode>\n"
        "    <BrowserRouter>\n"
        "      <App />\n"
        "    </BrowserRouter>\n"
        "  </React.StrictMode>,\n"
        ")"
    )


def _generate_app_tsx() -> str:
    return (
        "import React from 'react'\n"
        "import { Routes, Route } from 'react-router-dom'\n"
        "import { ThemeProvider } from './contexts/ThemeContext'\n"
        "import { RootLayout } from './layouts/RootLayout'\n"
        "import HomePage from './pages/HomePage'\n"
        "import NotFoundPage from './pages/NotFoundPage'\n"
        "\n"
        "export default function App() {\n"
        "  return (\n"
        "    <ThemeProvider>\n"
        "      <RootLayout>\n"
        "        <Routes>\n"
        "          <Route path=\"/\" element={<HomePage />} />\n"
        "          <Route path=\"*\" element={<NotFoundPage />} />\n"
        "        </Routes>\n"
        "      </RootLayout>\n"
        "    </ThemeProvider>\n"
        "  )\n"
        "}"
    )


def _generate_root_layout() -> str:
    return (
        "import React from 'react'\n"
        "\n"
        "interface RootLayoutProps {\n"
        "  children: React.ReactNode\n"
        "}\n"
        "\n"
        "export function RootLayout({ children }: RootLayoutProps) {\n"
        "  return (\n"
        '    <div className="relative min-h-screen bg-background text-foreground">\n'
        "      <main className=\"relative z-10\">{children}</main>\n"
        "    </div>\n"
        "  )\n"
        "}"
    )


def _generate_utils() -> str:
    return (
        "import { clsx, type ClassValue } from 'clsx'\n"
        "import { twMerge } from 'tailwind-merge'\n"
        "\n"
        "export function cn(...inputs: ClassValue[]) {\n"
        "  return twMerge(clsx(inputs))\n"
        "}"
    )


def _generate_globals_css() -> str:
    return (
        '@tailwind base;\n'
        '@tailwind components;\n'
        '@tailwind utilities;\n'
        '\n'
        '@layer base {\n'
        '  :root {\n'
        '    --background: 0 0% 100%;\n'
        '    --foreground: 222.2 84% 4.9%;\n'
        '    --card: 0 0% 100%;\n'
        '    --card-foreground: 222.2 84% 4.9%;\n'
        '    --primary: 221.2 83.2% 53.3%;\n'
        '    --primary-foreground: 210 40% 98%;\n'
        '    --secondary: 210 40% 96.1%;\n'
        '    --secondary-foreground: 222.2 47.4% 11.2%;\n'
        '    --muted: 210 40% 96.1%;\n'
        '    --muted-foreground: 215.4 16.3% 46.9%;\n'
        '    --accent: 210 40% 96.1%;\n'
        '    --accent-foreground: 222.2 47.4% 11.2%;\n'
        '    --destructive: 0 84.2% 60.2%;\n'
        '    --destructive-foreground: 210 40% 98%;\n'
        '    --border: 214.3 31.8% 91.4%;\n'
        '    --input: 214.3 31.8% 91.4%;\n'
        '    --ring: 221.2 83.2% 53.3%;\n'
        '    --radius: 0.5rem;\n'
        '  }\n'
        '\n'
        '  .dark {\n'
        '    --background: 222.2 84% 4.9%;\n'
        '    --foreground: 210 40% 98%;\n'
        '    --card: 222.2 84% 4.9%;\n'
        '    --card-foreground: 210 40% 98%;\n'
        '    --primary: 217.2 91.2% 59.8%;\n'
        '    --primary-foreground: 222.2 47.4% 11.2%;\n'
        '    --secondary: 217.2 32.6% 17.5%;\n'
        '    --secondary-foreground: 210 40% 98%;\n'
        '    --muted: 217.2 32.6% 17.5%;\n'
        '    --muted-foreground: 215 20.2% 65.1%;\n'
        '    --accent: 217.2 32.6% 17.5%;\n'
        '    --accent-foreground: 210 40% 98%;\n'
        '    --destructive: 0 62.8% 30.6%;\n'
        '    --destructive-foreground: 210 40% 98%;\n'
        '    --border: 217.2 32.6% 17.5%;\n'
        '    --input: 217.2 32.6% 17.5%;\n'
        '    --ring: 224.3 76.3% 48%;\n'
        '  }\n'
        '}\n'
        '\n'
        '@layer base {\n'
        '  * {\n'
        '    @apply border-border;\n'
        '  }\n'
        '  body {\n'
        '    @apply bg-background text-foreground;\n'
        '    font-feature-settings: "rlig" 1, "calt" 1;\n'
        '  }\n'
        '}'
    )


def _generate_theme_context() -> str:
    return (
        "import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'\n"
        "\n"
        "type Theme = 'light' | 'dark'\n"
        "\n"
        "interface ThemeContextValue {\n"
        "  theme: Theme\n"
        "  toggleTheme: () => void\n"
        "}\n"
        "\n"
        "const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)\n"
        "\n"
        "export function ThemeProvider({ children }: { children: React.ReactNode }) {\n"
        "  const [theme, setTheme] = useState<Theme>(() => {\n"
        "    if (typeof window !== 'undefined') {\n"
        "      const stored = localStorage.getItem('theme')\n"
        "      if (stored === 'light' || stored === 'dark') return stored as Theme\n"
        "      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'\n"
        "    }\n"
        "    return 'dark'\n"
        "  })\n"
        "\n"
        "  useEffect(() => {\n"
        "    const root = document.documentElement\n"
        "    root.classList.remove('light', 'dark')\n"
        "    root.classList.add(theme)\n"
        "    localStorage.setItem('theme', theme)\n"
        "  }, [theme])\n"
        "\n"
        "  const value = useMemo(\n"
        "    () => ({\n"
        "      theme,\n"
        "      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),\n"
        "    }),\n"
        "    [theme],\n"
        "  )\n"
        "\n"
        "  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>\n"
        "}\n"
        "\n"
        "export function useTheme() {\n"
        "  const context = useContext(ThemeContext)\n"
        "  if (!context) throw new Error('useTheme must be used within ThemeProvider')\n"
        "  return context\n"
        "}"
    )


def _generate_home_page(components: List[Dict[str, Any]]) -> str:
    """Generate a basic home page for fallback mode."""
    component_names = []
    for comp in components:
        name = comp.get('name', 'Component')
        clean = re.sub(r'[^a-zA-Z0-9]', '', name)
        if clean and clean not in component_names:
            component_names.append(clean)

    sections_lines = []
    if component_names:
        for name in component_names[:6]:
            sections_lines.append(
                f'          <div key="{name}" className="rounded-lg border p-6 shadow-sm">'
            )
            sections_lines.append(
                f'            <h3 className="font-semibold">{name}</h3>'
            )
            sections_lines.append(
                '            <p className="text-sm text-muted-foreground mt-1">'
                'Component from Figma design</p>'
            )
            sections_lines.append('          </div>')
    else:
        sections_lines.append(
            '          <div className="rounded-lg border p-8 text-center">'
        )
        sections_lines.append(
            '            <p className="text-muted-foreground">'
            'No components detected. Import a Figma file to generate components.</p>'
        )
        sections_lines.append('          </div>')

    sections_str = "\n".join(sections_lines)

    return (
        "import React from 'react'\n"
        "import { motion } from 'framer-motion'\n"
        "\n"
        "export default function HomePage() {\n"
        "  return (\n"
        '    <div className="container mx-auto px-4 py-8">\n'
        "      <motion.div\n"
        "        initial={{ opacity: 0, y: 20 }}\n"
        "        animate={{ opacity: 1, y: 0 }}\n"
        "        transition={{ duration: 0.5 }}\n"
        '        className="space-y-8"\n'
        "      >\n"
        '        <h1 className="text-4xl font-bold">Designify AI Generated</h1>\n'
        '        <p className="text-muted-foreground">\n'
        "          This page was generated from your Figma design.\n"
        "          The AI-powered generation will create a complete, production-ready version.\n"
        "        </p>\n"
        f"{sections_str}\n"
        "      </motion.div>\n"
        "    </div>\n"
        "  )\n"
        "}"
    )


def _generate_not_found() -> str:
    return (
        "import React from 'react'\n"
        "import { Link } from 'react-router-dom'\n"
        "import { motion } from 'framer-motion'\n"
        "\n"
        "export default function NotFoundPage() {\n"
        "  return (\n"
        '    <div className="flex min-h-screen items-center justify-center">\n'
        "      <motion.div\n"
        "        initial={{ opacity: 0, scale: 0.9 }}\n"
        "        animate={{ opacity: 1, scale: 1 }}\n"
        '        className="text-center"\n'
        "      >\n"
        '        <h1 className="text-6xl font-bold text-primary">404</h1>\n'
        '        <p className="mt-4 text-xl text-muted-foreground">Page not found</p>\n'
        "        <Link\n"
        '          to="/"\n'
        "          className=\"mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90\"\n"
        "        >\n"
        "          Go Home\n"
        "        </Link>\n"
        "      </motion.div>\n"
        "    </div>\n"
        "  )\n"
        "}"
    )


def _generate_readme() -> str:
    return (
        "# Designify AI Generated\n\n"
        "Generated by Designify AI from Figma design.\n\n"
        "## Quick Start\n\n"
        "```bash\nnpm install\nnpm run dev\n```\n\n"
        "## Build\n\n"
        "```bash\nnpm run build\nnpm run preview\n```\n\n"
        "## Tech Stack\n\n"
        "- React 18\n- TypeScript\n- Vite\n- Tailwind CSS\n- Framer Motion\n- Lucide React\n- React Router v6\n"
    )


def _generate_shadcn_button() -> str:
    return (
        "import * as React from 'react'\n"
        "import { cva, type VariantProps } from 'class-variance-authority'\n"
        "import { cn } from '@/lib/utils'\n"
        "\n"
        "const buttonVariants = cva(\n"
        "  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium "
        "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 "
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',\n"
        "  {\n"
        "    variants: {\n"
        "      variant: {\n"
        "        default: 'bg-primary text-primary-foreground hover:bg-primary/90',\n"
        "        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',\n"
        "        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',\n"
        "        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',\n"
        "        ghost: 'hover:bg-accent hover:text-accent-foreground',\n"
        "        link: 'text-primary underline-offset-4 hover:underline',\n"
        "      },\n"
        "      size: {\n"
        "        default: 'h-10 px-4 py-2',\n"
        "        sm: 'h-9 rounded-md px-3',\n"
        "        lg: 'h-11 rounded-md px-8',\n"
        "        icon: 'h-10 w-10',\n"
        "      },\n"
        "    },\n"
        "    defaultVariants: {\n"
        "      variant: 'default',\n"
        "      size: 'default',\n"
        "    },\n"
        "  }\n"
        ")\n"
        "\n"
        "export interface ButtonProps\n"
        "  extends React.ButtonHTMLAttributes<HTMLButtonElement>,\n"
        "    VariantProps<typeof buttonVariants> {}\n"
        "\n"
        "const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(\n"
        "  ({ className, variant, size, ...props }, ref) => {\n"
        "    return (\n"
        "      <button\n"
        "        className={cn(buttonVariants({ variant, size, className }))}\n"
        "        ref={ref}\n"
        "        {...props}\n"
        "      />\n"
        "    )\n"
        "  }\n"
        ")\n"
        "Button.displayName = 'Button'\n"
        "\n"
        "export { Button, buttonVariants }\n"
        "export default Button\n"
    )


def _generate_shadcn_card() -> str:
    return (
        "import * as React from 'react'\n"
        "import { cn } from '@/lib/utils'\n"
        "\n"
        "const Card = React.forwardRef<\n"
        "  HTMLDivElement,\n"
        "  React.HTMLAttributes<HTMLDivElement>\n"
        ">(({ className, ...props }, ref) => (\n"
        "  <div\n"
        "    ref={ref}\n"
        "    className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}\n"
        "    {...props}\n"
        "  />\n"
        "))\n"
        "Card.displayName = 'Card'\n"
        "\n"
        "const CardHeader = React.forwardRef<\n"
        "  HTMLDivElement,\n"
        "  React.HTMLAttributes<HTMLDivElement>\n"
        ">(({ className, ...props }, ref) => (\n"
        "  <div\n"
        "    ref={ref}\n"
        "    className={cn('flex flex-col space-y-1.5 p-6', className)}\n"
        "    {...props}\n"
        "  />\n"
        "))\n"
        "CardHeader.displayName = 'CardHeader'\n"
        "\n"
        "const CardTitle = React.forwardRef<\n"
        "  HTMLParagraphElement,\n"
        "  React.HTMLAttributes<HTMLHeadingElement>\n"
        ">(({ className, ...props }, ref) => (\n"
        "  <h3\n"
        "    ref={ref}\n"
        "    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}\n"
        "    {...props}\n"
        "  />\n"
        "))\n"
        "CardTitle.displayName = 'CardTitle'\n"
        "\n"
        "const CardDescription = React.forwardRef<\n"
        "  HTMLParagraphElement,\n"
        "  React.HTMLAttributes<HTMLParagraphElement>\n"
        ">(({ className, ...props }, ref) => (\n"
        "  <p\n"
        "    ref={ref}\n"
        "    className={cn('text-sm text-muted-foreground', className)}\n"
        "    {...props}\n"
        "  />\n"
        "))\n"
        "CardDescription.displayName = 'CardDescription'\n"
        "\n"
        "const CardContent = React.forwardRef<\n"
        "  HTMLDivElement,\n"
        "  React.HTMLAttributes<HTMLDivElement>\n"
        ">(({ className, ...props }, ref) => (\n"
        "  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />\n"
        "))\n"
        "CardContent.displayName = 'CardContent'\n"
        "\n"
        "const CardFooter = React.forwardRef<\n"
        "  HTMLDivElement,\n"
        "  React.HTMLAttributes<HTMLDivElement>\n"
        ">(({ className, ...props }, ref) => (\n"
        "  <div\n"
        "    ref={ref}\n"
        "    className={cn('flex items-center p-6 pt-0', className)}\n"
        "    {...props}\n"
        "  />\n"
        "))\n"
        "CardFooter.displayName = 'CardFooter'\n"
        "\n"
        "export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }\n"
        "export default Card\n"
    )

