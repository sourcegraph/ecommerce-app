from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import LargeBinary, Column
from typing import Optional, List
from datetime import datetime, UTC
from enum import Enum

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
    price: float
    
    # BLOB storage for images with explicit LargeBinary column
    image_data: Optional[bytes] = Field(
        default=None,
        sa_column=Column("image_data", LargeBinary)
    )
    image_mime_type: Optional[str] = Field(default=None)  # e.g., "image/jpeg"
    image_filename: Optional[str] = Field(default=None)   # Original filename
    is_saved: bool = Field(default=False)
    is_featured: bool = Field(default=False)  # Flag for featured products in carousel
    
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
    price: float = Field(ge=0)  # Delivery cost, 0 for free shipping
    min_order_amount: Optional[float] = Field(default=None, ge=0)  # Minimum order for this option
    estimated_days_min: int = Field(ge=0)  # Minimum delivery days
    estimated_days_max: int = Field(ge=0)  # Maximum delivery days
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    
    products: List["Product"] = Relationship(
        back_populates="delivery_options", 
        link_model=ProductDeliveryLink
    )


