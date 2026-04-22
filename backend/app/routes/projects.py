from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..db.database import get_database
from ..schemas.project import ProjectCreate, ProjectResponse, StudentCompactProfile
from ..auth.auth_bearer import get_alumni_user, get_student_user, get_current_user
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/", summary="Create a new project (Alumni only)")
async def create_project(
    project: ProjectCreate, 
    user: dict = Depends(get_alumni_user)
):
    db = get_database()
    projects_coll = db["projects"]
    proj_id = str(uuid.uuid4())
    
    new_proj = {
        "_id": proj_id,
        "title": project.title,
        "description": project.description,
        "skills_required": project.skills_required,
        "stipend": project.stipend,
        "duration": project.duration,
        "posted_by": user["user_id"],
        "applicants": [],
        "created_at": datetime.utcnow()
    }
    await projects_coll.insert_one(new_proj)
    return {"message": "Project created successfully", "id": proj_id}

@router.get("/", summary="List all projects")
async def list_projects():
    db = get_database()
    projects_coll = db["projects"]
    cursor = projects_coll.find().sort("created_at", -1)
    projects = []
    async for p in cursor:
        p["id"] = p["_id"]
        projects.append(p)
    return projects

@router.post("/{project_id}/apply", summary="Apply to a project (Student only)")
async def apply_project(
    project_id: str, 
    user: dict = Depends(get_student_user)
):
    db = get_database()
    projects_coll = db["projects"]
    
    # Check if project exists
    project = await projects_coll.find_one({"_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if already applied
    if user["user_id"] in project.get("applicants", []):
        raise HTTPException(status_code=400, detail="You have already applied to this project")
    
    result = await projects_coll.update_one(
        {"_id": project_id},
        {"$addToSet": {"applicants": user["user_id"]}}
    )
    
    return {"message": "Application submitted successfully"}

@router.get("/{project_id}/applicants", summary="Get list of applicants for a project (Owner only)")
async def get_applicants(
    project_id: str, 
    user: dict = Depends(get_alumni_user)
):
    db = get_database()
    projects_coll = db["projects"]
    users_coll = db["users"]
    
    project = await projects_coll.find_one({"_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["posted_by"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="You are not authorized to view applicants for this project")
    
    # Fetch student profiles for all applicants
    applicant_ids = project.get("applicants", [])
    applicants = []
    
    for student_id in applicant_ids:
        s_user = await users_coll.find_one({"_id": student_id})
        if s_user:
            profile = s_user.get("profile", {})
            acad = profile.get("academic_info", {})
            applicants.append({
                "id": student_id,
                "name": s_user.get("name") or s_user.get("email"),
                "email": s_user.get("email"),
                "branch": acad.get("branch"),
                "current_year": acad.get("current_year")
            })
            
    return applicants
