from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from datetime import date

# ✅ Align names with models.py
from models import Problem as Question, DailyRollout, UserAnswer, ProblemLike


def _pick_next_question(db: Session, subject: str) -> Question | None:
    last = (
        db.query(DailyRollout)
        .filter(DailyRollout.subject == subject)
        .order_by(DailyRollout.date.desc(), DailyRollout.id.desc())
        .first()
    )

    q = db.query(Question).filter(Question.subject == subject, Question.is_active.is_(True))
    if last:
        q = q.filter(Question.id > last.problem_id)

    next_q = q.order_by(Question.id.asc()).first()
    if not next_q:
        next_q = (
            db.query(Question)
            .filter(Question.subject == subject, Question.is_active.is_(True))
            .order_by(Question.id.asc())
            .first()
        )
    return next_q


def get_or_create_daily_rollout(db: Session, subject: str, today: date) -> Question:
    existing = (
        db.query(DailyRollout)
        .filter(DailyRollout.subject == subject, DailyRollout.date == today)
        .first()
    )
    if existing:
        return db.get(Question, existing.problem_id)

    q = _pick_next_question(db, subject)
    if not q:
        raise ValueError(f"No active questions for subject={subject}")

    rollout = DailyRollout(subject=subject, date=today, problem_id=q.id)
    db.add(rollout)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = (
            db.query(DailyRollout)
            .filter(DailyRollout.subject == subject, DailyRollout.date == today)
            .first()
        )
        return db.get(Question, existing.problem_id)

    return q


def compute_stats(db: Session, problem_id: int) -> tuple[int, int, int, float]:
    attempted = db.query(func.count(UserAnswer.id)).filter(
        UserAnswer.problem_id == problem_id
    ).scalar() or 0

    solved = db.query(func.count(UserAnswer.id)).filter(
        UserAnswer.problem_id == problem_id,
        UserAnswer.is_correct.is_(True)
    ).scalar() or 0

    likes = db.query(func.count(ProblemLike.id)).filter(
        ProblemLike.problem_id == problem_id
    ).scalar() or 0

    accuracy = float(solved) / float(attempted) if attempted else 0.0
    return attempted, solved, likes, accuracy


def has_liked(db: Session, problem_id: int, user_id: int | None) -> bool:
    if not user_id:
        return False
    return db.query(ProblemLike.id).filter(
        ProblemLike.problem_id == problem_id,
        ProblemLike.user_id == user_id
    ).first() is not None
