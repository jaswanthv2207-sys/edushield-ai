"""Student model for storing student information."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class Gender(str, enum.Enum):
    """Gender enumeration."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class FeeStatus(str, enum.Enum):
    """Fee payment status."""
    PAID = "paid"
    PENDING = "pending"
    OVERDUE = "overdue"
    SCHOLARSHIP = "scholarship"


class FamilySupport(str, enum.Enum):
    """Family support level."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class MedicalCondition(str, enum.Enum):
    """Medical condition status."""
    NONE = "none"
    MINOR = "minor"
    CHRONIC = "chronic"
    SEVERE = "severe"


class Student(Base):
    """Student database model."""
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    gender = Column(Enum(Gender), nullable=False)
    age = Column(Integer, nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    grade = Column(String(10), nullable=False)
    section = Column(String(10), nullable=True)

    # Academic metrics
    attendance_percentage = Column(Float, default=0.0)
    final_grade = Column(Float, default=0.0)
    previous_failures = Column(Integer, default=0)
    study_time_weekly = Column(Float, default=0.0)

    # Socioeconomic factors
    family_support = Column(Enum(FamilySupport), default=FamilySupport.MEDIUM)
    internet_access = Column(Boolean, default=True)
    fee_status = Column(Enum(FeeStatus), default=FeeStatus.PAID)
    medical_condition = Column(Enum(MedicalCondition), default=MedicalCondition.NONE)
    higher_education_interest = Column(Boolean, default=True)
    parent_education = Column(String(50), nullable=True)
    family_income = Column(String(20), nullable=True)
    distance_from_school = Column(Float, default=0.0)

    # Address
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), default="Rajasthan")

    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    school = relationship("School", back_populates="students")
    predictions = relationship("Prediction", back_populates="student", cascade="all, delete-orphan")
    counselling_sessions = relationship("Counselling", back_populates="student", cascade="all, delete-orphan")
