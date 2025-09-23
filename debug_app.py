#!/usr/bin/env python3
"""Debug app import issues"""

import sys
import os
import traceback
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    print("Importing app...")
    from app.main import app
    print("App imported successfully")
    
    print("\nChecking routes...")
    cart_routes = [r for r in app.routes if hasattr(r, 'path') and '/cart' in r.path]
    config_routes = [r for r in app.routes if hasattr(r, 'path') and '/config' in r.path]
    
    print(f"Cart routes found: {len(cart_routes)}")
    print(f"Config routes found: {len(config_routes)}")
    
    print(f"\nTotal routes: {len(app.routes)}")
    for route in app.routes:
        if hasattr(route, 'path'):
            print(f"  {route.path}")
    
except Exception as e:
    print(f"Error importing app: {e}")
    traceback.print_exc()
