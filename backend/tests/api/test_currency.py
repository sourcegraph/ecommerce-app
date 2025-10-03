import pytest
from datetime import datetime, UTC, timedelta
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlmodel import Session
from typing import Optional


@pytest.fixture(autouse=True)
def clean_fx_data(session: Session):
    from app.currency import FxRates
    from sqlmodel import select
    
    stmt = select(FxRates)
    rates = session.exec(stmt).all()
    for rate in rates:
        session.delete(rate)
    session.commit()
    yield


def get_mock_fx_rates(overrides: Optional[dict] = None) -> dict:
    base = {
        "GBP": 0.79,
        "EUR": 0.92,
        "AUD": 1.52,
        "MXN": 17.25,
        "JPY": 149.50
    }
    return base | (overrides or {})


def get_mock_provider_response(overrides: Optional[dict] = None) -> dict:
    base = {
        "base": "USD",
        "date": "2025-10-03",
        "rates": get_mock_fx_rates()
    }
    return base | (overrides or {})


def test_rates_empty_cache_fetches_from_provider(client: TestClient):
    with patch("httpx.get") as mock_get:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = get_mock_provider_response()
        mock_get.return_value = mock_response
        
        response = client.get("/fx/rates")
        
        assert response.status_code == 200
        data = response.json()
        assert data["base"] == "USD"
        assert data["rates"]["USD"] == 1.0
        assert data["rates"]["GBP"] == 0.79
        assert data["rates"]["EUR"] == 0.92
        assert data["rates"]["AUD"] == 1.52
        assert data["rates"]["MXN"] == 17.25
        assert data["rates"]["JPY"] == 149.50
        assert data["stale"] is False
        assert data["ttl_seconds"] == 21600
        assert "fetched_at" in data
        
        mock_get.assert_called_once()
        call_args = mock_get.call_args
        assert "https://api.frankfurter.app/latest" in call_args[0][0]


def test_rates_within_ttl_uses_cache(client: TestClient):
    with patch("httpx.get") as mock_get:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = get_mock_provider_response()
        mock_get.return_value = mock_response
        
        response1 = client.get("/fx/rates")
        assert response1.status_code == 200
        
        response2 = client.get("/fx/rates")
        assert response2.status_code == 200
        
        data2 = response2.json()
        assert data2["rates"]["GBP"] == 0.79
        assert data2["stale"] is False
        
        assert mock_get.call_count >= 1


def test_rates_expired_refetches(client: TestClient):
    with patch("httpx.get") as mock_get:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = get_mock_provider_response()
        mock_get.return_value = mock_response
        
        with patch("app.currency.datetime") as mock_datetime:
            now = datetime.now(UTC)
            mock_datetime.now.return_value = now
            mock_datetime.UTC = UTC
            
            response1 = client.get("/fx/rates")
            assert response1.status_code == 200
            
            future = now + timedelta(hours=7)
            mock_datetime.now.return_value = future
            
            mock_response.json.return_value = get_mock_provider_response({
                "rates": get_mock_fx_rates({"GBP": 0.81})
            })
            
            response2 = client.get("/fx/rates")
            assert response2.status_code == 200
            
            data2 = response2.json()
            assert data2["rates"]["GBP"] == 0.81
            
            assert mock_get.call_count == 2


def test_provider_failure_serves_stale_from_db(client: TestClient, session):
    from app.currency import FxRates
    
    old_rates = FxRates(
        base="USD",
        rates=get_mock_fx_rates(),
        fetched_at=datetime.now(UTC) - timedelta(hours=10)
    )
    session.add(old_rates)
    session.commit()
    
    with patch("httpx.get") as mock_get:
        mock_get.side_effect = Exception("Network error")
        
        response = client.get("/fx/rates")
        
        assert response.status_code == 200
        data = response.json()
        assert data["base"] == "USD"
        assert data["rates"]["GBP"] == 0.79
        assert data["stale"] is True


def test_no_persistent_rates_returns_usd_only_stale_true(client: TestClient):
    with patch("httpx.get") as mock_get:
        mock_get.side_effect = Exception("Network error")
        
        response = client.get("/fx/rates")
        
        assert response.status_code == 200
        data = response.json()
        assert data["base"] == "USD"
        assert data["rates"] == {"USD": 1.0}
        assert data["stale"] is True
        assert "fetched_at" in data


def test_response_includes_all_currencies(client: TestClient):
    with patch("httpx.get") as mock_get:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = get_mock_provider_response()
        mock_get.return_value = mock_response
        
        response = client.get("/fx/rates")
        
        assert response.status_code == 200
        data = response.json()
        
        expected_currencies = {"USD", "GBP", "EUR", "AUD", "MXN", "JPY"}
        assert set(data["rates"].keys()) == expected_currencies
        
        assert data["rates"]["USD"] == 1.0


def test_provider_returns_non_200_status(client: TestClient):
    with patch("httpx.get") as mock_get:
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = Exception("Server error")
        mock_get.return_value = mock_response
        
        response = client.get("/fx/rates")
        
        assert response.status_code == 200
        data = response.json()
        assert data["rates"] == {"USD": 1.0}
        assert data["stale"] is True
