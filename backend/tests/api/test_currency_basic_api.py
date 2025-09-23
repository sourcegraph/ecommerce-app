from fastapi.testclient import TestClient


def test_get_supported_currencies_endpoint(client: TestClient):
    """Test the /api/currencies endpoint returns currency list"""
    response = client.get("/api/currencies")
    
    assert response.status_code == 200
    currencies = response.json()
    assert isinstance(currencies, list)
    assert len(currencies) > 0
    assert "USD" in currencies


def test_health_endpoint_still_works(client: TestClient):
    """Sanity check that existing endpoints still work"""
    response = client.get("/health")
    assert response.status_code == 200
