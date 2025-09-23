#!/usr/bin/env python3
"""
Database seeding script to import products from the frontend's products.json file
"""
import json
import sys
from pathlib import Path
from sqlmodel import Session

from .db import engine, create_db_and_tables
from .models import Product, DeliveryOption, DeliverySpeed, ExchangeRateLatest
from .crud import get_category_by_name, create_category, download_and_store_image
from .schemas import CategoryCreate
from decimal import Decimal
import random

def load_products_json():
    """Load products from the JSON file"""
    # Try multiple possible paths for the products.json file
    possible_paths = [
        Path(__file__).parent.parent / "products.json",  # Backend directory
        Path(__file__).parent.parent.parent / "src" / "context" / "products.json",  # Frontend location
    ]
    
    for products_path in possible_paths:
        if products_path.exists():
            print(f"Loading products from: {products_path}")
            with open(products_path, 'r') as f:
                return json.load(f)
    
    print("Products file not found in any of these locations:")
    for path in possible_paths:
        print(f"   - {path}")
    sys.exit(1)

def seed_categories(session: Session, products: list) -> dict:
    """Create categories from product data and return a mapping"""
    # Extract unique categories
    categories = set(product['category'] for product in products)
    category_map = {}
    
    for category_name in categories:
        # Check if category already exists
        existing_category = get_category_by_name(session, category_name)
        if existing_category:
            category_map[category_name] = existing_category.id
            print(f"Category '{category_name}' already exists (ID: {existing_category.id})")
        else:
            # Create new category
            new_category = create_category(session, CategoryCreate(name=category_name))
            category_map[category_name] = new_category.id
            print(f"Created category '{category_name}' (ID: {new_category.id})")
    
    return category_map

def seed_products(session: Session, products: list, category_map: dict):
    """Create products with image download and storage"""
    print(f"\nSeeding {len(products)} products...")
    
    for product_data in products:
        # Check if product already exists
        existing_product = session.get(Product, product_data['id'])
        if existing_product:
            print(f"Product '{product_data['title']}' already exists (ID: {product_data['id']})")
            continue
        
        # Create new product with currency support
        price = float(product_data['price'])
        new_product = Product(
            id=product_data['id'],
            title=product_data['title'],
            description=product_data['description'],
            price=price,  # Keep for backward compatibility
            price_amount_minor=int(price * 100),  # Convert to cents
            price_currency="USD",
            category_id=category_map[product_data['category']],
            is_saved=False
        )
        
        session.add(new_product)
        session.commit()
        session.refresh(new_product)
        
        print(f"Created product '{product_data['title']}' (ID: {product_data['id']})")
        
        # Download and store image
        image_url = product_data.get('image')
        if image_url:
            print(f"Downloading image from: {image_url}")
            if download_and_store_image(session, new_product, image_url):
                print(f"Successfully stored image for product {product_data['id']}")
            else:
                print(f"Failed to download/store image for product {product_data['id']}")
        else:
            print(f"No image URL found for product {product_data['id']}")

def seed_delivery_options(session: Session) -> list[DeliveryOption]:
    """Create common delivery options with currency support"""
    delivery_options_data = [
        {
            "name": "Standard Shipping",
            "description": "3-5 business days", 
            "speed": DeliverySpeed.STANDARD,
            "price": 0.0,  # Free shipping
            "min_order_amount": 25.0,
            "estimated_days_min": 3,
            "estimated_days_max": 5,
            "is_active": True
        },
        {
            "name": "Express Delivery",
            "description": "1-2 business days",
            "speed": DeliverySpeed.EXPRESS,
            "price": 9.99,
            "min_order_amount": None,
            "estimated_days_min": 1,
            "estimated_days_max": 2,
            "is_active": True
        },
        {
            "name": "Next Day Delivery", 
            "description": "Next business day",
            "speed": DeliverySpeed.NEXT_DAY,
            "price": 19.99,
            "min_order_amount": None,
            "estimated_days_min": 1,
            "estimated_days_max": 1,
            "is_active": True
        },
        {
            "name": "Same Day Delivery",
            "description": "Same day (order by 2pm)",
            "speed": DeliverySpeed.SAME_DAY,
            "price": 24.99,
            "min_order_amount": None,
            "estimated_days_min": 0,
            "estimated_days_max": 0,
            "is_active": True
        },
    ]
    
    delivery_options = []
    for option_data in delivery_options_data:
        price = option_data["price"]
        min_amount = option_data["min_order_amount"]
        
        option = DeliveryOption(
            name=option_data["name"],
            description=option_data["description"],
            speed=option_data["speed"],
            price=price,  # Keep for backward compatibility
            price_amount_minor=int(float(str(price)) * 100),  # Convert to cents
            price_currency="USD",
            min_order_amount=min_amount,  # Keep for backward compatibility
            min_order_amount_minor=int(float(str(min_amount)) * 100) if min_amount else None,
            estimated_days_min=option_data["estimated_days_min"],
            estimated_days_max=option_data["estimated_days_max"],
            is_active=option_data["is_active"]
        )
        delivery_options.append(option)
    
    created_options = []
    for option in delivery_options:
        # Check if option already exists by name
        from sqlmodel import select
        existing = session.exec(select(DeliveryOption).where(DeliveryOption.name == option.name)).first()
        if existing:
            print(f"Delivery option '{option.name}' already exists")
            created_options.append(existing)
        else:
            session.add(option)
            session.commit()
            session.refresh(option)
            created_options.append(option)
            print(f"Created delivery option: {option.name} - ${option.price}")
    
    return created_options

