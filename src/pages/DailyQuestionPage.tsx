// src/pages/DailyQuestionPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Target,
  ThumbsUp,
  Clock,
  Lightbulb,
  BookOpen,
  Heart,
  Info,
  X,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// ⚠️ Add once globally (e.g., in App.tsx or main.tsx):
// import "katex/dist/katex.min.css";

import {
  normalizeSubject,
  getTodayBySubject,
  submitAnswer,
  checkAnswer,
  toggleLike,
  getHint,
  getSolution,
} from "../api/dpp";
import type { ProblemOut, Difficulty } from "../types/dpp";

type RouteParams = { subject?: string };
type OptionKey = "A" | "B" | "C" | "D";

/* ---------------- helpers: Markdown + LaTeX render ---------------- */

const hasMathDelimiters = (s: string) => /(\$\$|\$)/.test(s);
const looksLikeBareLatex = (s: string) => /\\[a-zA-Z]+|[_^{}]/.test(s);

function stripOuterParens(s: string) {
  const t = s.trim();
  return t.startsWith("(") && t.endsWith(")") ? t.slice(1, -1).trim() : t;
}

function normalizeLatexDelimiters(s: string) {
  return s
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");
}

function smartWrapInline(s: string) {
  if (!s) return s;
  let t = normalizeLatexDelimiters(s);
  if (hasMathDelimiters(t)) return t;
  if (looksLikeBareLatex(t)) {
    t = stripOuterParens(t);
    return "$" + t + "$";
  }
  return t;
}

function smartWrapBlock(s: string) {
  if (!s) return s;
  let t = normalizeLatexDelimiters(s);
  if (hasMathDelimiters(t)) return t;
  if (looksLikeBareLatex(t)) {
    t = stripOuterParens(t);
    return "$$" + t + "$$";
  }
  return t;
}

