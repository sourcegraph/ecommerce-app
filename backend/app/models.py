from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import LargeBinary, Column, Numeric
from typing import Optional, List
from datetime import datetime, UTC
from enum import Enum
from decimal import Decimal

class ProductDeliveryLink(SQLModel, table=True):
    __tablename__ = "product_delivery_options"
    
    product_id: Optional[int] = Field(default=None, foreign_key="products.id", primary_key=True)
    delivery_option_id: Optional[int] = Field(default=None, foreign_key="delivery_options.id", primary_key=True)

class Category(SQLModel, table=True):
    __tablename__ = "categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    
    products: List["Product"] = Relationship(back_populates="category")

class Product(SQLModel, table=True):
    __tablename__ = "products"
    
    id: Optional[int] = Field(default=None, primary_key=True)  # Keep existing JSON IDs
    title: str
    description: str
    price: float  # Keep for backward compatibility
    
    # Multi-currency price fields
    price_amount_minor: Optional[int] = Field(default=None, description="Price in minor units (e.g., cents)")
    price_currency: str = Field(default="USD", max_length=3, description="ISO 4217 currency code")
    
    # BLOB storage for images with explicit LargeBinary column
    image_data: Optional[bytes] = Field(
        default=None,
        sa_column=Column("image_data", LargeBinary)
    )
    image_mime_type: Optional[str] = Field(default=None)  # e.g., "image/jpeg"
    image_filename: Optional[str] = Field(default=None)   # Original filename
    is_saved: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    
    category_id: int = Field(foreign_key="categories.id", index=True)
    category: Optional[Category] = Relationship(back_populates="products")
    delivery_options: List["DeliveryOption"] = Relationship(
        back_populates="products", 
        link_model=ProductDeliveryLink
    )

class DeliverySpeed(str, Enum):
    STANDARD = "standard"
    EXPRESS = "express" 
    NEXT_DAY = "next_day"
    SAME_DAY = "same_day"

class DeliveryOption(SQLModel, table=True):
    __tablename__ = "delivery_options"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)  # e.g., "Standard Shipping", "Express Delivery"
    description: str  # e.g., "3-5 business days"
    speed: DeliverySpeed
    price: float = Field(ge=0)  # Delivery cost, 0 for free shipping - keep for backward compatibility
    min_order_amount: Optional[float] = Field(default=None, ge=0)  # Minimum order for this option - keep for backward compatibility
    
    # Multi-currency delivery price fields
    price_amount_minor: Optional[int] = Field(default=None, description="Delivery price in minor units")
    price_currency: str = Field(default="USD", max_length=3, description="ISO 4217 currency code")
    min_order_amount_minor: Optional[int] = Field(default=None, description="Minimum order in minor units")
    estimated_days_min: int = Field(ge=0)  # Minimum delivery days
    estimated_days_max: int = Field(ge=0)  # Maximum delivery days
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    
    products: List["Product"] = Relationship(
        back_populates="delivery_options", 
        link_model=ProductDeliveryLink
    )


class ExchangeRate(SQLModel, table=True):
    """Table for caching FX rates with proper expiry"""
    __tablename__ = "exchange_rates"
    
    base_currency: str = Field(primary_key=True, max_length=3)
    target_currency: str = Field(primary_key=True, max_length=3) 
    rate: Decimal = Field(sa_column=Column(Numeric(20, 10)))
    provider: Optional[str] = Field(default=None, max_length=50)  # e.g., "exchangerate.host"
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(description="When this rate expires")

class ExchangeRateLatest(SQLModel, table=True):
    """Legacy table for caching latest FX rates - kept for backward compatibility"""
    __tablename__ = "exchange_rates_latest"
    
    from_currency: str = Field(primary_key=True, max_length=3)
    to_currency: str = Field(primary_key=True, max_length=3)
    rate_decimal: Decimal = Field(sa_column=Column(Numeric(20, 10)))
    provider: str = Field(max_length=50)  # e.g., "xe.com", "fixer.io"
    last_updated: Optional[str] = None  # ISO timestamp
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(SQLModel, table=True):
    """User model for orders"""
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    first_name: str
    last_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    orders: List["Order"] = Relationship(back_populates="user")

class Order(SQLModel, table=True):
    """Order model with multi-currency support"""
    __tablename__ = "orders"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    
    # Order currency and totals
    currency: str = Field(max_length=3, default="USD", description="Order currency")
    total_amount_minor: int = Field(description="Total order amount in minor units")
    
    # USD conversion for reporting (snapshot at order time)
    total_usd_minor: int = Field(description="Total amount in USD minor units (cents)")
    fx_rate_decimal: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(20, 10)), description="FX rate used for USD conversion")
    fx_provider: Optional[str] = Field(default=None, max_length=50, description="FX rate provider")
    fx_timestamp: Optional[str] = Field(default=None, description="ISO timestamp of FX rate")
    
    status: str = Field(default="pending", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="orders")
    order_items: List["OrderItem"] = Relationship(back_populates="order")

class OrderItem(SQLModel, table=True):
    """Order item model with multi-currency support"""
    __tablename__ = "order_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", index=True)
    product_id: int = Field(foreign_key="products.id", index=True)
    quantity: int = Field(gt=0)
    
    # Price in order currency at time of order
    unit_price_amount_minor: int = Field(description="Unit price in minor units at time of order")
    unit_price_currency: str = Field(max_length=3, description="Currency of unit price")
    subtotal_amount_minor: int = Field(description="Subtotal (quantity * unit_price) in minor units")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    order: Optional[Order] = Relationship(back_populates="order_items")
    product: Optional[Product] = Relationship()


