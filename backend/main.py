# backend/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import Base, engine
from deps import get_db
from routes.auth import router as auth_router
from routes.quotes import router as quotes_router 
from routes.dpp import router as dpp_router                # student DPP endpoints
from routes.admin_dpp import router as admin_dpp_router    # admin-only create/schedule
from routes.comments import router as comments_router  

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

#mount quotes under /api

app.include_router(quotes_router, prefix="/api", tags=["Quotes"])

app.include_router(dpp_router,     prefix="/dpp",        tags=["DPP"])
app.include_router(admin_dpp_router, prefix="/admin-dpp", tags=["Admin DPP"])
app.include_router(comments_router, prefix="/comments",  tags=["Comments"])