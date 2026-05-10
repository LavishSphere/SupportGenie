"""GET /tickets/<id>/summary and /tickets/<id>/suggest-reply — JWT-protected.

Admin scope: any logged-in admin can summarize or get a suggested reply
for any ticket. We re-fetch the ticket from WHMCS each time (single source
of truth) before passing it to Gemini.
"""

from flask import Blueprint, jsonify

from helpers import jwt_auth, whmcs, gemini

bp = Blueprint("ai", __name__)


def _load_ticket(ticket_id: int):
    """Fetch a ticket from WHMCS.

    Returns (ticket_dict, None) on success or (None, (response, status))
    so the caller can early-return.
    """
    try:
        result = whmcs.get_ticket(ticket_id)
    except whmcs.WHMCSError:
        return None, (jsonify({"error": "could not fetch ticket"}), 502)

    if result.get("result") != "success":
        return None, (jsonify({"error": "ticket not found"}), 404)

    return result, None


@bp.route("/tickets/<int:ticket_id>/summary", methods=["GET"])
@jwt_auth.require_auth
def ticket_summary(ticket_id):
    ticket, err = _load_ticket(ticket_id)
    if err:
        return err

    try:
        summary = gemini.summarize_ticket(ticket)
    except Exception as e:
        return jsonify({"error": "summary failed", "detail": str(e)}), 500

    return jsonify({"ticket_id": ticket_id, "summary": summary})


@bp.route("/tickets/<int:ticket_id>/suggest-reply", methods=["GET"])
@jwt_auth.require_auth
def ticket_suggest_reply(ticket_id):
    ticket, err = _load_ticket(ticket_id)
    if err:
        return err

    try:
        suggestion = gemini.suggest_reply(ticket)
    except Exception as e:
        return jsonify({"error": "suggest failed", "detail": str(e)}), 500

    return jsonify({"ticket_id": ticket_id, "suggested_reply": suggestion})
