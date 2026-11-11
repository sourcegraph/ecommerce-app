from typing import Any
from pydantic import BaseModel
from .codes import ErrorCode


class ErrorResponse(BaseModel):
    code: int
    error_code: ErrorCode
    message: str
    details: dict[str, Any] | None = None
