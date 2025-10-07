# backend/models.py
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Text,
    Enum, ForeignKey, UniqueConstraint, CheckConstraint, Date, func, Index
)
from sqlalchemy.orm import relationship
from database import Base
import enum

# =========================
# ✅ AUTH & QUOTES (yours)
# =========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Profile fields
    class_level = Column(String(20), nullable=True)   # "11" | "12" | "dropper"
    stream = Column(String(50), nullable=True)        # e.g. "JEE Mains"

    # 👑 Admin flag
    is_admin = Column(Boolean, default=False, nullable=False)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String(64), unique=True, index=True, nullable=False)
    username = Column(String(50), index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)


class AccessTokenBlocklist(Base):
    __tablename__ = "access_token_blocklist"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)


class Quote(Base):
    __tablename__ = "quotes"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    author = Column(String(255), nullable=True)

# =========================
# 🧠 DPP MODELS
# =========================

class SubjectEnum(str, enum.Enum):
    math = "math"
    physics = "physics"
    chemistry = "chemistry"

class DifficultyEnum(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(Enum(SubjectEnum), nullable=False, index=True)
    topic = Column(String(120), nullable=False)
    chapter = Column(String(120), nullable=False)
    difficulty = Column(Enum(DifficultyEnum), nullable=False, index=True)

    # LaTeX strings
    question_tex = Column(Text, nullable=False)
    option_a_tex = Column(Text, nullable=False)
    option_b_tex = Column(Text, nullable=False)
    option_c_tex = Column(Text, nullable=False)
    option_d_tex = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)

    hint_tex = Column(Text, nullable=True)
    solution_tex = Column(Text, nullable=True)

    # Cached counters
    attempt_count = Column(Integer, default=0, nullable=False)
    solve_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    answers = relationship("UserAnswer", back_populates="problem", cascade="all, delete-orphan")
    likes = relationship("ProblemLike", back_populates="problem", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="problem", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("correct_option IN ('A','B','C','D')", name="ck_correct_option"),
        Index("ix_problems_topic", "topic"),
        Index("ix_problems_chapter", "chapter"),
    )

class DailyProblem(Base):
    __tablename__ = "daily_problems"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    subject = Column(Enum(SubjectEnum), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), unique=True)
    is_active = Column(Boolean, default=True, nullable=False)

    problem = relationship("Problem")

    __table_args__ = (
        UniqueConstraint("date", "subject", name="uq_daily_subject_date"),
        Index("ix_daily_subject_date", "subject", "date"),
    )

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), index=True)
    chosen_option = Column(String(1), nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    problem = relationship("Problem", back_populates="answers")

    __table_args__ = (
        UniqueConstraint("user_id", "problem_id", name="uq_answer_once"),
        CheckConstraint("chosen_option IN ('A','B','C','D')", name="ck_chosen_option"),
    )

class ProblemLike(Base):
    __tablename__ = "problem_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    problem = relationship("Problem", back_populates="likes")

    __table_args__ = (
        UniqueConstraint("user_id", "problem_id", name="uq_like_once"),
    )

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    problem = relationship("Problem", back_populates="comments")
    user = relationship("User")
