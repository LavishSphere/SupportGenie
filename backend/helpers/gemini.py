"""Gemini-backed AI helpers: ticket summarization and reply suggestion.

Both helpers take the raw WHMCS GetTicket response (a dict) and produce
plain text. Prompts are intentionally simple — easy to tune for the demo.
"""

import google.generativeai as genai

import config

genai.configure(api_key=config.GEMINI_API_KEY)
_model = genai.GenerativeModel(config.GEMINI_MODEL)


def _generate(prompt: str) -> str:
    response = _model.generate_content(prompt)
    return (getattr(response, "text", "") or "").strip()


def _format_conversation(ticket: dict) -> str:
    """Build a chronological transcript from a WHMCS ticket payload."""
    subject = ticket.get("subject", "")
    initial_msg = ticket.get("message", "")

    replies_block = ticket.get("replies", {})
    replies = replies_block.get("reply", []) if isinstance(replies_block, dict) else []

    lines = [f"Subject: {subject}", f"Initial message: {initial_msg}"]
    for r in replies:
        author = r.get("admin") or r.get("name") or "user"
        msg = r.get("message", "")
        lines.append(f"{author}: {msg}")
    return "\n".join(lines)


def summarize_ticket(ticket: dict) -> str:
    convo = _format_conversation(ticket)
    prompt = f"""You are an assistant that summarizes customer support tickets for a web hosting provider.

Summarize the ticket below in 3-5 concise bullet points covering:
- the customer's main issue
- relevant context (services, products, errors)
- the current status of the conversation (waiting on customer, escalated, resolved, etc.)

Ticket:
{convo}

Summary:"""
    return _generate(prompt)


def suggest_reply(ticket: dict) -> str:
    convo = _format_conversation(ticket)
    prompt = f"""You are a professional support agent for a web hosting provider.
Draft a polite, clear, and helpful reply to the customer based on the ticket below.

Guidelines:
- Friendly, professional tone
- Address the customer's specific issue directly
- If more information is needed, ask for it clearly and specifically
- Do NOT invent technical facts; if uncertain, say a human will follow up
- Sign off as "Support Team" — do not invent a personal name

Ticket:
{convo}

Suggested reply:"""
    return _generate(prompt)
