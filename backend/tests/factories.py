from typing import Optional
import io
from PIL import Image
from sqlmodel import Session
from app.models import Category, Product, DeliveryOption, DeliverySpeed, ProductCartCount
from app.schemas import CategoryCreate


def create_test_category(session: Session, name: Optional[str] = None) -> Category:
    """Create a test category with optional name override"""
    if name is None:
        # Get count of existing categories to make unique names
        from sqlmodel import select
        existing_count = len(session.exec(select(Category)).all())
        name = f"Test Category {existing_count + 1}"
    
    category_data = CategoryCreate(name=name)
    category = Category.model_validate(category_data)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def create_test_product(
    session: Session, 
    category_id: Optional[int] = None,
    title: Optional[str] = None,
    price: Optional[float] = None,
    with_image: bool = False
) -> Product:
    """Create a test product with configurable options"""
    if category_id is None:
        category = create_test_category(session)
        category_id = category.id
    
    if title is None:
        # Get count of existing products to make unique titles
        from sqlmodel import select
        existing_count = len(session.exec(select(Product)).all())
        title = f"Test Product {existing_count + 1}"
    
    if price is None:
        price = 29.99
    
    # Create Product directly with all required fields
    product = Product(
        title=title,
        description=f"Description for {title}",
        price=price,
        category_id=category_id,
        is_saved=False
    )
    
    if with_image:
        product.image_data = generate_test_image()
        product.image_mime_type = "image/jpeg"
        product.image_filename = f"test_{title.replace(' ', '_').lower()}.jpg"
    
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def generate_test_image(width: int = 300, height: int = 300) -> bytes:
    """Generate a small test image as bytes"""
    img = Image.new('RGB', (width, height), color=(128, 128, 128))
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='JPEG', quality=85)
    return img_buffer.getvalue()


def create_test_delivery_option(
    session: Session,
    name: Optional[str] = None,
    speed: Optional[DeliverySpeed] = None,
    price: Optional[float] = None,
    min_order_amount: Optional[float] = None,
    estimated_days_min: Optional[int] = None,
    estimated_days_max: Optional[int] = None,
    is_active: bool = True
) -> DeliveryOption:
    """Create a test delivery option with configurable options"""
    # Default values based on standard shipping
    if name is None:
        from sqlmodel import select
        existing_count = len(session.exec(select(DeliveryOption)).all())
        name = f"Test Delivery {existing_count + 1}"
    
    if speed is None:
        speed = DeliverySpeed.STANDARD
    
    if price is None:
        price = 0.0 if speed == DeliverySpeed.STANDARD else 9.99
    
    if estimated_days_min is None:
        days_mapping = {
            DeliverySpeed.STANDARD: 3,
            DeliverySpeed.EXPRESS: 1,
            DeliverySpeed.NEXT_DAY: 1,
            DeliverySpeed.SAME_DAY: 0
        }
        estimated_days_min = days_mapping[speed]
    
    if estimated_days_max is None:
        days_mapping = {
            DeliverySpeed.STANDARD: 5,
            DeliverySpeed.EXPRESS: 2,
            DeliverySpeed.NEXT_DAY: 1,
            DeliverySpeed.SAME_DAY: 0
        }
        estimated_days_max = days_mapping[speed]
    
    delivery_option = DeliveryOption(
        name=name,
        description=f"Test description for {name}",
        speed=speed,
        price=price,
        min_order_amount=min_order_amount,
        estimated_days_min=estimated_days_min,
        estimated_days_max=estimated_days_max,
        is_active=is_active
    )
    
    session.add(delivery_option)
    session.commit()
    session.refresh(delivery_option)
    return delivery_option


def create_standard_delivery_options(session: Session) -> list[DeliveryOption]:
    """Create the standard set of delivery options for testing"""
    options = [
        create_test_delivery_option(
            session, 
            name="Standard Shipping",
            speed=DeliverySpeed.STANDARD,
            price=0.0,
            min_order_amount=25.0
        ),
        create_test_delivery_option(
            session,
            name="Express Delivery", 
            speed=DeliverySpeed.EXPRESS,
            price=9.99
        ),
        create_test_delivery_option(
            session,
            name="Next Day Delivery",
            speed=DeliverySpeed.NEXT_DAY,
            price=19.99
        ),
        create_test_delivery_option(
            session,
            name="Same Day Delivery",
            speed=DeliverySpeed.SAME_DAY,
            price=24.99,
            min_order_amount=None
        )
    ]
    return options


def create_test_cart_count(
    session: Session,
    product_id: int,
    session_id: Optional[str] = None
) -> ProductCartCount:
    """Create a test cart count entry"""
    if session_id is None:
        import uuid
        session_id = str(uuid.uuid4())
    
    cart_count = ProductCartCount(
        product_id=product_id,
        session_id=session_id
    )
    
    session.add(cart_count)
    session.commit()
    session.refresh(cart_count)
    return cart_count
