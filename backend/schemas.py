from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    # NEW
    class_level: Optional[str] = None
    stream: Optional[str] = None

    class Config:
        from_attributes = True  # Pydantic v2

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

# NEW: update payload
class UpdateMe(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    class_level: Optional[str] = None  # "11" | "12" | "dropper"
    stream: Optional[str] = None       # e.g. "JEE Mains"

class ChangePassword(BaseModel):
    current_password: str
    new_password: str
