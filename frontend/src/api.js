// Single fetch wrapper so we never sprinkle Authorization headers across the app.
// On 401, we wipe the session — caller can react by sending the user to /login.

import { getToken, clearSession } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "https://api.uniplex.xyz";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    clearSession();
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request("/login", { method: "POST", body: { email, password }, auth: false }),

  listTickets: () => request("/tickets"),

  getTicket: (id) => request(`/tickets/${id}`),

  summarizeTicket: (id) => request(`/tickets/${id}/summary`),

  suggestReply: (id) => request(`/tickets/${id}/suggest-reply`),

  postReply: (id, message) =>
    request(`/tickets/${id}/reply`, { method: "POST", body: { message } }),
};

export { ApiError };
