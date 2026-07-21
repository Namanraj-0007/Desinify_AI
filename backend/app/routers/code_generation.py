"""
Phase 3: AI Code Generation Engine - API Routes
"""

from __future__ import annotations

from typing import Any, Dict, List
from datetime import datetime, timezone
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, status

from app.routers.utils.auth import get_current_user_id
from app.schemas.code_generation import (
    GenerateCodeRequest,
    GeneratedCodeResponse,
    GenerationVersion,
    VersionHistoryResponse,
    OptimizeCodeRequest,
    ExportRequest,
    FileOutput,
)
from app.services.code_generation_service import (
    generate_code,
    optimize_generation,
    export_code,
)
from app.services.mongo import get_db

router = APIRouter(prefix="/codegen", tags=["code-generation"])

# Collections
figma_projects_collection = get_db()["figma_projects"]
code_generations_collection = get_db()["code_generations"]


@router.post("/generate", response_model=GeneratedCodeResponse)
async def generate(
    payload: GenerateCodeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate frontend code from imported Figma project data."""
    try:
        # Fetch the project data
        project = await figma_projects_collection.find_one(
            {"_id": ObjectId(payload.project_id), "user_id": user_id}
        )
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        parsed = project.get("parsed", {})
        figma_data = {
            "component_tree": parsed.get("component_tree", {}),
            "design_tokens": parsed.get("design_tokens", {}),
            "stats": parsed.get("stats", {}),
        }

        # Generate code
        result = await generate_code(
            figma_data=figma_data,
            project_id=payload.project_id,
            frame_ids=payload.frame_ids,
            framework=payload.framework,
            use_typescript=payload.typescript,
            use_tailwind=payload.tailwind,
            optimization_level=payload.optimization_level,
        )

        # Determine next version number
        existing_count = await code_generations_collection.count_documents(
            {"project_id": payload.project_id}
        )
        version_number = existing_count + 1

        # Store generation record
        generation_doc = {
            "user_id": user_id,
            "project_id": payload.project_id,
            "project_name": project.get("project_name", "Project"),
            "figma_file_key": project.get("figma_file_key", ""),
            "version_number": version_number,
            "framework": payload.framework,
            "typescript": payload.typescript,
            "tailwind": payload.tailwind,
            "optimization_level": payload.optimization_level,
            "frame_ids": payload.frame_ids,
            "files": result["files"],
            "folder_structure": result["folder_structure"],
            "stats": result["stats"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        insert_result = await code_generations_collection.insert_one(generation_doc)
        generation_id = str(insert_result.inserted_id)

        return GeneratedCodeResponse(
            generation_id=generation_id,
            project_id=payload.project_id,
            framework=payload.framework,
            typescript=payload.typescript,
            tailwind=payload.tailwind,
            files=[FileOutput(**f) for f in result["files"]],
            folder_structure=result["folder_structure"],
            stats=result["stats"],
            frame_ids=payload.frame_ids,
            created_at=generation_doc["created_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")


@router.get("/history/{project_id}", response_model=VersionHistoryResponse)
async def get_version_history(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get all code generation versions for a project."""
    try:
        cursor = code_generations_collection.find(
            {"project_id": project_id, "user_id": user_id}
        ).sort("created_at", -1)

        versions: List[GenerationVersion] = []
        async for doc in cursor:
            versions.append(GenerationVersion(
                id=str(doc["_id"]),
                project_id=doc["project_id"],
                project_name=doc.get("project_name", ""),
                figma_file_key=doc.get("figma_file_key", ""),
                version_number=doc["version_number"],
                framework=doc["framework"],
                typescript=doc["typescript"],
                tailwind=doc["tailwind"],
                optimization_level=doc.get("optimization_level", "standard"),
                frame_ids=doc.get("frame_ids", []),
                files=[FileOutput(**f) for f in doc.get("files", [])],
                folder_structure=doc.get("folder_structure", []),
                stats=doc.get("stats", {}),
                created_at=doc["created_at"],
            ))

        return VersionHistoryResponse(versions=versions)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.post("/regenerate", response_model=GeneratedCodeResponse)
async def regenerate(
    payload: OptimizeCodeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Regenerate/optimize a previous code generation."""
    try:
        # Fetch the previous generation
        prev = await code_generations_collection.find_one(
            {"_id": ObjectId(payload.generation_id), "user_id": user_id}
        )
        if not prev:
            raise HTTPException(status_code=404, detail="Generation not found")

        # Apply optimizations
        optimized = await optimize_generation(
            previous_generation={
                "files": prev.get("files", []),
                "folder_structure": prev.get("folder_structure", []),
                "stats": prev.get("stats", {}),
            },
            improvement_type=payload.improvement_type,
            framework=payload.framework,
        )

        # Store as new version
        existing_count = await code_generations_collection.count_documents(
            {"project_id": prev["project_id"]}
        )
        version_number = existing_count + 1

        generation_doc = {
            "user_id": user_id,
            "project_id": prev["project_id"],
            "project_name": prev.get("project_name", "Project"),
            "figma_file_key": prev.get("figma_file_key", ""),
            "version_number": version_number,
            "framework": payload.framework,
            "typescript": prev.get("typescript", True),
            "tailwind": prev.get("tailwind", True),
            "optimization_level": f"optimized-{payload.improvement_type}",
            "frame_ids": prev.get("frame_ids", []),
            "files": optimized["files"],
            "folder_structure": optimized["folder_structure"],
            "stats": optimized["stats"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        insert_result = await code_generations_collection.insert_one(generation_doc)
        generation_id = str(insert_result.inserted_id)

        return GeneratedCodeResponse(
            generation_id=generation_id,
            project_id=prev["project_id"],
            framework=payload.framework,
            typescript=prev.get("typescript", True),
            tailwind=prev.get("tailwind", True),
            files=[FileOutput(**f) for f in optimized["files"]],
            folder_structure=optimized["folder_structure"],
            stats=optimized["stats"],
            frame_ids=prev.get("frame_ids", []),
            created_at=generation_doc["created_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@router.post("/export")
async def export_generation(
    payload: ExportRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Prepare a generation for export."""
    try:
        gen = await code_generations_collection.find_one(
            {"_id": ObjectId(payload.generation_id), "user_id": user_id}
        )
        if not gen:
            raise HTTPException(status_code=404, detail="Generation not found")

        result = await export_code(
            generation={
                "files": gen.get("files", []),
                "folder_structure": gen.get("folder_structure", []),
            },
            export_format=payload.format,
        )

        return {
            "ok": True,
            "files": result["files"],
            "folder_structure": result["folder_structure"],
            "export_format": result["export_format"],
            "total_files": result["total_files"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/{generation_id}", response_model=GenerationVersion)
async def get_generation(
    generation_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a specific generation by ID."""
    try:
        doc = await code_generations_collection.find_one(
            {"_id": ObjectId(generation_id), "user_id": user_id}
        )
        if not doc:
            raise HTTPException(status_code=404, detail="Generation not found")

        return GenerationVersion(
            id=str(doc["_id"]),
            project_id=doc["project_id"],
            project_name=doc.get("project_name", ""),
            figma_file_key=doc.get("figma_file_key", ""),
            version_number=doc["version_number"],
            framework=doc["framework"],
            typescript=doc["typescript"],
            tailwind=doc["tailwind"],
            optimization_level=doc.get("optimization_level", "standard"),
            files=[FileOutput(**f) for f in doc.get("files", [])],
            folder_structure=doc.get("folder_structure", []),
            stats=doc.get("stats", {}),
            created_at=doc["created_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
