from dataclasses import asdict, dataclass
from typing import Any

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from pydantic import ValidationError

from config import config
from logging_config import get_logger, request_id_var, trace_id_var

logger = get_logger(__name__)


@dataclass
class ProblemDetails:
    type: str
    title: str
    status: int
    detail: str
    instance: str
    code: str
    request_id: str
    trace_id: str
    details: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        result = asdict(self)
        if result["details"] is None:
            del result["details"]
        return result


def get_error_code(status_code: int, detail: str = "") -> str:
    if status_code == 400:
        if "duplicate" in detail.lower() or "already exists" in detail.lower():
            return "VALIDATION.INVALID_FIELDS"
        if "missing" in detail.lower() or "required" in detail.lower():
            return "VALIDATION.MISSING_REQUIRED"
        return "VALIDATION.INVALID_FIELDS"
    elif status_code == 401:
        if "expired" in detail.lower():
            return "AUTH.TOKEN_EXPIRED"
        return "AUTH.INVALID_TOKEN"
    elif status_code == 403:
        return "AUTH.INSUFFICIENT_PERMISSIONS"
    elif status_code == 404:
        return "RESOURCE.NOT_FOUND"
    elif status_code == 409:
        if "version" in detail.lower():
            return "CONFLICT.VERSION_MISMATCH"
        return "CONFLICT.DUPLICATE"
    elif status_code == 422:
        return "VALIDATION.UNPROCESSABLE"
    elif status_code == 429:
        return "RATE_LIMIT.EXCEEDED"
    elif status_code == 502:
        return "SERVER.BAD_GATEWAY"
    elif status_code == 503:
        return "SERVER.UNAVAILABLE"
    elif status_code == 504:
        return "SERVER.GATEWAY_TIMEOUT"
    elif status_code >= 500:
        return "SERVER.INTERNAL_ERROR"
    else:
        return "SERVER.INTERNAL_ERROR"


def get_error_type_url(code: str) -> str:
    kebab_case = code.replace(".", "-").replace("_", "-").lower()
    return f"{config.ERROR_TYPE_BASE_URL}/{kebab_case}"


def get_error_title(code: str) -> str:
    parts = code.split(".")
    return " ".join(part.replace("_", " ").title() for part in parts)


def create_problem_details(
    status_code: int,
    detail: str,
    instance: str,
    code: str | None = None,
    details: dict[str, Any] | None = None,
) -> ProblemDetails:
    if code is None:
        code = get_error_code(status_code, detail)

    return ProblemDetails(
        type=get_error_type_url(code),
        title=get_error_title(code),
        status=status_code,
        detail=detail,
        instance=instance,
        code=code,
        request_id=request_id_var.get(),
        trace_id=trace_id_var.get(),
        details=details,
    )


async def http_exception_handler(request: Request, exc: Exception) -> Response:
    http_exc = exc if isinstance(exc, HTTPException) else HTTPException(status_code=500)
    problem = create_problem_details(
        status_code=http_exc.status_code,
        detail=http_exc.detail,
        instance=str(request.url.path),
    )

    logger.error(
        "http_exception",
        http_status_code=http_exc.status_code,
        error_code=problem.code,
        error_detail=http_exc.detail,
        http_path=str(request.url.path),
    )

    return JSONResponse(
        status_code=http_exc.status_code,
        content=problem.to_dict(),
        headers={"Content-Type": "application/problem+json"},
    )


async def validation_exception_handler(
    request: Request, exc: Exception
) -> Response:
    if not isinstance(exc, (RequestValidationError, ValidationError)):
        return await generic_exception_handler(request, exc)
    
    errors = exc.errors()
    field_errors = [
        {"field": ".".join(str(loc) for loc in error["loc"]), "error": error["msg"]}
        for error in errors
    ]

    problem = create_problem_details(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Request validation failed",
        instance=str(request.url.path),
        code="VALIDATION.INVALID_FIELDS",
        details={"fields": field_errors},
    )

    logger.error(
        "validation_error",
        http_status_code=status.HTTP_400_BAD_REQUEST,
        error_code=problem.code,
        field_errors=field_errors,
        http_path=str(request.url.path),
    )

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=problem.to_dict(),
        headers={"Content-Type": "application/problem+json"},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> Response:
    import traceback

    error_stack = traceback.format_exc()

    problem = create_problem_details(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected error occurred",
        instance=str(request.url.path),
        code="SERVER.INTERNAL_ERROR",
    )

    logger.error(
        "unhandled_exception",
        http_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code=problem.code,
        error_type=type(exc).__name__,
        error_message=str(exc),
        error_stack=error_stack,
        http_path=str(request.url.path),
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=problem.to_dict(),
        headers={"Content-Type": "application/problem+json"},
    )
