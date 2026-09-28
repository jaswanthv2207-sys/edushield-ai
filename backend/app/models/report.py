"""Report model for storing generated reports."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base


class ReportType(str, enum.Enum):
    """Report type enumeration."""
    SCHOOL = "school"
    STUDENT = "student"
    RISK = "risk"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class ReportFormat(str, enum.Enum):
    """Report format enumeration."""
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"


class Report(Base):
    """Report database model."""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(Enum(ReportType), nullable=False)
    format = Column(Enum(ReportFormat), nullable=False)
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    parameters = Column(Text, nullable=True)  # JSON string of report parameters
    created_at = Column(DateTime(timezone=True), server_default=func.now())
