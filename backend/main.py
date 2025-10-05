# backend/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import Base, engine
from deps import get_db
from routes.auth import router as auth_router

# Auto create tables (dev only)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crakk Backend")

# ✅ Add correct CORS URLs for Vite dev server
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5180",
    "http://127.0.0.1:5180",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health(db: Session = Depends(get_db)):
    res = db.execute(text("SELECT version();"))
    return {"postgres": res.scalar()}

# ✅ Mount Auth Router
app.include_router(auth_router, prefix="/auth", tags=["auth"])
