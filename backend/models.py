from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Text, Enum, ForeignKey,
    UniqueConstraint, CheckConstraint, Date, func, Index
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

# =========================
# ✅ USERS (Firebase-backed)
# =========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, index=True, nullable=False)
    email = Column(String(320), unique=True, index=True, nullable=False)
    display_name = Column(String(200), nullable=True)
    photo_url = Column(String(500), nullable=True)
    class_level = Column(String(20), nullable=True)
    stream = Column(String(50), nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    answers  = relationship("UserAnswer", back_populates="user", lazy="noload")
    likes    = relationship("ProblemLike", back_populates="user", lazy="noload")
    comments = relationship("Comment", back_populates="user", lazy="noload")

# Optional Quote (only if you really use it)
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

    question_tex = Column(Text, nullable=False)
    option_a_tex = Column(Text, nullable=False)
    option_b_tex = Column(Text, nullable=False)
    option_c_tex = Column(Text, nullable=False)
    option_d_tex = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)

    hint_tex = Column(Text, nullable=True)
    solution_tex = Column(Text, nullable=True)

    attempt_count = Column(Integer, default=0, nullable=False)
    solve_count   = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    answers  = relationship("UserAnswer", back_populates="problem", cascade="all, delete-orphan", lazy="noload")
    likes    = relationship("ProblemLike", back_populates="problem", cascade="all, delete-orphan", lazy="noload")
    comments = relationship("Comment",     back_populates="problem", cascade="all, delete-orphan", lazy="noload")

    __table_args__ = (
        CheckConstraint("correct_option IN ('A','B','C','D')", name="ck_correct_option"),
        Index("ix_problems_topic", "topic"),
        Index("ix_problems_chapter", "chapter"),
    )

# Aliases used elsewhere
Question = Problem
PROBLEM_TABLE = "problems"
USER_TABLE    = "users"

class DailyProblem(Base):
    __tablename__ = "daily_problems"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    subject = Column(Enum(SubjectEnum), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), unique=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    problem = relationship("Problem", lazy="joined")

    __table_args__ = (
        UniqueConstraint("date", "subject", name="uq_daily_subject_date"),
        Index("ix_daily_subject_date", "subject", "date"),
    )

class DailyRollout(Base):
    __tablename__ = "daily_rollouts"

    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    subject = Column(String(20), nullable=False)
    problem_id = Column(Integer, ForeignKey(f"{PROBLEM_TABLE}.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    problem = relationship("Problem", lazy="joined")

    __table_args__ = (
        UniqueConstraint("date", "subject", name="uq_daily_rollouts_date_subject"),
        Index("ix_daily_rollouts_subject_date", "subject", "date"),
    )

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey(f"{USER_TABLE}.id", ondelete="SET NULL"), index=True, nullable=True)
    problem_id= Column(Integer, ForeignKey(f"{PROBLEM_TABLE}.id", ondelete="CASCADE"), index=True, nullable=False)
    chosen_option = Column(String(1), nullable=False)
    is_correct    = Column(Boolean, default=False, nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user    = relationship("User", back_populates="answers", lazy="joined")
    problem = relationship("Problem", back_populates="answers")

    __table_args__ = (
        CheckConstraint("chosen_option IN ('A','B','C','D')", name="ck_chosen_option"),
        Index("ix_answers_problem_user", "problem_id", "user_id"),
    )

class ProblemLike(Base):
    __tablename__ = "problem_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey(f"{USER_TABLE}.id", ondelete="CASCADE"), index=True, nullable=False)
    problem_id= Column(Integer, ForeignKey(f"{PROBLEM_TABLE}.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at= Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user    = relationship("User", back_populates="likes", lazy="joined")
    problem = relationship("Problem", back_populates="likes")

    __table_args__ = (
        UniqueConstraint("user_id", "problem_id", name="uq_like_once"),
        Index("ix_like_problem", "problem_id"),
        Index("ix_like_user", "user_id"),
    )

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    parent_id  = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)

    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    problem = relationship("Problem", back_populates="comments")
    user    = relationship("User", back_populates="comments")
