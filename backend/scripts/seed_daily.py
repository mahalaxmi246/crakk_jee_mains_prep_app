# backend/seed_daily.py
from datetime import date, datetime
from database import SessionLocal
from models import DailyRollout, Problem
from sqlalchemy import select

def set_today(subject: str):
    db = SessionLocal()
    try:
        # pick the first problem for that subject
        pid = db.execute(
            select(Problem.id).where(Problem.subject == subject).limit(1)
        ).scalar_one_or_none()
        if not pid:
            print(f"No problem found for subject={subject}")
            return
        today = date.today()
        # upsert unique (date, subject)
        obj = db.execute(
            select(DailyRollout).where(DailyRollout.date == today, DailyRollout.subject == subject)
        ).scalar_one_or_none()
        if obj:
            obj.problem_id = pid
        else:
            obj = DailyRollout(date=today, subject=subject, problem_id=pid, created_at=datetime.utcnow())
            db.add(obj)
        db.commit()
        print(f"Set {subject} → problem_id={pid} for {today}")
    finally:
        db.close()

if __name__ == "__main__":
    for s in ("math", "physics", "chemistry"):
        set_today(s)
