from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    is_saved: bool = False

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

class ProductReadWithCategory(ProductRead):
    category: CategoryRead

class CategoryReadWithProducts(CategoryRead):
    products: List[ProductRead] = []
