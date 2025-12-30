from typing import List, Optional
from pydantic import BaseModel

class PersonalInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class Experience(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class Project(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None

class Education(BaseModel):
    degree: Optional[str] = None
    school: Optional[str] = None
    year: Optional[str] = None

class ResumeData(BaseModel):
    personal_info: PersonalInfo
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[Experience] = []
    projects: List[Project] = []
    education: List[Education] = []
    certifications: List[str] = []

class ResumeResponse(BaseModel):
    # extracted_text: str
    # links: list[str]
    data: ResumeData
