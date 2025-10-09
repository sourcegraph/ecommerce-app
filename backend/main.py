from logging_config import get_logger

logger = get_logger(__name__)


def main():
    logger.info("backend_started", message="Hello from backend!")


if __name__ == "__main__":
    main()
