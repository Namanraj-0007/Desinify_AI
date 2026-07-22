import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.code_generation_service import generate_code


def test_generate_code_emits_runnable_project_files():
    figma_data = {
        "component_tree": {
            "pages": [
                {
                    "id": "page-1",
                    "name": "Home",
                    "children": [
                        {
                            "id": "frame-1",
                            "name": "Hero Section",
                            "type": "FRAME",
                            "width": 1440,
                            "height": 900,
                            "children": [
                                {
                                    "id": "btn-1",
                                    "name": "Primary Button",
                                    "type": "COMPONENT",
                                    "width": 160,
                                    "height": 48,
                                    "children": [],
                                }
                            ],
                        }
                    ],
                }
            ]
        },
        "design_tokens": {
            "colors": [{"name": "Primary", "hex": "#4f46e5"}],
            "typography": [{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 500}],
        },
        "stats": {"total_nodes": 3},
    }

    result = asyncio.run(
        generate_code(
            figma_data=figma_data,
            project_id="project-123",
            frame_ids=[],
            framework="react",
            use_typescript=True,
            use_tailwind=True,
            optimization_level="aggressive",
        )
    )

    files = {item["path"]: item["content"] for item in result["files"]}

    assert "package.json" in files
    assert "src/main.tsx" in files
    assert "src/App.tsx" in files
    assert "src/pages/HomePage.tsx" in files
    assert "src/lib/utils.ts" in files
    assert "src/components/ui/Button.tsx" in files
    assert "framer-motion" in files["package.json"]
    assert "lucide-react" in files["package.json"]
    assert "export function cn" in files["src/lib/utils.ts"]
