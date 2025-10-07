// src/api/dpp.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// attach access token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function normalizeSubject(s?: string) {
  const v = (s || "").toLowerCase();
  if (v === "math" || v === "mathematics") return "math";
  if (v === "physics") return "physics";
  if (v === "chem" || v === "chemistry") return "chemistry";
  return "math";
}

export async function getTodayBySubject(subject: string) {
  const { data } = await API.get(`/dpp/today`, { params: { subject } });
  return data;
}

export async function submitAnswer(problemId: number, option: "A" | "B" | "C" | "D") {
  const { data } = await API.post(`/dpp/answer`, {
    problem_id: problemId,
    chosen_option: option,
  });
  return data as { is_correct: boolean; correct_option: "A" | "B" | "C" | "D" };
}

// NEW: guest-only check (no persistence)
export async function checkAnswer(problemId: number, option: "A" | "B" | "C" | "D") {
  const { data } = await API.post(`/dpp/answer/check`, {
    problem_id: problemId,
    chosen_option: option,
  });
  return data as { is_correct: boolean; correct_option: "A" | "B" | "C" | "D" };
}

export async function toggleLike(problemId: number) {
  const { data } = await API.post(`/dpp/${problemId}/like/toggle`);
  return data.liked as boolean;
}

export async function getHint(problemId: number) {
  const { data } = await API.get(`/dpp/${problemId}/hint`);
  return data?.hint_tex as string | null;
}

export async function getSolution(problemId: number) {
  const { data } = await API.get(`/dpp/${problemId}/solution`);
  return data?.solution_tex as string | null;
}
