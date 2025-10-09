import re
from starlette.testclient import TestClient
from app.main import app


def test_trace_headers_generated():
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert "traceparent" in response.headers
    
    request_id = response.headers["X-Request-ID"]
    traceparent = response.headers["traceparent"]
    
    assert re.match(r'^[0-9a-f]{32}$', request_id)
    assert re.match(r'^00-[0-9a-f]{32}-[0-9a-f]{16}-01$', traceparent)


def test_trace_propagation():
    incoming_traceparent = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
    
    client = TestClient(app)
    response = client.get(
        "/health",
        headers={"traceparent": incoming_traceparent}
    )
    
    assert response.status_code == 200
    
    response_traceparent = response.headers["traceparent"]
    response_request_id = response.headers["X-Request-ID"]
    
    assert "4bf92f3577b34da6a3ce929d0e0e4736" in response_traceparent
    assert response_request_id == "4bf92f3577b34da6a3ce929d0e0e4736"


def test_invalid_traceparent_generates_new():
    client = TestClient(app)
    response = client.get(
        "/health",
        headers={"traceparent": "invalid-trace-header"}
    )
    
    assert response.status_code == 200
    assert "traceparent" in response.headers
    assert re.match(r'^00-[0-9a-f]{32}-[0-9a-f]{16}-01$', response.headers["traceparent"])
