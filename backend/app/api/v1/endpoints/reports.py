from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user, get_current_admin
from app.models.report import Report, ReportStatus
from app.models.artifact import Artifact
from app.models.user import User
from app.schemas.report import Report as ReportSchema, ReportCreate, ReportUpdate

router = APIRouter()

@router.post("/", response_model=ReportSchema)
def create_report(
    *,
    db: Session = Depends(get_db),
    report_in: ReportCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new content report.
    """
    # Check if artifact exists
    artifact = db.query(Artifact).filter(Artifact.id == report_in.artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    # Check if user already reported this artifact
    existing_report = db.query(Report).filter(
        Report.artifact_id == report_in.artifact_id,
        Report.reporter_id == current_user.id
    ).first()
    
    if existing_report:
        raise HTTPException(status_code=400, detail="You have already reported this artifact")
    
    # Create report
    report = Report(
        artifact_id=report_in.artifact_id,
        reporter_id=current_user.id,
        reason=report_in.reason,
        description=report_in.description,
        status=ReportStatus.PENDING
    )
    
    db.add(report)
    
    # Increment report count on artifact
    artifact.report_count += 1
    db.add(artifact)
    
    db.commit()
    db.refresh(report)
    
    return report

@router.get("/", response_model=List[ReportSchema])
def list_reports(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 50,
    status: ReportStatus = None,
) -> Any:
    """
    List all reports. Admin only.
    """
    query = db.query(Report)
    
    if status:
        query = query.filter(Report.status == status)
    
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    return reports

@router.patch("/{report_id}", response_model=ReportSchema)
def update_report(
    *,
    db: Session = Depends(get_db),
    report_id: int,
    report_in: ReportUpdate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Update report status. Admin only.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Update status
    report.status = report_in.status
    
    if report_in.status in [ReportStatus.RESOLVED, ReportStatus.DISMISSED]:
        from sqlalchemy.sql import func
        report.resolved_at = func.now()
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report
