"""Student schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.student import Gender, FeeStatus, FamilySupport, MedicalCondition


class StudentBase(BaseModel):
    """Base student schema."""
    student_id: str = Field(..., min_length=1, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Gender
    age: int = Field(..., ge=5, le=30)
    school_id: int
    grade: str
    section: Optional[str] = None
    attendance_percentage: float = Field(default=0.0, ge=0, le=100)
    final_grade: float = Field(default=0.0, ge=0, le=100)
    previous_failures: int = Field(default=0, ge=0)
    study_time_weekly: float = Field(default=0.0, ge=0)
    family_support: FamilySupport = FamilySupport.MEDIUM
    internet_access: bool = True
    fee_status: FeeStatus = FeeStatus.PAID
    medical_condition: MedicalCondition = MedicalCondition.NONE
    higher_education_interest: bool = True
    parent_education: Optional[str] = None
    family_income: Optional[str] = None
    distance_from_school: float = Field(default=0.0, ge=0)
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: str = "Rajasthan"


class StudentCreate(StudentBase):
    """Student creation schema."""
    pass


class StudentUpdate(BaseModel):
    """Student update schema - all fields optional."""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[Gender] = None
    age: Optional[int] = Field(None, ge=5, le=30)
    school_id: Optional[int] = None
    grade: Optional[str] = None
    section: Optional[str] = None
    attendance_percentage: Optional[float] = Field(None, ge=0, le=100)
    final_grade: Optional[float] = Field(None, ge=0, le=100)
    previous_failures: Optional[int] = Field(None, ge=0)
    study_time_weekly: Optional[float] = Field(None, ge=0)
    family_support: Optional[FamilySupport] = None
    internet_access: Optional[bool] = None
    fee_status: Optional[FeeStatus] = None
    medical_condition: Optional[MedicalCondition] = None
    higher_education_interest: Optional[bool] = None
    parent_education: Optional[str] = None
    family_income: Optional[str] = None
    distance_from_school: Optional[float] = Field(None, ge=0)
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None


class StudentResponse(StudentBase):
    """Student response schema."""
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudentListResponse(BaseModel):
    """Paginated student list response."""
    students: List[StudentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class StudentFilters(BaseModel):
    """Student filter parameters."""
    search: Optional[str] = None
    school_id: Optional[int] = None
    grade: Optional[str] = None
    gender: Optional[Gender] = None
    fee_status: Optional[FeeStatus] = None
    risk_level: Optional[str] = None
    min_attendance: Optional[float] = None
    max_attendance: Optional[float] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
