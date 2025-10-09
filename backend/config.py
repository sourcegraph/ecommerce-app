import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SERVICE_NAME: str = os.getenv("SERVICE_NAME", "linea-api")
    SERVICE_VERSION: str = os.getenv("SERVICE_VERSION", "1.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ERROR_TYPE_BASE_URL: str = os.getenv(
        "ERROR_TYPE_BASE_URL", "https://docs.lineasupply.com/errors"
    )


config = Config()
