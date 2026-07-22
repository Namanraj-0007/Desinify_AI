"""
Background Task Queue Service
Manages async generation tasks with progress tracking.
"""

from __future__ import annotations

import asyncio
import uuid
import logging
from typing import Any, Callable, Dict, Optional
from datetime import datetime

from app.schemas.ai_generation import GenerationProgress

logger = logging.getLogger(__name__)


# ─── In-Memory Task Store ─────────────────────────────────────────

class TaskStore:
    """Simple in-memory store for tracking generation tasks."""
    
    def __init__(self):
        self._tasks: Dict[str, Dict[str, Any]] = {}
    
    def create_task(self, task_type: str, user_id: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        task_id = str(uuid.uuid4())
        self._tasks[task_id] = {
            "id": task_id,
            "type": task_type,
            "user_id": user_id,
            "status": "queued",
            "progress": 0,
            "message": "Queued...",
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "result": None,
            "error": None,
        }
        return task_id
    
    def update_progress(self, task_id: str, progress: int, message: str, status: Optional[str] = None):
        if task_id in self._tasks:
            self._tasks[task_id].update({
                "progress": progress,
                "message": message,
                "status": status or self._tasks[task_id]["status"],
                "updated_at": datetime.utcnow().isoformat(),
            })
    
    def complete_task(self, task_id: str, result: Any):
        if task_id in self._tasks:
            self._tasks[task_id].update({
                "status": "complete",
                "progress": 100,
                "message": "Complete",
                "result": result,
                "updated_at": datetime.utcnow().isoformat(),
            })
    
    def fail_task(self, task_id: str, error: str):
        if task_id in self._tasks:
            self._tasks[task_id].update({
                "status": "error",
                "error": error,
                "message": f"Error: {error[:200]}",
                "updated_at": datetime.utcnow().isoformat(),
            })
    
    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        return self._tasks.get(task_id)
    
    def get_user_tasks(self, user_id: str, limit: int = 10) -> list:
        tasks = [t for t in self._tasks.values() if t.get("user_id") == user_id]
        tasks.sort(key=lambda t: t.get("created_at", ""), reverse=True)
        return tasks[:limit]


# Singleton instance
task_store = TaskStore()


# ─── Background Runner ────────────────────────────────────────────

async def run_generation_task(
    task_id: str,
    coro_factory: Callable[[], Any],
):
    """
    Run a generation task in the background, updating progress.
    
    Args:
        task_id: The task ID to update
        coro_factory: Async callable that yields progress updates
    """
    try:
        task_store.update_progress(task_id, 10, "Starting generation...", "running")
        
        result = await coro_factory()
        
        task_store.complete_task(task_id, result)
        logger.info(f"Task {task_id} completed successfully")
        
    except Exception as e:
        task_store.fail_task(task_id, str(e))
        logger.error(f"Task {task_id} failed: {e}")

