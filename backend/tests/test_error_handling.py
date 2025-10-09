from fastapi.testclient import TestClient
import re


def test_health_endpoint_includes_trace_headers(client: TestClient):
    response = client.get("/health")
    
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert "traceparent" in response.headers
    
    traceparent = response.headers["traceparent"]
    assert re.match(r"^00-[0-9a-f]{32}-[0-9a-f]{16}-01$", traceparent)
    
    request_id = response.headers["X-Request-ID"]
    trace_id = traceparent.split("-")[1]
    assert request_id == trace_id


def test_traceparent_propagation_preserves_trace_id(client: TestClient):
    incoming_trace_id = "a" * 32
    incoming_span_id = "b" * 16
    incoming_traceparent = f"00-{incoming_trace_id}-{incoming_span_id}-01"
    
    response = client.get("/health", headers={"traceparent": incoming_traceparent})
    
    assert response.status_code == 200
    assert "traceparent" in response.headers
    
    outgoing_traceparent = response.headers["traceparent"]
    outgoing_parts = outgoing_traceparent.split("-")
    
    assert outgoing_parts[1] == incoming_trace_id
    assert outgoing_parts[2] != incoming_span_id
    assert response.headers["X-Request-ID"] == incoming_trace_id


def test_invalid_traceparent_generates_new_trace(client: TestClient):
    response = client.get("/health", headers={"traceparent": "invalid-format"})
    
    assert response.status_code == 200
    assert "traceparent" in response.headers
    
    traceparent = response.headers["traceparent"]
    assert re.match(r"^00-[0-9a-f]{32}-[0-9a-f]{16}-01$", traceparent)


def test_not_found_returns_rfc7807_error(client: TestClient):
    response = client.get("/products/999999")
    
    assert response.status_code == 404
    assert response.headers.get("Content-Type") == "application/problem+json"
    
    problem = response.json()
    assert problem["status"] == 404
    assert problem["code"] == "RESOURCE.NOT_FOUND"
    assert problem["title"] == "Resource Not Found"
    assert "type" in problem
    assert "detail" in problem
    assert "instance" in problem
    assert "request_id" in problem
    assert "trace_id" in problem
    assert problem["request_id"] == response.headers["X-Request-ID"]


def test_validation_error_returns_rfc7807_with_field_details(client: TestClient):
    invalid_category = {"name": ""}
    
    response = client.post("/categories", json=invalid_category)
    
    assert response.status_code == 400
    assert response.headers.get("Content-Type") == "application/problem+json"
    
    problem = response.json()
    assert problem["status"] == 400
    assert problem["code"] == "VALIDATION.INVALID_FIELDS"
    assert problem["title"] == "Validation Invalid Fields"
    assert "details" in problem
    assert "fields" in problem["details"]
    assert isinstance(problem["details"]["fields"], list)


def test_duplicate_category_returns_validation_error(client: TestClient):
    import uuid
    
    unique_name = f"Test Category {uuid.uuid4()}"
    category_data = {"name": unique_name}
    
    response1 = client.post("/categories", json=category_data)
    assert response1.status_code == 200
    
    response2 = client.post("/categories", json=category_data)
    
    assert response2.status_code == 400
    assert response2.headers.get("Content-Type") == "application/problem+json"
    
    problem = response2.json()
    assert problem["status"] == 400
    assert problem["code"] == "VALIDATION.INVALID_FIELDS"
    assert "already exists" in problem["detail"].lower()
    assert problem["request_id"] == response2.headers["X-Request-ID"]


def test_cors_headers_expose_trace_context(client: TestClient):
    response = client.get(
        "/health",
        headers={
            "Origin": "http://localhost:3001",
        },
    )
    
    assert response.status_code == 200
    expose_headers = response.headers.get("Access-Control-Expose-Headers", "")
    assert "X-Request-ID" in expose_headers
    assert "traceparent" in expose_headers
    assert "Content-Type" in expose_headers
