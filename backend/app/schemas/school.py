"""School schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SchoolBase(BaseModel):
    """Base school schema."""
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(..., min_length=1, max_length=50)
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: str = "Rajasthan"
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    school_type: str = "government"
    medium: str = "hindi"


class SchoolCreate(SchoolBase):
    """School creation schema."""
    pass


class SchoolResponse(SchoolBase):
    """School response schema."""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SchoolListResponse(BaseModel):
    """Paginated school list response."""
    schools: List[SchoolResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
