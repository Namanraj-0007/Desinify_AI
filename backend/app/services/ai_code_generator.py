"""
AI Code Generator
Handles LLM API calls to Gemini and OpenAI for code generation.
Supports retry logic, token counting, chunking, and SSE streaming.
"""

from __future__ import annotations

import json
import re
import asyncio
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple
from datetime import datetime

import httpx

from app.config.settings import settings
from app.schemas.ai_generation import (
    AIPromptRequest,
    AIPromptResponse,
    GenerationProgress,
    StreamEvent,
    LLMProviderConfig,
    LLMResponse,
)

logger = logging.getLogger(__name__)


# ─── Constants ────────────────────────────────────────────────────

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"
OPENAI_API_BASE = "https://api.openai.com/v1"

DEFAULT_TIMEOUT = 120
MAX_RETRIES = 3
RETRY_DELAY_BASE = 2.0  # seconds, exponential backoff


# ─── Provider Configuration ───────────────────────────────────────

def _get_gemini_config() -> LLMProviderConfig:
    api_key = settings.gemini_api_key or ""
    return LLMProviderConfig(
        provider="gemini",
        api_key=api_key,
        model=settings.gemini_model or "gemini-2.0-flash-exp",
        max_tokens=8192,
        temperature=0.3,
        timeout_seconds=120,
    )


def _get_openai_config() -> LLMProviderConfig:
    api_key = settings.openai_api_key or ""
    return LLMProviderConfig(
        provider="openai",
        api_key=api_key,
        model=settings.openai_model or "gpt-4o",
        max_tokens=8192,
        temperature=0.3,
        timeout_seconds=120,
    )


def _get_llm_config() -> LLMProviderConfig:
    """Get the preferred LLM config. Prefers Gemini if available."""
    gemini = _get_gemini_config()
    if gemini.api_key:
        return gemini
    openai = _get_openai_config()
    if openai.api_key:
        return openai
    # Fallback to Gemini even without key - will fail gracefully
    return gemini


# ─── LLM API Calls ────────────────────────────────────────────────

async def _call_gemini(
    config: LLMProviderConfig,
    system_prompt: str,
    user_prompt: str,
) -> Tuple[str, Dict[str, int]]:
    """Call Gemini API with system + user prompt."""
    url = f"{GEMINI_API_BASE}/models/{config.model}:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": config.api_key,
    }
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"{system_prompt}\n\n{user_prompt}"[:config.max_tokens * 4]}
                ],
            }
        ],
        "generationConfig": {
            "temperature": config.temperature,
            "maxOutputTokens": config.max_tokens,
            "topP": 0.95,
            "topK": 40,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ],
    }

    async with httpx.AsyncClient(timeout=config.timeout_seconds) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code == 403:
        raise PermissionError("Gemini API key is invalid or missing. Set GEMINI_API_KEY in .env")
    if response.status_code == 429:
        raise ConnectionError("Gemini API rate limit exceeded. Please wait and retry.")
    if response.status_code >= 400:
        raise ConnectionError(f"Gemini API error {response.status_code}: {response.text[:500]}")

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        raise ValueError("Gemini returned no candidates. The prompt may have been blocked.")

    text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")

    usage = data.get("usageMetadata", {}) or {}
    token_usage = {
        "prompt": usage.get("promptTokenCount", 0),
        "completion": usage.get("candidatesTokenCount", 0),
        "total": usage.get("totalTokenCount", 0),
    }

    return text, token_usage


