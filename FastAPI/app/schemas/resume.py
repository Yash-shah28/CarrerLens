from pydantic import BaseModel

class ResumeResponse(BaseModel):
    extracted_text: str
    ai_analysis: str
