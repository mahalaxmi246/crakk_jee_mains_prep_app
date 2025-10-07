// src/types/dpp.ts

export type Subject = "math" | "physics" | "chemistry";
export type Difficulty = "easy" | "medium" | "hard";

export type ProblemStats = {
  attempted: number;
  solved: number;
  accuracy: number; // 0..1
};

export type ProblemOut = {
  id: number;
  subject: Subject;
  topic: string;
  chapter: string;
  difficulty: Difficulty;
  question_tex: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  stats: ProblemStats;
  likes_count: number;
  has_liked: boolean;
  has_answered: boolean;
};

export type AnswerOut = {
  is_correct: boolean;
  correct_option: "A" | "B" | "C" | "D";
};
