"""Prediction schemas."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.prediction import RiskLevel
from app.utils import parse_list_field


class PredictionRequest(BaseModel):
    """Single prediction request."""
    student_id: int


class ManualPredictionRequest(BaseModel):
    """Manual prediction request with student features."""
    gender: str = Field(..., pattern="^(male|female|other)$")
    age: int = Field(..., ge=5, le=30)
    school_id: int
    attendance_percentage: float = Field(..., ge=0, le=100)
    previous_failures: int = Field(..., ge=0)
    final_grade: float = Field(..., ge=0, le=100)
    family_support: str = Field(..., pattern="^(high|medium|low)$")
    internet_access: bool
    fee_status: str = Field(..., pattern="^(paid|pending|overdue|scholarship)$")
    medical_condition: str = Field(..., pattern="^(none|minor|chronic|severe)$")
    higher_education_interest: bool
    study_time_weekly: float = Field(default=0.0, ge=0)
    distance_from_school: float = Field(default=0.0, ge=0)


class BulkPredictionRequest(BaseModel):
    """Bulk prediction request."""
    student_ids: List[int]


class PredictionResponse(BaseModel):
    """Prediction response schema."""
    id: int
    student_id: int
    risk_level: RiskLevel
    risk_percentage: float
    confidence_score: float
    risk_factors: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    intervention_suggested: Optional[str] = None
    model_version: str
    created_at: Optional[datetime] = None

    @field_validator("risk_factors", "recommendations", mode="before")
    @classmethod
    def _decode_list_fields(cls, value):
        """Decode string-encoded list columns written by older versions."""
        return parse_list_field(value)

    class Config:
        from_attributes = True


class PredictionHistoryResponse(BaseModel):
    """Prediction history for a student."""
    predictions: List[PredictionResponse]
    total: int


class BulkPredictionResponse(BaseModel):
    """Bulk prediction response."""
    results: List[PredictionResponse]
    total_processed: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
