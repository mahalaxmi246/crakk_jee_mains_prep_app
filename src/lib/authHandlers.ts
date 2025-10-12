// src/lib/authHandlers.ts ✅ UPDATED

// ✅ Prefer env; fallback to local dev with /api
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/** ---- Token helpers (localStorage) ---- */
const TOKEN_KEY = "access_token";
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const setAccessToken = (t?: string) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

/** ---- Types ---- */
export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  emailOrUsername: string;
  password: string;
};

export type UserDTO = {
  id: number;
  username: string;
  email: string;
  class_level?: string | null;
  stream?: string | null;
};

/** ---- Auth Headers Helper ---- */
function withAuthHeaders(extra?: Record<string, string>) {
  const token = getAccessToken();
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** ---- Auth Handlers ---- */
export const authHandlers = {
  async register(data: RegisterPayload): Promise<UserDTO> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  async login(
    data: LoginPayload
  ): Promise<{ access_token?: string; token_type?: string }> {
    const form = new URLSearchParams();
    form.append("username", data.emailOrUsername);
    form.append("password", data.password);

    const res = await fetch(`${API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid credentials");
    }

    const json = await res.json();
    if (json?.access_token) setAccessToken(json.access_token);
    return json;
  },

  async logout(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: withAuthHeaders(),
        credentials: "include",
      });
    } finally {
      setAccessToken(undefined);
    }
    return true;
  },

  async getUser(): Promise<UserDTO | null> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: withAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  },
};

/** ---- Firebase → Backend JWT exchange ---- */
export async function exchangeFirebaseIdToken(idToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/firebase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
    credentials: "include",
  });
  if (!res.ok) {
    setAccessToken(undefined);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Firebase exchange failed");
  }
  const json = await res.json();
  if (json?.access_token) setAccessToken(json.access_token);
  return json;
}
