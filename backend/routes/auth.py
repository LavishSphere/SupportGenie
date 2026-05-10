"""POST /login — verify against demo admin creds in env, return JWT on success.

For the hackathon demo, SupportGenie uses its own admin login (not WHMCS
ValidateLogin, which only validates client accounts). The API credential
already gives us admin-level read access to all tickets.
"""

from flask import Blueprint, request, jsonify

import config
from helpers import jwt_auth

bp = Blueprint("auth", __name__)


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "missing credentials"}), 400

    if email != config.DEMO_ADMIN_EMAIL or password != config.DEMO_ADMIN_PASSWORD:
        return jsonify({"error": "invalid credentials"}), 401

    token = jwt_auth.create_token({"email": email, "role": "admin"})

    return jsonify({
        "token": token,
        "user": {"email": email, "role": "admin"},
    })
