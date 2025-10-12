# backend/routes/daily.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from deps import get_db, _ensure_db_user
from firebase_auth import get_current_firebase_user_optional
from schemas import ProblemOut, ProblemStats
from services.daily import get_or_create_daily_rollout, compute_stats, has_liked
from models import SubjectEnum, DifficultyEnum, UserAnswer

router = APIRouter(prefix="/daily", tags=["daily"])

@router.get("/{subject}/today", response_model=ProblemOut)
def get_today_question(
    subject: str,
    db: Session = Depends(get_db),
    firebase_claims = Depends(get_current_firebase_user_optional)
):
    # 🧠 Get today's question or create if missing
    q = get_or_create_daily_rollout(db, subject, date.today())
    if not q:
        raise HTTPException(404, "No question found")

    # 🧠 Identify user if logged in
    user_id = None
    has_answered = False
    if firebase_claims:
        user = _ensure_db_user(db, firebase_claims)
        user_id = user.id
        has_answered = (
            db.query(UserAnswer.id)
            .filter(UserAnswer.user_id == user_id, UserAnswer.problem_id == q.id)
            .first()
            is not None
        )

    # 🧠 Compute stats
    attempted, solved, likes_count, accuracy = compute_stats(db, q.id)
    stats_obj = ProblemStats(attempted=attempted, solved=solved, accuracy=accuracy)

    # 🧠 Enums
    subj_val = SubjectEnum(q.subject) if isinstance(q.subject, str) else q.subject
    diff_val = DifficultyEnum(q.difficulty) if isinstance(q.difficulty, str) else q.difficulty

    return ProblemOut.model_validate({
        "id": q.id,
        "subject": subj_val,
        "topic": q.topic,
        "chapter": q.chapter,
        "difficulty": diff_val,
        "question_tex": q.question_tex,
        "options": {
            "A": q.option_a_tex,
            "B": q.option_b_tex,
            "C": q.option_c_tex,
            "D": q.option_d_tex,
        },
        "stats": stats_obj,
        "likes_count": likes_count,
        "has_liked": has_liked(db, q.id, user_id),   # ✅ frontend depends on this
        "has_answered": has_answered,
    })
