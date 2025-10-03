from sqlmodel import SQLModel, Field, Session, select
from sqlalchemy import Column, JSON
from typing import Optional, Literal
from datetime import datetime, UTC
from pydantic import BaseModel
import httpx


CurrencyCode = Literal["USD", "GBP", "EUR", "AUD", "MXN", "JPY"]

TTL_SECONDS = 21600


class FxRates(SQLModel, table=True):
    __tablename__ = "fx_rates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    base: str = Field(default="USD")
    rates: dict = Field(sa_column=Column(JSON))
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class RatesResponse(BaseModel):
    base: str
    rates: dict[str, float]
    fetched_at: datetime
    ttl_seconds: int
    stale: bool


class FxService:
    def __init__(self, session: Session):
        self.session = session
        self._cache: Optional[dict] = None
        self._cache_fetched_at: Optional[datetime] = None
    
    def get_rates(self) -> RatesResponse:
        now = datetime.now(UTC)
        
        if self._is_cache_valid(now) and self._cache is not None and self._cache_fetched_at is not None:
            return self._build_response(
                self._cache,
                self._cache_fetched_at,
                stale=False
            )
        
        try:
            fresh_rates = self.fetch_from_provider()
            self._cache = fresh_rates
            self._cache_fetched_at = now
            
            self._persist_to_db(fresh_rates, now)
            
            return self._build_response(fresh_rates, now, stale=False)
        except Exception:
            db_rates = self._get_from_db()
            if db_rates:
                self._cache = db_rates["rates"]
                self._cache_fetched_at = db_rates["fetched_at"]
                return self._build_response(
                    db_rates["rates"],
                    db_rates["fetched_at"],
                    stale=True
                )
            
            return self._build_response(
                {},
                now,
                stale=True
            )
    
    def _is_cache_valid(self, now: datetime) -> bool:
        if self._cache is None or self._cache_fetched_at is None:
            return False
        
        age = (now - self._cache_fetched_at).total_seconds()
        return age < TTL_SECONDS
    
    def fetch_from_provider(self) -> dict:
        url = "https://api.frankfurter.app/latest"
        params = {
            "from": "USD",
            "to": "GBP,EUR,AUD,MXN,JPY"
        }
        
        response = httpx.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        
        data = response.json()
        return data["rates"]
    
    def _persist_to_db(self, rates: dict, fetched_at: datetime) -> None:
        fx_rates = FxRates(
            base="USD",
            rates=rates,
            fetched_at=fetched_at
        )
        self.session.add(fx_rates)
        self.session.commit()
    
    def _get_from_db(self) -> Optional[dict]:
        stmt = select(FxRates).order_by(FxRates.fetched_at.desc()).limit(1)  # type: ignore[attr-defined]
        result = self.session.exec(stmt).first()
        
        if result:
            return {
                "rates": result.rates,
                "fetched_at": result.fetched_at
            }
        return None
    
    def _build_response(
        self,
        rates: dict,
        fetched_at: datetime,
        stale: bool
    ) -> RatesResponse:
        all_rates = {"USD": 1.0, **rates}
        
        return RatesResponse(
            base="USD",
            rates=all_rates,
            fetched_at=fetched_at,
            ttl_seconds=TTL_SECONDS,
            stale=stale
        )
