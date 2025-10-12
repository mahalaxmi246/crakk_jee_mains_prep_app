from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, Literal, Dict, List
from datetime import date, datetime

# ✅ Import your Enums from models.py
from models import SubjectEnum, DifficultyEnum

# ===============================
# ✅ USER (Firebase-backed)
# ===============================

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    class_level: Optional[str] = None
    stream: Optional[str] = None
    is_admin: bool


class UpdateMe(BaseModel):
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    class_level: Optional[str] = None
    stream: Optional[str] = None


# ===============================
# 🧠 DPP SCHEMAS
# ===============================

class ProblemCreate(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    subject: SubjectEnum
    topic: str
    chapter: str
    difficulty: DifficultyEnum

    question_tex: str
    option_a_tex: str
    option_b_tex: str
    option_c_tex: str
    option_d_tex: str
    correct_option: Literal["A", "B", "C", "D"]

    hint_tex: Optional[str] = None
    solution_tex: Optional[str] = None


class ProblemStats(BaseModel):
    attempted: int
    solved: int
    accuracy: float  # 0.0 .. 1.0


class ProblemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    subject: SubjectEnum
    topic: str
    chapter: str
    difficulty: DifficultyEnum
    question_tex: str
    options: Dict[Literal["A", "B", "C", "D"], str]
    stats: ProblemStats
    likes_count: int
    has_liked: bool
    has_answered: bool

    # ✅ New fields to restore state after refresh
    my_choice: Optional[Literal["A", "B", "C", "D"]] = None
    is_correct: Optional[bool] = None
    correct_option: Optional[Literal["A", "B", "C", "D"]] = None


class DailyProblemOut(BaseModel):
    problem: Optional[ProblemOut] = None


# ---- Answering ----
class SubmitAnswerIn(BaseModel):
    selectedOption: Optional[Literal["A", "B", "C", "D"]] = None
    chosen_option: Optional[Literal["A", "B", "C", "D"]] = None

    def selected(self) -> Optional[str]:
        return self.selectedOption or self.chosen_option


class SubmitAnswerOut(BaseModel):
    isCorrect: bool
    correctOption: Literal["A", "B", "C", "D"]
    attemptedCount: Optional[int] = None
    solvedCount: Optional[int] = None
    accuracy: Optional[float] = None


# ---- Likes ----
class LikeResponse(BaseModel):
    likeCount: int
    hasLiked: bool
