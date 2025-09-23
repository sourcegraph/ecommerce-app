from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
from sqlmodel import Session

from app.models import ExchangeRate
from app.settings import BASE_CURRENCY, FX_TTL_SECONDS


def get_mock_exchange_rate_data(overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Factory function for exchange rate data with optional overrides"""
    base = {
        "base_currency": BASE_CURRENCY,
        "target_currency": "EUR", 
        "rate": Decimal("0.85"),
        "fetched_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(seconds=FX_TTL_SECONDS),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    return base | (overrides or {})


def create_mock_exchange_rate(
    session: Session, 
    overrides: Optional[Dict[str, Any]] = None
) -> ExchangeRate:
    """Create a mock exchange rate in the database"""
    data = get_mock_exchange_rate_data(overrides)
    rate = ExchangeRate(**data)
    session.add(rate)
    session.commit() 
    session.refresh(rate)
    return rate


def create_standard_exchange_rates(session: Session) -> list[ExchangeRate]:
    """Create a standard set of exchange rates for testing"""
    rates = []
    
    # Base currency rate (1.0)
    rates.append(create_mock_exchange_rate(
        session,
        {"base_currency": BASE_CURRENCY, "target_currency": BASE_CURRENCY, "rate": Decimal("1.0")}
    ))
    
    # USD to other currencies
    currencies_and_rates = {
        "EUR": Decimal("0.85"),
        "GBP": Decimal("0.75"), 
        "JPY": Decimal("110.0"),
        "AUD": Decimal("1.35"),
        "MXN": Decimal("18.5")
    }
    
    for currency, rate_value in currencies_and_rates.items():
        rates.append(create_mock_exchange_rate(
            session,
            {
                "base_currency": BASE_CURRENCY,
                "target_currency": currency,
                "rate": rate_value
            }
        ))
    
    return rates


def create_expired_exchange_rate(
    session: Session,
    overrides: Optional[Dict[str, Any]] = None
) -> ExchangeRate:
    """Create an expired exchange rate for testing fallback behavior"""
    yesterday = datetime.utcnow() - timedelta(days=1)
    default_overrides = {
        "fetched_at": yesterday,
        "expires_at": yesterday + timedelta(seconds=FX_TTL_SECONDS),
        "created_at": yesterday,
        "updated_at": yesterday
    }
    merged_overrides = default_overrides | (overrides or {})
    return create_mock_exchange_rate(session, merged_overrides)


def get_mock_api_response_data(overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Factory function for API response data"""
    base = {
        "success": True,
        "base": BASE_CURRENCY,
        "date": "2025-09-23",
        "rates": {
            "EUR": 0.85,
            "GBP": 0.75,
            "JPY": 110.0,
            "AUD": 1.35,
            "MXN": 18.5
        }
    }
    return base | (overrides or {})


def get_mock_currency_conversion_data(overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Factory function for currency conversion test data"""
    base = {
        "amount_minor": 10000,  # $100.00 in cents
        "from_currency": "USD",
        "to_currency": "EUR",
        "expected_amount_minor": 8500  # €85.00 in cents
    }
    return base | (overrides or {})
