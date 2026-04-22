export interface User {
  id: string;
  email: string;
  role: 'Student' | 'Alumni';
  name?: string;
}

export interface Profile {
  bio?: string;
  skills: string[];
  social_links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  academic_info?: {
    college_name?: string;
    branch?: string;
    current_year?: string;
    cgpa?: number;
  };
  professional_info?: {
    company_name?: string;
    job_title?: string;
    years_experience?: number;
    industry?: string;
  };
  mentorship_prefs?: {
    is_available?: boolean;
    domains?: string[];
    availability?: string;
  };
  projects?: Project[];
}

export interface Project {
  title?: string;
  description?: string;
  tech_stack: string[];
  github_link?: string;
}

export interface MarketplaceProject {
  _id: string;
  title: string;
  description: string;
  skills_required: string[];
  stipend?: string;
  duration?: string;
  posted_by: string;
  applicants?: string[];
  created_at?: string;
}

export interface Mentor {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: Profile;
}

export interface Message {
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  name: string;
  email?: string;
  last_message?: string;
  timestamp?: string;
}

export interface ForumPost {
  _id: string;
  content: string;
  author: string;
  author_name?: string;
  likes?: string[];
  comments?: Comment[];
  timestamp?: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: string;
  author_name?: string;
  timestamp?: string;
}
