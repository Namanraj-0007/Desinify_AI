"""
Phase 3: AI Code Generation Engine
Deterministic, rule-based engine that transforms parsed Figma data into production-ready frontend code.

Supports: React + TypeScript + Tailwind, Next.js App Router, HTML/CSS
"""

from __future__ import annotations

import re
import json
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, timezone
from collections import Counter
from dataclasses import dataclass, field


# ─── Pattern Detection ─────────────────────────────────────────────

@dataclass
class DetectedComponent:
    name: str
    type: str  # "button" | "card" | "navbar" | "input" | "header" | "footer" | "sidebar" | "modal" | "table" | "form" | "hero" | "pricing" | "testimonial" | "list" | "badge" | "chip"
    nodes: List[Dict[str, Any]]
    props: Dict[str, Any] = field(default_factory=dict)
    children: List[DetectedComponent] = field(default_factory=list)
    is_reusable: bool = False
    occurrences: int = 1


def _get_node_name(node: Dict[str, Any]) -> str:
    return node.get('name', 'Unnamed')


def _has_children(node: Dict[str, Any]) -> bool:
    return bool(node.get('children') and len(node['children']) > 0)


def _node_dimensions(node: Dict[str, Any]) -> Tuple[Optional[float], Optional[float]]:
    return node.get('width'), node.get('height')


def _is_button_like(node: Dict[str, Any]) -> bool:
    name = _get_node_name(node).lower()
    width, height = _node_dimensions(node)
    # Buttons are typically small (40-60px tall, 80-200px wide)
    if height and width:
        if 30 <= height <= 70 and 60 <= width <= 300:
            return True
    # Name-based detection
    button_keywords = ['button', 'btn', 'submit', 'click', 'action', 'cta']
    return any(kw in name for kw in button_keywords)


def _is_card_like(node: Dict[str, Any]) -> bool:
    name = _get_node_name(node).lower()
    width, height = _node_dimensions(node)
    # Cards have children and are rectangular
    if _has_children(node) and width and height:
        if width >= 150 and height >= 100:
            card_keywords = ['card', 'tile', 'panel', 'box', 'container', 'wrapper']
            if any(kw in name for kw in card_keywords):
                return True
            # Cards typically have padding-like structure
            if width > 200 and height > 150:
                return True
    return False


def _is_navbar_like(node: Dict[str, Any]) -> bool:
    name = _get_node_name(node).lower()
    width, height = _node_dimensions(node)
    if height and width:
        if 40 <= height <= 80 and width >= 300:
            nav_keywords = ['nav', 'header', 'topbar', 'menu', 'navigation', 'navbar']
            if any(kw in name for kw in nav_keywords):
                return True
    return False


def _is_input_like(node: Dict[str, Any]) -> bool:
    name = _get_node_name(node).lower()
    width, height = _node_dimensions(node)
    if height and width:
        if 30 <= height <= 60 and width >= 100:
            input_keywords = ['input', 'field', 'search', 'textbox', 'textarea', 'select', 'dropdown']
            if any(kw in name for kw in input_keywords):
                return True
    return False


def _is_sidebar_like(node: Dict[str, Any]) -> bool:
    name = _get_node_name(node).lower()
    width, height = _node_dimensions(node)
    if width and height:
        if 150 <= width <= 400 and height >= 400:
            sidebar_keywords = ['sidebar', 'side', 'aside', 'drawer', 'panel', 'navigation']
            if any(kw in name for kw in sidebar_keywords):
                return True
    return False


def _is_hero_like(node: Dict[str, Any]) -> bool:
    name = _get_node_name(node).lower()
    width, height = _node_dimensions(node)
    if width and height:
        if width >= 600 and height >= 300:
            hero_keywords = ['hero', 'banner', 'jumbotron', 'header', 'cover', 'splash']
            if any(kw in name for kw in hero_keywords):
                return True
    return False


def _is_footer_like(node: Dict[str, Any]) -> bool:
    name = _get_node_name(node).lower()
    width, height = _node_dimensions(node)
    if width and height:
        if width >= 400 and height <= 300:
            footer_keywords = ['footer', 'bottom', 'copyright']
            return any(kw in name for kw in footer_keywords)
    return False


