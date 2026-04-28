from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str
    tagline: Optional[str] = None
    description: str
    skills_required: List[str]
    stipend: Optional[str] = "Unpaid"
    duration: str
    effort_level: Optional[str] = "Medium"
    location_type: Optional[str] = "Remote"
    students_needed: Optional[int] = 1
    deadline: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    title: str
    tagline: Optional[str]
    description: str
    skills_required: List[str]
    stipend: str
    duration: str
    effort_level: str
    location_type: str
    students_needed: int
    deadline: Optional[str]
    posted_by: str
    applicants: List[str]
    created_at: datetime

class StudentCompactProfile(BaseModel):
    id: str
    name: str
    email: str
    branch: Optional[str]
    current_year: Optional[str]

class ApplicationResponse(BaseModel):
    project_id: str
    students: List[StudentCompactProfile]
