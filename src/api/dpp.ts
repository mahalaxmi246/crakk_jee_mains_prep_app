// src/api/dpp.ts
import { api } from "../lib/api";
import type {
  ProblemOut,
  AnswerOut,
  ToggleLikeResponse,
  HintResponse,
  SolutionResponse,
  Subject,
} from "../types/dpp";

/** Local type for choices */
export type OptionKey = "A" | "B" | "C" | "D";

/** ✅ Normalize subject strings */
export function normalizeSubject(s?: string): Subject {
  const v = (s || "").toLowerCase();
  if (v === "math" || v === "physics" || v === "chemistry") return v as Subject;
  return "math";
}

/** ✅ Centralized 401/403 handler */
function handleAuthError(e: any): never {
  const status = e?.response?.status ?? e?.status;
  if (status === 401 || status === 403) {
    // Your UI listens for this in the page
    window.dispatchEvent(new CustomEvent("OPEN_GLOBAL_LOGIN"));
  }
  throw e;
}

/* ------------------------------------------------------------------ */
/* Helpers to adapt backend payloads into ProblemOut                   */
/* ------------------------------------------------------------------ */
type AnyRec = Record<string, any>;

function adaptTodayPayloadToProblemOut(payload: AnyRec): ProblemOut {
  // backend may return { question: {...}, likeCount, hasLiked, attemptedCount, solvedCount, accuracy }
  // or might already be ProblemOut
  const q = (payload?.question ?? payload) as AnyRec;

  const options: ProblemOut["options"] =
    q.options ?? {
      A: q.option_a_tex ?? "",
      B: q.option_b_tex ?? "",
      C: q.option_c_tex ?? "",
      D: q.option_d_tex ?? "",
    };

  const attempted =
    Number(q.stats?.attempted ?? payload.attemptedCount ?? payload.attempted ?? 0);
  const solved =
    Number(q.stats?.solved ?? payload.solvedCount ?? payload.solved ?? 0);
  const accuracy =
    typeof q.stats?.accuracy === "number"
      ? q.stats.accuracy
      : typeof payload.accuracy === "number"
      ? payload.accuracy
      : attempted
      ? solved / attempted
      : 0;

  const likes_count = Number(
    payload.likeCount ?? payload.likes_count ?? q.likes_count ?? 0
  );
  const has_liked = Boolean(
    payload.hasLiked ?? payload.has_liked ?? q.has_liked ?? false
  );

  const out: ProblemOut = {
    id: Number(q.id),
    subject: q.subject,
    topic: q.topic ?? "",
    chapter: q.chapter ?? "",
    difficulty: q.difficulty,
    question_tex: q.question_tex ?? q.question ?? "",
    options,
    stats: { attempted, solved, accuracy },
    likes_count,
    has_liked,
    has_answered: Boolean(q.has_answered ?? payload.has_answered ?? false),
  };

  return out;
}

/* =======================================
   📌 Get today's problem by subject
   ======================================= */
export async function getTodayBySubject(subject: Subject): Promise<ProblemOut> {
  // NOTE: api base likely has "/api" already
  const res = await api.get(`/daily/${subject}/today`);
  const data = res.data;
  // If backend already returns ProblemOut, keep it; else adapt.
  if (data && typeof data === "object" && "stats" in data) {
    return data as ProblemOut;
  }
  return adaptTodayPayloadToProblemOut(data as AnyRec);
}

/* =======================================
   📌 Submit answer (auth optional)
   Uses the same endpoint for authed/guest.
   ======================================= */
export async function submitAnswer(
  problemId: number,
  chosen: OptionKey
): Promise<AnswerOut> {
  try {
    const res = await api.post(`/questions/${problemId}/submit`, {
      selectedOption: chosen,
    });
    return res.data as AnswerOut;
  } catch (e) {
    return handleAuthError(e);
  }
}

/** Public check (same route; backend accepts no-auth) */
export async function checkAnswer(
  problemId: number,
  chosen: OptionKey
): Promise<AnswerOut> {
  const res = await api.post(`/questions/${problemId}/submit`, {
    selectedOption: chosen,
  });
  return res.data as AnswerOut;
}

/* =======================================
   ❤️ Toggle like (protected)
   ======================================= */
export async function toggleLike(problemId: number): Promise<ToggleLikeResponse> {
  try {
    const res = await api.post(`/questions/${problemId}/like`);
    // backend returns { likeCount, hasLiked } (or snake_case)
    return res.data as ToggleLikeResponse;
  } catch (e) {
    return handleAuthError(e);
  }
}

/* =======================================
   💡 Hint / Solution (public)
   ======================================= */
export async function getHint(problemId: number): Promise<HintResponse> {
  const res = await api.get(`/questions/${problemId}/hint`);
  // expect { hint_tex } or string
  return (res.data as HintResponse) ?? null;
}

export async function getSolution(problemId: number): Promise<SolutionResponse> {
  const res = await api.get(`/questions/${problemId}/solution`);
  // expect { solution_tex } or string
  return (res.data as SolutionResponse) ?? null;
}
