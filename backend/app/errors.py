from typing import Any, Optional
from pydantic import BaseModel
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import structlog


class ProblemDetails(BaseModel):
    type: str
    title: str
    status: int
    detail: str
    instance: str
    code: str
    request_id: str
    trace_id: str
    details: Optional[dict[str, Any]] = None


ERROR_CODE_MAP = {
    400: "VALIDATION.INVALID_FIELDS",
    401: "AUTH.INVALID_TOKEN",
    403: "AUTH.INSUFFICIENT_PERMISSIONS",
    404: "RESOURCE.NOT_FOUND",
    409: "CONFLICT.DUPLICATE",
    422: "VALIDATION.UNPROCESSABLE",
    429: "RATE_LIMIT.EXCEEDED",
    500: "SERVER.INTERNAL_ERROR",
    502: "SERVER.BAD_GATEWAY",
    503: "SERVER.UNAVAILABLE",
    504: "SERVER.GATEWAY_TIMEOUT",
}


STATUS_TITLE_MAP = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
}


def make_error_type_uri(code: str) -> str:
    return f"https://docs.lineasupply.com/errors/{code.lower().replace('.', '-')}"


def add_exception_handlers(app: FastAPI) -> None:
    logger = structlog.get_logger()

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        trace_id = getattr(request.state, "trace_id", "unknown")
        request_id = getattr(request.state, "request_id", "unknown")
        
        code = ERROR_CODE_MAP.get(exc.status_code, "SERVER.INTERNAL_ERROR")
        title = STATUS_TITLE_MAP.get(exc.status_code, "Error")
        
        problem = ProblemDetails(
            type=make_error_type_uri(code),
            title=title,
            status=exc.status_code,
            detail=exc.detail,
            instance=str(request.url.path),
            code=code,
            request_id=request_id,
            trace_id=trace_id,
        )
        
        logger.warning(
            "HTTP exception",
            http_status_code=exc.status_code,
            error_code=code,
            error_detail=exc.detail,
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content=problem.model_dump(exclude_none=True),
            media_type="application/problem+json",
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        trace_id = getattr(request.state, "trace_id", "unknown")
        request_id = getattr(request.state, "request_id", "unknown")
        
        fields = [
            {
                "field": ".".join(str(loc) for loc in error["loc"] if loc != "body"),
                "error": error["msg"],
            }
            for error in exc.errors()
        ]
        
        problem = ProblemDetails(
            type=make_error_type_uri("VALIDATION.INVALID_FIELDS"),
            title="Validation Error",
            status=400,
            detail="Request body contains invalid fields",
            instance=str(request.url.path),
            code="VALIDATION.INVALID_FIELDS",
            request_id=request_id,
            trace_id=trace_id,
            details={"fields": fields},
        )
        
        logger.warning(
            "Validation error",
            http_status_code=400,
            error_code="VALIDATION.INVALID_FIELDS",
            validation_errors=fields,
        )
        
        return JSONResponse(
            status_code=400,
            content=problem.model_dump(exclude_none=True),
            media_type="application/problem+json",
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        trace_id = getattr(request.state, "trace_id", "unknown")
        request_id = getattr(request.state, "request_id", "unknown")
        
        logger.error(
            "Unhandled exception",
            http_status_code=500,
            error_code="SERVER.INTERNAL_ERROR",
            error_type=type(exc).__name__,
            error_message=str(exc),
            exc_info=True,
        )
        
        problem = ProblemDetails(
            type=make_error_type_uri("SERVER.INTERNAL_ERROR"),
            title="Internal Server Error",
            status=500,
            detail="An unexpected error occurred",
            instance=str(request.url.path),
            code="SERVER.INTERNAL_ERROR",
            request_id=request_id,
            trace_id=trace_id,
        )
        
        return JSONResponse(
            status_code=500,
            content=problem.model_dump(exclude_none=True),
            media_type="application/problem+json",
        )
