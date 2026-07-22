"""
AI Generation Schemas
Pydantic models for LLM prompt building, streaming, and progress tracking.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class AIPromptRequest(BaseModel):
    """Request to build an LLM prompt from parsed Figma data."""
    figma_json: Dict[str, Any] = Field(default_factory=dict)
    project_name: str = "Generated Project"
    framework: str = "react"
    typescript: bool = True
    tailwind: bool = True
    include_shadcn: bool = True
    include_framer_motion: bool = True
    selected_frame_ids: List[str] = Field(default_factory=list)


class AIPromptResponse(BaseModel):
    """Structured prompt ready for LLM consumption."""
    system_prompt: str
    user_prompt: str
    token_estimate: int
    figma_summary: Dict[str, Any] = Field(default_factory=dict)


class GenerationProgress(BaseModel):
    """Progress event for real-time tracking."""
    task_id: str
    status: str  # "queued" | "building_prompt" | "calling_llm" | "parsing_output" | "saving_files" | "complete" | "error"
    step: int = 0
    total_steps: int = 6
    message: str = ""
    percentage: int = 0
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class StreamEvent(BaseModel):
    """SSE stream event for real-time updates."""
    type: str  # "progress" | "log" | "file_generated" | "complete" | "error"
    data: Any = None
    done: bool = False


class LLMProviderConfig(BaseModel):
    """Configuration for an LLM provider."""
    provider: str = "gemini"  # "gemini" | "openai"
    api_key: str = ""
    model: str = ""
    max_tokens: int = 8192
    temperature: float = 0.4
    timeout_seconds: int = 120


class LLMResponse(BaseModel):
    """Parsed response from an LLM."""
    raw_text: str
    files: List[Dict[str, str]] = Field(default_factory=list)  # [{"path": "src/...", "content": "..."}]
    token_usage: Dict[str, int] = Field(default_factory=lambda: {"prompt": 0, "completion": 0, "total": 0})
    error: Optional[str] = None
    success: bool = True

