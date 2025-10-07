from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db    # ✅ FIXED
from models import Problem, Comment
from schemas import CommentIn, CommentOut
from deps import get_current_user

router = APIRouter()

@router.get("/{problem_id}", response_model=list[CommentOut])
def list_comments(problem_id: int, db: Session = Depends(get_db)):
    if not db.query(Problem).get(problem_id):
        raise HTTPException(404, "Problem not found")

    comments = (
        db.query(Comment)
        .filter(Comment.problem_id == problem_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [
        CommentOut(
            id=c.id,
            user_id=c.user_id,
            text=c.text,
            parent_id=c.parent_id,
            created_at=c.created_at
        )
        for c in comments
    ]

@router.post("/{problem_id}", response_model=CommentOut)
def add_comment(
    problem_id: int,
    payload: CommentIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not db.query(Problem).get(problem_id):
        raise HTTPException(404, "Problem not found")

    c = Comment(
        problem_id=problem_id,
        user_id=user.id,
        text=payload.text,
        parent_id=payload.parent_id
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return CommentOut(
        id=c.id,
        user_id=c.user_id,
        text=c.text,
        parent_id=c.parent_id,
        created_at=c.created_at
    )
