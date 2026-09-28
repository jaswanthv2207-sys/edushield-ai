"""Counselling model for tracking counselling sessions."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class CounsellingStatus(str, enum.Enum):
    """Counselling session status."""
    PENDING = "pending"
    COMPLETED = "completed"
    EMERGENCY = "emergency"
    CANCELLED = "cancelled"


class Priority(str, enum.Enum):
    """Priority level for counselling."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Counselling(Base):
    """Counselling session database model."""
    __tablename__ = "counselling"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    counsellor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meeting_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(CounsellingStatus), default=CounsellingStatus.PENDING)
    priority = Column(Enum(Priority), default=Priority.MEDIUM)
    notes = Column(Text, nullable=True)
    ai_recommendations = Column(Text, nullable=True)
    risk_summary = Column(Text, nullable=True)
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="counselling_sessions")
    counsellor = relationship("User")
