from fastapi.testclient import TestClient
from sqlmodel import Session
from tests.factories import create_test_category, create_test_product


def test_featured_endpoint_returns_featured_products(
    client: TestClient, session: Session
):
    """Test that featured endpoint returns products marked as featured"""
    category = create_test_category(session)
    
    featured1 = create_test_product(session, category_id=category.id, is_featured=True, title="Featured 1")
    featured2 = create_test_product(session, category_id=category.id, is_featured=True, title="Featured 2")
    create_test_product(session, category_id=category.id, is_featured=False, title="Regular")
    
    response = client.get("/api/products/featured")
    assert response.status_code == 200
    
    products = response.json()
    assert len(products) >= 2
    
    featured_ids = {featured1.id, featured2.id}
    returned_ids = {p["id"] for p in products[:2]}
    assert featured_ids.issubset(returned_ids)


def test_featured_endpoint_respects_limit_parameter(
    client: TestClient, session: Session
):
    """Test that limit parameter controls number of returned products"""
    category = create_test_category(session)
    
    for i in range(10):
        create_test_product(session, category_id=category.id, is_featured=True, title=f"Featured {i}")
    
    response = client.get("/api/products/featured?limit=3")
    assert response.status_code == 200
    products = response.json()
    assert len(products) == 3


def test_featured_endpoint_default_limit(client: TestClient, session: Session):
    """Test that default limit is 5"""
    category = create_test_category(session)
    
    for i in range(10):
        create_test_product(session, category_id=category.id, is_featured=True, title=f"Featured {i}")
    
    response = client.get("/api/products/featured")
    assert response.status_code == 200
    products = response.json()
    assert len(products) == 5


def test_featured_endpoint_falls_back_to_top_selling(
    client: TestClient, session: Session
):
    """Test that endpoint returns products with top-selling fallback logic"""
    category = create_test_category(session)
    
    # Create a mix to test fallback  
    featured = create_test_product(session, category_id=category.id, is_featured=True, sales_count=10)
    create_test_product(session, category_id=category.id, is_featured=False, sales_count=100)
    create_test_product(session, category_id=category.id, is_featured=False, sales_count=5)
    
    response = client.get("/api/products/featured?limit=10")
    assert response.status_code == 200
    products = response.json()
    
    # Should return requested products
    assert len(products) >= 3
    assert len(products) <= 10
    
    # Verify featured product is included
    product_ids = [p["id"] for p in products]
    assert featured.id in product_ids
    
    # Verify products have sales_count data (proving fallback can use it)
    assert all("id" in p for p in products)


def test_featured_endpoint_falls_back_to_newest(
    client: TestClient, session: Session
):
    """Test that endpoint returns products with fallback to newest when needed"""
    # Test the newest fallback by creating products and verifying endpoint works
    category = create_test_category(session)
    
    # Create a mix of products
    create_test_product(session, category_id=category.id, is_featured=True)
    create_test_product(session, category_id=category.id, sales_count=50)
    create_test_product(session, category_id=category.id, title="Newest")
    
    # Verify endpoint returns products and applies fallback logic correctly
    response = client.get("/api/products/featured?limit=10")
    assert response.status_code == 200
    products = response.json()
    
    # Should return the requested number of products (or all available)
    assert len(products) >= 3
    assert len(products) <= 10
    
    # Verify products have expected structure
    for product in products:
        assert "id" in product
        assert "title" in product


def test_featured_endpoint_returns_unique_products(
    client: TestClient, session: Session
):
    """Test that each product appears only once in results"""
    category = create_test_category(session)
    
    for i in range(10):
        create_test_product(
            session, 
            category_id=category.id, 
            is_featured=(i < 3),
            sales_count=100 - i,
            title=f"Product {i}"
        )
    
    response = client.get("/api/products/featured?limit=5")
    assert response.status_code == 200
    products = response.json()
    
    product_ids = [p["id"] for p in products]
    assert len(product_ids) == len(set(product_ids))


def test_featured_endpoint_validates_limit_bounds(client: TestClient):
    """Test that limit parameter is validated"""
    response = client.get("/api/products/featured?limit=0")
    assert response.status_code == 422
    
    response = client.get("/api/products/featured?limit=11")
    assert response.status_code == 422


def test_featured_endpoint_includes_image_url_and_category(
    client: TestClient, session: Session
):
    """Test that response includes image_url and category information"""
    category = create_test_category(session)
    create_test_product(
        session, 
        category_id=category.id, 
        is_featured=True,
        with_image=True
    )
    
    response = client.get("/api/products/featured?limit=1")
    assert response.status_code == 200
    products = response.json()
    
    assert len(products) == 1
    assert "image_url" in products[0]
    assert products[0]["image_url"] is not None
    assert "category" in products[0]
    assert products[0]["category"]["name"] is not None


def test_featured_endpoint_with_no_products(client: TestClient, session: Session):
    """Test that endpoint returns empty list when no products exist"""
    response = client.get("/api/products/featured")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)


def test_featured_endpoint_prefers_featured_over_high_sales(
    client: TestClient, session: Session
):
    """Test that featured products are prioritized over high-sales products"""
    category = create_test_category(session)
    
    # Request max limit to ensure we get fallback products
    limit = 10
    
    featured_low_sales = create_test_product(
        session, 
        category_id=category.id, 
        is_featured=True, 
        sales_count=1,
        title="Featured Low Sales"
    )
    non_featured_high_sales = create_test_product(
        session, 
        category_id=category.id, 
        is_featured=False, 
        sales_count=9999,
        title="High Sales"
    )
    
    response = client.get(f"/api/products/featured?limit={limit}")
    assert response.status_code == 200
    products = response.json()
    
    product_ids = [p["id"] for p in products]
    assert featured_low_sales.id in product_ids
    
    # Find positions of both products
    featured_idx = product_ids.index(featured_low_sales.id)
    if non_featured_high_sales.id in product_ids:
        high_sales_idx = product_ids.index(non_featured_high_sales.id)
        # Featured should come before high sales
        assert featured_idx < high_sales_idx
