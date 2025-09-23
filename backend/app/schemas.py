from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from app.models import DeliverySpeed
from app.money import Currency

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1)

    @field_validator('name')
    def name_must_not_be_empty_or_whitespace(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty or whitespace')
        return v.strip()

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

class ProductBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    is_saved: bool = False

    @field_validator('title', 'description')
    def strings_must_not_be_empty_or_whitespace(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty or whitespace')
        return v.strip()

    @field_validator('price')
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        # Check decimal places (reject more than 2 decimal places)
        if round(v, 2) != v:
            raise ValueError('Price can have at most 2 decimal places')
        return v

class ProductCreate(ProductBase):
    category_id: int

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_saved: Optional[bool] = None
    category_id: Optional[int] = None

class ProductRead(ProductBase):
    id: int
    category_id: int
    image_url: Optional[str] = None  # Generated URL for frontend
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryRead] = None
    delivery_summary: Optional["DeliverySummary"] = None

class ProductReadWithCategory(ProductRead):
    category: CategoryRead

class CategoryReadWithProducts(CategoryRead):
    products: List[ProductRead] = []

class DeliveryOptionBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    speed: DeliverySpeed
    price: float = Field(..., ge=0)
    min_order_amount: Optional[float] = Field(default=None, ge=0)
    estimated_days_min: int = Field(..., ge=0)
    estimated_days_max: int = Field(..., ge=0)
    is_active: bool = True

    @field_validator('name', 'description')
    def strings_must_not_be_empty_or_whitespace(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty or whitespace')
        return v.strip()

    @field_validator('price')
    def price_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('Price must be non-negative')
        if round(v, 2) != v:
            raise ValueError('Price can have at most 2 decimal places')
        return v

    @field_validator('estimated_days_min', 'estimated_days_max')
    def days_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('Estimated days must be non-negative')
        return v

class DeliveryOptionCreate(DeliveryOptionBase):
    pass

class DeliveryOptionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    speed: Optional[DeliverySpeed] = None
    price: Optional[float] = None
    min_order_amount: Optional[float] = None
    estimated_days_min: Optional[int] = None
    estimated_days_max: Optional[int] = None
    is_active: Optional[bool] = None

class DeliveryOptionRead(DeliveryOptionBase):
    id: int
    created_at: datetime
    updated_at: datetime

class DeliverySummary(BaseModel):
    has_free: bool
    cheapest_price: float
    fastest_days_min: int
    fastest_days_max: int
    options_count: int

class ProductReadWithDeliveryOptions(ProductRead):
    delivery_options: List[DeliveryOptionRead] = []

# Multi-currency schemas
class MoneySchema(BaseModel):
    """Schema for Money representation"""
    amount_minor: int = Field(..., description="Amount in minor units (e.g., cents)")
    currency: Currency = Field(default=Currency.USD)

class UserBase(BaseModel):
    email: str = Field(..., pattern=r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

class OrderBase(BaseModel):
    user_id: int
    currency: str = Field(default="USD", pattern=r'^[A-Z]{3}$')
    total_amount_minor: int = Field(..., ge=0)

class OrderCreate(OrderBase):
    pass

class OrderRead(OrderBase):
    id: int
    total_usd_minor: int
    fx_rate_decimal: Optional[float] = None
    fx_provider: Optional[str] = None
    fx_timestamp: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price_amount_minor: int = Field(..., ge=0)
    unit_price_currency: str = Field(..., pattern=r'^[A-Z]{3}$')

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemRead(OrderItemBase):
    id: int
    order_id: int
    subtotal_amount_minor: int
    created_at: datetime
    updated_at: datetime

# Currency API schemas
class CurrencyInfo(BaseModel):
    """Currency configuration info"""
    code: str = Field(..., description="ISO 4217 currency code")
    name: str = Field(..., description="Human-readable currency name")
    symbol: str = Field(..., description="Currency symbol")
    decimal_places: int = Field(..., description="Number of decimal places")

class SupportedCurrenciesResponse(BaseModel):
    """Response for GET /config/currencies"""
    base_currency: str = Field(..., description="Base currency for the system")
    supported_currencies: List[CurrencyInfo] = Field(..., description="List of supported currencies")

class PriceInfo(BaseModel):
    """Price information in a specific currency"""
    amount: float = Field(..., description="Price in major units (e.g., dollars)")
    amount_minor: int = Field(..., description="Price in minor units (e.g., cents)")
    currency: str = Field(..., description="ISO 4217 currency code")

# Updated ProductRead with currency support
class ProductReadWithCurrency(ProductBase):
    id: int
    category_id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryRead] = None
    delivery_summary: Optional[DeliverySummary] = None
    # New currency fields
    price_money: Optional[PriceInfo] = Field(None, description="Price in requested currency")
    base_price_money: Optional[PriceInfo] = Field(None, description="Price in base currency")

class FXMetadata(BaseModel):
    """Foreign exchange metadata"""
    rate: Decimal = Field(..., description="Exchange rate used")
    provider: str = Field(..., description="FX rate provider")
    timestamp: str = Field(..., description="ISO timestamp when rate was fetched")

class CartTotals(BaseModel):
    """Cart totals in requested currency"""
    subtotal: PriceInfo = Field(..., description="Subtotal before delivery")
    delivery_cost: PriceInfo = Field(..., description="Delivery cost")
    total: PriceInfo = Field(..., description="Total amount")
    fx_metadata: Optional[FXMetadata] = Field(None, description="FX conversion metadata if currency != base")

class CheckoutTotals(BaseModel):
    """Checkout totals with FX metadata"""
    currency: str = Field(..., description="Currency for the checkout")
    subtotal: PriceInfo = Field(..., description="Subtotal before delivery and taxes")
    delivery_cost: PriceInfo = Field(..., description="Delivery cost")
    tax: PriceInfo = Field(..., description="Tax amount")
    total: PriceInfo = Field(..., description="Total amount")
    fx_metadata: Optional[FXMetadata] = Field(None, description="FX conversion metadata if currency != base")

class OrderTotalsWithSnapshot(CheckoutTotals):
    """Order totals with FX rate snapshot"""
    fx_rates_snapshot: Dict[str, Any] = Field(..., description="Complete FX rates snapshot at order time")
