"""Tests for money and currency functionality"""

import pytest
from decimal import Decimal
from app.money import Money, Currency
from app.models import ExchangeRateLatest
from sqlmodel import Session, select


def test_money_creation():
    """Test Money schema creation and conversion"""
    # Test creation from minor units
    money = Money(amount_minor=2999, currency=Currency.USD)
    assert money.amount_minor == 2999
    assert money.currency == Currency.USD
    assert money.amount == 29.99
    
    # Test JPY (no minor units)
    money_jpy = Money(amount_minor=1000, currency=Currency.JPY)
    assert money_jpy.amount == 1000.0  # JPY doesn't have minor units
    
    # Test creation from amount
    money_from_amount = Money.from_amount(29.99, Currency.USD)
    assert money_from_amount.amount_minor == 2999
    assert money_from_amount.currency == Currency.USD
    
    money_jpy_from_amount = Money.from_amount(1000, Currency.JPY)
    assert money_jpy_from_amount.amount_minor == 1000
    assert money_jpy_from_amount.currency == Currency.JPY


def test_money_validation():
    """Test Money validation"""
    # Test negative amount raises error
    with pytest.raises(ValueError, match="Amount must be non-negative"):
        Money(amount_minor=-100, currency=Currency.USD)


def test_exchange_rates_exist(session: Session):
    """Test that exchange rates were seeded"""
        # Check USD to GBP rate exists
    # Check USD to GBP rate exists
    rate = session.exec(
        select(ExchangeRateLatest).where(
            ExchangeRateLatest.from_currency == "USD",
            ExchangeRateLatest.to_currency == "GBP"
        )
    ).first()
    
    assert rate is not None
    assert rate.rate_decimal == Decimal("0.8200")
    assert rate.provider == "development_seed"


def test_supported_currencies():
    """Test that all supported currencies are available"""
    supported = ["USD", "GBP", "EUR", "AUD", "MXN", "JPY"]
    
    for curr_code in supported:
        currency = Currency(curr_code)
        assert currency.value == curr_code
