"""
Phase 3: AI Code Generation Engine - API Routes
Supports standard generation, streaming, optimization, export, and ZIP download.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse, Response
from starlette.responses import StreamingResponse as StarletteStreamingResponse

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
    generate_code_streaming,
    optimize_generation,
    export_code,
)
from app.services.zip_service import create_project_zip, get_zip_filename
from app.services.mongo import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/codegen", tags=["code-generation"])

# Collections
figma_projects_collection = get_db()["figma_projects"]
code_generations_collection = get_db()["code_generations"]


@router.post("/generate", response_model=GeneratedCodeResponse)
async def generate(
    payload: GenerateCodeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate frontend code from imported Figma project data using AI."""
    try:
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

        result = await generate_code(
            figma_data=figma_data,
            project_id=payload.project_id,
            frame_ids=payload.frame_ids,
            framework=payload.framework,
            use_typescript=payload.typescript,
            use_tailwind=payload.tailwind,
            optimization_level=payload.optimization_level,
        )

        existing_count = await code_generations_collection.count_documents(
            {"project_id": payload.project_id}
        )
        version_number = existing_count + 1

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
            stats=result.get("stats", {}),
            frame_ids=payload.frame_ids,
            created_at=generation_doc["created_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Code generation failed")
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")


@router.post("/generate-stream")
async def generate_stream(
    payload: GenerateCodeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Stream code generation events for real-time UI updates (SSE)."""
    try:
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

        async def event_stream():
            full_text = ""
            files_result = []
            async for event in generate_code_streaming(
                figma_data=figma_data,
                project_id=payload.project_id,
                frame_ids=payload.frame_ids,
                framework=payload.framework,
                use_typescript=payload.typescript,
                use_tailwind=payload.tailwind,
            ):
                data = json.dumps({
                    "type": event.type,
                    "data": event.data,
                    "done": event.done,
                })
                yield f"data: {data}\n\n"

                if event.type == "log":
                    full_text += str(event.data)
                elif event.type == "file_generated":
                    files_result.append(event.data)
                elif event.type == "complete":
                    # Save generation to MongoDB
                    try:
                        existing_count = await code_generations_collection.count_documents(
                            {"project_id": payload.project_id}
                        )
                        version_number = existing_count + 1
                        gen_doc = {
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
                            "files": files_result,
                            "folder_structure": [f.get("path", "") for f in files_result],
                            "stats": {
                                "files_generated": len(files_result),
                                "generation_method": "ai_stream",
                            },
                            "created_at": datetime.now(timezone.utc).isoformat(),
                        }
                        await code_generations_collection.insert_one(gen_doc)
                    except Exception:
                        pass

            yield "data: {\"type\": \"done\", \"done\": true}\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Stream generation failed")
        raise HTTPException(status_code=500, detail=f"Stream generation failed: {str(e)}")


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
        logger.exception("Failed to fetch history")
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.post("/regenerate", response_model=GeneratedCodeResponse)
async def regenerate(
    payload: OptimizeCodeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Regenerate/optimize a previous code generation."""
    try:
        prev = await code_generations_collection.find_one(
            {"_id": ObjectId(payload.generation_id), "user_id": user_id}
        )
        if not prev:
            raise HTTPException(status_code=404, detail="Generation not found")

        optimized = await optimize_generation(
            previous_generation={
                "files": prev.get("files", []),
                "folder_structure": prev.get("folder_structure", []),
                "stats": prev.get("stats", {}),
            },
            improvement_type=payload.improvement_type,
            framework=payload.framework,
        )

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
            stats=optimized.get("stats", {}),
            frame_ids=prev.get("frame_ids", []),
            created_at=generation_doc["created_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Optimization failed")
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
        logger.exception("Export failed")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.post("/export-zip")
async def export_generation_zip(
    payload: ExportRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Download a generation as a ZIP file."""
    try:
        gen = await code_generations_collection.find_one(
            {"_id": ObjectId(payload.generation_id), "user_id": user_id}
        )
        if not gen:
            raise HTTPException(status_code=404, detail="Generation not found")

        files = gen.get("files", [])
        project_name = gen.get("project_name", "designify-project")
        version = gen.get("version_number", 1)
        zip_bytes = create_project_zip(files)
        filename = get_zip_filename(project_name, version)

        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(zip_bytes)),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("ZIP export failed")
        raise HTTPException(status_code=500, detail=f"ZIP export failed: {str(e)}")


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
        logger.exception("Failed to fetch generation")
        raise HTTPException(status_code=500, detail=str(e))

