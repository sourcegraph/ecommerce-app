import logging
import sys
from collections.abc import MutableMapping
from contextvars import ContextVar
from typing import Any

import structlog
from config import config

trace_id_var: ContextVar[str] = ContextVar("trace_id", default="")
span_id_var: ContextVar[str] = ContextVar("span_id", default="")
request_id_var: ContextVar[str] = ContextVar("request_id", default="")


def add_trace_context(
    logger: Any, method_name: str, event_dict: MutableMapping[str, Any]
) -> MutableMapping[str, Any]:
    trace_id = trace_id_var.get()
    span_id = span_id_var.get()
    request_id = request_id_var.get()

    if trace_id:
        event_dict["trace_id"] = trace_id
    if span_id:
        event_dict["span_id"] = span_id
    if request_id:
        event_dict["request_id"] = request_id

    event_dict["service_name"] = config.SERVICE_NAME
    event_dict["service_version"] = config.SERVICE_VERSION
    event_dict["environment"] = config.ENVIRONMENT

    return event_dict


def configure_logging() -> None:
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            add_trace_context,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO if config.ENVIRONMENT == "production" else logging.DEBUG,
    )

    for logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        logger = logging.getLogger(logger_name)
        logger.handlers = []
        logger.propagate = True


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name)


configure_logging()
