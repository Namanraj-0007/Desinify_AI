# Phase 1: Recursive Figma Parser Rewrite

## Goals
- Recursively parse EVERY node in Figma JSON (not just FRAMES and COMPONENTS)
- Extract ALL available properties from each node
- Preserve complete node hierarchy with parent-child relationships
- Generate rich design JSON with full metadata for AI prompt building

## Files to Modify
- `backend/app/services/design_parser.py` — Complete rewrite
- `backend/app/schemas/figma.py` — New schemas for rich node types
- `backend/app/routers/figma.py` — Minor updates if output format changes

## Tasks

- [x] **Task 1**: Update Pydantic schemas in `figma.py` with new rich node types
- [x] **Task 2**: Rewrite `_traverse_all_nodes` to properly categorize all node types
- [x] **Task 3**: Implement full node property extraction (all Figma API properties)
- [x] **Task 4**: Rewrite `_build_component_tree` for complete hierarchy preservation
- [x] **Task 5**: Rewrite `_collect_frames` to handle all container types
- [x] **Task 6**: Rewrite `_collect_components` to include component sets, variants, instances
- [x] **Task 7**: Rewrite `_collect_colors` with gradient support, opacity, stroke colors
- [x] **Task 8**: Rewrite `_collect_typography` with complete text style extraction
- [x] **Task 9**: Add new collectors: effects/shadows, layout grids, constraints, vector data, export settings
- [x] **Task 10**: Update `parse_design` entry point to return richer output

