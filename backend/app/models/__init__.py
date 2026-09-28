"""Database models."""
from app.models.user import User
from app.models.student import Student
from app.models.prediction import Prediction
from app.models.counselling import Counselling
from app.models.school import School
from app.models.report import Report

__all__ = ["User", "Student", "Prediction", "Counselling", "School", "Report"]
