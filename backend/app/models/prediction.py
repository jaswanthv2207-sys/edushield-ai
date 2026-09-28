"""Prediction model for storing ML prediction results."""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class RiskLevel(str, enum.Enum):
    """Risk level enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Prediction(Base):
    """Prediction database model."""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    risk_percentage = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    risk_factors = Column(Text, nullable=True)  # JSON string of contributing factors
    recommendations = Column(Text, nullable=True)  # JSON string of recommendations
    intervention_suggested = Column(Text, nullable=True)
    model_version = Column(String(20), default="1.0.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="predictions")
