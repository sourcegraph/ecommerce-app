from typing import Optional, Dict, Any
from datetime import datetime

from .schemas import PriceInfo, FXMetadata
from .currency_service import CurrencyService
from .settings import BASE_CURRENCY, get_currency_decimals


def create_price_info(amount_minor: int, currency: str) -> PriceInfo:
    """Create PriceInfo object from minor units"""
    decimals = get_currency_decimals(currency)
    if decimals == 0:  # JPY has no decimal places
        amount = float(amount_minor)
    else:
        amount = amount_minor / (10 ** decimals)
    
    return PriceInfo(
        amount=amount,
        amount_minor=amount_minor,
        currency=currency
    )


def convert_price_with_service(
    amount_minor: int, 
    from_currency: str, 
    to_currency: str,
    currency_service: CurrencyService
) -> tuple[PriceInfo, Optional[FXMetadata]]:
    """
    Convert price using CurrencyService and return converted price with FX metadata
    
    Returns:
        (converted_price_info, fx_metadata)
    """
    if from_currency == to_currency:
        return create_price_info(amount_minor, to_currency), None
    
    # Convert amount
    converted_amount_minor = currency_service.convert_minor(
        amount_minor, from_currency, to_currency
    )
    
    # Create price info
    converted_price = create_price_info(converted_amount_minor, to_currency)
    
    # Get FX metadata
    rate = currency_service.get_rate(from_currency, to_currency)
    if rate is not None:
        fx_metadata = FXMetadata(
            rate=rate,
            provider="exchangerate.host",
            timestamp=datetime.utcnow().isoformat()
        )
    else:
        raise ValueError(f"Could not get exchange rate from {from_currency} to {to_currency}")
    
    return converted_price, fx_metadata


def get_currency_info_dict() -> Dict[str, Dict[str, Any]]:
    """Get currency information for supported currencies"""
    return {
        "USD": {"name": "US Dollar", "symbol": "$", "decimal_places": 2},
        "EUR": {"name": "Euro", "symbol": "€", "decimal_places": 2},
        "GBP": {"name": "British Pound", "symbol": "£", "decimal_places": 2},
        "JPY": {"name": "Japanese Yen", "symbol": "¥", "decimal_places": 0},
        "AUD": {"name": "Australian Dollar", "symbol": "A$", "decimal_places": 2},
        "MXN": {"name": "Mexican Peso", "symbol": "MX$", "decimal_places": 2},
    }


def extract_price_minor_from_product(product) -> tuple[int, str]:
    """
    Extract price in minor units from product, handling both new and legacy fields.
    
    Returns:
        (amount_minor, currency)
    """
    if hasattr(product, 'price_amount_minor') and product.price_amount_minor is not None:
        return product.price_amount_minor, product.price_currency
    else:
        # Fallback to legacy price field - convert to minor units
        currency = BASE_CURRENCY
        decimals = get_currency_decimals(currency)
        if decimals == 0:
            amount_minor = int(product.price)
        else:
            amount_minor = int(product.price * (10 ** decimals))
        return amount_minor, currency


def extract_delivery_price_minor_from_option(delivery_option) -> tuple[int, str]:
    """
    Extract delivery price in minor units from delivery option, handling both new and legacy fields.
    
    Returns:
        (amount_minor, currency)
    """
    if hasattr(delivery_option, 'price_amount_minor') and delivery_option.price_amount_minor is not None:
        return delivery_option.price_amount_minor, delivery_option.price_currency
    else:
        # Fallback to legacy price field - convert to minor units
        currency = BASE_CURRENCY
        decimals = get_currency_decimals(currency)
        if decimals == 0:
            amount_minor = int(delivery_option.price)
        else:
            amount_minor = int(delivery_option.price * (10 ** decimals))
        return amount_minor, currency
