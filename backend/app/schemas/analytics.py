"""Analytics schemas."""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class DashboardStats(BaseModel):
    """Dashboard KPI statistics."""
    total_students: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    dropout_rate: float
    total_schools: int
    total_counsellors: int
    active_counselling_sessions: int


class AttendanceTrend(BaseModel):
    """Attendance trend data point."""
    month: str
    average_attendance: float
    student_count: int


class RiskDistribution(BaseModel):
    """Risk distribution data."""
    risk_level: str
    count: int
    percentage: float


class SchoolComparison(BaseModel):
    """School comparison data."""
    school_id: int
    school_name: str
    total_students: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    dropout_rate: float
    average_attendance: float


class GenderAnalysis(BaseModel):
    """Gender analysis data."""
    gender: str
    count: int
    high_risk_count: int
    dropout_rate: float


class AnalyticsResponse(BaseModel):
    """Complete analytics response."""
    dashboard_stats: DashboardStats
    attendance_trend: List[AttendanceTrend]
    risk_distribution: List[RiskDistribution]
    school_comparison: List[SchoolComparison]
    gender_analysis: List[GenderAnalysis]


class ReportRequest(BaseModel):
    """Report generation request."""
    report_type: str  # school, student, risk, monthly, yearly
    format: str  # pdf, excel, csv
    school_id: Optional[int] = None
    student_id: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
