import pytest
import time
from fastapi.testclient import TestClient
from sqlmodel import Session
from tests.factories import create_test_category, create_test_product

def test_get_products(client: TestClient):
    """Test getting all products"""
    response = client.get("/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    
    # Check product structure
    product = products[0]
    required_fields = ["id", "title", "description", "price", "category_id", "image_url"]
    for field in required_fields:
        assert field in product

def test_get_products_by_category(client: TestClient):
    """Test filtering products by category"""
    # Get categories first
    categories_response = client.get("/categories")
    assert categories_response.status_code == 200
    categories = categories_response.json()
    assert len(categories) > 0
    
    category_id = categories[0]["id"]
    
    # Get products for specific category
    response = client.get(f"/products?category_id={category_id}")
    assert response.status_code == 200
    products = response.json()
    
    # All products should belong to the specified category
    for product in products:
        assert product["category_id"] == category_id

def test_get_single_product(client: TestClient):
    """Test getting a single product by ID"""
    # Get all products first
    products_response = client.get("/products")
    products = products_response.json()
    assert len(products) > 0
    
    product_id = products[0]["id"]
    
    # Get single product
    response = client.get(f"/products/{product_id}")
    assert response.status_code == 200
    product = response.json()
    assert product["id"] == product_id
    assert "category" in product  # Should include category details

def test_get_nonexistent_product(client: TestClient):
    """Test getting a product that doesn't exist"""
    response = client.get("/products/99999")
    assert response.status_code == 404

def test_create_product(client: TestClient):
    """Test creating a new product"""
    # Get a category ID first
    categories_response = client.get("/categories")
    categories = categories_response.json()
    category_id = categories[0]["id"]
    
    product_data = {
        "title": "Test Product",
        "description": "A test product description",
        "price": 29.99,
        "category_id": category_id,
        "is_saved": False
    }
    
    response = client.post("/products", json=product_data)
    assert response.status_code == 200
    created_product = response.json()
    assert created_product["title"] == product_data["title"]
    assert created_product["price"] == product_data["price"]

def test_create_product_invalid_category(client: TestClient):
    """Test creating a product with invalid category"""
    product_data = {
        "title": "Test Product",
        "description": "A test product description",
        "price": 29.99,
        "category_id": 99999,  # Invalid category
        "is_saved": False
    }
    
    response = client.post("/products", json=product_data)
    assert response.status_code == 400

def test_update_product(client: TestClient):
    """Test updating a product"""
    # Get existing product
    products_response = client.get("/products")
    products = products_response.json()
    product_id = products[0]["id"]
    
    update_data = {
        "title": "Updated Product Title",
        "price": 39.99
    }
    
    response = client.put(f"/products/{product_id}", json=update_data)
    assert response.status_code == 200
    updated_product = response.json()
    assert updated_product["title"] == update_data["title"]
    assert updated_product["price"] == update_data["price"]

def test_delete_product(client: TestClient):
    """Test deleting a product"""
    # Create a product to delete
    categories_response = client.get("/categories")
    category_id = categories_response.json()[0]["id"]
    
    product_data = {
        "title": "Product to Delete",
        "description": "Will be deleted",
        "price": 10.0,
        "category_id": category_id
    }
    
    create_response = client.post("/products", json=product_data)
    product_id = create_response.json()["id"]
    
    # Delete the product
    delete_response = client.delete(f"/products/{product_id}")
    assert delete_response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/products/{product_id}")
    assert get_response.status_code == 404

def test_get_product_image(client: TestClient):
    """Test getting product image"""
    # Get a product with an image
    products_response = client.get("/products")
    products = products_response.json()
    
    # Find a product with an image
    product_with_image = None
    for product in products:
        if product.get("image_url"):
            product_with_image = product
            break
    
    if product_with_image:
        product_id = product_with_image["id"]
        response = client.get(f"/products/{product_id}/image")
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("image/")
    else:
        pytest.skip("No products with images found for testing")

def test_get_nonexistent_product_image(client: TestClient):
    """Test getting image for nonexistent product"""
    response = client.get("/products/99999/image")
    assert response.status_code == 404


# Data Validation Tests
@pytest.mark.parametrize("invalid_product", [
    {"title": "", "description": "Test", "price": 10.0, "category_id": 1},  # Empty title
    {"title": "Test", "description": "", "price": 10.0, "category_id": 1},  # Empty description  
    {"title": "Test", "description": "Test", "price": -5.0, "category_id": 1},  # Negative price
    {"title": "Test", "description": "Test", "price": 0, "category_id": 1},  # Zero price
    {"title": "Test", "description": "Test", "price": 10.999, "category_id": 1},  # >2 decimals
    {"title": "Test", "description": "Test", "category_id": 1},  # Missing price
])
def test_create_product_validation_errors(client: TestClient, session: Session, invalid_product: dict):
    """Test product creation validation"""
    # Create a valid category first
    category = create_test_category(session)
    invalid_product["category_id"] = category.id
    
    response = client.post("/products", json=invalid_product)
    assert response.status_code == 422


def test_create_product_with_very_long_fields(client: TestClient, session: Session):
    """Test handling of extremely long input fields"""
    category = create_test_category(session)
    
    product_data = {
        "title": "A" * 1000,  # Very long title
        "description": "B" * 10000,  # Very long description
        "price": 29.99,
        "category_id": category.id
    }
    
    response = client.post("/products", json=product_data)
    # Should either succeed (if no length limits) or return 422
    assert response.status_code in [200, 422]


# Business Logic Tests
def test_product_price_decimal_precision(client: TestClient, session: Session):
    """Test that product prices maintain proper decimal precision"""
    category = create_test_category(session)
    
    test_prices = [10.99, 0.01, 999.99, 12.34]
    
    for price in test_prices:
        product_data = {
            "title": f"Price Test {price}",
            "description": "Price precision test",
            "price": price,
            "category_id": category.id
        }
        
        response = client.post("/products", json=product_data)
        assert response.status_code == 200
        assert response.json()["price"] == price


def test_product_timestamps(client: TestClient, session: Session):
    """Test that created_at and updated_at work correctly"""
    category = create_test_category(session)
    
    # Create product
    product_data = {
        "title": "Timestamp Test",
        "description": "Test",
        "price": 10.0,
        "category_id": category.id
    }
    
    response = client.post("/products", json=product_data)
    assert response.status_code == 200
    
    product = response.json()
    product_id = product["id"]
    original_created_at = product["created_at"]
    original_updated_at = product["updated_at"]
    
    # Wait a moment and update
    time.sleep(0.1)
    
    update_response = client.put(f"/products/{product_id}", json={"title": "Updated Title"})
    assert update_response.status_code == 200
    
    updated_product = update_response.json()
    assert updated_product["created_at"] == original_created_at  # Should not change
    assert updated_product["updated_at"] != original_updated_at  # Should change


def test_product_category_relationship(client: TestClient, session: Session):
    """Test that products correctly maintain category relationships"""
    category1 = create_test_category(session, "Category 1")
    category2 = create_test_category(session, "Category 2")
    
    # Create product in category1
    product = create_test_product(session, category1.id)
    
    # Verify category relationship
    response = client.get(f"/products/{product.id}")
    assert response.status_code == 200
    product_data = response.json()
    assert product_data["category"]["id"] == category1.id
    assert product_data["category"]["name"] == "Category 1"
    
    # Update product to category2
    update_response = client.put(f"/products/{product.id}", json={"category_id": category2.id})
    assert update_response.status_code == 200
    
    # Verify updated relationship
    updated_response = client.get(f"/products/{product.id}")
    updated_product = updated_response.json()
    assert updated_product["category"]["id"] == category2.id
    assert updated_product["category"]["name"] == "Category 2"


def test_product_with_missing_image_returns_null_url(client: TestClient, session: Session):
    """Test that products without images return null/empty image_url"""
    product = create_test_product(session, with_image=False)
    
    response = client.get(f"/products/{product.id}")
    assert response.status_code == 200
    product_data = response.json()
    assert product_data["image_url"] is None or product_data["image_url"] == ""


def test_product_search_functionality(client: TestClient, session: Session):
    """Test product search if implemented"""
    category = create_test_category(session)
    
    # Create products with searchable terms
    create_test_product(session, category.id, "Unique Widget Alpha", 10.0)
    create_test_product(session, category.id, "Special Widget Beta", 20.0)
    create_test_product(session, category.id, "Different Gadget", 30.0)
    
    # Test search by title (if search parameter exists)
    search_response = client.get("/products?search=widget")
    if search_response.status_code == 200:
        # If search is implemented
        products = search_response.json()
        widget_products = [p for p in products if "widget" in p["title"].lower()]
        assert len(widget_products) >= 2
    else:
        # Search not implemented, skip this test
        pytest.skip("Search functionality not implemented")


def test_fastest_delivery_sort_returns_unique_products(client: TestClient, session: Session):
    """Test that sorting by fastest delivery returns no duplicate products"""
    from tests.factories import create_test_delivery_option
    from app.models import ProductDeliveryLink, DeliverySpeed
    
    category = create_test_category(session)
    
    same_day = create_test_delivery_option(
        session, 
        name="Same Day", 
        speed=DeliverySpeed.SAME_DAY,
        estimated_days_min=0,
        estimated_days_max=0,
        price=24.99
    )
    express = create_test_delivery_option(
        session,
        name="Express",
        speed=DeliverySpeed.EXPRESS,
        estimated_days_min=1,
        estimated_days_max=2,
        price=9.99
    )
    standard = create_test_delivery_option(
        session,
        name="Standard",
        speed=DeliverySpeed.STANDARD,
        estimated_days_min=3,
        estimated_days_max=5,
        price=0.0
    )
    
    product1 = create_test_product(session, category.id, "Product with Same Day", 29.99)
    product2 = create_test_product(session, category.id, "Product with Express", 39.99)
    product3 = create_test_product(session, category.id, "Product with Multiple Options", 49.99)
    product4 = create_test_product(session, category.id, "Product without Delivery", 19.99)
    
    session.add(ProductDeliveryLink(product_id=product1.id, delivery_option_id=same_day.id))
    session.add(ProductDeliveryLink(product_id=product2.id, delivery_option_id=express.id))
    session.add(ProductDeliveryLink(product_id=product3.id, delivery_option_id=same_day.id))
    session.add(ProductDeliveryLink(product_id=product3.id, delivery_option_id=express.id))
    session.add(ProductDeliveryLink(product_id=product3.id, delivery_option_id=standard.id))
    session.commit()
    
    response = client.get("/api/products?sort=delivery_fastest")
    assert response.status_code == 200
    products = response.json()
    
    product_ids = [p["id"] for p in products]
    assert len(product_ids) == len(set(product_ids)), "Products should be unique (no duplicates)"
    
    product1_idx = next(i for i, p in enumerate(products) if p["id"] == product1.id)
    product2_idx = next(i for i, p in enumerate(products) if p["id"] == product2.id)
    product3_idx = next(i for i, p in enumerate(products) if p["id"] == product3.id)
    product4_idx = next((i for i, p in enumerate(products) if p["id"] == product4.id), None)
    
    assert product1_idx < product2_idx, "Same day should come before express"
    assert product3_idx < product2_idx, "Product with same day should come before express-only"
    if product4_idx is not None:
        products_with_delivery = [p for p in products if p.get("delivery_summary")]
        products_without_delivery = [p for p in products if not p.get("delivery_summary")]
        if products_without_delivery:
            first_no_delivery_idx = next(i for i, p in enumerate(products) if not p.get("delivery_summary"))
            last_with_delivery_idx = next((len(products) - 1 - i for i, p in enumerate(reversed(products)) if p.get("delivery_summary")), -1)
            assert product4_idx > last_with_delivery_idx, "Product without delivery should come after products with delivery"


def test_fastest_delivery_with_category_filter_returns_unique_products(client: TestClient, session: Session):
    """Test that fastest delivery with category filter returns unique products"""
    from tests.factories import create_test_delivery_option
    from app.models import ProductDeliveryLink, DeliverySpeed
    
    category1 = create_test_category(session)
    category2 = create_test_category(session)
    
    express = create_test_delivery_option(
        session,
        name="Express",
        speed=DeliverySpeed.EXPRESS,
        estimated_days_min=1,
        estimated_days_max=2
    )
    standard = create_test_delivery_option(
        session,
        name="Standard",
        speed=DeliverySpeed.STANDARD,
        estimated_days_min=3,
        estimated_days_max=5
    )
    
    electronics1 = create_test_product(session, category1.id, "Laptop", 999.99)
    electronics2 = create_test_product(session, category1.id, "Mouse", 29.99)
    clothing1 = create_test_product(session, category2.id, "T-Shirt", 19.99)
    
    session.add(ProductDeliveryLink(product_id=electronics1.id, delivery_option_id=express.id))
    session.add(ProductDeliveryLink(product_id=electronics1.id, delivery_option_id=standard.id))
    session.add(ProductDeliveryLink(product_id=electronics2.id, delivery_option_id=standard.id))
    session.add(ProductDeliveryLink(product_id=clothing1.id, delivery_option_id=express.id))
    session.commit()
    
    response = client.get(f"/api/products?categoryId={category1.id}&sort=delivery_fastest")
    assert response.status_code == 200
    products = response.json()
    
    product_ids = [p["id"] for p in products]
    assert len(product_ids) == len(set(product_ids)), "Products should be unique (no duplicates)"
    
    for product in products:
        assert product["category_id"] == category1.id, "All products should be in the selected category"
    
    electronics1_idx = next((i for i, p in enumerate(products) if p["id"] == electronics1.id), None)
    electronics2_idx = next((i for i, p in enumerate(products) if p["id"] == electronics2.id), None)
    
    assert electronics1_idx is not None and electronics2_idx is not None
    assert electronics1_idx < electronics2_idx, "Express delivery should come before standard"


def test_fastest_delivery_with_delivery_filter_returns_unique_products(client: TestClient, session: Session):
    """Test that fastest delivery with deliveryOptionId filter returns unique products"""
    from tests.factories import create_test_delivery_option
    from app.models import ProductDeliveryLink, DeliverySpeed
    
    category = create_test_category(session)
    
    express = create_test_delivery_option(
        session,
        name="Express",
        speed=DeliverySpeed.EXPRESS,
        estimated_days_min=1,
        estimated_days_max=2,
        price=9.99
    )
    standard = create_test_delivery_option(
        session,
        name="Standard",
        speed=DeliverySpeed.STANDARD,
        estimated_days_min=3,
        estimated_days_max=5,
        price=0.0
    )
    
    product1 = create_test_product(session, category.id, "Product A", 29.99)
    product2 = create_test_product(session, category.id, "Product B", 19.99)
    product3 = create_test_product(session, category.id, "Product C", 39.99)
    
    session.add(ProductDeliveryLink(product_id=product1.id, delivery_option_id=express.id))
    session.add(ProductDeliveryLink(product_id=product2.id, delivery_option_id=express.id))
    session.add(ProductDeliveryLink(product_id=product2.id, delivery_option_id=standard.id))
    session.add(ProductDeliveryLink(product_id=product3.id, delivery_option_id=standard.id))
    session.commit()
    
    response = client.get(f"/api/products?deliveryOptionId={express.id}&sort=delivery_fastest")
    assert response.status_code == 200
    products = response.json()
    
    product_ids = [p["id"] for p in products]
    assert len(product_ids) == len(set(product_ids)), "Products should be unique (no duplicates)"
    assert len(products) == 2, "Should only return products with express delivery"
    
    returned_ids = set(product_ids)
    assert product1.id in returned_ids and product2.id in returned_ids
    assert product3.id not in returned_ids


def test_fastest_delivery_ignores_inactive_options(client: TestClient, session: Session):
    """Test that inactive delivery options don't affect fastest-days computation"""
    from tests.factories import create_test_delivery_option
    from app.models import ProductDeliveryLink, DeliverySpeed
    
    category = create_test_category(session)
    
    same_day_inactive = create_test_delivery_option(
        session,
        name="Same Day (Inactive)",
        speed=DeliverySpeed.SAME_DAY,
        estimated_days_min=0,
        estimated_days_max=0,
        is_active=False
    )
    express_active = create_test_delivery_option(
        session,
        name="Express (Active)",
        speed=DeliverySpeed.EXPRESS,
        estimated_days_min=1,
        estimated_days_max=2,
        is_active=True
    )
    standard_active = create_test_delivery_option(
        session,
        name="Standard (Active)",
        speed=DeliverySpeed.STANDARD,
        estimated_days_min=3,
        estimated_days_max=5,
        is_active=True
    )
    
    product_with_inactive = create_test_product(session, category.id, "Product with Inactive", 29.99)
    product_standard = create_test_product(session, category.id, "Product Standard Only", 19.99)
    
    session.add(ProductDeliveryLink(product_id=product_with_inactive.id, delivery_option_id=same_day_inactive.id))
    session.add(ProductDeliveryLink(product_id=product_with_inactive.id, delivery_option_id=express_active.id))
    session.add(ProductDeliveryLink(product_id=product_standard.id, delivery_option_id=standard_active.id))
    session.commit()
    
    response = client.get("/api/products?sort=delivery_fastest")
    assert response.status_code == 200
    products = response.json()
    
    product_with_inactive_idx = next(i for i, p in enumerate(products) if p["id"] == product_with_inactive.id)
    product_standard_idx = next(i for i, p in enumerate(products) if p["id"] == product_standard.id)
    
    assert product_with_inactive_idx < product_standard_idx, \
        "Product with active express should come before standard-only (inactive same-day shouldn't affect order)"
