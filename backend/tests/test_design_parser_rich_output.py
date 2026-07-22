import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.design_parser import parse_design


def test_parse_design_preserves_rich_node_metadata():
    figma_json = {
        "document": {
            "children": [
                {
                    "id": "page-1",
                    "name": "Landing",
                    "type": "PAGE",
                    "children": [
                        {
                            "id": "frame-1",
                            "name": "Hero",
                            "type": "FRAME",
                            "absoluteBoundingBox": {"x": 0, "y": 0, "width": 1440, "height": 900},
                            "layoutMode": "HORIZONTAL",
                            "itemSpacing": 24,
                            "children": [
                                {
                                    "id": "text-1",
                                    "name": "Headline",
                                    "type": "TEXT",
                                    "style": {"fontSize": 40, "fontWeight": 700, "fontFamily": "Inter"},
                                    "absoluteBoundingBox": {"x": 80, "y": 220, "width": 480, "height": 64},
                                    "children": [],
                                }
                            ],
                        }
                    ],
                }
            ]
        }
    }

    parsed = parse_design(figma_json)

    component_tree = parsed["component_tree"]
    assert component_tree["pages"][0]["children"][0]["layoutMode"] == "HORIZONTAL"
    assert component_tree["pages"][0]["children"][0]["children"][0]["fontSize"] == 40
    assert parsed["design_tokens"]["layout"]["responsive"] is True
    assert parsed["design_tokens"]["flex"]["enabled"] is True
