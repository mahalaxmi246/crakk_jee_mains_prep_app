from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
import datetime, hashlib, random

from deps import get_db
from models import Quote

router = APIRouter()

def _count(db: Session) -> int:
    return db.execute(select(func.count(Quote.id))).scalar_one()

def _by_offset(db: Session, offset: int):
    q = db.execute(select(Quote).order_by(Quote.id).offset(offset).limit(1))
    return q.scalars().first()

@router.get("/daily-quote")
def daily_quote(db: Session = Depends(get_db)):
    total = _count(db)
    if total == 0:
        return {"quote": "Stay motivated!"}
    today = datetime.date.today().isoformat()
    hv = int(hashlib.sha256(today.encode()).hexdigest(), 16)
    idx = hv % total
    row = _by_offset(db, idx)
    return {"quote": f"{row.text}" if not row.author else f"{row.text} - {row.author}"}

@router.get("/random-quote")
def random_quote(db: Session = Depends(get_db)):
    total = _count(db)
    if total == 0:
        return {"quote": "Keep going!"}
    idx = random.randrange(total)
    row = _by_offset(db, idx)
    return {"quote": f"{row.text}" if not row.author else f"{row.text} - {row.author}"}
