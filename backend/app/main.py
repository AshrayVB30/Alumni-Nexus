from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, users, projects, posts, chat
import asyncio

app = FastAPI(title="Alumni Nexus API", description="AI-powered digital ecosystem for alumni", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users & Profiles"])
app.include_router(projects.router, prefix="/api/projects", tags=["Skill Marketplace"])
app.include_router(posts.router, prefix="/api/posts", tags=["Discussion Forum"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat WebSockets"])

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    # Import locally to avoid circular dependencies if any
    from app.ai.mentor_match import sync_users_to_faiss
    asyncio.create_task(sync_users_to_faiss())

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to Alumni Nexus API"}
