from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Problem, DailyProblem, SubjectEnum, DifficultyEnum
from schemas import (
    ProblemCreate, DailyScheduleIn,
    BulkScheduleIn, BulkScheduleOut, BulkScheduledItem
)
from deps_admin import get_admin_user  # admin-only access

router = APIRouter()

@router.post("/problems")
def create_problem(
    data: ProblemCreate,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user)  # 👑 admin only
):
    p = Problem(
        subject=SubjectEnum(data.subject),
        topic=data.topic,
        chapter=data.chapter,
        difficulty=DifficultyEnum(data.difficulty),
        question_tex=data.question_tex,
        option_a_tex=data.option_a_tex,
        option_b_tex=data.option_b_tex,
        option_c_tex=data.option_c_tex,
        option_d_tex=data.option_d_tex,
        correct_option=data.correct_option,
        hint_tex=data.hint_tex,
        solution_tex=data.solution_tex
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id}

@router.post("/schedule")
def schedule_daily_problem(
    s: DailyScheduleIn,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user)  # 👑 admin only
):
    p = db.query(Problem).get(s.problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")

    if p.subject.value != s.subject:
        raise HTTPException(status_code=400, detail="Problem subject mismatch")

    exists = (
        db.query(DailyProblem)
        .filter(DailyProblem.date == s.date, DailyProblem.subject == SubjectEnum(s.subject))
        .first()
    )
    if exists:
        raise HTTPException(status_code=409, detail="Already scheduled for this subject & date")

    dp = DailyProblem(date=s.date, subject=SubjectEnum(s.subject), problem_id=p.id, is_active=True)
    db.add(dp)
    db.commit()
    return {"scheduled": True}

@router.post("/schedule/bulk", response_model=BulkScheduleOut)
def schedule_bulk(
    payload: BulkScheduleIn,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user)  # 👑 admin only
):
    """
    Schedule multiple subjects' problems for the same date, in one call.

    Example body:
    {
      "date": "2025-10-06",
      "items": [
        {"date":"2025-10-06","subject":"math","problem_id":1},
        {"date":"2025-10-06","subject":"physics","problem_id":5},
        {"date":"2025-10-06","subject":"chemistry","problem_id":9}
      ]
    }
    """
    scheduled: list[BulkScheduledItem] = []

    for it in payload.items:
        # Find problem
        p = db.query(Problem).get(it.problem_id)
        if not p:
            continue

        # Subject must match
        if p.subject.value != it.subject:
            continue

        # Only one per subject per date
        exists = (
            db.query(DailyProblem)
            .filter(DailyProblem.date == payload.date, DailyProblem.subject == SubjectEnum(it.subject))
            .first()
        )
        if exists:
            continue

        dp = DailyProblem(date=payload.date, subject=SubjectEnum(it.subject), problem_id=p.id, is_active=True)
        db.add(dp)
        scheduled.append(BulkScheduledItem(subject=it.subject, problem_id=p.id))

    db.commit()
    return BulkScheduleOut(date=payload.date, scheduled=scheduled)
