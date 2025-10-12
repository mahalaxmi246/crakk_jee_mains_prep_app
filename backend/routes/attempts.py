# backend/routes/attempts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from deps import get_db, _ensure_db_user
from firebase_auth import get_current_firebase_user_optional
from models import Problem as Question, UserAnswer
from schemas import SubmitAnswerIn, SubmitAnswerOut

router = APIRouter(prefix="/questions", tags=["attempts"])


def _normalize_choice(v: Optional[str]) -> str:
    """
    Normalize any representation to 'A'|'B'|'C'|'D'.
    Handles: lowercase, trailing/leading spaces, '1'..'4', 'A)', 'Option B', etc.
    """
    if v is None:
        return ""
    s = str(v).strip().upper()

    # remove common suffixes/prefixes
    if s.endswith(")"):          # "A)" -> "A"
        s = s[:-1]
    if s.startswith("OPTION "):  # "OPTION C" -> "C"
        s = s.replace("OPTION ", "")

    # map numeric to letter
    num_map = {"1": "A", "2": "B", "3": "C", "4": "D"}
    if s in num_map:
        s = num_map[s]

    # final trim
    s = s.strip()

    return s


@router.post("/{question_id}/submit", response_model=SubmitAnswerOut)
def submit_answer(
    question_id: int,
    body: SubmitAnswerIn,
    db: Session = Depends(get_db),
    firebase_claims = Depends(get_current_firebase_user_optional),
):
    # pick selectedOption or chosen_option
    selected_raw = body.selected()
    selected = _normalize_choice(selected_raw)

    if selected not in {"A", "B", "C", "D"}:
        raise HTTPException(422, "selectedOption must be one of A/B/C/D")

    q = db.get(Question, question_id)
    if not q:
        raise HTTPException(404, "Question not found")

    # normalize DB's correct_option too
    correct = _normalize_choice(getattr(q, "correct_option", None))

    user_id = None
    if firebase_claims:
        user = _ensure_db_user(db, firebase_claims)
        user_id = user.id

        # block re-submission for authed users
        already = db.query(UserAnswer.id).filter_by(
            user_id=user_id, problem_id=question_id
        ).first()
        if already:
            raise HTTPException(400, "You have already submitted an answer for this question")

    is_correct = (selected == correct)

    # record attempt (allow user_id=None for guests if you want)
    db.add(
        UserAnswer(
            user_id=user_id,
            problem_id=question_id,
            chosen_option=selected,  # store normalized
            is_correct=is_correct,
        )
    )
    db.commit()

    # recompute simple stats
    attempted = db.query(func.count(UserAnswer.id)).filter(
        UserAnswer.problem_id == question_id
    ).scalar() or 0

    solved = db.query(func.count(UserAnswer.id)).filter(
        UserAnswer.problem_id == question_id,
        UserAnswer.is_correct.is_(True)
    ).scalar() or 0

    accuracy = float(solved) / float(attempted) if attempted else 0.0

    return {
        "isCorrect": is_correct,
        "correctOption": correct,     # send normalized correct key
        "attemptedCount": attempted,
        "solvedCount": solved,
        "accuracy": round(accuracy, 4),
    }