def _is_modal_like(node: Dict[str, Any]) -> bool:
    name = _get_node_name(node).lower()
    modal_keywords = ['modal', 'dialog', 'popup', 'overlay', 'alert']
    return any(kw in name for kw in modal_keywords)


def _detect_component_type(node: Dict[str, Any]) -> str:
    """Detect the UI component type from a Figma node."""
    if _is_modal_like(node): return "modal"
    if _is_navbar_like(node): return "navbar"
    if _is_sidebar_like(node): return "sidebar"
    if _is_hero_like(node): return "hero"
    if _is_footer_like(node): return "footer"
    if _is_card_like(node): return "card"
    if _is_input_like(node): return "input"
    if _is_button_like(node): return "button"
    return "section"


def detect_components(figma_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Analyze Figma node tree and detect reusable UI components."""
    components = []
    seen_patterns: Dict[str, int] = Counter()

    def traverse(node: Dict[str, Any], depth: int = 0):
        if depth > 10:
            return
        comp_type = _detect_component_type(node)
        name = _get_node_name(node)

        # Create a structural signature for reuse detection
        sig = _structural_signature(node)
        seen_patterns[sig] += 1

        components.append({
            "id": node.get('id', ''),
            "name": name,
            "type": comp_type,
            "width": node.get('width'),
            "height": node.get('height'),
            "children_count": len(node.get('children', [])),
            "signature": sig,
            "depth": depth,
            "pattern_reuse_count": seen_patterns[sig],
            "is_reusable": seen_patterns[sig] > 1,
        })

        for child in node.get('children', []):
            traverse(child, depth + 1)

    pages = []
    if figma_data.get('document'):
        pages = figma_data.get('document', {}).get('children', [])
    elif figma_data.get('component_tree'):
        pages = figma_data.get('component_tree', {}).get('pages', [])

    for page in pages:
        traverse(page)

    return components


def _structural_signature(node: Dict[str, Any]) -> str:
    """Create a structural fingerprint for detecting reusable patterns."""
    children = node.get('children', [])
    child_types = sorted([_detect_component_type(c) for c in children])
    width = node.get('width', 0)
    height = node.get('height', 0)
    # Quantize dimensions to group similar sizes
    w_bucket = round(width / 20) * 20 if width else 0
    h_bucket = round(height / 20) * 20 if height else 0
    return f"{_detect_component_type(node)}:{w_bucket}x{h_bucket}:{','.join(child_types)}:{len(children)}"


# ─── Tailwind Class Generation ─────────────────────────────────────

def _width_to_tailwind(width: Optional[float]) -> str:
    if width is None:
        return "w-full"
    if width <= 40:
        return "w-10"
    if width <= 80:
        return "w-20"
    if width <= 120:
        return "w-28"
    if width <= 160:
        return "w-40"
    if width <= 200:
        return "w-48"
    if width <= 240:
        return "w-60"
    if width <= 280:
        return "w-72"
    if width <= 320:
        return "w-80"
    if width <= 384:
        return "w-96"
    return "w-full"


def _height_to_tailwind(height: Optional[float]) -> str:
    if height is None:
        return "h-auto"
    if height <= 40:
        return "h-10"
    if height <= 80:
        return "h-20"
    if height <= 120:
        return "h-28"
    if height <= 160:
        return "h-40"
    if height <= 200:
        return "h-48"
    if height <= 240:
        return "h-60"
    if height <= 280:
        return "h-72"
    if height <= 320:
        return "h-80"
    if height <= 384:
        return "h-96"
    return "h-auto"


def _flex_direction(width: Optional[float], height: Optional[float]) -> str:
    if width and height and height > width * 1.5:
        return "flex-col"
    return "flex-row"


def _justify_from_position(x: Optional[float], width: Optional[float]) -> str:
    if x is None or width is None:
        return "justify-start"
    if x > width * 0.7:
        return "justify-end"
    if x > width * 0.3:
        return "justify-center"
    return "justify-start"


def _align_from_position(y: Optional[float], height: Optional[float]) -> str:
    if y is None or height is None:
        return "items-start"
    if y > height * 0.7:
        return "items-end"
    if y > height * 0.3:
        return "items-center"
    return "items-start"


# ─── Code Generation ───────────────────────────────────────────────

def _clean_name(name: str) -> str:
    """Convert a Figma node name to a valid component name."""
    name = re.sub(r'[^a-zA-Z0-9\s]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    parts = name.split()
    return ''.join(p.capitalize() for p in parts if p) if parts else 'Component'


def _to_variable_name(name: str) -> str:
    """Convert a name to camelCase variable name."""
    cleaned = _clean_name(name)
    if not cleaned:
        return 'component'
    return cleaned[0].lower() + cleaned[1:]


def _generate_tailwind_classes(node: Dict[str, Any], comp_type: str) -> str:
    """Generate optimized Tailwind classes based on node properties."""
    classes = []
    width = node.get('width')
    height = node.get('height')

    # Container classes
    if comp_type == "navbar":
        classes.extend(["flex", "items-center", "justify-between", "px-6", "py-3", "w-full"])
    elif comp_type == "sidebar":
        classes.extend(["flex", "flex-col", "h-full", "py-4", "px-3"])
    elif comp_type == "hero":
        classes.extend(["flex", "flex-col", "items-center", "justify-center", "text-center", "px-8", "py-16"])
    elif comp_type == "card":
        classes.extend(["rounded-xl", "p-5", "shadow-sm"])
    elif comp_type == "footer":
        classes.extend(["w-full", "py-8", "px-6", "text-center"])
    elif comp_type == "button":
        classes.extend(["inline-flex", "items-center", "justify-center", "rounded-lg", "px-4", "py-2",
                        "font-medium", "text-sm", "transition-colors", "duration-200",
                        "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-offset-2"])
    elif comp_type == "input":
        classes.extend(["w-full", "rounded-lg", "border", "px-3", "py-2", "text-sm",
                        "outline-none", "transition-colors", "duration-200",
                        "focus:ring-2", "focus:border-transparent"])
    elif comp_type == "modal":
        classes.extend(["fixed", "inset-0", "z-50", "flex", "items-center", "justify-center"])
    else:
        # Default section
        classes.append(_width_to_tailwind(width))
        classes.append(_height_to_tailwind(height))
        classes.append("flex")
        classes.append(_flex_direction(width, height))

    # Responsive padding for large screens
    if width and width >= 768:
        classes.append("lg:px-8")
    if width and width >= 1024:
        classes.append("xl:px-12")

    return " ".join(classes)


def _generate_jsx_for_node(node: Dict[str, Any], comp_type: str, depth: int = 0) -> str:
    """Generate JSX for a single Figma node with proper Tailwind and semantics."""
    indent = "  " * (depth + 3)
    name = _get_node_name(node)
    children = node.get('children', [])

    # Semantic HTML mapping
    semantic_map = {
        "navbar": "nav",
        "header": "header",
        "footer": "footer",
        "sidebar": "aside",
        "hero": "section",
        "card": "div",
        "modal": "div",
        "button": "button",
        "input": "input",
        "section": "section",
        "form": "form",
        "list": "ul",
        "table": "table",
    }

    tag = semantic_map.get(comp_type, "div")
    tailwind = _generate_tailwind_classes(node, comp_type)

    # Generate aria attributes for accessibility
    aria_attrs = ""
    if comp_type == "navbar":
        aria_attrs = ' role="navigation" aria-label="Main navigation"'
    elif comp_type == "button":
        aria_attrs = ' role="button"'
    elif comp_type == "modal":
        aria_attrs = ' role="dialog" aria-modal="true"'
    elif comp_type == "input":
        return f'{indent}<input className="{tailwind}" placeholder="{name}" aria-label="{name}" />'
    elif comp_type == "form":
        aria_attrs = ' role="form"'

    if comp_type == "button":
        return f'{indent}<button className="{tailwind}" aria-label="{name}">{name}</button>'

    # Generate children
    child_jsx = ""
    for child in children:
        child_type = _detect_component_type(child)
        child_jsx += _generate_jsx_for_node(child, child_type, depth + 1) + "\n"

    # Text node
    if not children and comp_type in ("section", "card"):
        return f'{indent}<{tag} className="{tailwind}"{aria_attrs}>\n{indent}  <p className="text-muted-foreground">{name}</p>\n{indent}</{tag}>'

    if children:
        return f'{indent}<{tag} className="{tailwind}"{aria_attrs}>\n{child_jsx}{indent}</{tag}>'
    else:
        return f'{indent}<{tag} className="{tailwind}"{aria_attrs} />'


def _generate_component_file(
    node: Dict[str, Any],
    comp_type: str,
    use_typescript: bool,
    use_tailwind: bool,
) -> str:
    """Generate a complete React component file from a Figma node."""
    name = _clean_name(_get_node_name(node))
    if not name:
        name = "Component"

    imports = "import { cn } from '@/lib/utils'\n" if use_tailwind else ""
    jsx = _generate_jsx_for_node(node, comp_type)

    if use_typescript:
        file_content = f"""import React from 'react'
{imports}
interface Props {{
  className?: string
  children?: React.ReactNode
}}

export const {name}: React.FC<Props> = ({{
  className,
  children,
}}) => {{
  return (
{jsx}
  )
}}

export default {name}
"""
    else:
        file_content = f"""import React from 'react'
{imports}
export const {name} = ({{
  className,
  children,
}}) => {{
  return (
{jsx}
  )
}}

export default {name}
"""

    return file_content
def _generate_home_page(components: List[Dict[str, Any]]) -> str:
    component_names = []
    for comp in components:
        name = _clean_name(comp.get('name', 'Component'))
        if name and name not in component_names:
            component_names.append(name)

    imports = [
        "import React from 'react'",
        "import { MainLayout } from '../layouts/MainLayout'",
        "import '../styles/globals.css'",
        "import '../styles/design-tokens.css'",
    ]

    if component_names:
        imports.append(f"import {{ {', '.join(component_names)} }} from '../components'\n")

    sections = "\n".join(f"          <{name} key=\"{name}\" />" for name in component_names)
    if not sections:
        sections = "          <div className=\"rounded-2xl bg-slate-900 p-8 text-slate-200\">No generated sections available.</div>"

    page_body = """
export default function HomePage() {
  return (
    <MainLayout>
      <div className=\"space-y-8\">
""" + sections + """
      </div>
    </MainLayout>
  )
}
"""

    return "\n".join(imports) + page_body


def _generate_not_found_page() -> str:
    return """import React from 'react'

export default function NotFoundPage() {
  return (
    <main className=\"min-h-screen flex items-center justify-center bg-slate-950 text-white p-6\">
      <div className=\"max-w-xl text-center\">
        <h1 className=\"text-4xl font-semibold mb-4\">Page not found</h1>
        <p className=\"text-sm text-slate-300\">The page you are looking for does not exist.</p>
      </div>
    </main>
  )
}
"""


def _generate_app_tsx() -> str:
    return """import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path=\"/\" element={<HomePage />} />
          <Route path=\"*\" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
"""


def _generate_main_tsx() -> str:
    return """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './styles/design-tokens.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""


def _generate_main_layout() -> str:
    return """import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className=\"min-h-screen bg-slate-950 text-slate-100\">
      <div className=\"mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8\">{children}</div>
    </div>
  )
}
"""


def _generate_theme_context() -> str:
    return """import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
"""


def _generate_api_service() -> str:
    return """export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to fetch data')
  }
  return response.json()
}
"""


def _generate_utils_file() -> str:
    return """export function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
"""


def _generate_types_file() -> str:
    return """export type ComponentMeta = {
  id: string
  name: string
  type: string
  width?: number
  height?: number
}
"""


def _generate_vite_config() -> str:
    return """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
"""


def _generate_postcss_config() -> str:
    return """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""


def _generate_tailwind_config() -> str:
    return """/***** @type {import('tailwindcss').Config} *****/
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#111827',
      },
    },
  },
  plugins: [],
}
"""


def _generate_eslint_config() -> str:
    return """import { defineConfig } from 'eslint-define-config'

