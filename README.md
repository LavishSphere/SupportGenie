# SupportGenie

AI-powered support assistant for WHMCS hosting providers. Pulls tickets from WHMCS, summarizes conversations with Gemini, and drafts suggested replies so support staff can triage faster.

## Features

- WHMCS integration — fetches tickets directly via the admin API
- AI summaries — Gemini 2.5 Flash distills a ticket thread into 3-5 bullet points
- AI-suggested replies — drafts a professional support reply, ready to copy
- JWT-authenticated admin login; WHMCS and Gemini credentials never leave the backend

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind v4, react-router-dom v7 |
| Backend | Flask, PyJWT, google-generativeai, requests |
| AI | Gemini 2.5 Flash |
| Hosting | GitHub Pages (frontend), Python 3.11 server + Nginx reverse proxy (backend) |

## Architecture

```
[Browser]
   ↓
[tickets.uniplex.xyz]  — GitHub Pages, static SPA
   ↓ JWT in Authorization header
[api.uniplex.xyz]      — Flask, behind nginx + HTTPS
   ↓ identifier+secret           ↓ API key
[WHMCS REST API]            [Gemini API]
```

Frontend never talks to WHMCS or Gemini directly. All sensitive credentials live in the backend's `.env`.

## Setup

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp example.env .env       # fill in real values
python main.py            # http://localhost:3023
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

For local-frontend → local-backend, create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:3023
```

### Environment variables (backend `.env`)

```
SECRET_KEY=<long random string for signing JWTs>
GEMINI_API_KEY=<from aistudio.google.com>
WHMCS_IDENTIFIER=<WHMCS admin → API Credentials>
WHMCS_SECRET=<WHMCS admin → API Credentials>
WHMCS_URL=https://yourwhmcs.tld/includes/api.php
DEMO_ADMIN_EMAIL=admin@yourdomain.tld
DEMO_ADMIN_PASSWORD=<pick anything>
```

## WHMCS setup notes

The backend needs admin API access. In WHMCS admin:

1. **System Settings → API Credentials** — generate identifier + secret
2. **System Settings → API Roles** — ensure the role has at minimum `GetTickets` and `GetTicket` ticked
3. **System Settings → General Settings → Security tab → API IP Access Restriction** — add your backend server's public IP

Gotcha: WHMCS expects the API auth fields to be named `username` (containing the identifier) and `password` (containing the secret). Not `identifier`/`secret`. The official docs say so but many examples online get it wrong.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | — | Health check |
| POST | `/login` | — | Returns JWT |
| GET | `/tickets` | JWT | All tickets across the WHMCS instance |
| GET | `/tickets/<id>` | JWT | Full ticket with replies |
| GET | `/tickets/<id>/summary` | JWT | Gemini bullet-point summary |
| GET | `/tickets/<id>/suggest-reply` | JWT | Gemini-drafted reply |

## Deployment

### Frontend → GitHub Pages

```bash
cd frontend
npm run deploy            # builds and pushes dist/ to gh-pages
```

`public/CNAME` keeps `tickets.uniplex.xyz` bound across redeploys. Set the custom domain and enforce HTTPS in repo Settings → Pages.

### Backend → VPS

Upload `backend/` then in your server's terminal:

```bash
pip install -r requirements.txt
```

## License

MIT — see [LICENSE](LICENSE).
