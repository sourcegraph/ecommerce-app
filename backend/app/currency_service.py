from typing import List
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
import httpx
from sqlmodel import Session, select, col
from fastapi import HTTPException
import logging

from .models import ExchangeRate
from .settings import (
    BASE_CURRENCY, 
    SUPPORTED_CURRENCIES, 
    FX_TTL_SECONDS,
    EXCHANGE_API_URL,
    EXCHANGE_API_TIMEOUT,
    get_currency_decimals
)

logger = logging.getLogger(__name__)


class CurrencyService:
    """Service for handling currency conversion with caching and fallback"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_supported_currencies(self) -> List[str]:
        """Get list of supported currencies"""
        return SUPPORTED_CURRENCIES.copy()
    
    def convert_minor(
        self, 
        amount_minor: int, 
        from_currency: str, 
        to_currency: str
    ) -> int:
        """
        Convert amount from one currency to another.
        
        Args:
            amount_minor: Amount in minor units (e.g., cents for USD)
            from_currency: Source currency code (e.g., "USD")  
            to_currency: Target currency code (e.g., "EUR")
            
        Returns:
            Converted amount in minor units of target currency
        """
        if from_currency == to_currency:
            return amount_minor
            
        # Validate currencies
        if from_currency not in SUPPORTED_CURRENCIES:
            raise ValueError(f"Unsupported source currency: {from_currency}")
        if to_currency not in SUPPORTED_CURRENCIES:
            raise ValueError(f"Unsupported target currency: {to_currency}")
        
        # Convert minor to major units for calculation
        from_decimals = get_currency_decimals(from_currency)
        to_decimals = get_currency_decimals(to_currency)
        
        major_amount = Decimal(amount_minor) / (Decimal("10") ** from_decimals)
        
        # Get exchange rate
        rate = self.get_rate(from_currency, to_currency)
        
        # Convert to target currency
        converted_major = major_amount * rate
        
        # Convert back to minor units with proper rounding
        converted_minor = converted_major * (Decimal("10") ** to_decimals)
        
        return int(converted_minor.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    
    def get_rate(self, from_currency: str, to_currency: str) -> Decimal:
        """
        Get exchange rate from one currency to another.
        
        Args:
            from_currency: Source currency code
            to_currency: Target currency code
            
        Returns:
            Exchange rate as Decimal
            
        Raises:
            ValueError: If currencies are not supported
            HTTPException: If rate cannot be obtained
        """
        if from_currency == to_currency:
            return Decimal("1.0")
        
        # Try to get cached rate
        cached_rate = self._get_cached_rate(from_currency, to_currency)
        if cached_rate and not self._is_rate_expired(cached_rate):
            logger.debug(f"Using cached rate {from_currency} -> {to_currency}: {cached_rate.rate}")
            return cached_rate.rate
            
        # Refresh rates and try again
        try:
            self.refresh_rates(force=True)
            fresh_rate = self._get_cached_rate(from_currency, to_currency)
            if fresh_rate:
                return fresh_rate.rate
        except Exception as e:
            logger.error(f"Failed to refresh rates: {e}")
            # Fall back to cached rate even if expired
            if cached_rate:
                logger.warning(f"Using expired cached rate {from_currency} -> {to_currency}: {cached_rate.rate}")
                return cached_rate.rate
        
        raise HTTPException(
            status_code=503,
            detail=f"Unable to get exchange rate for {from_currency} -> {to_currency}"
        )
    
    def refresh_rates(self, force: bool = False) -> None:
        """
        Refresh exchange rates from external API.
        
        Args:
            force: If True, refresh regardless of cache status
        """
        # Check if we need to refresh
        if not force:
            latest_rate = self.session.exec(
                select(ExchangeRate)
                .where(ExchangeRate.base_currency == BASE_CURRENCY)
                .order_by(col(ExchangeRate.fetched_at).desc())
                .limit(1)
            ).first()
            
            if latest_rate and not self._is_rate_expired(latest_rate):
                logger.debug("Rates are still fresh, skipping refresh")
                return
        
        try:
            logger.info("Refreshing exchange rates from API")
            rates_data = self._fetch_rates_from_api()
            self._store_rates(rates_data)
            logger.info(f"Successfully refreshed {len(rates_data)} exchange rates")
            
        except Exception as e:
            logger.error(f"Failed to refresh exchange rates: {e}")
            raise
    
    def _get_cached_rate(self, from_currency: str, to_currency: str) -> ExchangeRate | None:
        """Get cached exchange rate from database"""
        # Direct rate
        direct_rate = self.session.exec(
            select(ExchangeRate)
            .where(
                ExchangeRate.base_currency == from_currency,
                ExchangeRate.target_currency == to_currency
            )
        ).first()
        
        if direct_rate:
            return direct_rate
            
        # Try inverse rate
        inverse_rate = self.session.exec(
            select(ExchangeRate)
            .where(
                ExchangeRate.base_currency == to_currency,
                ExchangeRate.target_currency == from_currency
            )
        ).first()
        
        if inverse_rate:
            # Create a virtual rate object with inverted rate
            inverted = ExchangeRate(
                base_currency=from_currency,
                target_currency=to_currency,
                rate=Decimal("1") / inverse_rate.rate,
                fetched_at=inverse_rate.fetched_at,
                expires_at=inverse_rate.expires_at
            )
            return inverted
            
        # Try cross-rate via base currency
        if from_currency != BASE_CURRENCY and to_currency != BASE_CURRENCY:
            from_base = self._get_cached_rate(BASE_CURRENCY, from_currency)
            to_base = self._get_cached_rate(BASE_CURRENCY, to_currency)
            
            if from_base and to_base:
                cross_rate = to_base.rate / from_base.rate
                cross = ExchangeRate(
                    base_currency=from_currency,
                    target_currency=to_currency,
                    rate=cross_rate,
                    fetched_at=min(from_base.fetched_at, to_base.fetched_at),
                    expires_at=min(from_base.expires_at, to_base.expires_at)
                )
                return cross
        
        return None
    
    def _is_rate_expired(self, rate: ExchangeRate) -> bool:
        """Check if exchange rate has expired"""
        return datetime.utcnow() > rate.expires_at
    
    def _fetch_rates_from_api(self) -> dict:
        """Fetch current exchange rates from external API"""
        params = {
            "base": BASE_CURRENCY,
            "symbols": ",".join([c for c in SUPPORTED_CURRENCIES if c != BASE_CURRENCY])
        }
        
        with httpx.Client(timeout=EXCHANGE_API_TIMEOUT) as client:
            response = client.get(EXCHANGE_API_URL, params=params)
            response.raise_for_status()
            
            data = response.json()
            if not data.get("success", False):
                raise ValueError(f"API error: {data.get('error', 'Unknown error')}")
                
            return data.get("rates", {})
    
    def _store_rates(self, rates_data: dict) -> None:
        """Store fetched rates in database"""
        now = datetime.utcnow()
        expires_at = now + timedelta(seconds=FX_TTL_SECONDS)
        
        # Store base currency rate (1.0)
        base_rate = ExchangeRate(
            base_currency=BASE_CURRENCY,
            target_currency=BASE_CURRENCY, 
            rate=Decimal("1.0"),
            fetched_at=now,
            expires_at=expires_at
        )
        self.session.add(base_rate)
        
        # Store rates for other currencies
        for currency, rate_value in rates_data.items():
            if currency in SUPPORTED_CURRENCIES:
                rate = ExchangeRate(
                    base_currency=BASE_CURRENCY,
                    target_currency=currency,
                    rate=Decimal(str(rate_value)),
                    fetched_at=now,
                    expires_at=expires_at
                )
                self.session.add(rate)
        
        self.session.commit()
