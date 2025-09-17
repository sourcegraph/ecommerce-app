import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

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