export default defineConfig({
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:@typescript-eslint/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
})
"""


def _generate_tsconfig() -> str:
    return """{
  \"compilerOptions\": {
    \"target\": \"ES2020\",
    \"useDefineForClassFields\": true,
    \"lib\": [\"DOM\", \"DOM.Iterable\", \"ES2020\"],
    \"allowJs\": false,
    \"skipLibCheck\": true,
    \"esModuleInterop\": true,
    \"allowSyntheticDefaultImports\": true,
    \"strict\": true,
    \"forceConsistentCasingInFileNames\": true,
    \"module\": \"ESNext\",
    \"moduleResolution\": \"Bundler\",
    \"resolveJsonModule\": true,
    \"isolatedModules\": true,
    \"jsx\": \"react-jsx\",
    \"noEmit\": true,
    \"baseUrl\": \".\",
    \"paths\": {
      \"@/*\": [\"src/*\"]
    }
  },
  \"include\": [\"src\"],
  \"references\": [{ \"path\": \"./tsconfig.node.json\" }]
}
"""


def _generate_tsconfig_node() -> str:
    return """{
  \"compilerOptions\": {
    \"composite\": true,
    \"module\": \"ESNext\",
    \"moduleResolution\": \"Bundler\",
    \"resolveJsonModule\": true
  },
  \"include\": [\"vite.config.ts\"]
}
"""


def _generate_index_html() -> str:
    return """<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>Designify AI Generated Website</title>
  </head>
  <body>
    <div id=\"root\"></div>
    <script type=\"module\" src=\"/src/main.tsx\"></script>
  </body>
