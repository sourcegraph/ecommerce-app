import os

# Currency settings
BASE_CURRENCY = os.getenv("BASE_CURRENCY", "USD")
SUPPORTED_CURRENCIES = os.getenv("SUPPORTED_CURRENCIES", "USD,EUR,GBP,JPY,AUD,MXN").split(",")
FX_TTL_SECONDS = int(os.getenv("FX_TTL_SECONDS", "3600"))  # 1 hour default

# ExchangeRate API settings  
EXCHANGE_API_URL = "https://api.exchangerate.host/latest"
EXCHANGE_API_TIMEOUT = 10  # seconds

# Currency decimal places mapping
CURRENCY_DECIMALS = {
    "USD": 2,
    "EUR": 2, 
    "GBP": 2,
    "AUD": 2,
    "MXN": 2,
    "JPY": 0,  # Japanese Yen has no decimal places
}

def get_currency_decimals(currency: str) -> int:
    """Get the number of decimal places for a currency"""
    return CURRENCY_DECIMALS.get(currency.upper(), 2)
