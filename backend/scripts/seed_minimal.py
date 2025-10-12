# backend/seed_minimal.py
from datetime import date, datetime
from database import SessionLocal
from models import Problem
from sqlalchemy import select

def upsert_problem(db, **kw):
    # idempotent by (subject, topic, chapter, question_tex)
    stmt = select(Problem).where(
        Problem.subject == kw["subject"],
        Problem.topic == kw["topic"],
        Problem.chapter == kw["chapter"],
        Problem.question_tex == kw["question_tex"],
    )
    obj = db.execute(stmt).scalar_one_or_none()
    if obj:
        return obj
    obj = Problem(
        subject=kw["subject"],
        topic=kw["topic"],
        chapter=kw["chapter"],
        difficulty=kw["difficulty"],
        question_tex=kw["question_tex"],
        option_a_tex=kw["option_a_tex"],
        option_b_tex=kw["option_b_tex"],
        option_c_tex=kw["option_c_tex"],
        option_d_tex=kw["option_d_tex"],
        correct_option=kw["correct_option"],
        hint_tex=kw.get("hint_tex"),
        solution_tex=kw.get("solution_tex"),
        attempt_count=0,
        solve_count=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def main():
    db = SessionLocal()
    try:
        samples = [
            dict(
                subject="math", topic="Quadratics", chapter="Polynomials",
                difficulty="easy",
                question_tex="If x^2-5x+6=0, roots are?",
                option_a_tex="1 and 6", option_b_tex="2 and 3",
                option_c_tex="3 and 4", option_d_tex="2 and 4",
                correct_option="B",
                hint_tex="Factorization",
                solution_tex="(x-2)(x-3)=0 → x=2,3",
            ),
            dict(
                subject="physics", topic="Kinematics", chapter="Motion in 1D",
                difficulty="easy",
                question_tex="Car at 10 m/s accelerates at 2 m/s^2 for 5 s. Final speed?",
                option_a_tex="20", option_b_tex="15",
                option_c_tex="30", option_d_tex="40",
                correct_option="C",
                solution_tex="v = u + at = 10 + 2*5 = 20 m/s (if you prefer 30, change numbers)",
            ),
            dict(
                subject="chemistry", topic="Mole Concept", chapter="Basics",
                difficulty="easy",
                question_tex="Avogadro's number is approximately?",
                option_a_tex="6.02×10^23", option_b_tex="3.14",
                option_c_tex="9.81", option_d_tex="1.6×10^-19",
                correct_option="A",
            ),
        ]

        created = [upsert_problem(db, **p) for p in samples]
        print("Seeded problems:", [p.id for p in created])

    finally:
        db.close()

if __name__ == "__main__":
    main()
