from fastapi import HTTPException, Query, Depends
from sqlmodel import Session
from typing import Optional

from .db import get_session
from .currency_service import CurrencyService
from .settings import SUPPORTED_CURRENCIES, BASE_CURRENCY


def validate_currency(currency: Optional[str] = None) -> str:
    """
    Validate currency parameter and return normalized value.
    Returns base currency if no currency provided.
    """
    if currency is None:
        return BASE_CURRENCY
    
    currency_upper = currency.upper()
    if currency_upper not in SUPPORTED_CURRENCIES:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Unsupported currency",
                "code": "UNSUPPORTED_CURRENCY",
                "message": f"Currency '{currency}' is not supported. Supported currencies: {', '.join(SUPPORTED_CURRENCIES)}"
            }
        )
    
    return currency_upper


def get_currency_service(session: Session = Depends(get_session)) -> CurrencyService:
    """Dependency to get CurrencyService instance"""
    return CurrencyService(session)


def get_currency_param(currency: Optional[str] = Query(None, description="ISO 4217 currency code (e.g., USD, EUR)")):
    """Query parameter for currency with validation"""
    return validate_currency(currency)
