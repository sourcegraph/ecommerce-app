import uuid


def test_add_to_cart_creates_new_entry(client):
    """Test that adding a product to cart creates a new cart count entry"""
    product_id = 1  # Use existing seeded product
    session_id = str(uuid.uuid4())
    
    response = client.post("/cart/add", json={
        "product_id": product_id,
        "session_id": session_id
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == product_id
    assert data["cart_count"] == 1


def test_add_to_cart_duplicate_session_does_not_increase_count(client):
    """Test that adding the same product twice from same session doesn't increase count"""
    product_id = 2  # Use different seeded product to avoid conflicts
    session_id = str(uuid.uuid4())
    
    # Add first time
    response1 = client.post("/cart/add", json={
        "product_id": product_id,
        "session_id": session_id
    })
    assert response1.status_code == 200
    assert response1.json()["cart_count"] == 1
    
    # Add second time with same session
    response2 = client.post("/cart/add", json={
        "product_id": product_id,
        "session_id": session_id
    })
    assert response2.status_code == 200
    assert response2.json()["cart_count"] == 1  # Should not increase


def test_add_to_cart_multiple_sessions_increases_count(client):
    """Test that different sessions adding same product increases count"""
    product_id = 3  # Use different seeded product to avoid conflicts
    session_id_1 = str(uuid.uuid4())
    session_id_2 = str(uuid.uuid4())
    
    # Add from first session
    response1 = client.post("/cart/add", json={
        "product_id": product_id,
        "session_id": session_id_1
    })
    assert response1.status_code == 200
    assert response1.json()["cart_count"] == 1
    
    # Add from second session
    response2 = client.post("/cart/add", json={
        "product_id": product_id,
        "session_id": session_id_2
    })
    assert response2.status_code == 200
    assert response2.json()["cart_count"] == 2


def test_add_to_cart_nonexistent_product_returns_404(client):
    """Test adding nonexistent product to cart returns 404"""
    response = client.post("/cart/add", json={
        "product_id": 99999,
        "session_id": str(uuid.uuid4())
    })
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_remove_from_cart_reduces_count(client):
    """Test that removing from cart reduces the count"""
    product_id = 4  # Use different seeded product to avoid conflicts
    session_id = str(uuid.uuid4())
    
    # First add to cart
    response1 = client.post("/cart/add", json={
        "product_id": product_id,
        "session_id": session_id
    })
    assert response1.status_code == 200
    assert response1.json()["cart_count"] == 1
    
    # Then remove
    response2 = client.post("/cart/remove", json={
        "product_id": product_id,
        "session_id": session_id
    })
    
    assert response2.status_code == 200
    data = response2.json()
    assert data["product_id"] == product_id
    assert data["cart_count"] == 0


def test_remove_from_cart_nonexistent_entry_returns_zero(client):
    """Test removing nonexistent cart entry returns zero count"""
    product_id = 5  # Use different seeded product to avoid conflicts
    
    response = client.post("/cart/remove", json={
        "product_id": product_id,
        "session_id": str(uuid.uuid4())
    })
    
    assert response.status_code == 200
    assert response.json()["cart_count"] == 0


def test_get_cart_count_for_product_with_no_carts(client):
    """Test getting cart count for product with no cart entries"""
    product_id = 6  # Use different seeded product to avoid conflicts
    
    response = client.get(f"/cart/count/{product_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == product_id
    assert data["cart_count"] == 0


def test_products_api_includes_cart_count(client):
    """Test that the products API endpoint includes cart counts"""
    response = client.get("/api/products?include_cart_count=true")
    
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 1  # Should have seeded products
    
    # Check that all products have cart_count field
    for product in products:
        assert "cart_count" in product
        assert product["cart_count"] is not None


def test_products_api_cart_count_optional(client):
    """Test that cart count can be excluded from products API"""
    response = client.get("/api/products?include_cart_count=false")
    
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 1  # Should have seeded products
    
    # Check that all products have cart_count as None
    for product in products:
        assert "cart_count" in product
        assert product["cart_count"] is None
