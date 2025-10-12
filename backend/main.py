from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import SessionLocal
import firebase_admin_init  # side-effect: init Firebase Admin

# Routers
from routes.daily import router as daily_router
from routes.attempts import router as attempts_router
from routes.likes import router as likes_router
from routes.quotes import router as quotes_router
from routes.quotes import router as quotes_router
from routes import daily, questions, auth

# Optional routers – include ONLY if you actually have these files/models
# from routes.quotes import router as quotes_router
# from routes.dpp import router as dpp_router
# from routes.comments import router as comments_router

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="Crakk Backend")

# CORS (add your dev frontend ports)
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
    allow_headers=["*"],  # includes Authorization
)

@app.get("/")
def health(db: Session = Depends(get_db)):
    res = db.execute(text("SELECT version();"))
    return {"postgres": res.scalar()}

# Mount routers under /api
API_PREFIX = "/api"
app.include_router(quotes_router, prefix=API_PREFIX)
app.include_router(daily_router,    prefix=API_PREFIX)
app.include_router(attempts_router, prefix=API_PREFIX)
app.include_router(likes_router,    prefix=API_PREFIX)
app.include_router(daily.router, prefix=API_PREFIX)
app.include_router(questions.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix="/api") 

# Optional routers (uncomment only if you actually have them)
# app.include_router(quotes_router,   prefix=API_PREFIX, tags=["Quotes"])
# app.include_router(dpp_router,      prefix=API_PREFIX, tags=["DPP"])
# app.include_router(comments_router, prefix=API_PREFIX, tags=["Comments"])

