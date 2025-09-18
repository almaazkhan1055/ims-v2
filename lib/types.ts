export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  company?: {
    name: string;
    department: string;
    title: string;
  };
  address?: {
    city: string;
    state: string;
  };
  // Custom fields for interview management
  role?: string;
  interviewStatus?: 'scheduled' | 'completed' | 'no-show' | 'cancelled';
  averageScore?: number;
}

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'ta_member' | 'panelist';

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

export interface SessionData {
  user: AuthResponse;
  role: UserRole;
  token: string;
}

export interface FeedbackForm {
  overallScore: number;
  strengths: string;
  areasForImprovement: string;
  candidateId: number;
  panelId: number;
}

export interface DashboardMetrics {
  interviewsThisWeek: number;
  averageFeedbackScore: number;
  noShows: number;
  totalCandidates: number;
}

export interface FilterOptions {
  role?: string;
  interviewer?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  status?: string;
}