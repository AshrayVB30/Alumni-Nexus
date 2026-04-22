from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str
    description: str
    skills_required: List[str]
    stipend: Optional[str] = "Unpaid"
    duration: str

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: str
    skills_required: List[str]
    stipend: str
    duration: str
    posted_by: str
    applicants: List[str] # List of Student IDs
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
