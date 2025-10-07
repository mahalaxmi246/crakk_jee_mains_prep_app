# backend/routes/dpp.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date as _date
from typing import Optional

from database import get_db
from models import Problem, DailyProblem, ProblemLike, UserAnswer, SubjectEnum, User
from schemas import (
    ProblemOut, ProblemStats, AnswerIn, AnswerOut,
    TodayAllOut, TodaySubjectBundle, HintOut, SolutionOut
)
from deps import get_current_user, get_current_user_optional

router = APIRouter()

def _subject_enum(s: str):
    try:
        return SubjectEnum(s)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid subject")

@router.get("/today", response_model=ProblemOut)
def get_today_problem(
    subject: str = Query(..., pattern="^(math|physics|chemistry)$"),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    today = _date.today()
    dp = (
        db.query(DailyProblem)
        .filter(
            DailyProblem.date == today,
            DailyProblem.subject == _subject_enum(subject),
            DailyProblem.is_active == True
        )
        .first()
    )
    if not dp:
        raise HTTPException(status_code=404, detail="No problem scheduled for today for this subject")

    p = dp.problem

    likes_count = db.query(ProblemLike).filter_by(problem_id=p.id).count()
    has_liked = False
    has_answered = False
    if user:
        has_liked = db.query(ProblemLike).filter_by(problem_id=p.id, user_id=user.id).first() is not None
        has_answered = db.query(UserAnswer).filter_by(problem_id=p.id, user_id=user.id).first() is not None

    stats = ProblemStats(
        attempted=p.attempt_count,
        solved=p.solve_count,
        accuracy=(p.solve_count / p.attempt_count) if p.attempt_count else 0.0,
    )

    return ProblemOut(
        id=p.id,
        subject=p.subject.value,
        topic=p.topic,
        chapter=p.chapter,
        difficulty=p.difficulty.value,
        question_tex=p.question_tex,
        options={"A": p.option_a_tex, "B": p.option_b_tex, "C": p.option_c_tex, "D": p.option_d_tex},
        stats=stats,
        likes_count=likes_count,
        has_liked=has_liked,
        has_answered=has_answered,
    )

@router.get("/today/all", response_model=TodayAllOut)
def get_today_all(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    today = _date.today()
    items = []
    for s in ["math", "physics", "chemistry"]:
        dp = (
            db.query(DailyProblem)
            .filter(
                DailyProblem.date == today,
                DailyProblem.subject == _subject_enum(s),
                DailyProblem.is_active == True
            )
            .first()
        )
        if not dp:
            items.append(TodaySubjectBundle(subject=s, problem=None))
            continue

        p = dp.problem
        likes_count = db.query(ProblemLike).filter_by(problem_id=p.id).count()

        has_liked = False
        has_answered = False
        if user:
            has_liked = db.query(ProblemLike).filter_by(problem_id=p.id, user_id=user.id).first() is not None
            has_answered = db.query(UserAnswer).filter_by(problem_id=p.id, user_id=user.id).first() is not None

        stats = ProblemStats(
            attempted=p.attempt_count,
            solved=p.solve_count,
            accuracy=(p.solve_count / p.attempt_count) if p.attempt_count else 0.0,
        )
        items.append(
            TodaySubjectBundle(
                subject=s,
                problem=ProblemOut(
                    id=p.id,
                    subject=p.subject.value,
                    topic=p.topic,
                    chapter=p.chapter,
                    difficulty=p.difficulty.value,
                    question_tex=p.question_tex,
                    options={"A": p.option_a_tex, "B": p.option_b_tex, "C": p.option_c_tex, "D": p.option_d_tex},
                    stats=stats,
                    likes_count=likes_count,
                    has_liked=has_liked,
                    has_answered=has_answered,
                )
            )
        )
    return TodayAllOut(date=today, items=items)

# PUBLIC: hint/solution (no login needed)
@router.get("/{problem_id}/hint", response_model=HintOut)
def get_hint(problem_id: int, db: Session = Depends(get_db), user: Optional[User] = Depends(get_current_user_optional)):
    p = db.get(Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"hint_tex": p.hint_tex}

@router.get("/{problem_id}/solution", response_model=SolutionOut)
def get_solution(problem_id: int, db: Session = Depends(get_db), user: Optional[User] = Depends(get_current_user_optional)):
    p = db.get(Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"solution_tex": p.solution_tex}

# PROTECTED: actions
@router.post("/answer", response_model=AnswerOut)
def submit_answer(payload: AnswerIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = db.get(Problem, payload.problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    existing = db.query(UserAnswer).filter_by(problem_id=p.id, user_id=user.id).first()
    if existing:
        return AnswerOut(is_correct=existing.is_correct, correct_option=p.correct_option)
    is_correct = (payload.chosen_option == p.correct_option)
    db.add(UserAnswer(user_id=user.id, problem_id=p.id, chosen_option=payload.chosen_option, is_correct=is_correct))
    p.attempt_count += 1
    if is_correct:
        p.solve_count += 1
    db.commit()
    return AnswerOut(is_correct=is_correct, correct_option=p.correct_option)

@router.post("/{problem_id}/like/toggle")
def toggle_like(problem_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = db.get(Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    existing = db.query(ProblemLike).filter_by(problem_id=problem_id, user_id=user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False}
    db.add(ProblemLike(problem_id=problem_id, user_id=user.id))
    db.commit()
    return {"liked": True}


@router.post("/answer/check", response_model=AnswerOut)
def check_answer(
    payload: AnswerIn,
    db: Session = Depends(get_db),
):
    """
    Public endpoint: returns correctness but does NOT store anything.
    Useful for guests.
    """
    p = db.get(Problem, payload.problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")

    is_correct = (payload.chosen_option == p.correct_option)
    return AnswerOut(is_correct=is_correct, correct_option=p.correct_option)