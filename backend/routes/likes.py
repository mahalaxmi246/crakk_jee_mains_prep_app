# backend/routes/likes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from deps import get_db, _ensure_db_user
from firebase_auth import get_current_firebase_user
from models import Problem as Question, ProblemLike
from schemas import LikeResponse

router = APIRouter(prefix="/questions", tags=["likes"])


@router.post("/{question_id}/like", response_model=LikeResponse)
def toggle_like(
    question_id: int,
    db: Session = Depends(get_db),
    firebase_claims = Depends(get_current_firebase_user),
):
    user = _ensure_db_user(db, firebase_claims)

    q = db.get(Question, question_id)
    if not q:
        raise HTTPException(404, "Question not found")

    existing = db.query(ProblemLike).filter_by(
        user_id=user.id, problem_id=question_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        has_liked = False
    else:
        db.add(ProblemLike(user_id=user.id, problem_id=question_id))
        db.commit()
        has_liked = True

    like_count = db.query(func.count(ProblemLike.id)).filter(
        ProblemLike.problem_id == question_id
    ).scalar() or 0

    return {"likeCount": like_count, "hasLiked": has_liked}
