"""Analytics service for dashboard and reporting."""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.student import Student
from app.models.prediction import Prediction, RiskLevel
from app.models.school import School
from app.models.counselling import Counselling
from app.models.user import User


def _apply_student_filters(query, school_id=None, grade=None, gender=None):
    """Restrict a Student query with the optional analytics filters."""
    if school_id:
        query = query.filter(Student.school_id == school_id)
    if grade:
        query = query.filter(Student.grade == str(grade))
    if gender:
        query = query.filter(Student.gender == gender)
    return query


def _has_filters(school_id, grade, gender) -> bool:
    return bool(school_id or grade or gender)


def _latest_predictions(
    db: Session,
    school_id: Optional[int] = None,
    grade: Optional[str] = None,
    gender: Optional[str] = None,
) -> List[Prediction]:
    """Latest prediction per student, optionally restricted by student filters."""
    query = (
        db.query(Prediction)
        .distinct(Prediction.student_id)
        .order_by(Prediction.student_id, Prediction.created_at.desc())
    )
    if _has_filters(school_id, grade, gender):
        query = query.join(Student, Student.id == Prediction.student_id)
        query = _apply_student_filters(query, school_id, grade, gender)
    return query.all()


def get_dashboard_stats(
    db: Session,
    school_id: Optional[int] = None,
    grade: Optional[str] = None,
    gender: Optional[str] = None,
) -> Dict[str, Any]:
    """Get dashboard KPI statistics."""
    total_students = _apply_student_filters(
        db.query(Student).filter(Student.is_active == True),  # noqa: E712
        school_id, grade, gender,
    ).count()
    total_schools = db.query(School).count()
    total_counsellors = db.query(User).filter(User.role == "counsellor", User.is_active == True).count()
    active_sessions = db.query(Counselling).filter(Counselling.status == "pending").count()

    # Get latest prediction for each student
    latest_predictions = _latest_predictions(db, school_id, grade, gender)

    high_risk = sum(1 for p in latest_predictions if p.risk_level == RiskLevel.HIGH)
    medium_risk = sum(1 for p in latest_predictions if p.risk_level == RiskLevel.MEDIUM)
    low_risk = sum(1 for p in latest_predictions if p.risk_level == RiskLevel.LOW)

    dropout_rate = (high_risk / total_students * 100) if total_students > 0 else 0

    return {
        "total_students": total_students,
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": low_risk,
        "dropout_rate": round(dropout_rate, 2),
        "total_schools": total_schools,
        "total_counsellors": total_counsellors,
        "active_counselling_sessions": active_sessions,
    }


def get_attendance_trend(
    db: Session,
    school_id: Optional[int] = None,
    grade: Optional[str] = None,
    gender: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get attendance trend by month."""
    results = (
        _apply_student_filters(
            db.query(
                extract("month", Student.created_at).label("month"),
                func.avg(Student.attendance_percentage).label("avg_attendance"),
                func.count(Student.id).label("student_count"),
            ).filter(Student.is_active == True),  # noqa: E712
            school_id, grade, gender,
        )
        .group_by(extract("month", Student.created_at))
        .order_by("month")
        .all()
    )

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    return [
        {
            "month": month_names[int(r.month) - 1],
            "average_attendance": round(float(r.avg_attendance), 2),
            "student_count": r.student_count,
        }
        for r in results
    ]


def get_risk_distribution(
    db: Session,
    school_id: Optional[int] = None,
    grade: Optional[str] = None,
    gender: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get risk level distribution."""
    latest_predictions = _latest_predictions(db, school_id, grade, gender)

    total = len(latest_predictions)
    if total == 0:
        return []

    high = sum(1 for p in latest_predictions if p.risk_level == RiskLevel.HIGH)
    medium = sum(1 for p in latest_predictions if p.risk_level == RiskLevel.MEDIUM)
    low = sum(1 for p in latest_predictions if p.risk_level == RiskLevel.LOW)

    return [
        {"risk_level": "high", "count": high, "percentage": round(high / total * 100, 2)},
        {"risk_level": "medium", "count": medium, "percentage": round(medium / total * 100, 2)},
        {"risk_level": "low", "count": low, "percentage": round(low / total * 100, 2)},
    ]


def get_school_comparison(
    db: Session,
    school_id: Optional[int] = None,
    grade: Optional[str] = None,
    gender: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get school-wise comparison data."""
    school_query = db.query(School)
    if school_id:
        school_query = school_query.filter(School.id == school_id)
    schools = school_query.all()
    result = []

    for school in schools:
        students = _apply_student_filters(
            db.query(Student).filter(
                Student.school_id == school.id, Student.is_active == True  # noqa: E712
            ),
            school.id, grade, gender,
        ).all()
        total = len(students)

        if total == 0:
            continue

        # Get latest predictions for school students
        student_ids = [s.id for s in students]
        predictions = _latest_predictions(db, school.id, grade, gender)
        predictions = [p for p in predictions if p.student_id in set(student_ids)]

        high = sum(1 for p in predictions if p.risk_level == RiskLevel.HIGH)
        medium = sum(1 for p in predictions if p.risk_level == RiskLevel.MEDIUM)
        low = sum(1 for p in predictions if p.risk_level == RiskLevel.LOW)
        dropout_rate = (high / total * 100) if total > 0 else 0
        avg_attendance = sum(s.attendance_percentage for s in students) / total

        result.append({
            "school_id": school.id,
            "school_name": school.name,
            "total_students": total,
            "high_risk_count": high,
            "medium_risk_count": medium,
            "low_risk_count": low,
            "dropout_rate": round(dropout_rate, 2),
            "average_attendance": round(avg_attendance, 2),
        })

    return result


def get_gender_analysis(
    db: Session,
    school_id: Optional[int] = None,
    grade: Optional[str] = None,
    gender: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get gender-wise analysis."""
    gender_query = db.query(Student.gender).filter(Student.is_active == True)  # noqa: E712
    gender_query = _apply_student_filters(gender_query, school_id, grade, None)
    genders = gender_query.distinct().all()
    result = []

    for (gender_value,) in genders:
        if gender and gender_value != gender:
            continue
        students = _apply_student_filters(
            db.query(Student).filter(
                Student.gender == gender_value, Student.is_active == True  # noqa: E712
            ),
            school_id, grade, None,
        ).all()
        total = len(students)

        if total == 0:
            continue

        student_ids = [s.id for s in students]
        predictions = (
            db.query(Prediction)
            .filter(Prediction.student_id.in_(student_ids))
            .distinct(Prediction.student_id)
            .order_by(Prediction.student_id, Prediction.created_at.desc())
            .all()
        )

        high = sum(1 for p in predictions if p.risk_level == RiskLevel.HIGH)
        dropout_rate = (high / total * 100) if total > 0 else 0

        result.append({
            "gender": gender_value.value if hasattr(gender_value, "value") else str(gender_value),
            "count": total,
            "high_risk_count": high,
            "dropout_rate": round(dropout_rate, 2),
        })

    return result


def get_analytics(
    db: Session,
    school_id: Optional[int] = None,
    grade: Optional[str] = None,
    gender: Optional[str] = None,
) -> Dict[str, Any]:
    """Get complete analytics data."""
    return {
        "dashboard_stats": get_dashboard_stats(db, school_id, grade, gender),
        "attendance_trend": get_attendance_trend(db, school_id, grade, gender),
        "risk_distribution": get_risk_distribution(db, school_id, grade, gender),
        "school_comparison": get_school_comparison(db, school_id, grade, gender),
        "gender_analysis": get_gender_analysis(db, school_id, grade, gender),
    }
