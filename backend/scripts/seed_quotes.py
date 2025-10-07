import csv
from database import SessionLocal
from models import Quote

def main():
    db = SessionLocal()
    try:
        with open("daily_quotes.csv", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = [
                Quote(text=r["text"].strip(), author=(r.get("author") or "").strip() or None)
                for r in reader
            ]
        db.add_all(rows)
        db.commit()
        print(f"✅ Inserted {len(rows)} quotes.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
