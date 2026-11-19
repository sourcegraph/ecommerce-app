from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from .schemas import ErrorResponse
from .codes import ErrorCode
from .exceptions import AppError


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        body = ErrorResponse(
            code=exc.status_code,
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=body.model_dump(),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        errors = []
        for error in exc.errors():
            error_dict = dict(error)
            if "ctx" in error_dict:
                ctx = error_dict["ctx"]
                if isinstance(ctx, dict):
                    for key, value in ctx.items():
                        if isinstance(value, Exception):
                            ctx[key] = str(value)
                error_dict["ctx"] = ctx
            errors.append(error_dict)

        details = {"errors": errors}
        body = ErrorResponse(
            code=422,
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Validation error",
            details=details,
        )
        return JSONResponse(status_code=422, content=body.model_dump())

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        if exc.status_code == 404:
            code = ErrorCode.NOT_FOUND
        elif exc.status_code == 409:
            code = ErrorCode.CONFLICT
        elif 400 <= exc.status_code < 500:
            code = ErrorCode.BAD_REQUEST
        else:
            code = ErrorCode.INTERNAL_SERVER_ERROR

        body = ErrorResponse(
            code=exc.status_code,
            error_code=code,
            message=str(exc.detail) if exc.detail else "Error",
        )
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
        body = ErrorResponse(
            code=500,
            error_code=ErrorCode.INTERNAL_SERVER_ERROR,
            message="Internal server error",
        )
        return JSONResponse(status_code=500, content=body.model_dump())
