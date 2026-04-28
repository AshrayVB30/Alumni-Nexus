# Alumni Nexus: Comprehensive Project Documentation

Alumni Nexus is a state-of-the-art, AI-powered digital ecosystem designed to bridge the gap between alumni and students. It facilitates mentorship, skill-based collaboration, and real-time networking through a unified platform accessible via Web and Mobile.

---

## 1. Project Vision & Objectives

### Vision
To empower educational communities by leveraging AI to create meaningful connections, enabling knowledge transfer, and accelerating career growth through a seamless digital experience.

### Key Objectives
*   **Intelligent Mentorship**: Automated mentor matching using vector similarity search (FAISS).
*   **Skill Marketplace**: A platform for alumni to post projects and students to apply, fostering practical learning.
*   **Real-time Communication**: Integrated WebSocket-based chat for instant guidance.
*   **Knowledge Hub**: A community forum for long-form discussions and institutional updates.
*   **Admin Governance**: A premium portal for platform analytics, user verification, and content moderation.
*   **Cross-Platform Access**: Native-feel experience on both web (Next.js) and mobile (React Native/Expo).

---

## 2. System Architecture

The project follows a modern decoupled architecture:

```mermaid
graph TD
    subgraph "Clients"
        Web[Next.js Web App]
        Mobile[Expo React Native App]
    end

    subgraph "Backend Tier"
        API[FastAPI Server]
        WS[WebSocket Manager]
    end

    subgraph "Data & AI Layer"
        DB[(MongoDB Atlas)]
        FAISS[FAISS Vector Index]
        Model[all-MiniLM-L6-v2]
    end

    Web <-->|REST / WS| API
    Mobile <-->|REST / WS| API
    API <-->|Motor Async| DB
    API <-->|In-Memory| FAISS
    FAISS <-->|Embeddings| Model
```

---

## 3. Technology Stack

### Backend (The "Brain")
*   **Runtime**: Python 3.10+
*   **Web Framework**: FastAPI (Asynchronous, High Performance)
*   **Database**: MongoDB (NoSQL) with **Motor** for async operations.
*   **AI/ML**: 
    *   **FAISS**: Facebook AI Similarity Search for high-speed vector indexing.
    *   **Sentence-Transformers**: `all-MiniLM-L6-v2` for generating semantic embeddings.
*   **Authentication**: JWT (JSON Web Tokens) with `Passlib` (bcrypt) for secure password hashing.
*   **Real-time**: Python WebSockets for live chat functionality.

### Web Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript (Strict typing)
*   **Styling**: Tailwind CSS with **Framer Motion** for premium animations.
*   **Charts**: **Recharts** for real-time data visualization in the Admin Portal.
*   **UI Components**: Custom Design System with glassy cards and soft shadows.
*   **Icons**: Lucide React.
*   **State Management**: Zustand & React Hooks.

### Mobile App
*   **Framework**: React Native with **Expo**.
*   **Navigation**: React Navigation (Stack & Tab).
*   **Icons**: Expo Vector Icons.
*   **API Client**: Axios with interceptors for auth management.

---

## 4. Admin Portal: System Governance

The platform includes a **Premium Admin Dashboard** designed for institutional oversight:

### Modules
*   **Analytics Dashboard**: Real-time visualization of user growth, active engagement, and platform health.
*   **User Management**: Unified interface for verifying alumni, managing roles, and auditing user activity.
*   **Content Moderation**: Tools to monitor and moderate community posts and project listings.
*   **System Logs**: Live feed of platform events and security audits.

### Design Aesthetics
The Admin Portal utilizes a **Glassmorphic SaaS Theme**:
- 26px font-weight for primary headers.
- 16px border-radius for cards.
- Consistent 70/30 layout for data-rich sections.
- Integrated `DashboardLayout` for unified navigation.

---

## 5. Database Schema (MongoDB)

### `users` Collection
The core collection storing identity and rich profile data.
```json
{
  "_id": "uuid-string",
  "name": "Full Name",
  "email": "user@example.com",
  "password": "hashed_password",
  "role": "Student | Alumni | Admin",
  "is_verified": true,
  "profile": {
    "bio": "Text description",
    "skills": ["Python", "Design"],
    "interests": ["AI", "Fintech"],
    "academic_info": { "college": "...", "branch": "...", "cgpa": 8.5 },
    "professional_info": { "company": "...", "title": "...", "experience": 5 },
    "mentorship_prefs": { "is_available": true, "domains": ["Web Dev"] }
  }
}
```

### `projects` Collection (Marketplace)
```json
{
  "_id": "uuid-string",
  "title": "Project Title",
  "description": "Project details",
  "posted_by": "alumni_id",
  "skills_required": ["React", "Node"],
  "status": "Open | Closed",
  "applicants": ["student_id_1", "student_id_2"]
}
```

---

## 6. AI Matching Engine: Deep Dive

The "AI Match" feature uses a **Vector Space Model** to find the most relevant mentors for a student.

1.  **Preprocessing**: On startup, all Alumni profiles are flattened into "Document Strings" containing their title, company, skills, and industry.
2.  **Vectorization**: The `all-MiniLM-L6-v2` model converts these strings into 384-dimensional floating-point vectors.
3.  **Indexing**: These vectors are loaded into a FAISS `IndexFlatL2`.
4.  **Querying**: When a student requests a match, their interests and skills are vectorized and compared against the index using Euclidean distance (L2).
5.  **Efficiency**: This allows the platform to search through thousands of alumni in milliseconds.

---

## 7. API Reference

### Auth Module (`/api/auth`)
*   `POST /register`: Onboard new users.
*   `POST /login`: Generate JWT tokens.

### User Module (`/api/users`)
*   `GET /me`: Fetch authenticated user profile.
*   `PUT /{id}/profile`: Update profile information.
*   `GET /{id}/mentors`: **AI matching endpoint**.

### Marketplace Module (`/api/projects`)
*   `GET /`: Fetch all projects.
*   `POST /`: Create a new project (Alumni only).
*   `POST /{id}/apply`: Apply for a project (Student only).

### Forum Module (`/api/posts`)
*   `GET /`: Fetch forum feed.
*   `POST /`: Create a new post.
*   `POST /{id}/comment`: Add a comment to a post.

### Communication Module (`/api/chat`)
*   `WS /ws/{token}`: Real-time messaging entry point.
*   `GET /conversations`: List active chat threads.
*   `GET /history/{user_id}`: Retrieve message logs.

### Admin Module (`/api/admin`)
*   `GET /analytics`: Fetch platform performance data.
*   `GET /users`: Paginated list of users for management.
*   `POST /users/{id}/verify`: verify or unverify a user.

---

## 8. Development Roadmap

- [x] Phase 1: Core Authentication & Profile Management.
- [x] Phase 2: AI Mentor Matching with FAISS.
- [x] Phase 3: Real-time Chat & WebSockets.
- [x] Phase 4: Skill Marketplace & Project Application.
- [x] Phase 5: Mobile App development with Expo.
- [x] Phase 6: **Premium Admin Dashboard & Analytics**.
- [ ] Phase 7: Video conferencing integration (WebRTC).
- [ ] Phase 8: Automated Resume Reviewer (LLM Integration).
- [ ] Phase 9: Global Notification System (Push/Email).

---

## 9. Maintainer Notes
*   **Vector Sync**: The FAISS index is updated on server startup. In a scaling environment, this should be moved to a background task or a dedicated vector database.
*   **Security**: Ensure `DashboardLayout` protection logic is consistently applied to all administrative routes.

