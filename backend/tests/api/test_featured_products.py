from fastapi.testclient import TestClient


def test_get_featured_products_endpoint_exists(client: TestClient):
    """Test that GET /api/products/featured endpoint exists and returns valid data"""
    response = client.get("/api/products/featured")
    assert response.status_code == 200
    
    products = response.json()
    assert isinstance(products, list)
    
    # Should return 5 featured products from seed data
    assert len(products) == 5
    
    # Check structure of first product
    if len(products) > 0:
        product = products[0]
        assert "id" in product
        assert "title" in product
        assert "description" in product
        assert "price" in product
        assert "is_featured" in product
        assert "featured_order" in product
        assert product["is_featured"] is True


def test_get_featured_products_respects_limit(client: TestClient):
    """Test that limit parameter works"""
    response = client.get("/api/products/featured?limit=3")
    assert response.status_code == 200
    
    products = response.json()
    assert len(products) <= 3


def test_get_featured_products_includes_category(client: TestClient):
    """Test that featured products include category information"""
    response = client.get("/api/products/featured")
    assert response.status_code == 200
    
    products = response.json()
    if len(products) > 0:
        product = products[0]
        assert "category" in product
        assert product["category"] is not None
        assert "name" in product["category"]


def test_get_featured_products_ordered_correctly(client: TestClient):
    """Test that products are ordered by featured_order"""
    response = client.get("/api/products/featured")
    assert response.status_code == 200
    
    products = response.json()
    # Check that products with featured_order are ordered
    orders = [p["featured_order"] for p in products if p["featured_order"] is not None]
    
    # Should be in ascending order
    assert orders == sorted(orders)
