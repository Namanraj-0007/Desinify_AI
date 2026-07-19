import asyncio
from typing import Optional

from app.services.mongo import get_client


async def ping_mongo(timeout_s: float = 2.5) -> Optional[str]:

    """Ping Mongo with a small timeout so auth endpoints don't hang.

    Returns:
      - "ok" when reachable
      - otherwise returns a multi-line error string including:
        type, str(e), repr(e), and full traceback
    """

    import traceback

    try:
        client = get_client()
        await asyncio.wait_for(client.admin.command('ping'), timeout=timeout_s)
        return "ok"

    except Exception as e:
        err_type = type(e).__name__
        return (
            f"{err_type}: {str(e)}\n"
            f"repr={repr(e)}\n"
            f"traceback:\n{traceback.format_exc()}"
        )


