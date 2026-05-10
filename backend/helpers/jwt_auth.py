"""JWT issuing/decoding plus a @require_auth decorator for protecting routes."""

import datetime
from functools import wraps

import jwt
from flask import request, jsonify, g

import config


def create_token(payload: dict) -> str:
    data = {
        **payload,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=config.JWT_EXP_HOURS),
    }
    return jwt.encode(data, config.SECRET_KEY, algorithm=config.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, config.SECRET_KEY, algorithms=[config.JWT_ALGORITHM])


def require_auth(fn):
    """Decorator: rejects request unless a valid Bearer token is present.

    On success, attaches the decoded payload to flask.g.user so handlers can
    read g.user["user_id"] / g.user["email"].
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "missing or malformed token"}), 401

        token = auth_header.split(" ", 1)[1].strip()

        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "invalid token"}), 401

        g.user = payload
        return fn(*args, **kwargs)

    return wrapper
