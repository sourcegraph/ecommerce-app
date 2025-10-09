import secrets
import time
import re
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import structlog


TRACEPARENT_PATTERN = re.compile(r'^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$')


def parse_traceparent(traceparent: str) -> tuple[str, str] | None:
    match = TRACEPARENT_PATTERN.match(traceparent)
    if match:
        return match.group(1), match.group(2)
    return None


def generate_trace_id() -> str:
    return secrets.token_hex(16)


def generate_span_id() -> str:
    return secrets.token_hex(8)


def make_traceparent(trace_id: str, span_id: str) -> str:
    return f"00-{trace_id}-{span_id}-01"


class TracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        traceparent_header = request.headers.get("traceparent", "")
        parsed = parse_traceparent(traceparent_header)
        
        if parsed:
            trace_id, parent_span_id = parsed
            span_id = generate_span_id()
        else:
            trace_id = generate_trace_id()
            span_id = generate_span_id()
        
        request_id = trace_id
        
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            trace_id=trace_id,
            span_id=span_id,
            request_id=request_id,
        )
        
        request.state.trace_id = trace_id
        request.state.span_id = span_id
        request.state.request_id = request_id
        request.state.start_time = time.time()
        
        logger = structlog.get_logger()
        
        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = int((time.time() - request.state.start_time) * 1000)
            logger.error(
                "Request failed",
                http_method=request.method,
                http_path=request.url.path,
                http_status_code=500,
                duration_ms=duration_ms,
                error_type=type(exc).__name__,
                error_message=str(exc),
            )
            raise
        
        duration_ms = int((time.time() - request.state.start_time) * 1000)
        
        response.headers["X-Request-ID"] = request_id
        response.headers["traceparent"] = make_traceparent(trace_id, span_id)
        
        logger.info(
            "Request completed",
            http_method=request.method,
            http_path=request.url.path,
            http_status_code=response.status_code,
            duration_ms=duration_ms,
        )
        
        return response
