# Alumni Nexus

An AI-powered digital ecosystem for alumni engagement, mentorship, and career development.

## Project Structure
- `backend/`: FastAPI application with MongoDB and FAISS AI Integration.
- `frontend/`: Next.js 14 App Router application integrated with Tailwind CSS.

## 1. Setup Instructions

### Environment Variables
Check the `.env` file at the root. The database URI is already pre-configured:
```env
URI=mongodb+srv://AlumniNexus:AlumniNexus2026@cluster0.26w6w1y.mongodb.net/
```

### Backend Setup
1. Navigate to the `backend` folder: `cd backend`
2. We recommend creating a virtual environment:
   ```bash
   conda create -n alumni-nexus python=3.10 -y
   conda activate alumni-nexus
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The server will start at `http://localhost:8000`. You can access the auto-generated Swagger documentation at `http://localhost:8000/docs`.*

### Frontend Setup
1. Navigate to the `frontend` folder: `cd frontend`
2. Install Node dependencies (already installed during scaffolding, but to ensure):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend will start at `http://localhost:3000`.*

## 2. Database Design (MongoDB Collections)

- **`users`**: Stores user authentication and profile data. Handles `Student`, `Alumni`, and `Admin` roles. Profiles are nested JSON.
- **`messages`**: Used for the Chat system. Contains sender, receiver, message content, and timestamps.
- **`projects`**: The Skill Marketplace collection. Tracks `title`, `description`, project owner (`posted_by`), and an array of `applicants` string IDs.
- **`posts`**: Discussion Forum posts. Includes `content`, `author`, embedded `comments` list, and `likes` array.

## 3. Sample API Requests

### Register a User
```bash
curl -X 'POST' \
  'http://localhost:8000/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "student@example.com",
  "role": "Student",
  "password": "securepassword123"
}'
```

### Mentorship AI Match
Retrieves top 5 generated embeddings via FAISS similarity matching:
```bash
curl -X 'GET' \
  'http://localhost:8000/api/users/{user_id}/mentors' \
  -H 'accept: application/json'
```

### Real-Time WebSocket Chat Test (JS Example)
```javascript
const ws = new WebSocket("ws://localhost:8000/ws/{your_user_id}");
ws.onmessage = function(event) {
    console.log(event.data);
};
ws.send(JSON.stringify({"receiver_id": "other_id", "message": "Hi Mentor!"}));
```

## 4. Deployment Steps

### Backend
The backend includes a `Dockerfile`.
1. Build the image: `docker build -t alumni-nexus-backend ./backend`
2. Run the container: `docker run -d -p 8000:8000 -e URI='<mongo_uri>' alumni-nexus-backend`
   - *Deploy standard FastAPI Docker containers on AWS ECS, Render, or DigitalOcean App Platform.*

### Frontend
1. The Next.js frontend is production-ready for Vercel.
2. In the Vercel dashboard, attach the repository, select Next.js, and deploy.