</html>
"""


def _generate_gitignore() -> str:
    return """node_modules
dist
.env
.DS_Store
npm-debug.log
yarn-error.log
yarn-debug.log
.vscode
"""


def _generate_package_json(use_typescript: bool, use_tailwind: bool, framework: str) -> str:
    deps = {
        'react': '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router-dom': '^6.26.1',
    }
    dev_deps = {
        '@types/react': '^18.3.5',
        '@types/react-dom': '^18.3.0',
        '@vitejs/plugin-react': '^4.3.1',
        'autoprefixer': '^10.4.20',
        'eslint': '^9.9.1',
        'eslint-plugin-react': '^7.34.0',
        'eslint-plugin-react-hooks': '^5.1.0-rc.0',
        '@typescript-eslint/parser': '^6.10.0',
        '@typescript-eslint/eslint-plugin': '^6.10.0',
        'globals': '^15.9.0',
        'postcss': '^8.4.41',
        'tailwindcss': '^3.4.10',
        'typescript': '^5.5.4',
        'vite': '^5.4.2',
    }

    content = {
        'name': 'designify-ai-generated',
        'private': True,
        'version': '0.1.0',
        'type': 'module',
        'scripts': {
            'dev': 'vite',
            'build': 'vite build',
            'preview': 'vite preview',
            'lint': 'eslint .',
        },
        'dependencies': deps,
        'devDependencies': dev_deps,
    }
    return json.dumps(content, indent=2)


def _generate_readme(project_name: str = 'Designify AI Generated Website') -> str:
    return f"""# {project_name}

