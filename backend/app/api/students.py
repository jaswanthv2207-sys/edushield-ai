"""Student API routes."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.auth import get_current_active_user, require_role
from app.models.user import User
from app.models.student import Gender, FeeStatus
from app.models.prediction import RiskLevel
from app.schemas.student import (
    StudentCreate, StudentUpdate, StudentResponse,
    StudentListResponse, StudentFilters
)
from app.services import student_service

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=StudentListResponse)
async def get_students(
    search: Optional[str] = None,
    school_id: Optional[int] = None,
    grade: Optional[str] = None,
    gender: Optional[str] = None,
    fee_status: Optional[str] = None,
    risk_level: Optional[str] = None,
    min_attendance: Optional[float] = None,
    max_attendance: Optional[float] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get paginated list of students with filters."""
    # Enum filters arrive as strings from the UI - reject bad values with 400
    # instead of letting the SQLAlchemy enum coercion bubble up as a 500.
    for value, enum_cls, label in (
        (gender, Gender, "gender"),
        (fee_status, FeeStatus, "fee_status"),
        (risk_level, RiskLevel, "risk_level"),
    ):
        if value and value != "all":
            try:
                enum_cls(value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid {label}: {value}",
                )

    filters = StudentFilters(
        search=search,
        school_id=school_id,
        grade=grade,
        gender=gender,
        fee_status=fee_status,
        risk_level=risk_level,
        min_attendance=min_attendance,
        max_attendance=max_attendance,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )

    # Non-admin users can only see their school's students
    school_filter = None
    if current_user.role.value in ["teacher", "counsellor"] and current_user.school_id:
        school_filter = current_user.school_id

    students, total = student_service.get_students(db, filters, school_id=school_filter)
    total_pages = (total + page_size - 1) // page_size

    return {
        "students": [StudentResponse.model_validate(s) for s in students],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get student by ID."""
    student = student_service.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return student


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "principal", "teacher"]))
):
    """Create a new student."""
    # Check if student_id already exists
    existing = student_service.get_student_by_student_id(db, student_data.student_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already exists"
        )

    student = student_service.create_student(db, student_data)
    return student


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "principal", "teacher"]))
):
    """Update an existing student."""
    student = student_service.update_student(db, student_id, student_data)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return student


@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "principal"]))
):
    """Delete (deactivate) a student."""
    success = student_service.delete_student(db, student_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return {"message": "Student deleted successfully"}


@router.get("/{student_id}/predictions")
async def get_student_predictions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get prediction history for a student."""
    student = student_service.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    predictions = student_service.get_student_prediction_history(db, student_id)
    return {
        "predictions": predictions,
        "total": len(predictions)
    }
