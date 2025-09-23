from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List, Optional, cast, Any
from sqlalchemy.sql.elements import ColumnElement
import io

from .db import get_session, create_db_and_tables
from .schemas import (
    ProductRead, ProductCreate, ProductUpdate,
    ProductReadWithDeliveryOptions, DeliverySummary,
    CategoryRead, CategoryCreate, CategoryReadWithProducts,
    DeliveryOptionRead,
    # Currency schemas
    CurrencyInfo, SupportedCurrenciesResponse,
    CartTotals, CheckoutTotals, OrderTotalsWithSnapshot
)
from . import crud
from .models import Product, DeliveryOption, Category, ProductDeliveryLink
from .currency_service import CurrencyService
from .background_tasks import background_tasks
from .currency_dependencies import get_currency_param
from .currency_utils import (
    create_price_info, convert_price_with_service, get_currency_info_dict
)
from .settings import BASE_CURRENCY, SUPPORTED_CURRENCIES


def get_currency_service(session: Session = Depends(get_session)) -> CurrencyService:
    """Dependency injection for CurrencyService"""
    return CurrencyService(session)


def calculate_delivery_summary(delivery_options: List[DeliveryOption]) -> Optional[DeliverySummary]:
    """Calculate delivery summary from a list of delivery options"""
    active_options = [opt for opt in delivery_options if opt.is_active]
    if not active_options:
        return None
    
    cheapest = min(active_options, key=lambda o: o.price)
    fastest_min = min(opt.estimated_days_min for opt in active_options)
    fastest_max = min(opt.estimated_days_max for opt in active_options if opt.estimated_days_min == fastest_min)
    
    return DeliverySummary(
        has_free=any(opt.price == 0 for opt in active_options),
        cheapest_price=cheapest.price,
        fastest_days_min=fastest_min,
        fastest_days_max=fastest_max,
        options_count=len(active_options)
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    await background_tasks.start()
    yield
    # Shutdown
    await background_tasks.stop()

app = FastAPI(
    title="E-commerce Store API",
    description="A FastAPI backend for the e-commerce demo with multi-currency support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "E-commerce API with multi-currency support is running"}

# Category endpoints
@app.post("/categories", response_model=CategoryRead)
def create_category(
    category: CategoryCreate,
    session: Session = Depends(get_session)
):
    existing_category = crud.get_category_by_name(session, category.name)
    if existing_category:
        raise HTTPException(
            status_code=400,
            detail=f"Category with name '{category.name}' already exists"
        )
    return crud.create_category(session, category)

@app.get("/api/categories", response_model=List[CategoryRead])
def get_categories_for_filter(session: Session = Depends(get_session)):
    """Get categories that have at least one product for dropdown filtering"""
    stmt = (
        select(Category)
        .join(Product)
        .distinct()
        .order_by(Category.name)
    )
    return session.exec(stmt).all()

@app.get("/categories", response_model=List[CategoryRead])
def get_categories(session: Session = Depends(get_session)):
    return crud.get_categories(session)

@app.get("/categories/{category_id}", response_model=CategoryReadWithProducts)
def get_category(
    category_id: int,
    session: Session = Depends(get_session)
):
    category = crud.get_category(session, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Convert to response format with image URLs
    products_with_images = []
    for product in category.products:
        product_dict = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "category_id": product.category_id,
            "is_saved": product.is_saved,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
            "image_url": f"/products/{product.id}/image" if product.image_data else None,
        }
        products_with_images.append(product_dict)
    
    return {
        "id": category.id,
        "name": category.name,
        "created_at": category.created_at,
        "updated_at": category.updated_at,
        "products": products_with_images
    }

@app.get("/api/delivery-options", response_model=List[DeliveryOptionRead])
def get_delivery_options_for_filter(session: Session = Depends(get_session)):
    """Get active delivery options for dropdown filtering"""
    stmt = (
        select(DeliveryOption)
        .where(DeliveryOption.is_active)
        .order_by(cast(ColumnElement[int], DeliveryOption.estimated_days_min).asc(), cast(ColumnElement[float], DeliveryOption.price).asc())
    )
    return session.exec(stmt).all()

# Product endpoints
@app.post("/products", response_model=ProductRead)
def create_product(
    product: ProductCreate,
    session: Session = Depends(get_session)
):
    category = crud.get_category(session, product.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    
    created_product = crud.create_product(session, product)
    
    # Convert to response format with image URL
    product_dict = {
        "id": created_product.id,
        "title": created_product.title,
        "description": created_product.description,
        "price": created_product.price,
        "category_id": created_product.category_id,
        "is_saved": created_product.is_saved,
        "created_at": created_product.created_at,
        "updated_at": created_product.updated_at,
        "image_url": f"/products/{created_product.id}/image" if created_product.image_data else None,
    }
    
    return product_dict

@app.get("/api/products", response_model=List[ProductRead])
def get_products_api(
    categoryId: Optional[int] = Query(None),
    deliveryOptionId: Optional[int] = Query(None),
    sort: str = Query("created_desc"),
    include_delivery_summary: bool = Query(True),
    session: Session = Depends(get_session)
):
    """Get products with filtering and sorting"""
    stmt = select(Product).join(Category)
    
    if categoryId:
        stmt = stmt.where(Product.category_id == categoryId)
    
    if deliveryOptionId:
        stmt = stmt.join(ProductDeliveryLink).where(ProductDeliveryLink.delivery_option_id == deliveryOptionId)
    
    if include_delivery_summary:
        stmt = stmt.options(selectinload(cast(Any, Product.delivery_options)))
    stmt = stmt.options(selectinload(cast(Any, Product.category)))
    
    # Apply sorting
    if sort == "price_asc":
        stmt = stmt.order_by(cast(ColumnElement[float], Product.price).asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(cast(ColumnElement[float], Product.price).desc())
    else:  # created_desc (default)
        stmt = stmt.order_by(cast(ColumnElement, Product.created_at).desc())
    
    products = session.exec(stmt).all()
    
    # Convert to response format
    result = []
    for product in products:
        product_dict = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "category_id": product.category_id,
            "is_saved": product.is_saved,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
            "image_url": f"/products/{product.id}/image" if product.image_data else None,
            "category": {
                "id": product.category.id,
                "name": product.category.name,
                "created_at": product.category.created_at,
                "updated_at": product.category.updated_at,
            } if product.category else None,
            "delivery_summary": None,
        }
        
        if include_delivery_summary and hasattr(product, 'delivery_options'):
            summary = calculate_delivery_summary(product.delivery_options)
            if summary:
                product_dict["delivery_summary"] = summary.model_dump()
        
        result.append(product_dict)
    
    return result

@app.get("/products", response_model=List[ProductRead])
def get_products(
    category_id: Optional[int] = None,
    include_delivery_summary: bool = Query(False),
    session: Session = Depends(get_session)
):
    stmt = select(Product).join(Category)
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    
    if include_delivery_summary:
        stmt = stmt.options(selectinload(cast(Any, Product.delivery_options)))
    
    stmt = stmt.options(selectinload(cast(Any, Product.category)))
    products = session.exec(stmt).all()
    
    # Convert to response format
    result = []
    for product in products:
        product_dict = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "category_id": product.category_id,
            "is_saved": product.is_saved,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
            "image_url": f"/products/{product.id}/image" if product.image_data else None,
            "category": {
                "id": product.category.id,
                "name": product.category.name,
                "created_at": product.category.created_at,
                "updated_at": product.category.updated_at,
            } if product.category else None,
            "delivery_summary": None,
        }
        
        if include_delivery_summary and hasattr(product, 'delivery_options'):
            summary = calculate_delivery_summary(product.delivery_options)
            if summary:
                product_dict["delivery_summary"] = summary.model_dump()
        
        result.append(product_dict)
    
    return result

@app.get("/products/{product_id}", response_model=ProductReadWithDeliveryOptions)
def get_product(
    product_id: int,
    session: Session = Depends(get_session)
):
    stmt = (
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(cast(Any, Product.delivery_options)))
        .options(selectinload(cast(Any, Product.category)))
    )
    product = session.exec(stmt).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Filter active options and sort them
    active_options = [opt for opt in product.delivery_options if opt.is_active]
    speed_order = {"standard": 0, "express": 1, "next_day": 2, "same_day": 3}
    active_options_sorted = sorted(active_options, key=lambda o: (o.price, speed_order.get(o.speed.value, 999)))
    
    # Convert to response format with image URL
    product_dict = {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "price": product.price,
        "category_id": product.category_id,
        "is_saved": product.is_saved,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "image_url": f"/products/{product.id}/image" if product.image_data else None,
        "category": {
            "id": product.category.id,
            "name": product.category.name,
            "created_at": product.category.created_at,
            "updated_at": product.category.updated_at,
        } if product.category else None,
        "delivery_options": [
            {
                "id": opt.id,
                "name": opt.name,
                "description": opt.description,
                "speed": opt.speed,
                "price": opt.price,
                "min_order_amount": opt.min_order_amount,
                "estimated_days_min": opt.estimated_days_min,
                "estimated_days_max": opt.estimated_days_max,
                "is_active": opt.is_active,
                "created_at": opt.created_at,
                "updated_at": opt.updated_at,
            }
            for opt in active_options_sorted
        ]
    }
    
    return product_dict

@app.put("/products/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    session: Session = Depends(get_session)
):
    if product_update.category_id:
        category = crud.get_category(session, product_update.category_id)
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
    
    updated_product = crud.update_product(session, product_id, product_update)
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Convert to response format with image URL
    product_dict = {
        "id": updated_product.id,
        "title": updated_product.title,
        "description": updated_product.description,
        "price": updated_product.price,
        "category_id": updated_product.category_id,
        "is_saved": updated_product.is_saved,
        "created_at": updated_product.created_at,
        "updated_at": updated_product.updated_at,
        "image_url": f"/products/{product_id}/image" if updated_product.image_data else None,
    }
    
    return product_dict

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    session: Session = Depends(get_session)
):
    if not crud.delete_product(session, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

@app.get("/products/{product_id}/image")
def get_product_image(
    product_id: int,
    session: Session = Depends(get_session)
):
    product = crud.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.image_data:
        raise HTTPException(status_code=404, detail="No image found for this product")
    
    # Return image as streaming response
    return StreamingResponse(
        io.BytesIO(product.image_data),
        media_type=product.image_mime_type or "image/jpeg",
        headers={
            "Content-Disposition": f'inline; filename="{product.image_filename or f"product_{product_id}.jpg"}"',
            "Cache-Control": "public, max-age=86400"  # Cache for 1 day
        }
    )


# Cart, Checkout, and Orders endpoints with currency support

# GET /cart endpoint (Oracle requirement 3)
@app.get("/cart")
def get_cart_totals(
    currency: str = Depends(get_currency_param),
    session: Session = Depends(get_session),
    currency_service: CurrencyService = Depends(get_currency_service)
):
    """Get cart totals in requested currency"""
    # For demo purposes, using mock cart data
    # In real implementation, this would come from session/user cart
    mock_subtotal_minor = 2999  # $29.99 in cents
    mock_delivery_minor = 599   # $5.99 in cents
    
    base_currency = BASE_CURRENCY
    
    # Convert subtotal
    if currency != base_currency:
        converted_subtotal, fx_metadata = convert_price_with_service(
            mock_subtotal_minor, base_currency, currency, currency_service
        )
        converted_delivery, _ = convert_price_with_service(
            mock_delivery_minor, base_currency, currency, currency_service
        )
    else:
        converted_subtotal = create_price_info(mock_subtotal_minor, base_currency)
        converted_delivery = create_price_info(mock_delivery_minor, base_currency)
        fx_metadata = None
    
    # Calculate total
    total_minor = converted_subtotal.amount_minor + converted_delivery.amount_minor
    total = create_price_info(total_minor, currency)
    
    return CartTotals(
        subtotal=converted_subtotal,
        delivery_cost=converted_delivery,
        total=total,
        fx_metadata=fx_metadata
    )

# POST /checkout endpoint (Oracle requirement 5)
@app.post("/checkout")
def create_checkout(
    currency: str = Depends(get_currency_param),
    session: Session = Depends(get_session),
    currency_service: CurrencyService = Depends(get_currency_service)
):
    """Create checkout with currency support and FX metadata"""
    # For demo purposes, using mock checkout data
    mock_subtotal_minor = 2999  # $29.99 in cents
    mock_delivery_minor = 599   # $5.99 in cents
    mock_tax_minor = 240        # $2.40 in cents (8% tax)
    
    base_currency = BASE_CURRENCY
    
    # Convert all amounts
    if currency != base_currency:
        converted_subtotal, fx_metadata = convert_price_with_service(
            mock_subtotal_minor, base_currency, currency, currency_service
        )
        converted_delivery, _ = convert_price_with_service(
            mock_delivery_minor, base_currency, currency, currency_service
        )
        converted_tax, _ = convert_price_with_service(
            mock_tax_minor, base_currency, currency, currency_service
        )
    else:
        converted_subtotal = create_price_info(mock_subtotal_minor, base_currency)
        converted_delivery = create_price_info(mock_delivery_minor, base_currency)
        converted_tax = create_price_info(mock_tax_minor, base_currency)
        fx_metadata = None
    
    # Calculate total
    total_minor = (converted_subtotal.amount_minor + 
                   converted_delivery.amount_minor + 
                   converted_tax.amount_minor)
    total = create_price_info(total_minor, currency)
    
    return CheckoutTotals(
        currency=currency,
        subtotal=converted_subtotal,
        delivery_cost=converted_delivery,
        tax=converted_tax,
        total=total,
        fx_metadata=fx_metadata
    )

# POST /orders endpoint (Oracle requirement 6)
@app.post("/orders")
def create_order(
    currency: str = Depends(get_currency_param),
    session: Session = Depends(get_session),
    currency_service: CurrencyService = Depends(get_currency_service)
):
    """Create order with FX rates snapshot and currency data"""
    # For demo purposes, using mock order data
    mock_subtotal_minor = 2999  # $29.99 in cents
    mock_delivery_minor = 599   # $5.99 in cents
    mock_tax_minor = 240        # $2.40 in cents
    
    base_currency = BASE_CURRENCY
    
    # Convert all amounts
    if currency != base_currency:
        converted_subtotal, fx_metadata = convert_price_with_service(
            mock_subtotal_minor, base_currency, currency, currency_service
        )
        converted_delivery, _ = convert_price_with_service(
            mock_delivery_minor, base_currency, currency, currency_service
        )
        converted_tax, _ = convert_price_with_service(
            mock_tax_minor, base_currency, currency, currency_service
        )
    else:
        converted_subtotal = create_price_info(mock_subtotal_minor, base_currency)
        converted_delivery = create_price_info(mock_delivery_minor, base_currency)
        converted_tax = create_price_info(mock_tax_minor, base_currency)
        fx_metadata = None
    
    # Calculate total
    total_minor = (converted_subtotal.amount_minor + 
                   converted_delivery.amount_minor + 
                   converted_tax.amount_minor)
    total = create_price_info(total_minor, currency)
    
    # Create FX rates snapshot (Oracle requirement 6)
    fx_rates_snapshot: dict[str, Any] = {
        "timestamp": fx_metadata.timestamp if fx_metadata else None,
        "base_currency": base_currency,
        "rates": {}
    }
    
    # Snapshot current rates for all supported currencies
    for curr in SUPPORTED_CURRENCIES:
        if curr != base_currency:
            try:
                rate = currency_service.get_rate(base_currency, curr)
                if isinstance(fx_rates_snapshot["rates"], dict):
                    fx_rates_snapshot["rates"][f"{base_currency}_{curr}"] = str(rate)
            except Exception:
                # Skip if rate unavailable
                pass
    
    return OrderTotalsWithSnapshot(
        currency=currency,
        subtotal=converted_subtotal,
        delivery_cost=converted_delivery,
        tax=converted_tax,
        total=total,
        fx_metadata=fx_metadata,
        fx_rates_snapshot=fx_rates_snapshot
    )

# Currency configuration endpoint (Oracle requirement 4)
@app.get("/config/currencies", response_model=SupportedCurrenciesResponse)
def get_currencies_config():
    """Get supported currencies with detailed information"""
    currency_info = get_currency_info_dict()
    
    currencies = []
    for code in SUPPORTED_CURRENCIES:
        if code in currency_info:
            currencies.append(CurrencyInfo(
                code=code,
                name=currency_info[code]["name"],
                symbol=currency_info[code]["symbol"],
                decimal_places=currency_info[code]["decimal_places"]
            ))
    
    return SupportedCurrenciesResponse(
        base_currency=BASE_CURRENCY,
        supported_currencies=currencies
    )

# Currency endpoints
@app.get("/api/currencies", response_model=List[str])
def get_supported_currencies(
    currency_service: CurrencyService = Depends(get_currency_service)
):
    """Get list of supported currencies"""
    return currency_service.get_supported_currencies()


@app.post("/api/currencies/convert")
def convert_currency(
    amount_minor: int,
    from_currency: str,
    to_currency: str,
    currency_service: CurrencyService = Depends(get_currency_service)
):
    """Convert amount between currencies"""
    try:
        converted_amount = currency_service.convert_minor(
            amount_minor=amount_minor,
            from_currency=from_currency.upper(),
            to_currency=to_currency.upper()
        )
        return {
            "amount_minor": converted_amount,
            "from_currency": from_currency.upper(),
            "to_currency": to_currency.upper(),
            "original_amount": amount_minor
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/currencies/rates/{to_currency}")
def get_exchange_rate(
    to_currency: str,
    currency_service: CurrencyService = Depends(get_currency_service)
):
    """Get exchange rate from base currency to target currency"""
    try:
        rate = currency_service.get_rate(BASE_CURRENCY, to_currency.upper())
        return {
            "base_currency": BASE_CURRENCY,
            "target_currency": to_currency.upper(),
            "rate": float(rate)  # rate is guaranteed to be Decimal by get_rate method
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/currencies/refresh")
def refresh_exchange_rates(
    force: bool = False,
    currency_service: CurrencyService = Depends(get_currency_service)
):
    """Refresh exchange rates from external API"""
    try:
        currency_service.refresh_rates(force=force)
        return {"message": "Exchange rates refreshed successfully"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to refresh rates: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