const MDMath: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const DailyQuestionPage: React.FC = () => {
  const { subject } = useParams<RouteParams>();
  const normSubject = normalizeSubject(subject);

  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<ProblemOut | null>(null);

  const [selectedOption, setSelectedOption] = useState<OptionKey | "">("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctOption, setCorrectOption] = useState<OptionKey | null>(null);
  const [resultMsg, setResultMsg] = useState<string>("");

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [solutionText, setSolutionText] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const isAuthed = !!localStorage.getItem("access_token");

  useEffect(() => {
    const open = () => setShowLogin(true);
    window.addEventListener("OPEN_LOGIN_MODAL", open as EventListener);
    return () => window.removeEventListener("OPEN_LOGIN_MODAL", open as EventListener);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getTodayBySubject(normSubject);
        if (!mounted) return;
        setProblem(data);
        setIsLiked(data.has_liked);
        setLikesCount(data.likes_count);

        setSelectedOption("");
        setCorrectOption(null);
        setIsCorrect(null);
        setResultMsg("");
        setShowHint(false);
        setHintText("");
        setShowSolution(false);
        setSolutionText("");

        setIsSubmitted(!!data.has_answered);
      } catch (e) {
        console.error(e);
        if (mounted) setProblem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [normSubject]);

  const accuracyPct = useMemo(() => {
    if (!problem) return 0;
    const { attempted, solved } = problem.stats;
    return attempted ? Math.round((solved / attempted) * 100) : 0;
  }, [problem]);

  const difficultyPill = (difficulty?: Difficulty) => {
    const base = "px-3 py-1 rounded-full text-sm font-medium capitalize";
    switch (difficulty) {
      case "easy":
        return `${base} text-green-700 bg-green-100`;
      case "medium":
        return `${base} text-yellow-700 bg-yellow-100`;
      case "hard":
        return `${base} text-red-700 bg-red-100`;
      default:
        return `${base} text-gray-700 bg-gray-100`;
    }
  };

  const handleSubmit = async () => {
    if (!problem || !selectedOption || isSubmitted) return;

    const res = isAuthed
      ? await submitAnswer(problem.id, selectedOption as OptionKey)
      : await checkAnswer(problem.id, selectedOption as OptionKey);

    setIsSubmitted(true);
    setCorrectOption(res.correct_option as OptionKey);
    setIsCorrect(res.is_correct);
    setResultMsg(
      res.is_correct
        ? "🎉 Correct! Well done!"
        : `❌ Incorrect. The correct answer is ${res.correct_option}.`
    );

    if (isAuthed) {
      const attempted = problem.stats.attempted + 1;
      const solved = problem.stats.solved + (res.is_correct ? 1 : 0);
      setProblem({
        ...problem,
        has_answered: true,
        stats: { attempted, solved, accuracy: attempted ? solved / attempted : 0 },
      });
    }
  };

  const handleLike = async () => {
    if (!problem) return;
    if (!isAuthed) {
      setShowLogin(true);
      return;
    }
    const liked = await toggleLike(problem.id);
    setIsLiked(liked);
    setLikesCount((c) => (liked ? c + 1 : Math.max(0, c - 1)));
  };

  const handleToggleHint = async () => {
    if (!problem) return;
    if (!showHint) setHintText((await getHint(problem.id)) || "");
    setShowHint((v) => !v);
  };

  const handleToggleSolution = async () => {
    if (!problem) return;
    if (!showSolution) setSolutionText((await getSolution(problem.id)) || "");
    setShowSolution((v) => !v);
  };

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!problem) return <div className="p-8 text-center">No problem scheduled for today.</div>;

  const alreadyAnswered = problem.has_answered;
  const submissionLocked = alreadyAnswered && isAuthed;
  const showEvaluationStyles = isSubmitted || submissionLocked;
  const questionContent = smartWrapInline(problem.question_tex || "");

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-start gap-4 pt-8 pb-4">
          <Link
            to="/"
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Today&apos;s Question</h1>
            <div className="mt-1 text-sm text-gray-600 capitalize">{normSubject}</div>
          </div>
        </div>

        {submissionLocked && !isSubmitted && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-800 text-sm inline-flex items-center gap-2">
            <Info size={16} />
            Your first attempt for this question is already recorded. Further submissions are disabled.
          </div>
        )}

        {/* Chapter / stats */}
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
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{problem.stats.attempted} attempted</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} />
              <span>{problem.stats.solved} solved</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp size={16} />
              <span>{accuracyPct}% accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Daily Question</span>
            </div>
          </div>
        </div>

        {/* Question + options */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <MDMath content={questionContent} className="text-gray-900 not-italic text-base leading-relaxed" />

          <div className="mt-6 space-y-3">
            {(["A", "B", "C", "D"] as const).map((opt) => {
              const checked = selectedOption === opt;
              const raw = problem.options[opt] || "";
              const optText = smartWrapInline(raw);

              let borderBg = "border-gray-200 hover:border-gray-300";
              let ring = "";
              if (!showEvaluationStyles) {
                if (checked) {
                  borderBg = "border-purple-500 bg-purple-50";
                  ring = "ring-1 ring-purple-200";
                }
              } else {
                if (correctOption === opt) {
                  borderBg = "border-green-500 bg-green-50";
                  ring = "ring-1 ring-green-200";
                } else if (!submissionLocked && selectedOption === opt && correctOption !== opt) {
                  borderBg = "border-red-500 bg-red-50";
                  ring = "ring-1 ring-red-200";
                } else {
                  borderBg = "border-gray-200";
                }
              }

              return (
                <div key={opt}>
                  <label
                    className={`group flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${borderBg} ${ring}`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={opt}
                      checked={checked}
                      onChange={(e) => setSelectedOption(e.target.value as OptionKey)}
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

          {isSubmitted && (
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

        {/* Hint & Solution */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <button
              onClick={handleToggleHint}
              className="inline-flex items-center gap-2 text-purple-600 font-medium"
            >
              <Lightbulb size={20} />
              <span>{showHint ? "Hide Hint" : "Show Hint"}</span>
            </button>
            {showHint && (
              <div className="mt-4 text-gray-900">
                {hintText ? (
                  <MDMath content={smartWrapBlock(hintText)} className="not-italic" />
                ) : (
                  <div>No hint</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <button
              onClick={handleToggleSolution}
              className="inline-flex items-center gap-2 text-purple-600 font-medium"
            >
              <BookOpen size={20} />
              <span>{showSolution ? "Hide Solution" : "Show Solution"}</span>
            </button>
            {showSolution && (
              <div className="mt-4 text-gray-900">
                {solutionText ? (
                  <MDMath content={smartWrapBlock(solutionText)} className="not-italic" />
                ) : (
                  <div>No solution</div>
                )}
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
              <button
                onClick={() => setShowLogin(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please log in to like problems or save your progress.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLogin(false)} className="px-3 py-2 rounded-md border">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogin(false);
                  window.dispatchEvent(new CustomEvent("OPEN_GLOBAL_LOGIN"));
                }}
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
