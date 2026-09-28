"""Reports API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import os
import csv
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from app.database import get_db
from app.api.auth import get_current_active_user, require_role
from app.models.user import User
from app.models.report import Report, ReportType, ReportFormat
from app.services import analytics_service, student_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate")
async def generate_report(
    report_type: str,
    format: str,
    school_id: Optional[int] = None,
    student_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a report in specified format."""
    # Validate report type
    valid_types = ["school", "student", "risk", "monthly", "yearly"]
    if report_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid report type. Must be one of: {', '.join(valid_types)}"
        )

    # Validate format
    valid_formats = ["pdf", "excel", "csv"]
    if format not in valid_formats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid format. Must be one of: {', '.join(valid_formats)}"
        )

    # Generate report data
    analytics_data = analytics_service.get_analytics(db)

    # Create reports directory
    os.makedirs("reports", exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{report_type}_report_{timestamp}"

    if format == "pdf":
        filepath = f"reports/{filename}.pdf"
        _generate_pdf_report(filepath, report_type, analytics_data, school_id, student_id)
    elif format == "csv":
        filepath = f"reports/{filename}.csv"
        _generate_csv_report(filepath, report_type, analytics_data, school_id, student_id)
    else:
        filepath = f"reports/{filename}.xlsx"
        _generate_excel_report(filepath, report_type, analytics_data, school_id, student_id)

    # Save report record
    report = Report(
        report_type=ReportType(report_type),
        format=ReportFormat(format),
        title=f"{report_type.title()} Report",
        file_path=filepath,
        generated_by=current_user.id,
        school_id=school_id,
        parameters=str({"start_date": start_date, "end_date": end_date}),
    )
    db.add(report)
    db.commit()

    return {
        "message": "Report generated successfully",
        "file_path": filepath,
        "download_url": f"/api/reports/download/{report.id}"
    }


@router.get("/download/{report_id}")
async def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download a generated report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    if not os.path.exists(report.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file not found"
        )

    return FileResponse(
        report.file_path,
        filename=os.path.basename(report.file_path),
        media_type="application/octet-stream"
    )


@router.get("/")
async def get_reports(
    report_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of generated reports."""
    query = db.query(Report)

    if report_type:
        query = query.filter(Report.report_type == report_type)

    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return {
        "reports": reports,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


def _generate_pdf_report(filepath: str, report_type: str, data: dict, school_id: Optional[int], student_id: Optional[int]):
    """Generate PDF report."""
    doc = SimpleDocTemplate(filepath, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor('#1e40af')
    )
    elements.append(Paragraph(f"EduShield AI - {report_type.title()} Report", title_style))
    elements.append(Spacer(1, 0.2 * inch))

    # Generated date
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 0.3 * inch))

    # Dashboard stats
    stats = data.get("dashboard_stats", {})
    elements.append(Paragraph("Dashboard Statistics", styles['Heading2']))
    elements.append(Spacer(1, 0.1 * inch))

    stats_data = [
        ["Metric", "Value"],
        ["Total Students", str(stats.get("total_students", 0))],
        ["High Risk Students", str(stats.get("high_risk_count", 0))],
        ["Medium Risk Students", str(stats.get("medium_risk_count", 0))],
        ["Low Risk Students", str(stats.get("low_risk_count", 0))],
        ["Dropout Rate", f"{stats.get('dropout_rate', 0)}%"],
        ["Total Schools", str(stats.get("total_schools", 0))],
    ]

    stats_table = Table(stats_data, colWidths=[3 * inch, 2 * inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(stats_table)
    elements.append(Spacer(1, 0.3 * inch))

    # Risk distribution
    elements.append(Paragraph("Risk Distribution", styles['Heading2']))
    elements.append(Spacer(1, 0.1 * inch))

    risk_data = [["Risk Level", "Count", "Percentage"]]
    for item in data.get("risk_distribution", []):
        risk_data.append([
            item["risk_level"].title(),
            str(item["count"]),
            f"{item['percentage']}%"
        ])

    risk_table = Table(risk_data, colWidths=[2 * inch, 1.5 * inch, 1.5 * inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(risk_table)

    doc.build(elements)


def _generate_csv_report(filepath: str, report_type: str, data: dict, school_id: Optional[int], student_id: Optional[int]):
    """Generate CSV report."""
    with open(filepath, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)

        # Write header
        writer.writerow(["EduShield AI - Report"])
        writer.writerow(["Report Type", report_type.title()])
        writer.writerow(["Generated On", datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
        writer.writerow([])

        # Write dashboard stats
        writer.writerow(["Dashboard Statistics"])
        stats = data.get("dashboard_stats", {})
        for key, value in stats.items():
            writer.writerow([key.replace("_", " ").title(), value])
        writer.writerow([])

        # Write risk distribution
        writer.writerow(["Risk Distribution"])
        writer.writerow(["Risk Level", "Count", "Percentage"])
        for item in data.get("risk_distribution", []):
            writer.writerow([item["risk_level"], item["count"], item["percentage"]])


def _generate_excel_report(filepath: str, report_type: str, data: dict, school_id: Optional[int], student_id: Optional[int]):
    """Generate Excel report using pandas."""
    import pandas as pd

    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        # Dashboard stats
        stats = data.get("dashboard_stats", {})
        stats_df = pd.DataFrame([stats])
        stats_df.to_excel(writer, sheet_name='Dashboard Stats', index=False)

        # Risk distribution
        risk_df = pd.DataFrame(data.get("risk_distribution", []))
        risk_df.to_excel(writer, sheet_name='Risk Distribution', index=False)

        # School comparison
        school_df = pd.DataFrame(data.get("school_comparison", []))
        school_df.to_excel(writer, sheet_name='School Comparison', index=False)

        # Gender analysis
        gender_df = pd.DataFrame(data.get("gender_analysis", []))
        gender_df.to_excel(writer, sheet_name='Gender Analysis', index=False)