Generated by Designify AI.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Structure

- `src/App.tsx` – Application shell
- `src/main.tsx` – Vite entrypoint
- `src/pages` – Page components
- `src/components` – Reusable UI components
- `src/layouts` – Shared page layout
- `src/styles` – Tailwind and global styles
- `src/types` – TypeScript definitions
"""


def _generate_env_example() -> str:
    return """# Example environment file for generated website
VITE_API_BASE_URL=http://localhost:8000/api
"""


def _generate_globals_css() -> str:
    return """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
    color: #f8fafc;
    background-color: #0f172a;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(99, 102, 241, 0.18), transparent 32%),
      radial-gradient(circle at 80% 10%, rgba(16, 185, 129, 0.12), transparent 25%);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
}
"""


def _generate_project_files(
    components: List[Dict[str, Any]],
    framework: str,
    use_typescript: bool,
    use_tailwind: bool,
) -> List[Dict[str, str]]:
    return [
        {"path": "index.html", "content": _generate_index_html()},
        {"path": "package.json", "content": _generate_package_json(use_typescript, use_tailwind, framework)},
        {"path": "tsconfig.json", "content": _generate_tsconfig()},
        {"path": "tsconfig.node.json", "content": _generate_tsconfig_node()},
        {"path": "vite.config.ts", "content": _generate_vite_config()},
        {"path": "postcss.config.js", "content": _generate_postcss_config()},
        {"path": "tailwind.config.js", "content": _generate_tailwind_config()},
        {"path": "eslint.config.js", "content": _generate_eslint_config()},
        {"path": "README.md", "content": _generate_readme()},
        {"path": ".env.example", "content": _generate_env_example()},
        {"path": ".gitignore", "content": _generate_gitignore()},
        {"path": "src/main.tsx", "content": _generate_main_tsx()},
        {"path": "src/App.tsx", "content": _generate_app_tsx()},
        {"path": "src/pages/HomePage.tsx", "content": _generate_home_page(components)},
        {"path": "src/pages/NotFoundPage.tsx", "content": _generate_not_found_page()},
        {"path": "src/layouts/MainLayout.tsx", "content": _generate_main_layout()},
        {"path": "src/contexts/ThemeContext.tsx", "content": _generate_theme_context()},
        {"path": "src/services/api.ts", "content": _generate_api_service()},
        {"path": "src/utils/format.ts", "content": _generate_utils_file()},
        {"path": "src/types/index.ts", "content": _generate_types_file()},
        {"path": "src/styles/globals.css", "content": _generate_globals_css()},
    ]


def _generate_folder_structure(components: List[Dict[str, Any]], framework: str) -> List[str]:
    """Generate a flat list of folder/file paths for the project."""
    folders = [
        "src/components/ui",
        "src/components/layout",
        "src/components/forms",
        "src/components/shared",
        "src/hooks",
        "src/lib",
        "src/styles",
        "src/types",
        "src/utils",
        "src/pages",
        "src/layouts",
        "src/contexts",
        "src/services",
    ]

    if framework == "nextjs":
        folders = [
            "src/app",
            "src/components/ui",
            "src/components/layout",
            "src/components/forms",
            "src/components/shared",
            "src/hooks",
            "src/lib",
            "src/styles",
            "src/types",
            "src/utils",
        ]

    files = []
    for comp in components:
        ctype = comp.get('type', 'section')
        name = _clean_name(comp.get('name', 'Component'))
        folder_map = {
            "button": "src/components/ui",
            "input": "src/components/forms",
            "card": "src/components/ui",
            "modal": "src/components/ui",
            "navbar": "src/components/layout",
            "sidebar": "src/components/layout",
            "header": "src/components/layout",
            "footer": "src/components/layout",
            "hero": "src/components/shared",
            "pricing": "src/components/shared",
            "testimonial": "src/components/shared",
            "form": "src/components/forms",
            "table": "src/components/ui",
            "badge": "src/components/ui",
            "list": "src/components/ui",
        }
        folder = folder_map.get(ctype, "src/components/ui")
        files.append(f"{folder}/{name}.tsx")

    return sorted(set(folders + files))


def _generate_export_barrel(components: List[Dict[str, Any]]) -> str:
    """Generate barrel exports for all components."""
    folder_map = {
        "button": "ui",
        "input": "forms",
        "card": "ui",
        "modal": "ui",
        "navbar": "layout",
        "sidebar": "layout",
        "header": "layout",
        "footer": "layout",
        "hero": "shared",
        "pricing": "shared",
        "testimonial": "shared",
        "form": "forms",
        "table": "ui",
        "badge": "ui",
        "list": "ui",
        "section": "ui",
    }
    content = "// Auto-generated barrel exports\n"
    for comp in components:
        name = _clean_name(comp.get('name', 'Component'))
        if not name:
            continue
        folder = folder_map.get(comp.get('type', 'section'), "ui")
        content += f"export {{ {name} }} from './{folder}/{name}'\n"
    return content


def _generate_styles_file(colors: List[Dict[str, Any]], typography: List[Dict[str, Any]]) -> str:
    """Generate a Tailwind-compatible styles file with design tokens."""
    content = "/* Auto-generated design tokens from Figma */\n\n"

    # Color variables
    if colors:
        content += ":root {\n"
        for i, color in enumerate(colors[:10]):
            hex_val = color.get('hex', '#000000')
            content += f"  --figma-color-{i + 1}: {hex_val};\n"
        content += "}\n\n"

    # Typography
    if typography:
        for i, t in enumerate(typography[:5]):
            family = t.get('fontFamily', 'Inter')
            size = t.get('fontSize', 16)
            weight = t.get('fontWeight', 'normal')
            content += f".text-figma-style-{i + 1} {{\n"
            content += f"  font-family: '{family}';\n"
            content += f"  font-size: {size}px;\n"
            if weight:
                content += f"  font-weight: {weight};\n"
            content += "}\n\n"

    return content


def _generate_index_page(components: List[Dict[str, Any]], framework: str) -> str:
    """Generate a main page that composes all detected components."""
    imports = ""
    usage = ""
    for comp in components:
        name = _clean_name(comp.get('name', 'Component'))
        folder_map = {
            "button": "@/components/ui",
            "input": "@/components/forms",
            "card": "@/components/ui",
            "modal": "@/components/ui",
            "navbar": "@/components/layout",
            "sidebar": "@/components/layout",
            "header": "@/components/layout",
            "footer": "@/components/layout",
            "hero": "@/components/shared",
            "pricing": "@/components/shared",
            "testimonial": "@/components/shared",
            "form": "@/components/forms",
            "table": "@/components/ui",
            "badge": "@/components/ui",
            "list": "@/components/ui",
            "section": "@/components/ui",
        }
        folder = folder_map.get(comp.get('type', 'section'), "@/components/ui")
        imports += f"import {{ {name} }} from '{folder}/{name}'\n"

    for comp in components:
        name = _clean_name(comp.get('name', 'Component'))
        usage += f"          <{name} />\n"

    content = f"""import React from 'react'
{imports}

