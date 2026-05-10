"""Loads environment variables and exposes constants used across the app."""

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

WHMCS_IDENTIFIER = os.getenv("WHMCS_IDENTIFIER")
WHMCS_SECRET = os.getenv("WHMCS_SECRET")
WHMCS_URL = os.getenv("WHMCS_URL")
WHMCS_ADMIN_USERNAME = os.getenv("WHMCS_ADMIN_USERNAME")

DEMO_ADMIN_EMAIL = os.getenv("DEMO_ADMIN_EMAIL")
DEMO_ADMIN_PASSWORD = os.getenv("DEMO_ADMIN_PASSWORD")

JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 12

GEMINI_MODEL = "models/gemini-2.5-flash"

ALLOWED_ORIGINS = [
    "https://tickets.uniplex.xyz",
    "http://localhost:5173",
]


def assert_ready() -> None:
    """Fail fast at startup if anything critical is missing."""
    missing = [
        name for name, value in {
            "SECRET_KEY": SECRET_KEY,
            "GEMINI_API_KEY": GEMINI_API_KEY,
            "WHMCS_IDENTIFIER": WHMCS_IDENTIFIER,
            "WHMCS_SECRET": WHMCS_SECRET,
            "WHMCS_URL": WHMCS_URL,
            "DEMO_ADMIN_EMAIL": DEMO_ADMIN_EMAIL,
            "DEMO_ADMIN_PASSWORD": DEMO_ADMIN_PASSWORD,
        }.items() if not value
    ]
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")