def assign_delivery_options_to_products(session: Session, delivery_options: list[DeliveryOption]):
    """Assign delivery options to products: all get Standard+Express, some get premium options"""
    from sqlmodel import select
    products = list(session.exec(select(Product)).all())
    
    # Create lookup dictionary for delivery options by name
    options_by_name = {opt.name: opt for opt in delivery_options}
    
    # Standard options that every product gets
    standard_options = [
        options_by_name["Standard Shipping"],
        options_by_name["Express Delivery"]
    ]
    
    # Premium options that only some products get
    next_day_option = options_by_name["Next Day Delivery"]
    same_day_option = options_by_name["Same Day Delivery"]
    
    # Calculate how many products get premium options (about 30% for Next Day, 20% for Same Day)
    num_products = len(products)
    next_day_count = max(1, num_products // 3)  # ~33% get Next Day
    same_day_count = max(1, num_products // 5)  # ~20% get Same Day
    
    # Shuffle products to randomly select which ones get premium options
    random.shuffle(products)
    
    for i, product in enumerate(products):
        # All products get standard options
        selected_options = standard_options.copy()
        
        # Some products also get Next Day delivery
        if i < next_day_count:
            selected_options.append(next_day_option)
        
        # Fewer products get Same Day delivery (and they must also have Next Day)
        if i < same_day_count:
            if next_day_option not in selected_options:
                selected_options.append(next_day_option)
            selected_options.append(same_day_option)
        
        product.delivery_options = selected_options
        session.add(product)
        
        option_names = [opt.name for opt in selected_options]
        print(f"Assigned delivery options to '{product.title}': {', '.join(option_names)}")
    
    session.commit()

def seed_exchange_rates(session: Session):
    """Seed initial exchange rates (sample rates for development)"""
    exchange_rates_data = [
        # Base currency USD to others
        ("USD", "GBP", "0.8200"),  # USD to British Pound
        ("USD", "EUR", "0.9500"),  # USD to Euro
        ("USD", "AUD", "1.5400"),  # USD to Australian Dollar
        ("USD", "MXN", "17.2500"), # USD to Mexican Peso
        ("USD", "JPY", "149.8000"), # USD to Japanese Yen
        
        # Reverse rates (others to USD)
        ("GBP", "USD", "1.2195"),  # British Pound to USD
        ("EUR", "USD", "1.0526"),  # Euro to USD
        ("AUD", "USD", "0.6493"),  # Australian Dollar to USD
        ("MXN", "USD", "0.0580"),  # Mexican Peso to USD
        ("JPY", "USD", "0.0067"),  # Japanese Yen to USD
    ]
    
    created_rates = []
    for from_curr, to_curr, rate_str in exchange_rates_data:
        # Check if rate already exists
        from sqlmodel import select
        existing = session.exec(
            select(ExchangeRateLatest).where(
                ExchangeRateLatest.from_currency == from_curr,
                ExchangeRateLatest.to_currency == to_curr
            )
        ).first()
        
        if existing:
            print(f"Exchange rate {from_curr}->{to_curr} already exists")
            created_rates.append(existing)
        else:
            rate = ExchangeRateLatest(
                from_currency=from_curr,
                to_currency=to_curr,
                rate_decimal=Decimal(rate_str),
                provider="development_seed",
                last_updated="2025-09-23T16:00:00Z"
            )
            session.add(rate)
            session.commit()
            session.refresh(rate)
            created_rates.append(rate)
            print(f"Created exchange rate: {from_curr} -> {to_curr} = {rate_str}")
    
    return created_rates

def seed_database(custom_engine=None):
    """Main seeding function"""
    db_engine = custom_engine or engine
    
    print("Starting database seeding...")
    
    # Create tables if they don't exist
    create_db_and_tables()
    
    # Load products data
    print("Loading products.json...")
    products = load_products_json()
    
    with Session(db_engine) as session:
        # Seed categories
        print("\nCreating categories...")
        category_map = seed_categories(session, products)
        
        # Seed products
        seed_products(session, products, category_map)
        
        # Seed delivery options
        print("\nCreating delivery options...")
        delivery_options = seed_delivery_options(session)
        
        # Assign delivery options to products
        print("\nAssigning delivery options to products...")
        assign_delivery_options_to_products(session, delivery_options)
        
        # Seed exchange rates
        print("\nCreating exchange rates...")
        exchange_rates = seed_exchange_rates(session)
    
    print("\nDatabase seeding completed!")
    print(f"   - Categories: {len(category_map)}")
    print(f"   - Products: {len(products)}")
    print(f"   - Delivery options: {len(delivery_options) if 'delivery_options' in locals() else 0}")
    print(f"   - Exchange rates: {len(exchange_rates) if 'exchange_rates' in locals() else 0}")
    print("   - All product images downloaded and stored as BLOBs")
    print("   - Delivery options randomly assigned to products")
    print("   - Multi-currency support enabled with sample exchange rates")

if __name__ == "__main__":
    seed_database()
