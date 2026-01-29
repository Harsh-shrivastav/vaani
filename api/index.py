"""
Vaani Backend - Vercel Entry Point
Exports FastAPI app for Vercel Python runtime.
"""

import sys
import os
from pathlib import Path

# Add server folder to path
root = Path(__file__).parent.parent
sys.path.insert(0, str(root / "server"))

# Import the FastAPI app
from main import app

# Vercel uses 'app' as the ASGI handler
handler = app
