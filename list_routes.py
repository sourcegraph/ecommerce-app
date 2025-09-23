#!/usr/bin/env python3
"""List all routes in the FastAPI app"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.main import app

print("Available routes:")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        methods = getattr(route, 'methods', set())
        print(f"{route.path} - {methods}")
