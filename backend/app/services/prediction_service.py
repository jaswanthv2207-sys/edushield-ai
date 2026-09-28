"""Prediction service for ML model interactions."""
import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.prediction import Prediction, RiskLevel
from app.ml.model import predictor
from app.schemas.prediction import ManualPredictionRequest


def predict_student(db: Session, student_id: int) -> Optional[Prediction]:
    """Generate prediction for a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return None

    # Prepare features
    features = {
        "age": student.age,
        "attendance_percentage": student.attendance_percentage,
        "previous_failures": student.previous_failures,
        "final_grade": student.final_grade,
        "study_time_weekly": student.study_time_weekly,
        "distance_from_school": student.distance_from_school,
        "gender": student.gender.value,
        "family_support": student.family_support.value,
        "internet_access": student.internet_access,
        "fee_status": student.fee_status.value,
        "medical_condition": student.medical_condition.value,
        "higher_education_interest": student.higher_education_interest,
    }

    # Get prediction from ML model
    result = predictor.predict(features)

    # Save prediction to database
    db_prediction = Prediction(
        student_id=student_id,
        risk_level=RiskLevel(result["risk_level"]),
        risk_percentage=result["risk_percentage"],
        confidence_score=result["confidence_score"],
        risk_factors=json.dumps(result["risk_factors"]),
        recommendations=json.dumps(result["recommendations"]),
        intervention_suggested=result["intervention_suggested"],
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return db_prediction


def predict_manual(features: ManualPredictionRequest) -> Dict[str, Any]:
    """Generate prediction from manual input features."""
    feature_dict = {
        "age": features.age,
        "attendance_percentage": features.attendance_percentage,
        "previous_failures": features.previous_failures,
        "final_grade": features.final_grade,
        "study_time_weekly": features.study_time_weekly,
        "distance_from_school": features.distance_from_school,
        "gender": features.gender,
        "family_support": features.family_support,
        "internet_access": features.internet_access,
        "fee_status": features.fee_status,
        "medical_condition": features.medical_condition,
        "higher_education_interest": features.higher_education_interest,
    }

    return predictor.predict(feature_dict)


def predict_bulk(db: Session, student_ids: List[int]) -> List[Prediction]:
    """Generate predictions for multiple students and persist the results."""
    students = db.query(Student).filter(Student.id.in_(student_ids)).all()

    features_list = []
    ordered_students = []
    for student in students:
        ordered_students.append(student)
        features_list.append({
            "age": student.age,
            "attendance_percentage": student.attendance_percentage,
            "previous_failures": student.previous_failures,
            "final_grade": student.final_grade,
            "study_time_weekly": student.study_time_weekly,
            "distance_from_school": student.distance_from_school,
            "gender": student.gender.value,
            "family_support": student.family_support.value,
            "internet_access": student.internet_access,
            "fee_status": student.fee_status.value,
            "medical_condition": student.medical_condition.value,
            "higher_education_interest": student.higher_education_interest,
        })

    results = predictor.predict_bulk(features_list) if features_list else []

    # Save predictions to database
    saved: List[Prediction] = []
    for student, result in zip(ordered_students, results):
        db_prediction = Prediction(
            student_id=student.id,
            risk_level=RiskLevel(result["risk_level"]),
            risk_percentage=result["risk_percentage"],
            confidence_score=result["confidence_score"],
            risk_factors=json.dumps(result["risk_factors"]),
            recommendations=json.dumps(result["recommendations"]),
            intervention_suggested=result["intervention_suggested"],
        )
        db.add(db_prediction)
        saved.append(db_prediction)

    db.commit()
    for prediction in saved:
        db.refresh(prediction)

    return saved


def get_prediction_history(db: Session, student_id: int) -> List[Prediction]:
    """Get prediction history for a student."""
    return (
        db.query(Prediction)
        .filter(Prediction.student_id == student_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
