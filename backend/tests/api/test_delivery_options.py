import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from tests.factories import (
    create_test_product,
    create_test_delivery_option,
    create_standard_delivery_options,
)
from app.models import DeliverySpeed


def test_product_with_delivery_options_includes_options_in_response(
    client: TestClient, session: Session
):
    """Test that individual product endpoint includes delivery options"""
    # Create a product and delivery options
    product = create_test_product(session, title="Test Product", price=30.0)
    delivery_options = create_standard_delivery_options(session)

    # Assign delivery options to product
    product.delivery_options = delivery_options
    session.add(product)
    session.commit()

    # Get the product
    response = client.get(f"/products/{product.id}")
    assert response.status_code == 200

    product_data = response.json()
    assert "delivery_options" in product_data
    assert len(product_data["delivery_options"]) == 4

    # Check that options are sorted by price, then speed
    options = product_data["delivery_options"]
    assert options[0]["name"] == "Standard Shipping"
    assert options[0]["price"] == 0.0
    assert options[1]["name"] == "Express Delivery"
    assert options[1]["price"] == 9.99


def test_products_list_includes_delivery_summary_when_requested(
    client: TestClient, session: Session
):
    """Test that products list includes delivery summary when flag is set"""
    # Create a product with delivery options
    product = create_test_product(session, title="Test Product", price=30.0)
    delivery_options = create_standard_delivery_options(session)
    product.delivery_options = delivery_options
    session.add(product)
    session.commit()

    # Test without delivery summary flag
    response = client.get("/products")
    assert response.status_code == 200
    products = response.json()

    test_product = next((p for p in products if p["id"] == product.id), None)
    assert test_product is not None
    assert test_product["delivery_summary"] is None

    # Test with delivery summary flag
    response = client.get("/products?include_delivery_summary=true")
    assert response.status_code == 200
    products = response.json()

    test_product = next((p for p in products if p["id"] == product.id), None)
    assert test_product is not None
    assert test_product["delivery_summary"] is not None

    summary = test_product["delivery_summary"]
    assert summary["has_free"] is True
    assert summary["cheapest_price"] == 0.0
    assert summary["fastest_days_min"] == 0  # Same day option
    assert summary["fastest_days_max"] == 0
    assert summary["options_count"] == 4


def test_delivery_summary_calculation_with_no_free_options(session: Session):
    """Test delivery summary calculation when no free options exist"""
    from app.main import calculate_delivery_summary

    # Create only paid delivery options
    paid_options = [
        create_test_delivery_option(
            session, name="Express", speed=DeliverySpeed.EXPRESS, price=9.99
        ),
        create_test_delivery_option(
            session, name="Next Day", speed=DeliverySpeed.NEXT_DAY, price=19.99
        ),
    ]

    summary = calculate_delivery_summary(paid_options)
    assert summary is not None
    assert summary.has_free is False
    assert summary.cheapest_price == 9.99
    assert summary.fastest_days_min == 1
    assert (
        summary.fastest_days_max == 1
    )  # Next day has min=1, max=1, so fastest_max is 1
    assert summary.options_count == 2


def test_delivery_summary_calculation_with_inactive_options(session: Session):
    """Test that inactive delivery options are excluded from summary"""
    from app.main import calculate_delivery_summary

    options = [
        create_test_delivery_option(
            session, name="Active Option", price=5.0, is_active=True
        ),
        create_test_delivery_option(
            session, name="Inactive Option", price=2.0, is_active=False
        ),
    ]

    summary = calculate_delivery_summary(options)
    assert summary is not None
    assert summary.cheapest_price == 5.0  # Only active option considered
    assert summary.options_count == 1


def test_delivery_summary_calculation_with_no_options(session: Session):
    """Test delivery summary calculation with empty options list"""
    from app.main import calculate_delivery_summary

    summary = calculate_delivery_summary([])
    assert summary is None


def test_product_delivery_options_relationship(session: Session):
    """Test the many-to-many relationship between products and delivery options"""
    # Create a product and delivery options
    product = create_test_product(session, title="Relationship Test Product")
    delivery_option1 = create_test_delivery_option(session, name="Option 1")
    delivery_option2 = create_test_delivery_option(session, name="Option 2")

    # Test assigning delivery options to product
    product.delivery_options = [delivery_option1, delivery_option2]
    session.add(product)
    session.commit()
    session.refresh(product)

    # Verify relationship works both ways
    assert len(product.delivery_options) == 2
    assert delivery_option1 in product.delivery_options
    assert delivery_option2 in product.delivery_options

    # Check reverse relationship
    session.refresh(delivery_option1)
    session.refresh(delivery_option2)
    assert product in delivery_option1.products
    assert product in delivery_option2.products


