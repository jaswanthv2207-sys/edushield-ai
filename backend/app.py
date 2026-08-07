from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="EduShield AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class Student(BaseModel):
    attendance: float
    cgpa: float
    income: str
    backlogs: int


@app.get("/")
def home():
    return {"message": "EduShield AI Backend Running"}


@app.post("/predict")
def predict(student: Student):
    score = 0

    if student.attendance < 60:
        score += 40

    if student.cgpa < 6:
        score += 30

    if student.income.lower() == "low":
        score += 15

    if student.backlogs >= 2:
        score += 15

    level = (
        "High Risk"
        if score >= 80
        else "Medium Risk"
        if score >= 50
        else "Low Risk"
    )

    return {
        "risk": score,
        "level": level,
        "reasons": [
            "Low Attendance",
            "Poor Academic Performance",
            "Financial Difficulty",
        ],
        "recommendations": [
            "Schedule counselling",
            "Assign faculty mentor",
            "Parent meeting",
            "Scholarship support",
        ],
    }