from typing import Any
from .codes import ErrorCode


class AppError(Exception):
    status_code: int
    error_code: ErrorCode
    message: str
    details: dict[str, Any] | None

    def __init__(
        self,
        *,
        status_code: int,
        error_code: ErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details


class NotFoundError(AppError):
    def __init__(
        self,
        *,
        error_code: ErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            status_code=404,
            error_code=error_code,
            message=message,
            details=details,
        )


class BadRequestError(AppError):
    def __init__(
        self,
        *,
        error_code: ErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            status_code=400,
            error_code=error_code,
            message=message,
            details=details,
        )


class ConflictError(AppError):
    def __init__(
        self,
        *,
        error_code: ErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            status_code=409,
            error_code=error_code,
            message=message,
            details=details,
        )
