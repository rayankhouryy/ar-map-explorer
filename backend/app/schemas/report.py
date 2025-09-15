from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.report import ReportReason, ReportStatus

class ReportBase(BaseModel):
    reason: ReportReason
    description: Optional[str] = Field(None, max_length=1000)

class ReportCreate(ReportBase):
    artifact_id: int

class ReportUpdate(BaseModel):
    status: ReportStatus

class ReportInDBBase(ReportBase):
    id: int
    artifact_id: int
    reporter_id: int
    status: ReportStatus
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Report(ReportInDBBase):
    pass
