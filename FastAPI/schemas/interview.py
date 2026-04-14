from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime

class TranscriptMessageSchema(BaseModel):
    speaker: str
    message: str
    timestamp: Optional[float] = None

class TranscriptSchema(BaseModel):
    candidate_name: str
    transcript: List[TranscriptMessageSchema]
    room_id: str
    resume_text: Optional[str] = None
    jd_text: Optional[str] = None
    created_at: Optional[datetime] = None

class SummarySchema(BaseModel):
    candidate_name: str
    summary: Dict[str, Any]
    room_id: str
    timestamp: float
    transcript_id: Optional[str] = None
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class InterviewResponseSchema(BaseModel):
    status: str
    summary: SummarySchema