async def _call_gemini_stream(
    config: LLMProviderConfig,
    system_prompt: str,
    user_prompt: str,
) -> AsyncGenerator[str, None]:
    """Stream Gemini response token by token."""
    url = f"{GEMINI_API_BASE}/models/{config.model}:streamGenerateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": config.api_key,
    }
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"{system_prompt}\n\n{user_prompt}"[:config.max_tokens * 4]}
                ],
            }
        ],
        "generationConfig": {
            "temperature": config.temperature,
            "maxOutputTokens": config.max_tokens,
            "topP": 0.95,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ],
    }

    async with httpx.AsyncClient(timeout=config.timeout_seconds) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as response:
            if response.status_code >= 400:
                error_text = await response.aread()
                raise ConnectionError(f"Gemini stream error {response.status_code}: {error_text[:500].decode()}")

            buffer = ""
            async for chunk in response.aiter_bytes():
                text = chunk.decode("utf-8", errors="replace")
                buffer += text
                # Try to extract text from SSE-like responses
                for line in buffer.split("\n"):
                    if line.startswith("data: "):
                        try:
                            data = json.loads(line[6:])
                            candidates = data.get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                if parts and "text" in parts[0]:
                                    yield parts[0]["text"]
                        except json.JSONDecodeError:
                            continue
                buffer = buffer[-500:]  # Keep last 500 chars for partial parsing


def _call_openai(
    config: LLMProviderConfig,
    system_prompt: str,
    user_prompt: str,
) -> Tuple[str, Dict[str, int]]:
    """Call OpenAI API with system + user prompt."""
    import openai

    client = openai.OpenAI(api_key=config.api_key, timeout=config.timeout_seconds)

    response = client.chat.completions.create(
        model=config.model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=config.temperature,
        max_tokens=config.max_tokens,
    )

    text = response.choices[0].message.content or ""
    usage = response.usage or {}
    token_usage = {
        "prompt": usage.prompt_tokens or 0,
        "completion": usage.completion_tokens or 0,
        "total": usage.total_tokens or 0,
    }

    return text, token_usage


# ─── Retry Logic ──────────────────────────────────────────────────

async def call_llm_with_retry(
    system_prompt: str,
    user_prompt: str,
    config: Optional[LLMProviderConfig] = None,
    stream: bool = False,
) -> LLMResponse:
    """
    Call the LLM with retry logic and exponential backoff.
    Falls back from Gemini to OpenAI if available.
    """
    if config is None:
        config = _get_llm_config()

    last_error: Optional[Exception] = None
    providers_to_try = []

    # Build list of providers to try
    gemini_config = _get_gemini_config()
    openai_config = _get_openai_config()

    if config.provider == "gemini" and gemini_config.api_key:
        providers_to_try.append(gemini_config)
        if openai_config.api_key:
            providers_to_try.append(openai_config)
    elif config.provider == "openai" and openai_config.api_key:
        providers_to_try.append(openai_config)
        if gemini_config.api_key:
            providers_to_try.append(gemini_config)
    else:
        if gemini_config.api_key:
            providers_to_try.append(gemini_config)
        if openai_config.api_key:
            providers_to_try.append(openai_config)

    if not providers_to_try:
        return LLMResponse(
            raw_text="",
            files=[],
            success=False,
            error="No LLM API keys configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env",
        )

    for provider_config in providers_to_try:
        for attempt in range(MAX_RETRIES):
            try:
                logger.info(f"Calling LLM: {provider_config.provider}/{provider_config.model} (attempt {attempt + 1})")

                if provider_config.provider == "gemini":
                    text, token_usage = await _call_gemini(provider_config, system_prompt, user_prompt)
                else:
                    text, token_usage = _call_openai(provider_config, system_prompt, user_prompt)

                # Parse files from the response
                files = _parse_file_output(text)

                return LLMResponse(
                    raw_text=text,
                    files=files,
                    token_usage=token_usage,
                    success=True,
                )

            except (PermissionError, ValueError) as e:
                # Non-retryable errors
                last_error = e
                logger.error(f"LLM non-retryable error: {e}")
                break  # Try next provider

            except (ConnectionError, httpx.TimeoutException, httpx.HTTPError) as e:
                last_error = e
                delay = RETRY_DELAY_BASE * (2 ** attempt)
                logger.warning(f"LLM retryable error (attempt {attempt + 1}): {e}. Retrying in {delay}s")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(delay)
                continue

            except Exception as e:
                last_error = e
                logger.error(f"LLM unexpected error: {e}")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAY_BASE)
                continue

        logger.warning(f"All retries exhausted for {provider_config.provider}, trying next provider")

    error_msg = str(last_error) if last_error else "All LLM providers failed"
    return LLMResponse(raw_text="", files=[], success=False, error=error_msg)


