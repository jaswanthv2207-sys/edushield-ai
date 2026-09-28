"""Counselling API routes."""
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.api.auth import get_current_active_user, require_role
from app.models.user import User
from app.models.counselling import Counselling, CounsellingStatus, Priority
from app.models.student import Student
from app.models.prediction import Prediction
from app.schemas.counselling import (
    CounsellingCreate, CounsellingUpdate, CounsellingResponse,
    AssignCounsellorRequest, CounsellingListResponse
)
from app.services import student_service, prediction_service
from app.utils import parse_list_field
from datetime import datetime

router = APIRouter(prefix="/counselling", tags=["Counselling"])


def _session_payload(db: Session, session: Counselling) -> dict:
    """Serialize a counselling session including display names."""
    return {
        "id": session.id,
        "student_id": session.student_id,
        "counsellor_id": session.counsellor_id,
        "meeting_date": session.meeting_date,
        "status": session.status,
        "priority": session.priority,
        "notes": session.notes,
        "ai_recommendations": parse_list_field(session.ai_recommendations),
        "risk_summary": session.risk_summary,
        "follow_up_date": session.follow_up_date,
        "created_at": session.created_at,
        "updated_at": session.updated_at,
        "student_name": session.student.full_name if session.student else None,
        "counsellor_name": session.counsellor.full_name if session.counsellor else None,
    }


@router.get("/")
async def get_counselling_sessions(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    student_id: Optional[int] = None,
    counsellor_id: Optional[int] = None,
    search: Optional[str] = Query(None, description="Search by student name or notes"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get paginated counselling sessions with filters."""
    query = db.query(Counselling)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = (
            query
            .outerjoin(Student, Student.id == Counselling.student_id)
            .filter(or_(Student.full_name.ilike(term), Counselling.notes.ilike(term)))
        )

    if status:
        query = query.filter(Counselling.status == status)
    if priority:
        query = query.filter(Counselling.priority == priority)
    if student_id:
        query = query.filter(Counselling.student_id == student_id)
    if counsellor_id:
        query = query.filter(Counselling.counsellor_id == counsellor_id)

    # Non-admin users can only see their own sessions
    if current_user.role.value == "counsellor":
        query = query.filter(Counselling.counsellor_id == current_user.id)

    total = query.count()
    sessions = query.order_by(Counselling.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    # Bulk-load display names so the UI does not show "Student #1"
    student_ids = {s.student_id for s in sessions}
    counsellor_ids = {s.counsellor_id for s in sessions}
    students = {
        st.id: st.full_name
        for st in db.query(Student).filter(Student.id.in_(student_ids)).all()
    } if student_ids else {}
    counsellors = {
        u.id: u.full_name
        for u in db.query(User).filter(User.id.in_(counsellor_ids)).all()
    } if counsellor_ids else {}

    sessions_data = [
        {
            "id": s.id,
            "student_id": s.student_id,
            "counsellor_id": s.counsellor_id,
            "meeting_date": s.meeting_date,
            "status": s.status,
            "priority": s.priority,
            "notes": s.notes,
            "ai_recommendations": parse_list_field(s.ai_recommendations),
            "risk_summary": s.risk_summary,
            "follow_up_date": s.follow_up_date,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
            "student_name": students.get(s.student_id),
            "counsellor_name": counsellors.get(s.counsellor_id),
        }
        for s in sessions
    ]

    return {
        "sessions": sessions_data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/assign", response_model=CounsellingResponse)
async def assign_counsellor(
    request: AssignCounsellorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "principal", "counsellor"]))
):
    """Assign a counsellor to a student."""
    # Verify student exists
    student = student_service.get_student_by_id(db, request.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Verify the counsellor exists
    counsellor = db.query(User).filter(User.id == request.counsellor_id).first()
    if not counsellor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counsellor not found"
        )

    # Get latest prediction for AI recommendations
    predictions = prediction_service.get_prediction_history(db, request.student_id)
    latest_prediction = predictions[0] if predictions else None

    ai_recommendations = []
    risk_summary = None
    if latest_prediction:
        ai_recommendations = parse_list_field(latest_prediction.recommendations)
        risk_summary = f"Risk Level: {latest_prediction.risk_level.value}, Risk Percentage: {latest_prediction.risk_percentage}%"

    # Create counselling session
    session = Counselling(
        student_id=request.student_id,
        counsellor_id=request.counsellor_id,
        meeting_date=request.meeting_date,
        priority=request.priority,
        notes=request.notes,
        ai_recommendations=json.dumps(ai_recommendations),
        risk_summary=risk_summary,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "student_id": session.student_id,
        "counsellor_id": session.counsellor_id,
        "meeting_date": session.meeting_date,
        "status": session.status,
        "priority": session.priority,
        "notes": session.notes,
        "ai_recommendations": parse_list_field(session.ai_recommendations),
        "risk_summary": session.risk_summary,
        "follow_up_date": session.follow_up_date,
        "created_at": session.created_at,
        "updated_at": session.updated_at,
        "student_name": student.full_name,
        "counsellor_name": counsellor.full_name,
    }


@router.put("/{session_id}", response_model=CounsellingResponse)
async def update_counselling_session(
    session_id: int,
    update_data: CounsellingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a counselling session."""
    session = db.query(Counselling).filter(Counselling.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counselling session not found"
        )

    # Only assigned counsellor or admin can update
    if current_user.role.value == "counsellor" and session.counsellor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own sessions"
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)

    return _session_payload(db, session)


@router.get("/high-risk-students")
async def get_high_risk_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of high-risk students for counselling."""
    from app.models.prediction import RiskLevel

    high_risk_students = (
        db.query(Student, Prediction)
        .join(Prediction, Student.id == Prediction.student_id)
        .filter(Prediction.risk_level == RiskLevel.HIGH)
        .order_by(Prediction.risk_percentage.desc())
        .all()
    )

    result = []
    for student, prediction in high_risk_students:
        # Check if already assigned
        existing_session = (
            db.query(Counselling)
            .filter(
                Counselling.student_id == student.id,
                Counselling.status == CounsellingStatus.PENDING
            )
            .first()
        )

        result.append({
            "student": student,
            "prediction": prediction,
            "assigned": existing_session is not None,
            "session_id": existing_session.id if existing_session else None,
        })

    return result


@router.get("/{session_id}", response_model=CounsellingResponse)
async def get_counselling_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get counselling session by ID."""
    session = db.query(Counselling).filter(Counselling.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counselling session not found"
        )
    return _session_payload(db, session)


@router.delete("/{session_id}")
async def delete_counselling_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "principal"]))
):
    """Delete a counselling session."""
    session = db.query(Counselling).filter(Counselling.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counselling session not found"
        )

    db.delete(session)
    db.commit()

    return {"message": "Counselling session deleted successfully"}
