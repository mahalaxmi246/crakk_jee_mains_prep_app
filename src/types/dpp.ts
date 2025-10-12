// src/types/dpp.ts

export type Subject = "math" | "physics" | "chemistry";
export type Difficulty = "easy" | "medium" | "hard";

// ---------- Problem Stats ----------
export type ProblemStats = {
  attempted: number;
  solved: number;
  accuracy: number; // 0..1
};

// ---------- Problem ----------
export type ProblemOut = {
  id: number;
  subject: Subject;
  topic: string;
  chapter: string;
  difficulty: Difficulty;
  question_tex: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  stats: ProblemStats;

  // ✅ Support both snake_case (backend) and camelCase (frontend)
  likes_count?: number;
  likeCount?: number;

  has_liked?: boolean;
  hasLiked?: boolean;

  has_answered?: boolean;
  hasAnswered?: boolean;
};

// ---------- Answer ----------
export type AnswerOut = {
  is_correct?: boolean;        // snake_case
  isCorrect?: boolean;        // camelCase
  correct_option?: "A" | "B" | "C" | "D";   // snake_case
  correctOption?: "A" | "B" | "C" | "D";   // camelCase

  // optional stats returned after submission
  attemptedCount?: number;
  solvedCount?: number;
  accuracy?: number;
};

// ---------- Toggle Like ----------
export type ToggleLikeResponse = {
  likeCount?: number;
  likes_count?: number;
  hasLiked?: boolean;
  has_liked?: boolean;
};

// ---------- Hint ----------
export type HintResponse =
  | { hint_tex?: string }
  | string
  | null;

// ---------- Solution ----------
export type SolutionResponse =
  | { solution_tex?: string }
  | string
  | null;
