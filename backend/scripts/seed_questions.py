# backend/scripts/seed_questions.py
import csv
import sys
from pathlib import Path
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Question

"""
Usage:
  python -m scripts.seed_questions ./data/questions_math.csv ./data/questions_physics.csv ...
CSV headers required:
subject,topic,chapter,difficulty,question_tex,option_a_tex,option_b_tex,option_c_tex,option_d_tex,correct_option,hint_tex,solution_tex
"""

def seed_file(db: Session, path: Path):
    with path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    created = 0
    for r in rows:
        q = Question(
            subject=r["subject"].strip().lower(),
            topic=(r.get("topic") or "").strip() or None,
            chapter=(r.get("chapter") or "").strip() or None,
            difficulty=r["difficulty"].strip().lower(),
            question_tex=r["question_tex"],
            option_a_tex=r["option_a_tex"],
            option_b_tex=r["option_b_tex"],
            option_c_tex=r["option_c_tex"],
            option_d_tex=r["option_d_tex"],
            correct_option=r["correct_option"].strip().upper(),
            hint_tex=(r.get("hint_tex") or None),
            solution_tex=(r.get("solution_tex") or None),
            is_active=True,
        )
        db.add(q)
        created += 1

    db.commit()
    print(f"[{path.name}] inserted {created} questions")

def main():
    if len(sys.argv) < 2:
        print("Pass at least one CSV file path.")
        sys.exit(1)

    db = SessionLocal()
    try:
        for p in sys.argv[1:]:
            seed_file(db, Path(p))
    finally:
        db.close()

if __name__ == "__main__":
    main()
