from pydantic import BaseModel, Field, field_validator
from sqlmodel import SQLModel
from enum import Enum

class Currency(str, Enum):
    USD = "USD"
    GBP = "GBP"
    EUR = "EUR"
    AUD = "AUD"
    MXN = "MXN"
    JPY = "JPY"

class Money(BaseModel):
    """Pydantic schema for money representation with minor units (e.g., cents)"""
    amount_minor: int = Field(..., description="Amount in minor units (e.g., cents for USD)")
    currency: Currency = Field(default=Currency.USD)
    
    @field_validator('amount_minor')
    def amount_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('Amount must be non-negative')
        return v
    
    @property
    def amount(self) -> float:
        """Convert minor units to major units (e.g., cents to dollars)"""
        if self.currency == Currency.JPY:
            # JPY doesn't have minor units
            return float(self.amount_minor)
        return self.amount_minor / 100.0
    
    @classmethod
    def from_amount(cls, amount: float, currency: Currency = Currency.USD) -> "Money":
        """Create Money from major units (e.g., dollars)"""
        if currency == Currency.JPY:
            # JPY doesn't have minor units
            amount_minor = int(round(amount))
        else:
            amount_minor = int(round(amount * 100))
        return cls(amount_minor=amount_minor, currency=currency)

class MoneyFields(SQLModel):
    """Mixin for SQLModel entities that need money fields"""
    # This is a base class - specific implementations will define their own fields
    pass

# ExchangeRateLatest model is defined in models.py to avoid circular imports
