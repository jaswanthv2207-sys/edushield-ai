"""Prediction API routes."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
from app.database import get_db
from app.api.auth import get_current_active_user, require_role
from app.models.user import User
from app.schemas.prediction import (
    PredictionRequest, ManualPredictionRequest, BulkPredictionRequest,
    PredictionResponse, BulkPredictionResponse
)
from app.services import prediction_service, student_service

router = APIRouter(prefix="/predict", tags=["Predictions"])


@router.post("/manual", response_model=dict)
async def manual_prediction(
    features: ManualPredictionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Generate prediction from manual input features."""
    result = prediction_service.predict_manual(features)
    return result


@router.post("/bulk", response_model=BulkPredictionResponse)
async def bulk_prediction(
    request: BulkPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "principal"]))
):
    """Generate predictions for multiple students."""
    results = prediction_service.predict_bulk(db, request.student_ids)

    high_risk = sum(1 for r in results if r.risk_level.value == "high")
    medium_risk = sum(1 for r in results if r.risk_level.value == "medium")
    low_risk = sum(1 for r in results if r.risk_level.value == "low")

    return {
        "results": results,
        "total_processed": len(results),
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": low_risk,
    }


@router.post("/upload-csv")
async def upload_csv_predictions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "principal"]))
):
    """Upload CSV file for bulk prediction."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed"
        )

    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid CSV file: {str(e)}"
        )

    # Validate required columns
    required_columns = [
        "gender", "age", "attendance_percentage", "previous_failures",
        "final_grade", "family_support", "internet_access", "fee_status",
        "medical_condition", "higher_education_interest"
    ]

    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )

    # Convert DataFrame to list of dictionaries
    students_data = df.to_dict("records")

    # Get predictions
    from app.ml.model import predictor
    results = predictor.predict_bulk(students_data)

    high_risk = sum(1 for r in results if r["risk_level"] == "high")
    medium_risk = sum(1 for r in results if r["risk_level"] == "medium")
    low_risk = sum(1 for r in results if r["risk_level"] == "low")

    return {
        "results": results,
        "total_processed": len(results),
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": low_risk,
    }


@router.get("/history/{student_id}", response_model=List[PredictionResponse])
async def get_prediction_history(
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

    predictions = prediction_service.get_prediction_history(db, student_id)
    return predictions


# NOTE: this parameterised route is declared last on purpose so that the
# static paths above (/manual, /bulk, /upload-csv, /history/...) are not
# swallowed by the {student_id} path parameter.
@router.post("/{student_id}", response_model=PredictionResponse)
async def predict_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate prediction for a specific student."""
    prediction = prediction_service.predict_student(db, student_id)
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return prediction
