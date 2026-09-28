"""Analytics API routes."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User
from app.models.student import Gender
from app.schemas.analytics import AnalyticsResponse
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _clean_gender(gender: Optional[str]) -> Optional[str]:
    """Return a validated gender value, or None when unfiltered."""
    if not gender or gender == "all":
        return None
    try:
        Gender(gender)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid gender: {gender}",
        )
    return gender


def _clean_grade(grade: Optional[str]) -> Optional[str]:
    return None if not grade or grade == "all" else str(grade)


@router.get("/", response_model=AnalyticsResponse)
async def get_analytics(
    school_id: Optional[int] = Query(None, description="Filter by school"),
    grade: Optional[str] = Query(None, description="Filter by grade/class"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get complete analytics data (optionally filtered)."""
    return analytics_service.get_analytics(
        db, school_id, _clean_grade(grade), _clean_gender(gender)
    )


@router.get("/dashboard")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard KPI statistics."""
    return analytics_service.get_dashboard_stats(db)


@router.get("/attendance-trend")
async def get_attendance_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get attendance trend data."""
    return analytics_service.get_attendance_trend(db)


@router.get("/risk-distribution")
async def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get risk distribution data."""
    return analytics_service.get_risk_distribution(db)


@router.get("/school-comparison")
async def get_school_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get school comparison data."""
    return analytics_service.get_school_comparison(db)


@router.get("/gender-analysis")
async def get_gender_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get gender analysis data."""
    return analytics_service.get_gender_analysis(db)
