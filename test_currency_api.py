#!/usr/bin/env python3
"""Quick test of the currency API endpoints"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_config_currencies():
    """Test GET /config/currencies endpoint"""
    response = client.get("/config/currencies")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_products_with_currency():
    """Test GET /products with currency parameter"""
    response = client.get("/products?currency=EUR")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Number of products: {len(data) if isinstance(data, list) else 'not a list'}")
        if isinstance(data, list) and len(data) > 0:
            product = data[0]
            print(f"First product keys: {list(product.keys())}")
            if 'price_money' in product:
                print(f"Price money: {product['price_money']}")
            if 'base_price_money' in product:
                print(f"Base price money: {product['base_price_money']}")
            else:
                print("❌ Missing price_money and base_price_money fields - products endpoint not updated yet")
    return response.status_code in [200, 503]  # 503 for missing FX rates is ok

def test_api_products_with_currency():
    """Test GET /api/products with currency parameter"""
    response = client.get("/api/products?currency=EUR")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Number of products: {len(data) if isinstance(data, list) else 'not a list'}")
        if isinstance(data, list) and len(data) > 0:
            product = data[0]
            print(f"First product keys: {list(product.keys())}")
            if 'price_money' in product:
                print(f"Price money: {product['price_money']}")
            if 'base_price_money' in product:
                print(f"Base price money: {product['base_price_money']}")
            else:
                print("❌ Missing price_money and base_price_money fields - /api/products endpoint not updated yet")
    return response.status_code in [200, 503]  # 503 for missing FX rates is ok

def test_cart():
    """Test GET /cart endpoint"""
    response = client.get("/cart?currency=EUR")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    return response.status_code in [200, 503]  # 503 for missing FX rates is ok

if __name__ == "__main__":
    print("Testing currency API endpoints...")
    
    print("\n1. Testing /config/currencies")
    test_config_currencies()
    
    print("\n2. Testing /products with currency")
    test_products_with_currency()
    
    print("\n3. Testing /api/products with currency") 
    test_api_products_with_currency()
    
    print("\n4. Testing /cart")
    test_cart()
    
    print("\nTests completed!")
