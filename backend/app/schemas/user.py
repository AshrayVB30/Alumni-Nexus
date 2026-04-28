from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class SocialLinks(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class Project(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: List[str] = []
    github_link: Optional[str] = None

class MentorshipPrefs(BaseModel):
    is_available: bool = False
    domains: List[str] = []
    availability: Optional[str] = None

class StudentAcademic(BaseModel):
    college_name: Optional[str] = None
    branch: Optional[str] = None
    current_year: Optional[str] = None
    cgpa: Optional[float] = None

    @field_validator('cgpa', mode='before')
    @classmethod
    def parse_cgpa(cls, v):
        if v == "" or v is None:
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

class AlumniEducation(BaseModel):
    college_name: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[str] = None

class AlumniProfessional(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    years_experience: Optional[int] = 0
    industry: Optional[str] = None

    @field_validator('years_experience', mode='before')
    @classmethod
    def parse_years_experience(cls, v):
        if v == "" or v is None:
            return 0
        try:
            return int(v)
        except (ValueError, TypeError):
            return 0

class ProfileBase(BaseModel):
    # Common
    profile_photo: Optional[str] = None
    bio: Optional[str] = None
    current_company: Optional[str] = None
    designation: Optional[str] = None
    location: Optional[str] = None
    followers_count: int = 0
    following_count: int = 0
    connections_count: int = 0
    followers: List[str] = []
    following: List[str] = []
    
    skills: List[str] = []
    interests: List[str] = []
    career_interests: List[str] = []
    social_links: SocialLinks = SocialLinks()
    
    # Student specific
    academic_info: Optional[StudentAcademic] = None
    projects: List[Project] = []
    resume_url: Optional[str] = None
    
    # Alumni specific
    education_info: Optional[AlumniEducation] = None
    professional_info: Optional[AlumniProfessional] = None
    mentorship_prefs: Optional[MentorshipPrefs] = None
    verification_url: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    usn: str = Field(..., description="University Seat Number (required and unique)")
    year_of_passing: str = Field(..., description="Year of passing/graduation")
    phone_number: Optional[str] = None
    department: Optional[str] = None
    role: str = Field(default="student", description="Role can be student, alumni, or admin")
    is_verified: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(UserBase):
    name: str
    password: str

class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    usn: Optional[str] = None
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    profile: ProfileBase = ProfileBase()

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    year_of_passing: Optional[str] = None
    profile: Optional[ProfileBase] = None