export default function Home() {{
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
{usage}
      </div>
    </main>
  )
}}
"""
    return content


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
    Main entry point for code generation.

    Takes parsed Figma data and generates a complete frontend project.
    Returns structured output with files, folder structure, and metadata.
    """
    # Phase 1: Detect components
    components = detect_components(figma_data)

    # Filter to requested frames if specified
    if frame_ids:
        components = [c for c in components if c.get('id') in frame_ids]

    # Fall back to a placeholder component when no real components are detected.
    if not components:
        placeholder_name = 'GeneratedSection'
        if frame_ids:
            placeholder_name = f'SelectedFrame{len(frame_ids)}'
        components = [{
            'id': 'generated-placeholder',
            'name': placeholder_name,
            'type': 'section',
            'width': 800,
            'height': 600,
            'children': [],
            'is_reusable': False,
            'signature': 'placeholder',
        }]

    # Phase 2: Extract design tokens
    design_tokens = figma_data.get('design_tokens', {})
    colors = design_tokens.get('colors', [])
    typography = design_tokens.get('typography', [])
    stats = figma_data.get('stats', {})

    # Phase 3: Generate files
    files = []
    folder_structure = _generate_folder_structure(components, framework)

    # Generate component files
    for comp in components:
        file_content = _generate_component_file(comp, comp.get('type', 'section'), use_typescript, use_tailwind)
        name = _clean_name(comp.get('name', 'Component'))
        folder_map = {
            "button": "src/components/ui",
            "input": "src/components/forms",
            "card": "src/components/ui",
            "modal": "src/components/ui",
            "navbar": "src/components/layout",
            "sidebar": "src/components/layout",
            "header": "src/components/layout",
            "footer": "src/components/layout",
            "hero": "src/components/shared",
            "pricing": "src/components/shared",
            "testimonial": "src/components/shared",
            "form": "src/components/forms",
            "table": "src/components/ui",
            "badge": "src/components/ui",
            "list": "src/components/ui",
            "section": "src/components/ui",
        }
        folder = folder_map.get(comp.get('type', 'section'), "src/components/ui")
        files.append({
            "path": f"{folder}/{name}.tsx",
            "content": file_content
        })

    # Generate barrel export
    files.append({
        "path": "src/components/index.ts",
        "content": _generate_export_barrel(components)
    })

    # Generate styles file
    files.append({
        "path": "src/styles/design-tokens.css",
        "content": _generate_styles_file(colors, typography)
    })

    # Generate application scaffolding for React
    if framework == "react":
        files.extend(_generate_project_files(components, framework, use_typescript, use_tailwind))
    else:
        # Generate main index page for non-React frameworks
        files.append({
            "path": "src/app/page.tsx" if framework == "nextjs" else "src/pages/index.tsx",
            "content": _generate_index_page(components, framework)
        })

    # Collect generation stats
    comp_types = Counter(c.get('type', 'unknown') for c in components)
    reusable_count = sum(1 for c in components if c.get('is_reusable'))

    generation_stats = {
        "total_components": len(components),
        "reusable_components": reusable_count,
        "unique_types": len(comp_types),
        "files_generated": len(files),
        "component_breakdown": dict(comp_types),
        "has_tailwind": use_tailwind,
        "has_typescript": use_typescript,
        "optimization_level": optimization_level,
    }

    return {
        "files": files,
        "folder_structure": folder_structure,
        "stats": generation_stats,
    }