# ─── Streaming Generator ──────────────────────────────────────────

async def stream_generation(
    system_prompt: str,
    user_prompt: str,
    config: Optional[LLMProviderConfig] = None,
) -> AsyncGenerator[StreamEvent, None]:
    """
    Stream generation events for real-time UI updates.
    Yields progress events and file generation events.
    """
    if config is None:
        config = _get_llm_config()

    yield StreamEvent(type="progress", data={"step": 1, "message": "Calling LLM...", "percentage": 20}, done=False)

    try:
        if config.provider == "gemini" and config.api_key:
            full_text = ""
            async for token in _call_gemini_stream(config, system_prompt, user_prompt):
                full_text += token
                yield StreamEvent(type="log", data=token, done=False)

            files = _parse_file_output(full_text)
            yield StreamEvent(
                type="progress",
                data={"step": 3, "message": f"Parsed {len(files)} files from LLM output", "percentage": 70},
                done=False,
            )

            for file in files:
                yield StreamEvent(type="file_generated", data=file, done=False)

            yield StreamEvent(
                type="progress",
                data={"step": 4, "message": "Generation complete", "percentage": 100},
                done=True,
            )
            yield StreamEvent(type="complete", data={"files": files}, done=True)

        else:
            result = await call_llm_with_retry(system_prompt, user_prompt, config)
            if result.success:
                for file in result.files:
                    yield StreamEvent(type="file_generated", data=file, done=False)
                yield StreamEvent(type="complete", data={"files": result.files, "token_usage": result.token_usage}, done=True)
            else:
                yield StreamEvent(type="error", data={"message": result.error}, done=True)

    except Exception as e:
        yield StreamEvent(type="error", data={"message": str(e)}, done=True)


# ─── File Output Parser ───────────────────────────────────────────

def _parse_file_output(text: str) -> List[Dict[str, str]]:
    """
    Parse the LLM response text into structured file entries.
    Expects format: FILE: path/to/file.tsx
                    ```tsx
                    code
                    ```
    """
    files: List[Dict[str, str]] = []
    current_path: Optional[str] = None
    current_content: List[str] = []
    in_code_block = False

    for line in text.split("\n"):
        # Check for FILE: marker
        file_match = re.match(r'^FILE:\s+(.+)$', line.strip())
        if file_match:
            # Save previous file
            if current_path and current_content:
                files.append({
                    "path": current_path,
                    "content": "\n".join(current_content).strip(),
                })
            current_path = file_match.group(1).strip()
            current_content = []
            in_code_block = False
            continue

        # Check for code block start
        if current_path and line.strip().startswith("```"):
            if not in_code_block:
                in_code_block = True
            else:
                in_code_block = False
                # Save this file
                if current_content:
                    files.append({
                        "path": current_path,
                        "content": "\n".join(current_content).strip(),
                    })
                current_path = None
                current_content = []
            continue

        # Collect content lines
        if current_path and in_code_block:
            current_content.append(line)

    # Save last file if any
    if current_path and current_content and not in_code_block:
        files.append({
            "path": current_path,
            "content": "\n".join(current_content).strip(),
        })

    # Deduplicate by path (keep the longest content for each path)
    seen: Dict[str, int] = {}
    deduped: List[Dict[str, str]] = []
    for f in files:
        path = f["path"]
        if path in seen:
            # Keep the file with longer content
            idx = seen[path]
            if len(f["content"]) > len(deduped[idx]["content"]):
                deduped[idx]["content"] = f["content"]
        else:
            seen[path] = len(deduped)
            deduped.append(f)

    return deduped

