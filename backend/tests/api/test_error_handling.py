from starlette.testclient import TestClient
from app.main import app


def test_rfc7807_not_found_error():
    client = TestClient(app)
    response = client.get("/products/99999")
    
    assert response.status_code == 404
    assert response.headers["content-type"] == "application/problem+json"
    
    problem = response.json()
    
    assert problem["type"].startswith("https://docs.lineasupply.com/errors/")
    assert problem["title"] == "Not Found"
    assert problem["status"] == 404
    assert "Product not found" in problem["detail"]
    assert problem["instance"] == "/products/99999"
    assert problem["code"] == "RESOURCE.NOT_FOUND"
    assert "request_id" in problem
    assert "trace_id" in problem


def test_rfc7807_validation_error():
    client = TestClient(app)
    response = client.post(
        "/products",
        json={
            "title": "Test",
            "price": "invalid_price",
            "category_id": 1
        }
    )
    
    assert response.status_code == 400
    assert response.headers["content-type"] == "application/problem+json"
    
    problem = response.json()
    
    assert problem["code"] == "VALIDATION.INVALID_FIELDS"
    assert problem["status"] == 400
    assert "details" in problem
    assert "fields" in problem["details"]
    assert len(problem["details"]["fields"]) > 0


def test_cors_headers_exposed():
    client = TestClient(app)
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3001",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "traceparent,X-Request-ID"
        }
    )
    
    assert response.status_code == 200
    assert "access-control-allow-headers" in response.headers
    
    allowed_headers = response.headers["access-control-allow-headers"].lower()
    assert "traceparent" in allowed_headers
    assert "x-request-id" in allowed_headers
