from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, or_

from database import Base, engine
from deps import get_db, get_current_user
from models import User
from schemas import UserCreate, UserRead, Token
from security import hash_password, verify_password, create_access_token

# Create tables at startup (dev-friendly)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth Starter")

# --- CORS: allow your React dev server to call the API ---
origins = [
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

# ---------- HEALTH ----------
@app.get("/")
def health(db: Session = Depends(get_db)):
    """Check DB connection quickly"""
    res = db.execute(text("SELECT version();"))
    return {"postgres": res.scalar()}

# ---------- AUTH ----------
@app.post("/register", response_model=UserRead)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    existing = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/token", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login using EITHER username OR email + password.
    OAuth2 form uses field name 'username', but we accept email there too.
    """
    identifier = form_data.username.strip()

    user = db.query(User).filter(
        or_(User.username == identifier, User.email == identifier)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.username)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    """Get current logged-in user info (protected)"""
    return current_user
