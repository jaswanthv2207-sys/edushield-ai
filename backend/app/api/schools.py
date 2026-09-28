"""School API routes."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.auth import get_current_active_user, require_role
from app.models.user import User
from app.models.school import School
from app.schemas.school import SchoolCreate, SchoolResponse, SchoolListResponse

router = APIRouter(prefix="/schools", tags=["Schools"])


@router.get("/", response_model=SchoolListResponse)
async def get_schools(
    search: Optional[str] = None,
    district: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get paginated list of schools."""
    query = db.query(School)

    if search:
        query = query.filter(School.name.ilike(f"%{search}%"))
    if district:
        query = query.filter(School.district == district)

    total = query.count()
    schools = query.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size

    return {
        "schools": schools,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{school_id}", response_model=SchoolResponse)
async def get_school(
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get school by ID."""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )
    return school


@router.post("/", response_model=SchoolResponse, status_code=status.HTTP_201_CREATED)
async def create_school(
    school_data: SchoolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create a new school (admin only)."""
    existing = db.query(School).filter(School.code == school_data.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A school with this code already exists"
        )
    school = School(**school_data.model_dump())
    db.add(school)
    db.commit()
    db.refresh(school)
    return school


@router.put("/{school_id}", response_model=SchoolResponse)
async def update_school(
    school_id: int,
    school_data: SchoolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update a school (admin only)."""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    update_data = school_data.model_dump(exclude_unset=True)
    if "code" in update_data:
        conflict = (
            db.query(School)
            .filter(School.code == update_data["code"], School.id != school_id)
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A school with this code already exists"
            )
    for field, value in update_data.items():
        setattr(school, field, value)

    db.commit()
    db.refresh(school)
    return school


@router.delete("/{school_id}")
async def delete_school(
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Delete a school (admin only)."""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    db.delete(school)
    db.commit()
    return {"message": "School deleted successfully"}
