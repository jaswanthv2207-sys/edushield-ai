"""Counselling schemas."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime
from app.models.counselling import CounsellingStatus, Priority
from app.utils import parse_list_field


class CounsellingCreate(BaseModel):
    """Counselling session creation schema."""
    student_id: int
    meeting_date: datetime
    priority: Priority = Priority.MEDIUM
    notes: Optional[str] = None
    ai_recommendations: Optional[List[str]] = None
    risk_summary: Optional[str] = None
    follow_up_date: Optional[datetime] = None


class CounsellingUpdate(BaseModel):
    """Counselling session update schema."""
    meeting_date: Optional[datetime] = None
    status: Optional[CounsellingStatus] = None
    priority: Optional[Priority] = None
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None


class CounsellingResponse(BaseModel):
    """Counselling session response schema."""
    id: int
    student_id: int
    counsellor_id: int
    meeting_date: datetime
    status: CounsellingStatus
    priority: Priority
    notes: Optional[str] = None
    ai_recommendations: Optional[List[str]] = None
    risk_summary: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    student_name: Optional[str] = None
    counsellor_name: Optional[str] = None

    @field_validator("ai_recommendations", mode="before")
    @classmethod
    def _decode_list_fields(cls, value):
        """Decode string-encoded list columns written by older versions."""
        return parse_list_field(value)

    class Config:
        from_attributes = True


class AssignCounsellorRequest(BaseModel):
    """Assign counsellor request schema."""
    student_id: int
    counsellor_id: int
    meeting_date: datetime
    priority: Priority = Priority.MEDIUM
    notes: Optional[str] = None


class CounsellingListResponse(BaseModel):
    """Paginated counselling list response."""
    sessions: List[CounsellingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
