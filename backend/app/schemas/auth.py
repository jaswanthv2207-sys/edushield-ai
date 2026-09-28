"""Authentication schemas."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[int] = None
    role: Optional[UserRole] = None


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str
    remember_me: bool = False


class UserCreate(BaseModel):
    """User creation schema."""
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.TEACHER
    school_id: Optional[int] = None
    phone: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    email: str
    full_name: str
    role: UserRole
    school_id: Optional[int] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    """Profile update schema for the current user."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)


class PasswordChange(BaseModel):
    """Password change schema."""
    current_password: str
    new_password: str


Token.model_rebuild()
