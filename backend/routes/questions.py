from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from sqlalchemy import select, func

from deps import get_db
from models import Problem, ProblemLike

router = APIRouter(prefix="/questions", tags=["questions"])

# ---------- Submit Answer ----------
class SubmitBody(BaseModel):
    # Accept either camelCase (frontend) or snake_case (alt)
    model_config = ConfigDict(extra="forbid")
    chosen_option: Optional[Literal["A", "B", "C", "D"]] = None
    selectedOption: Optional[Literal["A", "B", "C", "D"]] = None

    def choice(self) -> Optional[str]:
        return self.selectedOption or self.chosen_option

@router.post("/{problem_id}/submit")
def submit_answer(problem_id: int, body: SubmitBody, db: Session = Depends(get_db)):
    choice = body.choice()
    if choice is None:
        raise HTTPException(status_code=422, detail="chosen_option or selectedOption is required")

    problem = db.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    is_correct = (choice == problem.correct_option)

    # Optional: compute/return counters so UI can update without refetch
    attempted = db.scalar(select(func.count()).select_from(Problem))  # placeholder if you track attempts
    solved = attempted  # placeholder

    return {
        "is_correct": is_correct,
        "correct_option": problem.correct_option,
        # Optional extras your UI already knows how to read:
        # "attemptedCount": attempted or 0,
        # "solvedCount": solved or 0,
        # "accuracy": (solved / attempted) if attempted else 0.0,
    }

# ---------- (Optional) Hint / Solution (if you haven’t added yet) ----------
@router.get("/{problem_id}/hint")
def get_hint(problem_id: int, db: Session = Depends(get_db)):
    problem = db.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"hint_tex": problem.hint_tex or ""}

@router.get("/{problem_id}/solution")
def get_solution(problem_id: int, db: Session = Depends(get_db)):
    problem = db.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"solution_tex": problem.solution_tex or ""}

# ---------- (Optional) Like toggle with idempotency ----------
class LikeResponse(BaseModel):
    likeCount: int
    hasLiked: bool

@router.post("/{problem_id}/like", response_model=LikeResponse)
def toggle_like(problem_id: int, db: Session = Depends(get_db)):
    # Replace with real user_id from auth later
    user_id = 1

    existing = db.scalar(
        select(ProblemLike).where(
            ProblemLike.problem_id == problem_id,
            ProblemLike.user_id == user_id
        )
    )

    if existing:
        db.delete(existing)
        db.commit()
        hasLiked = False
    else:
        try:
            db.add(ProblemLike(user_id=user_id, problem_id=problem_id))
            db.commit()
            hasLiked = True
        except Exception:
            db.rollback()
            hasLiked = True

    likeCount = db.scalar(
        select(func.count(ProblemLike.id)).where(ProblemLike.problem_id == problem_id)
    ) or 0

    return LikeResponse(likeCount=likeCount, hasLiked=hasLiked)
