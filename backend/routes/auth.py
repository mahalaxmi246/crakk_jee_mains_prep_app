# backend/routes/auth.py
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session

from deps import get_db, get_current_user
from models import User, RefreshToken, AccessTokenBlocklist
from schemas import (
    UserCreate, UserRead, TokenPair, RefreshRequest,
    UpdateMe, ChangePassword
)
from security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_refresh_token, decode_token,
    generate_jti
)

router = APIRouter()

# ---------- REGISTER ----------
@router.post("/register", response_model=UserRead)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # 1) Check email first (email must be unique)
    email_exists = db.query(User).filter(User.email == payload.email).first()
    if email_exists:
        raise HTTPException(status_code=400, detail="Email already exists")

    # 2) Decide a base username
    base_username = (payload.username or "").strip()
    if not base_username:
        # derive from email prefix
        base_username = payload.email.split("@")[0].strip()

    # sanitize (keep letters, digits, _ and -)
    import re
    base_username = re.sub(r"[^A-Za-z0-9_-]", "", base_username) or "user"

    # 3) Ensure username is unique; if taken, add a short random suffix
    username = base_username
    attempts = 0
    while db.query(User).filter(User.username == username).first():
        attempts += 1
        suffix = secrets.token_hex(2)  # 4 hex chars
        username = f"{base_username}-{suffix}"
        if attempts > 10:
            raise HTTPException(status_code=400, detail="Could not allocate a unique username, try again")

    # 4) Create user
    user = User(
        username=username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
    existing = (
        db.query(User)
        .filter(or_(User.username == payload.username, User.email == payload.email))
        .first()
    )
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


# ---------- LOGIN -> access + refresh ----------
@router.post("/token", response_model=TokenPair)
def login(form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):
    # Accept email OR username in OAuth's "username" field
    identifier = form_data.username.strip()
    user = (
        db.query(User)
        .filter(or_(User.username == identifier, User.email == identifier))
        .first()
    )
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # access token (contains jti in our security.py)
    access_token = create_access_token(user.username)

    # refresh token (persist jti in DB)
    jti = generate_jti()
    refresh_token = create_refresh_token(user.username, jti)
    payload = decode_refresh_token(refresh_token)
    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)

    db.add(RefreshToken(jti=jti, username=user.username, expires_at=expires_at, revoked=False))
    db.commit()

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


# ---------- REFRESH (rotate) ----------
@router.post("/refresh", response_model=TokenPair)
def refresh_tokens(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_refresh_token(body.refresh_token)
    if not payload or "sub" not in payload or "jti" not in payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    username = payload["sub"]
    jti = payload["jti"]
    row = db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
    now = datetime.now(timezone.utc)

    if not row or row.revoked or row.expires_at <= now:
        raise HTTPException(status_code=401, detail="Refresh token expired or revoked")

    # rotate: revoke old, issue new pair
    row.revoked = True
    new_access = create_access_token(username)
    new_jti = generate_jti()
    new_refresh = create_refresh_token(username, new_jti)
    new_payload = decode_refresh_token(new_refresh)
    new_exp = datetime.fromtimestamp(new_payload["exp"], tz=timezone.utc)

    db.add(RefreshToken(jti=new_jti, username=username, expires_at=new_exp, revoked=False))
    db.commit()

    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}


# ---------- LOGOUT (requires ACCESS token) ----------
@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    """
    Revokes all refresh tokens for the user AND blacklists the current access token,
    so subsequent requests with the same token immediately return 401.
    """
    # revoke all active refresh tokens
    q = db.query(RefreshToken).filter(
        RefreshToken.username == current_user.username,
        RefreshToken.revoked == False,
    )
    count = q.update({RefreshToken.revoked: True}, synchronize_session=False)

    # blacklist the current access token
    if authorization and authorization.lower().startswith("bearer "):
        access_token = authorization.split(" ", 1)[1]
        payload = decode_token(access_token)
        if payload and "jti" in payload and "exp" in payload:
            exp_dt = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
            exists = db.query(AccessTokenBlocklist).filter(AccessTokenBlocklist.jti == payload["jti"]).first()
            if not exists:
                db.add(AccessTokenBlocklist(jti=payload["jti"], expires_at=exp_dt))

    db.commit()
    return {"detail": "Logged out", "revoked_tokens": count}


# ---------- WHO AM I ----------
@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ---------- UPDATE MY PROFILE (username/email/class_level/stream) ----------
ALLOWED_CLASS = {"11", "12", "dropper"}
ALLOWED_STREAM = {"JEE Mains", "JEE Advanced", "NEET", "Foundation", "Other"}

@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UpdateMe,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # username
    if payload.username and payload.username != current_user.username:
        exists = db.query(User).filter(User.username == payload.username).first()
        if exists:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = payload.username

    # email
    if payload.email and payload.email != current_user.email:
        exists = db.query(User).filter(User.email == payload.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email

    # class_level
    if payload.class_level is not None:
        if payload.class_level not in ALLOWED_CLASS:
            raise HTTPException(status_code=400, detail="Invalid class level")
        current_user.class_level = payload.class_level

    # stream
    if payload.stream is not None:
        if payload.stream not in ALLOWED_STREAM:
            raise HTTPException(status_code=400, detail="Invalid stream")
        current_user.stream = payload.stream

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


# ---------- CHANGE PASSWORD (revokes sessions + blacklists current access) ----------
@router.post("/change-password")
def change_password(
    payload: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    # verify current password
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # update password
    current_user.hashed_password = hash_password(payload.new_password)
    db.add(current_user)

    # revoke all refresh tokens
    db.query(RefreshToken).filter(
        RefreshToken.username == current_user.username,
        RefreshToken.revoked == False,
    ).update({RefreshToken.revoked: True}, synchronize_session=False)

    # blacklist current access token (force re-login)
    if authorization and authorization.lower().startswith("bearer "):
        access_token = authorization.split(" ", 1)[1]
        token_payload = decode_token(access_token)
        if token_payload and "jti" in token_payload and "exp" in token_payload:
            exp_dt = datetime.fromtimestamp(token_payload["exp"], tz=timezone.utc)
            exists = db.query(AccessTokenBlocklist).filter(AccessTokenBlocklist.jti == token_payload["jti"]).first()
            if not exists:
                db.add(AccessTokenBlocklist(jti=token_payload["jti"], expires_at=exp_dt))

    db.commit()
    return {"detail": "Password changed. Please log in again."}
