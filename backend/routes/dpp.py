from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date as _date
from typing import Optional

from deps import get_db, get_current_firebase_user, get_current_firebase_user_optional
from models import Problem, DailyProblem, ProblemLike, UserAnswer, SubjectEnum
from schemas import (
    ProblemOut, ProblemStats, AnswerIn, AnswerOut,
    TodayAllOut, TodaySubjectBundle, HintOut, SolutionOut
)

router = APIRouter()

def _subject_enum(s: str):
    try:
        return SubjectEnum(s)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid subject")

def _ensure_db_user(db: Session, claims: dict):
    from models import User
    email = (claims.get("email") or f"{claims['uid']}@firebase.local").lower()
    base = email.split("@")[0][:20]

    user = db.query(User).filter(User.email == email).first()
    if user:
        return user

    cand = base
    i = 0
    while db.query(User).filter(User.username == cand).first():
        i += 1
        cand = f"{base}-{i}"

    user = User(username=cand, email=email, hashed_password=f"firebase:{claims['uid']}")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ✅ GET today problem for a subject
@router.get("/today", response_model=ProblemOut)
def get_today_problem(
    subject: str = Query(..., pattern="^(math|physics|chemistry)$"),
    db: Session = Depends(get_db),
    claims: Optional[dict] = Depends(get_current_firebase_user_optional),
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
    my_choice = None
    is_correct = None
    correct_option = None

    if claims:
        user = _ensure_db_user(db, claims)
        has_liked = db.query(ProblemLike).filter_by(problem_id=p.id, user_id=user.id).first() is not None
        ua = db.query(UserAnswer).filter_by(problem_id=p.id, user_id=user.id).first()
        has_answered = ua is not None
        if ua:
            my_choice = ua.chosen_option
            is_correct = ua.is_correct
            correct_option = p.correct_option

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
        my_choice=my_choice,
        is_correct=is_correct,
        correct_option=correct_option,
    )

# ✅ GET today problems for all subjects
@router.get("/today/all", response_model=TodayAllOut)
def get_today_all(
    db: Session = Depends(get_db),
    claims: Optional[dict] = Depends(get_current_firebase_user_optional),
):
    today = _date.today()
    items = []
    user_id: Optional[int] = None
    if claims:
        user_id = _ensure_db_user(db, claims).id

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
        my_choice = None
        is_correct = None
        correct_option = None

        if user_id:
            has_liked = db.query(ProblemLike).filter_by(problem_id=p.id, user_id=user_id).first() is not None
            ua = db.query(UserAnswer).filter_by(problem_id=p.id, user_id=user_id).first()
            has_answered = ua is not None
            if ua:
                my_choice = ua.chosen_option
                is_correct = ua.is_correct
                correct_option = p.correct_option

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
                    my_choice=my_choice,
                    is_correct=is_correct,
                    correct_option=correct_option,
                )
            )
        )
    return TodayAllOut(date=today, items=items)

# PUBLIC
@router.get("/{problem_id}/hint", response_model=HintOut)
def get_hint(problem_id: int, db: Session = Depends(get_db)):
    p = db.get(Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"hint_tex": p.hint_tex}

@router.get("/{problem_id}/solution", response_model=SolutionOut)
def get_solution(problem_id: int, db: Session = Depends(get_db)):
    p = db.get(Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"solution_tex": p.solution_tex}

# PROTECTED: actions (require Firebase)
@router.post("/answer", response_model=AnswerOut)
def submit_answer(payload: AnswerIn, db: Session = Depends(get_db), claims: dict = Depends(get_current_firebase_user)):
    p = db.get(Problem, payload.problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")

    user = _ensure_db_user(db, claims)

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
def toggle_like(problem_id: int, db: Session = Depends(get_db), claims: dict = Depends(get_current_firebase_user)):
    p = db.get(Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")

    user = _ensure_db_user(db, claims)

    existing = db.query(ProblemLike).filter_by(problem_id=problem_id, user_id=user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False}

    db.add(ProblemLike(problem_id=problem_id, user_id=user.id))
    db.commit()
    return {"liked": True}

# PUBLIC: quick check (no writes)
@router.post("/answer/check", response_model=AnswerOut)
def check_answer(payload: AnswerIn, db: Session = Depends(get_db)):
    p = db.get(Problem, payload.problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    is_correct = (payload.chosen_option == p.correct_option)
    return AnswerOut(is_correct=is_correct, correct_option=p.correct_option)
