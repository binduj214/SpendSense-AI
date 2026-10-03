import os
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Database configuration
DATABASE_URL = f"sqlite:///{BASE_DIR}/database/spendsense.db"

# API configuration
API_VERSION = "v1"
APP_NAME = "SpendSense AI"
APP_DESCRIPTION = "AI-Powered Personal Finance & Predictive Savings Assistant"

# CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Currency
CURRENCY_SYMBOL = "₹"
CURRENCY_CODE = "INR"
