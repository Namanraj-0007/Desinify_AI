"""
ZIP Export Service
Creates in-memory ZIP archives of generated projects for download.
Ensures essential project config files are always included.
"""

from __future__ import annotations

import io
import json
import zipfile
import os
from typing import Dict, List, Optional


def _get_essential_files() -> List[Dict[str, str]]:
    """Return essential project configuration files that must exist in every generated project."""
    return [
        {
            "path": "package.json",
            "content": json.dumps({
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
                    "class-variance-authority": "^0.7.0",
                    "@hookform/resolvers": "^3.9.0",
                    "zod": "^3.23.8"
                },
                "devDependencies": {
                    "@types/react": "^18.3.5",
                    "@types/react-dom": "^18.3.0",
                    "@vitejs/plugin-react": "^4.3.1",
                    "autoprefixer": "^10.4.20",
                    "eslint": "^9.9.1",
                    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
                    "globals": "^15.9.0",
                    "postcss": "^8.4.41",
                    "tailwindcss": "^3.4.10",
                    "typescript": "^5.5.4",
                    "vite": "^5.4.2"
                }
            }, indent=2)
        },
        {
            "path": "vite.config.ts",
            "content": (
                "import { defineConfig } from 'vite'\n"
                "import react from '@vitejs/plugin-react'\n"
                "import path from 'path'\n\n"
                "export default defineConfig({\n"
                "  plugins: [react()],\n"
                "  resolve: {\n"
                "    alias: {\n"
                "      '@': path.resolve(__dirname, './src'),\n"
                "    },\n"
                "  },\n"
                "})"
            )
        },
        {
            "path": "tsconfig.json",
            "content": json.dumps({
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
        },
        {
            "path": "tsconfig.node.json",
            "content": json.dumps({
                "compilerOptions": {
                    "target": "ES2022",
                    "lib": ["ES2023"],
                    "module": "ESNext",
                    "skipLibCheck": True,
                    "moduleResolution": "Bundler",
                    "allowImportingTsExtensions": True,
                    "isolatedModules": True,
                    "moduleDetection": "force",
                    "noEmit": True,
                    "strict": True,
                    "noUnusedLocals": True,
                    "noUnusedParameters": True,
                    "noFallthroughCasesInSwitch": True
                },
                "include": ["vite.config.ts"]
            }, indent=2)
        },
        {
            "path": "postcss.config.js",
            "content": "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n"
        },
        {
            "path": "tailwind.config.js",
            "content": (
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
        },
        {
            "path": "index.html",
            "content": (
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
        },
        {
            "path": "src/main.tsx",
            "content": (
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
        },
        {
            "path": "src/lib/utils.ts",
            "content": (
                "import { clsx, type ClassValue } from 'clsx'\n"
                "import { twMerge } from 'tailwind-merge'\n\n"
                "export function cn(...inputs: ClassValue[]) {\n"
                "  return twMerge(clsx(inputs))\n"
                "}"
            )
        },
        {
            "path": "src/styles/globals.css",
            "content": (
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
                '  }\n'
                '}'
            )
        },
        {
            "path": "README.md",
            "content": (
                "# Designify AI Generated\n\n"
                "Generated by Designify AI from Figma design.\n\n"
                "## Quick Start\n\n"
                "```bash\nnpm install\nnpm run dev\n```\n\n"
                "## Build\n\n"
                "```bash\nnpm run build\nnpm run preview\n```\n\n"
                "## Tech Stack\n\n"
                "- React 18\n"
                "- TypeScript\n"
                "- Vite\n"
                "- Tailwind CSS\n"
                "- Framer Motion\n"
                "- Lucide React\n"
                "- React Router v6\n"
            )
        },
        {
            "path": "public/vite.svg",
            "content": '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFBD4F"></stop><stop offset="100%" stop-color="#FF9640"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>'
        },
    ]


def create_project_zip(files: List[Dict[str, str]]) -> bytes:
    """
    Create an in-memory ZIP file containing all generated project files,
    plus any missing essential configuration files.
    """
    essential_files = _get_essential_files()
    existing_paths = {f.get("path", "") for f in files}
    
    buffer = io.BytesIO()
    
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add generated files
        for file_entry in files:
            path = file_entry.get("path", "")
            content = file_entry.get("content", "")
            
            if not path:
                continue
            
            # Normalize path separators
            path = path.replace("\\", "/").lstrip("/")
            
            # Write file
            zf.writestr(path, content)
        
        # Add any missing essential config files
        for ess_file in essential_files:
            if ess_file["path"] not in existing_paths:
                zf.writestr(ess_file["path"], ess_file["content"])
    
    buffer.seek(0)
    return buffer.getvalue()


def create_tar_archive(files: List[Dict[str, str]]) -> bytes:
    """
    Create an in-memory tar.gz archive containing all generated project files.
    Falls back to ZIP if tar is not available.
    """
    try:
        import tarfile
        
        essential_files = _get_essential_files()
        existing_paths = {f.get("path", "") for f in files}
        
        buffer = io.BytesIO()
        with tarfile.open(fileobj=buffer, mode='w:gz') as tf:
            for file_entry in files:
                path = file_entry.get("path", "")
                content = file_entry.get("content", "")
                
                path = path.replace("\\", "/").lstrip("/")
                if not path:
                    continue
                
                info = tarfile.TarInfo(name=path)
                content_bytes = content.encode('utf-8')
                info.size = len(content_bytes)
                info.mtime = 0
                
                tf.addfile(info, io.BytesIO(content_bytes))
            
            # Add missing essential files
            for ess_file in essential_files:
                if ess_file["path"] not in existing_paths:
                    path = ess_file["path"]
                    content = ess_file["content"]
                    info = tarfile.TarInfo(name=path)
                    content_bytes = content.encode('utf-8')
                    info.size = len(content_bytes)
                    info.mtime = 0
                    tf.addfile(info, io.BytesIO(content_bytes))
        
        buffer.seek(0)
        return buffer.getvalue()
    except ImportError:
        return create_project_zip(files)


def get_zip_filename(project_name: str = "designify-project", version: int = 1) -> str:
    """Generate a clean filename for the ZIP download."""
    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in project_name)
    return f"{safe_name}-v{version}.zip"

