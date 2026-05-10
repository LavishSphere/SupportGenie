// Tiny auth store. localStorage is fine for a hackathon demo; if you ever
// need stricter security (XSS resistance), move the token to a httpOnly
// cookie set by the backend.

const TOKEN_KEY = "sg_token";
const USER_KEY = "sg_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}
