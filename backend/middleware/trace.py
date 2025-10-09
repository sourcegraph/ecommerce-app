import re
import secrets
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from logging_config import get_logger, request_id_var, span_id_var, trace_id_var

logger = get_logger(__name__)

TRACEPARENT_PATTERN = re.compile(r"^00-([0-9a-f]{32})-([0-9a-f]{16})-01$")


def generate_trace_id() -> str:
    return secrets.token_hex(16)


def generate_span_id() -> str:
    return secrets.token_hex(8)


def parse_traceparent(traceparent: str | None) -> tuple[str, str]:
    if not traceparent:
        return generate_trace_id(), generate_span_id()

    match = TRACEPARENT_PATTERN.match(traceparent)
    if not match:
        return generate_trace_id(), generate_span_id()

    trace_id = match.group(1)
    return trace_id, generate_span_id()


def format_traceparent(trace_id: str, span_id: str) -> str:
    return f"00-{trace_id}-{span_id}-01"


class TraceContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        incoming_traceparent = request.headers.get("traceparent")
        trace_id, span_id = parse_traceparent(incoming_traceparent)
        request_id = trace_id

        trace_id_var.set(trace_id)
        span_id_var.set(span_id)
        request_id_var.set(request_id)

        start_time = time.time()

        logger.info(
            "request_started",
            http_method=request.method,
            http_path=str(request.url.path),
        )

        response = await call_next(request)

        duration_ms = (time.time() - start_time) * 1000

        response.headers["X-Request-ID"] = request_id
        response.headers["traceparent"] = format_traceparent(trace_id, span_id)

        logger.info(
            "request_completed",
            http_method=request.method,
            http_path=str(request.url.path),
            http_status_code=response.status_code,
            duration_ms=round(duration_ms, 2),
        )

        return response
