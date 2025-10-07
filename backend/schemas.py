from pydantic import BaseModel, EmailStr
from typing import Optional, Literal, Dict, List
from datetime import date, datetime

# ===============================
# ✅ USER SCHEMAS
# ===============================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    class_level: Optional[str] = None
    stream: Optional[str] = None
    is_admin: bool  # expose to frontend

    class Config:
        from_attributes = True  # Pydantic v2

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UpdateMe(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    class_level: Optional[str] = None  # "11" | "12" | "dropper"
    stream: Optional[str] = None       # e.g. "JEE Mains"

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

# ===============================
# 🧠 DPP SCHEMAS
# ===============================

# literals used for validation
SubjectLiteral = Literal["math", "physics", "chemistry"]
DifficultyLiteral = Literal["easy", "medium", "hard"]

# ---- Admin: Create Problem ----
class ProblemCreate(BaseModel):
    subject: SubjectLiteral
    topic: str
    chapter: str
    difficulty: DifficultyLiteral

    question_tex: str
    option_a_tex: str
    option_b_tex: str
    option_c_tex: str
    option_d_tex: str
    correct_option: Literal["A", "B", "C", "D"]

    hint_tex: Optional[str] = None
    solution_tex: Optional[str] = None

# ---- Admin: Schedule Daily Problem (single) ----
class DailyScheduleIn(BaseModel):
    date: date
    subject: SubjectLiteral
    problem_id: int

# ---- Admin: Bulk schedule ----
class BulkScheduleIn(BaseModel):
    date: date
    items: List[DailyScheduleIn]

class BulkScheduledItem(BaseModel):
    subject: SubjectLiteral
    problem_id: int

class BulkScheduleOut(BaseModel):
    date: date
    scheduled: List[BulkScheduledItem]

# ---- Stats ----
class ProblemStats(BaseModel):
    attempted: int
    solved: int
    accuracy: float

# ---- Student: Today problem ----
class ProblemOut(BaseModel):
    id: int
    subject: SubjectLiteral
    topic: str
    chapter: str
    difficulty: DifficultyLiteral
    question_tex: str
    options: Dict[str, str]  # { "A": "...", "B": "...", ... }
    stats: ProblemStats
    likes_count: int
    has_liked: bool
    has_answered: bool

    class Config:
        from_attributes = True

# ---- Student: Answer ----
class AnswerIn(BaseModel):
    problem_id: int
    chosen_option: Literal["A", "B", "C", "D"]

class AnswerOut(BaseModel):
    is_correct: bool
    correct_option: Literal["A", "B", "C", "D"]

# ---- Comments ----
class CommentIn(BaseModel):
    text: str
    parent_id: Optional[int] = None

class CommentOut(BaseModel):
    id: int
    user_id: int
    text: str
    parent_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ---- Today bundle across all subjects ----
class TodaySubjectBundle(BaseModel):
    subject: SubjectLiteral
    problem: Optional[ProblemOut] = None  # None if not scheduled

class TodayAllOut(BaseModel):
    date: date
    items: List[TodaySubjectBundle]

class HintOut(BaseModel):
    hint_tex: Optional[str] = None

class SolutionOut(BaseModel):
    solution_tex: Optional[str] = None