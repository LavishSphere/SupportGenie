"""SupportGenie backend entry point.

Run locally:
    python main.py

Run in production (recommended):
    gunicorn -w 2 -b 127.0.0.1:3023 main:app
"""

from flask import Flask, jsonify
from flask_cors import CORS

import config
from routes.auth import bp as auth_bp
from routes.tickets import bp as tickets_bp
from routes.ai import bp as ai_bp


def create_app() -> Flask:
    config.assert_ready()

    app = Flask(__name__)

    CORS(app, resources={r"/*": {"origins": config.ALLOWED_ORIGINS}})

    app.register_blueprint(auth_bp)
    app.register_blueprint(tickets_bp)
    app.register_blueprint(ai_bp)

    @app.route("/")
    def home():
        return jsonify({"status": "online", "service": "SupportGenie API"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3023)
