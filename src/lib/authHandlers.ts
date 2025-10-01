const API_URL = "http://127.0.0.1:8000";

async function login({ email, password }: { email: string; password: string }) {
  const form = new URLSearchParams();
  form.append("username", email);        // send EMAIL in 'username' field
  form.append("password", password);
  form.append("grant_type", "password");

  const res = await fetch(`${API_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || "Login failed");
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data;
}

async function me() {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

function logout() {
  localStorage.removeItem("access_token");
}

export const authHandlers = { login, me, logout };
