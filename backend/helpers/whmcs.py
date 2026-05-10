"""Thin WHMCS API client.

Every WHMCS API call is the same shape: POST form-encoded fields including
identifier + secret + action. We wrap that once in `_post` and expose one
function per action we actually use.

Docs:
- ValidateLogin: https://developers.whmcs.com/api-reference/validatelogin/
- GetTickets:    https://developers.whmcs.com/api-reference/gettickets/
- GetTicket:     https://developers.whmcs.com/api-reference/getticket/
"""

import requests

import config


class WHMCSError(Exception):
    pass


def _post(action: str, params: dict | None = None) -> dict:
    # WHMCS expects API auth in fields literally named "username" and "password",
    # with the API Credential's IDENTIFIER as username and SECRET as password.
    # See: https://developers.whmcs.com/api/authentication/
    payload = {
        "username": config.WHMCS_IDENTIFIER,
        "password": config.WHMCS_SECRET,
        "action": action,
        "responsetype": "json",
    }
    if params:
        payload.update(params)

    try:
        response = requests.post(config.WHMCS_URL, data=payload, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise WHMCSError(f"WHMCS request failed: {e}") from e


def validate_login(email: str, password: str) -> dict:
    """Verify a client's email/password against WHMCS.

    Returns the raw WHMCS response. On success it contains:
        {"result": "success", "userid": <int>, "passwordhash": "..."}
    On failure:
        {"result": "error", "message": "Invalid Email or Password"}
    """
    return _post("ValidateLogin", {
        "email": email,
        "password2": password,
    })


def get_tickets(limit: int = 25) -> dict:
    """Admin-scope: returns ALL tickets across the WHMCS instance."""
    return _post("GetTickets", {
        "limitnum": limit,
    })


def get_ticket(ticket_id: int) -> dict:
    return _post("GetTicket", {
        "ticketid": ticket_id,
    })


def add_ticket_reply(ticket_id: int, message: str, admin_username: str) -> dict:
    """Post an admin reply to a ticket.

    Requires the API role to have AddTicketReply permission. Posts under
    the given admin username — must match an existing WHMCS admin.
    """
    return _post("AddTicketReply", {
        "ticketid": ticket_id,
        "message": message,
        "adminusername": admin_username,
    })
