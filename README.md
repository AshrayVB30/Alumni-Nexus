# Alumni Nexus

Alumni Nexus is an **AI-powered digital ecosystem** designed to bridge the gap between alumni and students. It facilitates intelligent mentorship, skill-based collaboration, and real-time networking through a unified platform accessible via Web and Mobile.

---

## 🚀 Key Features
- **Intelligent Mentorship**: Automated mentor matching using vector similarity search (FAISS).
- **Skill Marketplace**: A platform for alumni to post projects and students to apply.
- **Real-time Chat**: Integrated WebSocket-based messaging for instant guidance.
- **Cross-Platform**: Seamless experience across Web (Next.js) and Mobile (React Native/Expo).

## 📂 Project Structure
- `backend/`: FastAPI application with MongoDB Atlas and FAISS AI Integration.
- `frontend/`: Next.js 14 App Router application with Tailwind CSS & Shadcn UI.
- `mobile/`: Expo-based React Native application for Android and iOS.

---

## 🛠️ Detailed Documentation
For a deep dive into the architecture, database schema, AI logic, and API reference, please refer to the:
👉 **[Full Project Documentation](Project_Documentation.md)**

---

## 1. Setup Instructions

### Environment Configuration
The database URI is pre-configured in the root `.env` for quick start, but you should create your own for production:
```env
URI=your_mongodb_uri_here
SECRET_KEY=your_secret_key_here
```

### Backend Setup
1. `cd backend`
2. Create and activate a virtual environment:
   ```bash
   conda create -n alumni-nexus python=3.10 -y
   conda activate alumni-nexus
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server: `python run.py`
   *API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)*

### Web Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
   *Web App: [http://localhost:3000](http://localhost:3000)*

### Mobile App Setup (Expo)
1. `cd mobile`
2. Install dependencies: `npm install`
3. Start the project: `npx expo start`
   *Scan the QR code with the **Expo Go** app on your physical device.*

---

## 📊 Database Design
The project uses **MongoDB** with the following core collections:
- `users`: Identity, roles, and rich profiles.
- `messages`: WebSocket chat history logs.
- `projects`: Marketplace postings and applications.
- `posts`: Discussion forum threads and comments.

---

## 🧪 Sample API Requests

### Register a User
```bash
curl -X 'POST' 'http://localhost:8000/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"email": "student@example.com", "role": "Student", "password": "securepassword123"}'
```

### Mentorship AI Match
```bash
curl -X 'GET' 'http://localhost:8000/api/users/{user_id}/mentors'
```

---

## 🚢 Deployment

### Backend (Docker)
1. `docker build -t alumni-nexus-backend ./backend`
2. `docker run -d -p 8000:8000 -e URI='<mongo_uri>' alumni-nexus-backend`

### Frontend (Vercel)
Connect the repository to Vercel and it will automatically detect the Next.js project in the `/frontend` directory.

---

## 🤝 Maintainers
*   **Project Lead**: Alumni Nexus Team
*   **AI Engine**: FAISS + Sentence Transformers
*   **Stack**: FastAPI, Next.js, React Native

