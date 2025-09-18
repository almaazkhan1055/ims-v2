import { User, Todo, Post, FilterOptions } from './types';

const API_BASE = 'https://dummyjson.com';

export class ApiService {
  static async getUsers(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    try {
      // Validate inputs
      const validPage = Math.max(1, Math.floor(page));
      const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));
      const skip = (validPage - 1) * validLimit;
      
      const response = await fetch(`${API_BASE}/users?limit=${validLimit}&skip=${skip}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.users || !Array.isArray(data.users)) {
        return { users: [], total: 0 };
      }
      
      // Simulate interview-specific fields
      const users = data.users.map((user: any) => ({
        ...user,
        interviewStatus: this.getRandomStatus(),
        averageScore: Math.floor(Math.random() * 5) + 1,
      }));

      return {
        users,
        total: data.total || 0,
      };
    } catch (error) {
      console.error('API Error - getUsers:', error);
      throw new Error('Failed to load candidates. Please try again.');
    }
  }

  static async getUserById(id: number): Promise<User> {
    try {
      // Validate input
      const validId = Math.max(1, Math.floor(id));
      
      const response = await fetch(`${API_BASE}/users/${validId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Candidate not found');
        }
        throw new Error(`Failed to fetch candidate: ${response.status} ${response.statusText}`);
      }

      const user = await response.json();
      
      if (!user || !user.id) {
        throw new Error('Invalid candidate data received');
      }
      
      return {
        ...user,
        interviewStatus: this.getRandomStatus(),
        averageScore: Math.floor(Math.random() * 5) + 1,
      };
    } catch (error) {
      console.error('API Error - getUserById:', error);
      throw error;
    }
  }

  static async getUserTodos(userId: number): Promise<Todo[]> {
    try {
      // Validate input
      const validUserId = Math.max(1, Math.floor(userId));
      
      const response = await fetch(`${API_BASE}/todos/user/${validUserId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch interview schedule: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.todos || !Array.isArray(data.todos)) {
        return [];
      }
      
      return data.todos;
    } catch (error) {
      console.error('API Error - getUserTodos:', error);
      throw new Error('Failed to load interview schedule. Please try again.');
    }
  }

  static async getUserPosts(userId: number): Promise<Post[]> {
    try {
      // Validate input
      const validUserId = Math.max(1, Math.floor(userId));
      
      const response = await fetch(`${API_BASE}/posts/user/${validUserId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feedback: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.posts || !Array.isArray(data.posts)) {
        return [];
      }
      
      return data.posts;
    } catch (error) {
      console.error('API Error - getUserPosts:', error);
      throw new Error('Failed to load feedback. Please try again.');
    }
  }

  static async searchUsers(query: string): Promise<User[]> {
    try {
      if (!query?.trim()) return [];
      
      // Enhanced sanitization to prevent injection
      const sanitizedQuery = query
        .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
        .trim()
        .substring(0, 100); // Limit length
      
      if (!sanitizedQuery) return [];
      
      const response = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(sanitizedQuery)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.users || !Array.isArray(data.users)) {
        return [];
      }
      
      return data.users.map((user: any) => ({
        ...user,
        interviewStatus: this.getRandomStatus(),
        averageScore: Math.floor(Math.random() * 5) + 1,
      }));
    } catch (error) {
      console.error('API Error - searchUsers:', error);
      throw new Error('Failed to search users. Please try again.');
    }
  }

  // Simulate interview statuses
  private static getRandomStatus(): 'scheduled' | 'completed' | 'no-show' | 'cancelled' {
    const statuses: ('scheduled' | 'completed' | 'no-show' | 'cancelled')[] = 
      ['scheduled', 'completed', 'no-show', 'cancelled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // Mock feedback submission
  static async submitFeedback(feedback: any): Promise<void> {
    try {
      // Validate feedback data
      if (!feedback || typeof feedback !== 'object') {
        throw new Error('Invalid feedback data');
      }

      const { overallScore, strengths, areasForImprovement, candidateId } = feedback;

      if (!overallScore || overallScore < 1 || overallScore > 5) {
        throw new Error('Overall score must be between 1 and 5');
      }

      if (!strengths?.trim() || strengths.length < 10) {
        throw new Error('Strengths must be at least 10 characters long');
      }

      if (!areasForImprovement?.trim() || areasForImprovement.length < 10) {
        throw new Error('Areas for improvement must be at least 10 characters long');
      }

      if (!candidateId || candidateId < 1) {
        throw new Error('Valid candidate ID is required');
      }

      // Sanitize text inputs
      const sanitizedFeedback = {
        ...feedback,
        strengths: strengths.trim().substring(0, 1000),
        areasForImprovement: areasForImprovement.trim().substring(0, 1000),
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be a POST request
      console.log('Feedback submitted:', sanitizedFeedback);
      
      return Promise.resolve();
    } catch (error) {
      console.error('API Error - submitFeedback:', error);
      throw error;
    }
  }
}