def test_delivery_option_model_validation():
    """Test DeliveryOption model validation"""
    from app.schemas import DeliveryOptionCreate
    from pydantic import ValidationError

    # Valid delivery option
    valid_data = {
        "name": "Test Delivery",
        "description": "Test description",
        "speed": DeliverySpeed.STANDARD,
        "price": 9.99,
        "estimated_days_min": 1,
        "estimated_days_max": 3,
    }

    option = DeliveryOptionCreate(**valid_data)
    assert option.name == "Test Delivery"
    assert option.price == 9.99

    # Test negative price validation
    with pytest.raises(ValidationError) as exc_info:
        DeliveryOptionCreate(**{**valid_data, "price": -5.0})
    assert "greater than or equal to 0" in str(exc_info.value)

    # Test negative days validation
    with pytest.raises(ValidationError) as exc_info:
        DeliveryOptionCreate(**{**valid_data, "estimated_days_min": -1})
    assert "greater than or equal to 0" in str(exc_info.value)

    # Test empty name validation
    with pytest.raises(ValidationError) as exc_info:
        DeliveryOptionCreate(**{**valid_data, "name": ""})
    assert "at least 1 character" in str(exc_info.value)


def test_product_with_minimum_order_amount_api_response(
    client: TestClient, session: Session
):
    """Test that minimum order amounts are properly returned in API response"""
    # Create a product
    product = create_test_product(session, title="Test Product", price=30.0)

    # Create delivery options: one with minimum order, one without
    standard_delivery = create_test_delivery_option(
        session,
        name="Standard Shipping",
        price=0.0,
        min_order_amount=25.0,  # Standard $25 minimum
    )

    premium_delivery = create_test_delivery_option(
        session,
        name="Premium Delivery",
        price=15.0,
        min_order_amount=None,  # No minimum
    )

    product.delivery_options = [standard_delivery, premium_delivery]
    session.add(product)
    session.commit()

    # Get the product
    response = client.get(f"/products/{product.id}")
    assert response.status_code == 200

    product_data = response.json()
    delivery_options = product_data["delivery_options"]

    # Find options by name
    standard = next(
        opt for opt in delivery_options if opt["name"] == "Standard Shipping"
    )
    premium = next(opt for opt in delivery_options if opt["name"] == "Premium Delivery")

    # Verify minimum order amounts are correctly returned
    assert standard["min_order_amount"] == 25.0
    assert premium["min_order_amount"] is None


def test_fastest_delivery_sort_no_duplicates(client: TestClient, session: Session):
    """Test that fastest delivery sort does not return duplicate products (issue #35)"""
    # Create a product with multiple delivery options
    product = create_test_product(session, title="Multi-Option Product", price=50.0)
    delivery_options = create_standard_delivery_options(session)
    product.delivery_options = delivery_options
    session.add(product)
    session.commit()

    # Fetch products with fastest delivery sort
    response = client.get("/products?sort=delivery_fastest")
    assert response.status_code == 200

    products = response.json()

    # Count occurrences of our product
    product_count = sum(1 for p in products if p["id"] == product.id)

    # Product should appear exactly once, not multiple times (one per delivery option)
    assert product_count == 1, f"Product appeared {product_count} times, expected 1"


def test_fastest_delivery_sort_with_category_filter_no_duplicates(
    client: TestClient, session: Session
):
    """Test that fastest delivery sort with category filter does not return duplicates"""
    # Create a unique category
    from tests.factories import create_test_category
    import uuid

    unique_name = f"TestCategory-{uuid.uuid4().hex[:8]}"
    category = create_test_category(session, name=unique_name)

    # Create products in that category with multiple delivery options
    product1 = create_test_product(
        session, title="Product 1", price=30.0, category_id=category.id
    )
    product2 = create_test_product(
        session, title="Product 2", price=40.0, category_id=category.id
    )

    delivery_options = create_standard_delivery_options(session)
    product1.delivery_options = delivery_options
    product2.delivery_options = delivery_options
    session.add_all([product1, product2])
    session.commit()

    # Fetch products with fastest delivery sort and category filter
    response = client.get(f"/products?sort=delivery_fastest&categoryId={category.id}")
    assert response.status_code == 200

    products = response.json()

    # Count occurrences of each product
    product1_count = sum(1 for p in products if p["id"] == product1.id)
    product2_count = sum(1 for p in products if p["id"] == product2.id)

    # Each product should appear exactly once
    assert product1_count == 1, f"Product 1 appeared {product1_count} times"
    assert product2_count == 1, f"Product 2 appeared {product2_count} times"
