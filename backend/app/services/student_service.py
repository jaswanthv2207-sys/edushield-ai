"""Student service for CRUD operations."""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models.student import Student
from app.models.prediction import Prediction, RiskLevel
from app.schemas.student import StudentCreate, StudentUpdate, StudentFilters


def get_students(
    db: Session,
    filters: StudentFilters,
    school_id: Optional[int] = None
) -> tuple[List[Student], int]:
    """Get paginated students with filters."""
    query = db.query(Student).filter(Student.is_active == True)

    # Apply school filter
    if school_id:
        query = query.filter(Student.school_id == school_id)
    if filters.school_id:
        query = query.filter(Student.school_id == filters.school_id)

    # Search filter
    if filters.search:
        search = f"%{filters.search}%"
        query = query.filter(
            or_(
                Student.full_name.ilike(search),
                Student.student_id.ilike(search),
                Student.email.ilike(search),
            )
        )

    # Grade filter
    if filters.grade:
        query = query.filter(Student.grade == filters.grade)

    # Gender filter
    if filters.gender:
        query = query.filter(Student.gender == filters.gender)

    # Fee status filter
    if filters.fee_status:
        query = query.filter(Student.fee_status == filters.fee_status)

    # Attendance range filter
    if filters.min_attendance is not None:
        query = query.filter(Student.attendance_percentage >= filters.min_attendance)
    if filters.max_attendance is not None:
        query = query.filter(Student.attendance_percentage <= filters.max_attendance)

    # Risk level filter (join with predictions)
    if filters.risk_level:
        query = query.join(Prediction).filter(Prediction.risk_level == filters.risk_level)

    # Sorting
    sort_column = getattr(Student, filters.sort_by, Student.created_at)
    if filters.sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Pagination
    total = query.count()
    students = query.offset((filters.page - 1) * filters.page_size).limit(filters.page_size).all()

    return students, total


def get_student_by_id(db: Session, student_id: int) -> Optional[Student]:
    """Get student by ID."""
    return db.query(Student).filter(Student.id == student_id, Student.is_active == True).first()


def get_student_by_student_id(db: Session, student_id: str) -> Optional[Student]:
    """
    Get student by student_id field.

    Deliberately not filtered on ``is_active``: this is used to enforce the
    unique constraint on ``student_id``, which applies to soft-deleted rows
    too. Without this, re-using the ID of a deleted student raises an
    IntegrityError (HTTP 500) instead of a validation error.
    """
    return db.query(Student).filter(Student.student_id == student_id).first()


def create_student(db: Session, student_data: StudentCreate) -> Student:
    """Create a new student."""
    db_student = Student(**student_data.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def update_student(db: Session, student_id: int, student_data: StudentUpdate) -> Optional[Student]:
    """Update an existing student."""
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return None

    update_data = student_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_student, field, value)

    db.commit()
    db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int) -> bool:
    """Soft delete a student."""
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return False

    db_student.is_active = False
    db.commit()
    return True


def get_student_prediction_history(db: Session, student_id: int) -> List[Prediction]:
    """Get prediction history for a student."""
    return (
        db.query(Prediction)
        .filter(Prediction.student_id == student_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )


def bulk_create_students(db: Session, students_data: List[StudentCreate]) -> List[Student]:
    """Bulk create students."""
    db_students = [Student(**data.model_dump()) for data in students_data]
    db.add_all(db_students)
    db.commit()
    for student in db_students:
        db.refresh(student)
    return db_students
