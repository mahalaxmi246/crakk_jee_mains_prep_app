# backend/routes/comments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from deps import get_db, get_current_firebase_user
from models import Problem, Comment

router = APIRouter()

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

@router.get("/{problem_id}")
def list_comments(problem_id: int, db: Session = Depends(get_db)):
    if not db.get(Problem, problem_id):
        raise HTTPException(404, "Problem not found")

    comments = (
        db.query(Comment)
        .filter(Comment.problem_id == problem_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [
        {
            "id": c.id,
            "user_id": c.user_id,
            "text": c.text,
            "parent_id": c.parent_id,
            "created_at": c.created_at,
        }
        for c in comments
    ]

@router.post("/{problem_id}")
def add_comment(
    problem_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_firebase_user),
):
    if not db.get(Problem, problem_id):
        raise HTTPException(404, "Problem not found")

    user = _ensure_db_user(db, claims)

    c = Comment(
        problem_id=problem_id,
        user_id=user.id,
        text=payload.get("text", ""),
        parent_id=payload.get("parent_id"),
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {
        "id": c.id,
        "user_id": c.user_id,
        "text": c.text,
        "parent_id": c.parent_id,
        "created_at": c.created_at,
    }
