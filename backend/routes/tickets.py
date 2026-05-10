"""GET /tickets and GET /tickets/<id> — admin-scope, JWT-protected.

Admin sees all tickets across the WHMCS instance.
"""

from flask import Blueprint, jsonify, request

import config
from helpers import jwt_auth, whmcs

bp = Blueprint("tickets", __name__)


@bp.route("/tickets", methods=["GET"])
@jwt_auth.require_auth
def list_tickets():
    try:
        limit = int(request.args.get("limit", 50))
    except ValueError:
        limit = 50

    try:
        result = whmcs.get_tickets(limit=limit)
    except whmcs.WHMCSError:
        return jsonify({"error": "could not fetch tickets"}), 502

    tickets_block = result.get("tickets", {})
    raw = tickets_block.get("ticket", []) if isinstance(tickets_block, dict) else []

    simplified = [
        {
            "id": t.get("id"),
            "tid": t.get("tid"),
            "subject": t.get("subject"),
            "status": t.get("status"),
            "lastreply": t.get("lastreply"),
            "department": t.get("department"),
            "priority": t.get("priority"),
            "name": t.get("name"),
            "email": t.get("email"),
        }
        for t in raw
    ]

    return jsonify({"tickets": simplified, "count": len(simplified)})


@bp.route("/tickets/<int:ticket_id>", methods=["GET"])
@jwt_auth.require_auth
def get_ticket(ticket_id):
    try:
        result = whmcs.get_ticket(ticket_id)
    except whmcs.WHMCSError:
        return jsonify({"error": "could not fetch ticket"}), 502

    if result.get("result") != "success":
        return jsonify({"error": "ticket not found"}), 404

    return jsonify({"ticket": result})


@bp.route("/tickets/<int:ticket_id>/reply", methods=["POST"])
@jwt_auth.require_auth
def reply_to_ticket(ticket_id):
    """Post an admin reply to a ticket. Body: {"message": "..."}."""
    if not config.WHMCS_ADMIN_USERNAME:
        return jsonify({"error": "WHMCS_ADMIN_USERNAME not configured"}), 500

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "missing message"}), 400

    try:
        result = whmcs.add_ticket_reply(
            ticket_id,
            message=message,
            admin_username=config.WHMCS_ADMIN_USERNAME,
        )
    except whmcs.WHMCSError:
        return jsonify({"error": "could not post reply"}), 502

    if result.get("result") != "success":
        return jsonify({"error": result.get("message") or "post failed"}), 400

    return jsonify({"success": True})
