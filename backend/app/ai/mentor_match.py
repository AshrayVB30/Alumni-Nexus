import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from app.db.database import get_database
import asyncio

# Load the model
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Dimension for all-MiniLM-L6-v2 is 384
EMBEDDING_DIM = 384

# Global in-memory index for simplification, in production consider persistent vector DB like milvus or pinecone
index = faiss.IndexFlatL2(EMBEDDING_DIM)
id_map = {}  # Map faiss internal ID to user ID
current_faiss_id = 0

def generate_embedding(text: str) -> np.ndarray:
    if model is None:
        return np.zeros(EMBEDDING_DIM, dtype=np.float32)
    embedding = model.encode(text)
    return embedding.astype(np.float32)

async def sync_users_to_faiss():
    """
    Load all mentors from DB and generate their embeddings
    to populate the FAISS index.
    """
    global current_faiss_id, index, id_map
    
    db = get_database()
    users_collection = db["users"]
    
    index.reset()
    id_map = {}
    current_faiss_id = 0
    
    cursor = users_collection.find({"role": "Alumni"})
    async for user in cursor:
        profile = user.get("profile", {})
        skills = profile.get("skills", [])
        bio = profile.get("bio", "")
        
        # Professional info
        prof = profile.get("professional_info", {}) or {}
        company = prof.get("company_name", "")
        title = prof.get("job_title", "")
        industry = prof.get("industry", "")
        
        # Create a document string representing the mentor
        doc_str = f"Role: {title} at {company}. Industry: {industry}. Bio: {bio}. Skills: {', '.join(skills)}"
        if not title and not skills:
            continue
            
        emb = generate_embedding(doc_str)
        index.add(np.array([emb]))
        id_map[current_faiss_id] = user["_id"]
        current_faiss_id += 1
        
    print(f"Synced {current_faiss_id} mentors to FAISS.")

async def match_users(user_id: str, top_k: int = 5):
    """
    Find matching mentors for a student.
    """
    if current_faiss_id == 0:
        return []
        
    db = get_database()
    users_collection = db["users"]
    
    student = await users_collection.find_one({"_id": user_id})
    if not student:
        return []
        
    profile = student.get("profile", {})
    skills = profile.get("skills", [])
    interests = profile.get("interests", [])
    career_interests = profile.get("career_interests", [])
    
    # Create doc query from student profile
    query_str = f"Interests: {', '.join(interests)}. Career Interests: {', '.join(career_interests)}. Skills: {', '.join(skills)}"
    
    query_emb = generate_embedding(query_str)
    
    k = min(top_k, current_faiss_id)
    D, I = index.search(np.array([query_emb]), k)
    
    matches = []
    for idx in I[0]:
        if idx in id_map:
            matched_user_id = id_map[idx]
            matched_user = await users_collection.find_one({"_id": matched_user_id}, {"password": 0})
            if matched_user:
                matches.append(matched_user)
                
    return matches
