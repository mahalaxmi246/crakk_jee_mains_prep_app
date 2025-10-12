import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Users, Target, ThumbsUp, Clock, Lightbulb, BookOpen, Heart, X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import {
  normalizeSubject,
  getTodayBySubject,
  submitAnswer,
  checkAnswer,
  toggleLike,
  getHint,
  getSolution,
} from "../api/dpp";
import type {
  ProblemOut, Difficulty, AnswerOut, ToggleLikeResponse, HintResponse, SolutionResponse
} from "../types/dpp";
import { useAuth } from "../contexts/AuthContext";
import { getAuth } from "firebase/auth";

// ----- markdown helpers -----
const hasMathDelimiters = (s: string) => /(\$\$|\$)/.test(s);
const looksLikeBareLatex = (s: string) => /\\[a-zA-Z]+|[_^{}]/.test(s);
const stripOuterParens = (s: string) => {
  const t = s.trim();
  return t.startsWith("(") && t.endsWith(")") ? t.slice(1, -1).trim() : t;
};
const normalizeLatexDelimiters = (s: string) =>
  s.replace(/\\\(/g, "$").replace(/\\\)/g, "$").replace(/\\\[/g, "$$").replace(/\\\]/g, "$$");
const smartWrapInline = (s: string) => {
  if (!s) return s;
  let t = normalizeLatexDelimiters(s);
  if (hasMathDelimiters(t)) return t;
  if (looksLikeBareLatex(t)) return `$${stripOuterParens(t)}$`;
  return t;
};
const smartWrapBlock = (s: string) => {
  if (!s) return s;
  let t = normalizeLatexDelimiters(s);
  if (hasMathDelimiters(t)) return t;
  if (looksLikeBareLatex(t)) return `$$${stripOuterParens(t)}$$`;
  return t;
};
const MDMath: React.FC<{ content: string; className?: string }> = ({ content, className }) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {content}
    </ReactMarkdown>
  </div>
);

// ---------- local persistence helpers (per-user, per-problem) ----------
type PersistedEval = {
  submittedChoice: "A" | "B" | "C" | "D";
  correctOption: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  ts: number;
};
const persistKey = (problemId: string | number, uid?: string | null) =>
  `dpp:${problemId}:answer:${uid ?? "anon"}`;

const loadPersistedEval = (
  problemId: string | number,
  uid?: string | null
): PersistedEval | null => {
  try {
    const raw = localStorage.getItem(persistKey(problemId, uid));
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p) return null;
    if (!["A", "B", "C", "D"].includes(p.submittedChoice)) return null;
    if (!["A", "B", "C", "D"].includes(p.correctOption)) return null;
    return {
      submittedChoice: p.submittedChoice,
      correctOption: p.correctOption,
      isCorrect: !!p.isCorrect,
      ts: Number(p.ts ?? 0),
    };
  } catch {
    return null;
  }
};

const savePersistedEval = (
  problemId: string | number,
  uid: string | null | undefined,
  data: PersistedEval
) => {
  try {
    localStorage.setItem(persistKey(problemId, uid), JSON.stringify(data));
  } catch {}
};

