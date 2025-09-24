from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models import DeliverySpeed

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
    is_featured: bool = False

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
    is_featured: Optional[bool] = None
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