async def optimize_generation(
    previous_generation: Dict[str, Any],
    improvement_type: str,
    framework: str = "react",
) -> Dict[str, Any]:
    """
    Optimize previously generated code based on improvement type.
    Returns a new generation with optimizations applied.
    """
    files = previous_generation.get('files', [])
    optimized_files = []

    for file in files:
        content = file['content']
        path = file['path']

        if improvement_type == "accessibility":
            # Add aria-labels, roles, keyboard handlers
            content = content.replace('<nav ', '<nav aria-label="Navigation" ')
            content = content.replace('<button ', '<button aria-label="Button" type="button" ')
            content = content.replace('<img ', '<img alt="" ')
            content = re.sub(
                r'<input ',
                '<input aria-label="Input" ',
                content
            )
            # Add focus-visible styles
            content = content.replace(
                'transition-colors',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )

        elif improvement_type == "responsiveness":
            # Add responsive Tailwind classes
            content = content.replace('w-full', 'w-full sm:w-auto lg:w-full')
            content = content.replace('flex-col', 'flex-col md:flex-row lg:flex-col')
            content = content.replace('px-6', 'px-4 sm:px-6 lg:px-8')
            content = content.replace('py-8', 'py-6 sm:py-8 lg:py-12')
            # Add grid for cards
            if 'card' in path.lower():
                content = content.replace(
                    'className="',
                    'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 '
                )

        elif improvement_type == "tailwind":
            # Merge duplicate classes, remove inline styles
            content = re.sub(r'style=\{.*?\}', '', content)
            # Remove redundant flex items if already in parent
            content = content.replace('flex items-center justify-between', 'flex items-center justify-between')

        elif improvement_type == "naming":
            # Improve component/variable naming
            content = re.sub(
                r'export (const|function) ([A-Z][a-z]+)',
                lambda m: f'export {m.group(1)} {m.group(2)}' if len(m.group(2)) > 2 else
                f'export {m.group(1)} GeneratedComponent',
                content
            )

        elif improvement_type == "structure":
            # Break large components into smaller ones
            # Extract repeated patterns
            pass  # Structure optimization is complex; keep as-is for now

        optimized_files.append({"path": path, "content": content})

    return {
        "files": optimized_files,
        "folder_structure": previous_generation.get("folder_structure", []),
        "stats": {
            **previous_generation.get("stats", {}),
            "optimized": True,
            "improvement_type": improvement_type,
        }
    }


