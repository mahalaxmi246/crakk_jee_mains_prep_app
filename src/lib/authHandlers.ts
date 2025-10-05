// src/lib/authHandlers.ts
const API_BASE_URL = "http://127.0.0.1:8000";

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

/** ---- API handlers ---- */
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
    form.append("username", data.emailOrUsername); // backend accepts username OR email
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
    // Persist token so /auth/me can succeed
    if (json?.access_token) setAccessToken(json.access_token);
    return json;
  },

  async logout(): Promise<boolean> {
    // Best-effort server logout; always clear local token.
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAccessToken(undefined);
    }
    return true;
  },

  async getUser(): Promise<UserDTO | null> {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  },
};
