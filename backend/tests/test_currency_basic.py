from decimal import Decimal

from app.currency_service import CurrencyService


def test_currency_service_basic_functionality(session):
    """Test basic currency service functionality"""
    service = CurrencyService(session)
    
    # Test getting supported currencies
    currencies = service.get_supported_currencies()
    assert len(currencies) > 0
    assert "USD" in currencies
    
    # Test same currency conversion
    result = service.convert_minor(10000, "USD", "USD")
    assert result == 10000
    
    # Test same currency rate
    rate = service.get_rate("USD", "USD")
    assert rate == Decimal("1.0")
