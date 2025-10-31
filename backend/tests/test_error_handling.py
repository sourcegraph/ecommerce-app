from tests.factories import create_test_category, create_test_product


def test_category_not_found_returns_structured_error(client):
    resp = client.get("/categories/999999")
    assert resp.status_code == 404
    body = resp.json()
    assert body["code"] == 404
    assert body["error_code"] == "CATEGORY_NOT_FOUND"
    assert body["message"] == "Category not found"


def test_category_conflict_returns_structured_error(client, session):
    create_test_category(session, name="Books")

    resp = client.post("/categories", json={"name": "Books"})
    assert resp.status_code == 409
    body = resp.json()
    assert body["code"] == 409
    assert body["error_code"] == "CATEGORY_EXISTS"
    assert "already exists" in body["message"]


def test_product_not_found_returns_structured_error(client):
    resp = client.get("/products/999999")
    assert resp.status_code == 404
    body = resp.json()
    assert body["code"] == 404
    assert body["error_code"] == "PRODUCT_NOT_FOUND"
    assert body["message"] == "Product not found"


def test_validation_error_returns_structured_422(client):
    resp = client.post("/products", json={"title": "Invalid"})
    assert resp.status_code == 422
    body = resp.json()
    assert body["code"] == 422
    assert body["error_code"] == "VALIDATION_ERROR"
    assert isinstance(body.get("details", {}).get("errors"), list)


def test_image_not_found_returns_structured_error(client, session):
    product = create_test_product(session, title="No Image Product", with_image=False)

    resp = client.get(f"/products/{product.id}/image")
    assert resp.status_code == 404
    body = resp.json()
    assert body["code"] == 404
    assert body["error_code"] == "IMAGE_NOT_FOUND"


def test_category_not_found_during_product_create_returns_bad_request(client):
    resp = client.post(
        "/products",
        json={
            "title": "Test Product",
            "description": "Test Description",
            "price": 29.99,
            "category_id": 999999,
        },
    )
    assert resp.status_code == 400
    body = resp.json()
    assert body["code"] == 400
    assert body["error_code"] == "CATEGORY_NOT_FOUND"
    assert body["message"] == "Category not found"