// ---------- component ----------
const DailyQuestionPage: React.FC = () => {
  const { subject } = useParams<{ subject?: string }>();
  const normSubject = normalizeSubject(subject);
  const { user, isVerified } = useAuth();
  const isAuthed = !!user && isVerified;
  const uid = user?.uid ?? null;

  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<ProblemOut | null>(null);

  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | "">("");
  const [submittedChoice, setSubmittedChoice] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [resultMsg, setResultMsg] = useState("");

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [solutionText, setSolutionText] = useState("");

  const [showLogin, setShowLogin] = useState(false);

  // Normalize possibly different backend casings/field names
  const pickBackendField = <T,>(obj: any, ...keys: string[]): T | undefined => {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
    }
    return undefined;
  };

  const applyEvaluationFromPayloadOrStorage = (payload: any) => {
    // Try from backend first (support multiple casings)
    const priorChoice =
      pickBackendField<string>(payload, "my_choice", "user_choice", "selected_option", "myChoice", "userChoice", "selectedOption");
    const priorCorrect =
      pickBackendField<string>(payload, "correct_option", "correctAnswer", "correctOption");
    const priorIsCorrect =
      pickBackendField<boolean>(payload, "is_correct", "right", "isCorrect");

    if (priorChoice && priorCorrect) {
      const u = (priorChoice as any) as "A" | "B" | "C" | "D";
      const c = (priorCorrect as any) as "A" | "B" | "C" | "D";
      setSubmittedChoice(u);
      setSelectedOption(u);
      setCorrectOption(c);
      setIsCorrect(priorIsCorrect ?? (u === c));
      setIsSubmitted(true);
      setResultMsg((u === c) ? "🎉 Correct! Well done!" : `❌ Incorrect. The correct answer is ${c}.`);
      return true;
    }

    // Fallback: read from localStorage (per user & problem)
    if (problem) {
      const persisted = loadPersistedEval(problem.id, uid);
      if (persisted) {
        setSubmittedChoice(persisted.submittedChoice);
        setSelectedOption(persisted.submittedChoice);
        setCorrectOption(persisted.correctOption);
        setIsCorrect(persisted.isCorrect);
        setIsSubmitted(true);
        setResultMsg(
          persisted.isCorrect
            ? "🎉 Correct! Well done!"
            : `❌ Incorrect. The correct answer is ${persisted.correctOption}.`
        );
        return true;
      }
    }

    return false;
  };

  const fetchToday = useCallback(async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        try { await auth.currentUser.getIdToken(); } catch {}
      }
      const data = await getTodayBySubject(normSubject);
      setProblem(data);

      // normalize both formats
      setIsLiked((data.has_liked ?? (data as any).hasLiked) ?? false);
      setLikesCount((data.likes_count ?? (data as any).likeCount) ?? 0);

      const hasAnswered = Boolean(data.has_answered ?? (data as any).hasAnswered);
      setIsSubmitted(hasAnswered);

      // Reset transient UI first
      setSelectedOption("");
      setSubmittedChoice(null);
      setCorrectOption(null);
      setIsCorrect(null);
      setResultMsg("");
      setShowHint(false);
      setHintText("");
      setShowSolution(false);
      setSolutionText("");

      // If already answered, restore evaluation state from backend payload (if present)
      // or fallback to localStorage.
      if (hasAnswered) {
        applyEvaluationFromPayloadOrStorage(data);
      }
    } catch (e) {
      console.error(e);
      setProblem(null);
    } finally {
      setLoading(false);
    }
  }, [normSubject, uid]); // uid so that switching accounts refetches & restores proper state

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchToday();
    })();
    return () => { mounted = false; };
  }, [fetchToday]);

  useEffect(() => {
    const refetchOnAuth = () => fetchToday();
    window.addEventListener("AUTH_EXCHANGED", refetchOnAuth);
    window.addEventListener("AUTH_READY", refetchOnAuth);
    return () => {
      window.removeEventListener("AUTH_EXCHANGED", refetchOnAuth);
      window.removeEventListener("AUTH_READY", refetchOnAuth);
    };
  }, [fetchToday]);

  useEffect(() => { (async () => { await fetchToday(); })(); }, [isAuthed, fetchToday]);

  const accuracyPct = useMemo(() => {
    if (!problem) return 0;
    const { attempted, solved } = problem.stats;
    return attempted ? Math.round((solved / attempted) * 100) : 0;
  }, [problem]);

  const difficultyPill = (difficulty?: Difficulty) => {
    const base = "px-3 py-1 rounded-full text-sm font-medium capitalize";
    switch (difficulty) {
      case "easy": return `${base} text-green-700 bg-green-100`;
      case "medium": return `${base} text-yellow-700 bg-yellow-100`;
      case "hard": return `${base} text-red-700 bg-red-100`;
      default: return `${base} text-gray-700 bg-gray-100`;
    }
  };

  const handleSubmit = async () => {
    if (!problem || !selectedOption || isSubmitted) return;

    const userPick = selectedOption;
    const res = (isAuthed
      ? await submitAnswer(problem.id, userPick)
      : await checkAnswer(problem.id, userPick)) as AnswerOut & Record<string, any>;

    const is_correct: boolean = Boolean(res.is_correct ?? res.isCorrect);
    const correct_option = (res.correct_option ?? res.correctOption) as "A" | "B" | "C" | "D";

    // compute stats for display
    const attempted = Number(res.attemptedCount ?? problem.stats.attempted + 1);
    const solved = Number(res.solvedCount ?? (problem.stats.solved + (is_correct ? 1 : 0)));
    const accuracy = Number(res.accuracy ?? (attempted ? solved / attempted : problem.stats.accuracy));

    // Update evaluation UI
    setSubmittedChoice(userPick);
    setCorrectOption(correct_option);
    setIsCorrect(is_correct);
    setIsSubmitted(true);
    setResultMsg(is_correct ? "🎉 Correct! Well done!" : `❌ Incorrect. The correct answer is ${correct_option}.`);

    setProblem({
      ...problem,
      has_answered: true,
      stats: { attempted, solved, accuracy },
    });

    // Persist locally so a reload/open shows the green/red state even if backend doesn't return it
    savePersistedEval(problem.id, uid, {
      submittedChoice: userPick,
      correctOption: correct_option,
      isCorrect: is_correct,
      ts: Date.now(),
    });
  };

  const handleLike = async () => {
    if (!problem) return;
    if (!isAuthed) {
      setShowLogin(true);
      return;
    }
    const res: ToggleLikeResponse = await toggleLike(problem.id);
    const hasLiked = Boolean((res as any).has_liked ?? res.hasLiked);
    const likeCount = Number((res as any).likes_count ?? res.likeCount ?? 0);
    setIsLiked(hasLiked);
    setLikesCount(likeCount);
  };

  const handleToggleHint = async () => {
    if (!problem) return;
    if (!showHint) {
      const hint: HintResponse = await getHint(problem.id);
      const text = typeof hint === "string" ? hint : hint?.hint_tex ?? "";
      setHintText(text);
    }
    setShowHint(v => !v);
  };

  const handleToggleSolution = async () => {
    if (!problem) return;
    if (!showSolution) {
      const sol: SolutionResponse = await getSolution(problem.id);
      const text = typeof sol === "string" ? sol : sol?.solution_tex ?? "";
      setSolutionText(text);
    }
    setShowSolution(v => !v);
  };

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!problem) return <div className="p-8 text-center">No problem scheduled for today.</div>;

  const alreadyAnswered = Boolean(problem.has_answered ?? (problem as any).hasAnswered);
  const submissionLocked = alreadyAnswered && isAuthed;
  const showEvaluationStyles = isSubmitted || submissionLocked;
  const questionContent = smartWrapInline(problem.question_tex || "");

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* top */}
        <div className="flex items-start gap-4 pt-8 pb-4">
          <Link to="/" className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100" aria-label="Back">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Today&apos;s Question</h1>
            <div className="mt-1 text-sm text-gray-600 capitalize">{normSubject}</div>
          </div>
        </div>

        {/* stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold truncate">{problem.chapter}</h2>
                <span className={difficultyPill(problem.difficulty)}>{problem.difficulty}</span>
              </div>
            </div>

            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isLiked ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Like"
            >
              <Heart size={18} className={isLiked ? "fill-current" : ""} />
              <span>{likesCount}</span>
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2"><Users size={16} /><span>{problem.stats.attempted} attempted</span></div>
            <div className="flex items-center gap-2"><Target size={16} /><span>{problem.stats.solved} solved</span></div>
            <div className="flex items-center gap-2"><ThumbsUp size={16} /><span>{accuracyPct}% accuracy</span></div>
            <div className="flex items-center gap-2"><Clock size={16} /><span>Daily Question</span></div>
          </div>
        </div>

        {/* question + options */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <MDMath content={questionContent} className="text-gray-900 not-italic text-base leading-relaxed" />

          <div className="mt-6 space-y-3">
            {(["A", "B", "C", "D"] as const).map((opt) => {
              const checked = selectedOption === opt;
              const raw = problem.options?.[opt] || "";
              const optText = smartWrapInline(raw);

              // definitive styles based on submittedChoice + correctOption
              const isCorrectOpt = showEvaluationStyles && correctOption === opt;
              const isWrongPick =
                showEvaluationStyles && submittedChoice === opt && correctOption !== opt;

              let borderBg = "border-gray-200 hover:border-gray-300";
              let ring = "";
              if (!showEvaluationStyles) {
                if (checked) {
                  borderBg = "border-purple-500 bg-purple-50";
                  ring = "ring-1 ring-purple-200";
                }
              } else {
                if (isCorrectOpt) {
                  borderBg = "border-green-500 bg-green-50";
                  ring = "ring-1 ring-green-200";
                } else if (!submissionLocked && isWrongPick) {
                  borderBg = "border-red-500 bg-red-50";
                  ring = "ring-1 ring-red-200";
                } else if (submissionLocked && isWrongPick) {
                  // still show wrong pick in red even when locked
                  borderBg = "border-red-500 bg-red-50";
                  ring = "ring-1 ring-red-200";
                } else {
                  borderBg = "border-gray-200";
                }
              }

              return (
                <div key={opt}>
                  <label className={`group flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${borderBg} ${ring}`}>
                    <input
                      type="radio"
                      name="answer"
                      value={opt}
                      checked={checked}
                      onChange={(e) => setSelectedOption(e.target.value as "A" | "B" | "C" | "D")}
                      disabled={showEvaluationStyles}
                      className="mt-0.5 text-purple-600"
                    />
                    <span className="font-semibold w-6 leading-6">{opt}.</span>
                    <div className="flex-1">
                      <MDMath content={optText} className="text-gray-900 not-italic" />
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          {(isSubmitted || submissionLocked) && (
            <div className="mt-5">
              {isCorrect ? (
                <div className="rounded-xl border border-green-200 bg-green-50 text-green-800 text-sm p-4">
                  {resultMsg || "🎉 Correct! Well done!"}
                </div>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-4">
                  {resultMsg ||
                    (correctOption
                      ? `❌ Incorrect. The correct answer is ${correctOption}.`
                      : "❌ Incorrect.")}
                </div>
              )}
            </div>
          )}

          {!submissionLocked && !isSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="w-full mt-5 rounded-xl bg-purple-600 py-3.5 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              Submit Answer
            </button>
          )}
        </div>

        {/* hint & solution */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <button onClick={handleToggleHint} className="inline-flex items-center gap-2 text-purple-600 font-medium">
              <Lightbulb size={20} /><span>{showHint ? "Hide Hint" : "Show Hint"}</span>
            </button>
            {showHint && (
              <div className="mt-4 text-gray-900">
                {hintText ? <MDMath content={smartWrapBlock(hintText)} className="not-italic" /> : <div>No hint</div>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <button onClick={handleToggleSolution} className="inline-flex items-center gap-2 text-purple-600 font-medium">
              <BookOpen size={20} /><span>{showSolution ? "Hide Solution" : "Show Solution"}</span>
            </button>
            {showSolution && (
              <div className="mt-4 text-gray-900">
                {solutionText ? <MDMath content={smartWrapBlock(solutionText)} className="not-italic" /> : <div>No solution</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[420px] rounded-xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Login required</h3>
              <button onClick={() => setShowLogin(false)} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Please log in to like problems or save your progress.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLogin(false)} className="px-3 py-2 rounded-md border">Cancel</button>
              <button
                onClick={() => { setShowLogin(false); window.dispatchEvent(new CustomEvent("OPEN_GLOBAL_LOGIN")); }}
                className="px-3 py-2 rounded-md bg-purple-600 text-white"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyQuestionPage;