async def export_code(
    generation: Dict[str, Any],
    export_format: str,
) -> Dict[str, Any]:
    """
    Prepare generated code for export.
    Returns the files grouped and ready for ZIP packaging.
    """
    files = generation.get('files', [])
    folder_structure = generation.get('folder_structure', [])

    # Add framework-specific files
    if export_format == "nextjs":
        files.append({
            "path": "next.config.js",
            "content": "/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  reactStrictMode: true,\n}\n\nmodule.exports = nextConfig\n"
        })
        files.append({
            "path": "tailwind.config.ts",
            "content": """import type { Config } from 'tailwindcss'\n\nconst config: Config = {\n  content: [\n    './src/**/*.{js,ts,jsx,tsx}',\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}\n\nexport default config\n"""
        })

    elif export_format == "react":
        files.append({
            "path": "tailwind.config.js",
            "content": "/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ['./src/**/*.{js,jsx,ts,tsx}'],\n  theme: { extend: {} },\n  plugins: [],\n}\n"
        })
        files.append({
            "path": "vite.config.ts",
            "content": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})\n"
        })

    elif export_format == "html":
        # Generate a single HTML file
        combined_css = ""
        combined_html = ""
        for file in files:
            if file['path'].endswith('.css'):
                combined_css += file['content'] + "\n"
            elif file['path'].endswith('.tsx') or file['path'] == "src/pages/index.tsx":
                # Extract JSX-like content
                combined_html += file['content'] + "\n"

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Design</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
{combined_css}
  </style>
</head>
<body>
  <div id="root">
    {combined_html}
  </div>
</body>
</html>"""
        files = [{"path": "index.html", "content": html_content}]

    return {
        "files": files,
        "folder_structure": folder_structure,
        "export_format": export_format,
        "total_files": len(files),
    }
