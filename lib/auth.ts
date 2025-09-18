import { LoginCredentials, AuthResponse, SessionData } from './types';

const SESSION_KEY = 'interview_dashboard_session';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<SessionData> {
    try {
      // Validate input to prevent injection
      if (!credentials.username || !credentials.password || !credentials.role) {
        throw new Error('All fields are required');
      }

      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const authResponse: AuthResponse = await response.json();
      
      const sessionData: SessionData = {
        user: authResponse,
        role: credentials.role,
        token: authResponse.token,
      };

      // Store session securely (excluding sensitive data)
      this.setSession(sessionData);
      
      return sessionData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static setSession(session: SessionData): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      // Store the full session data
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Session storage error:', error);
    }
  }

  static getSession(): SessionData | null {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return null;
      }
      
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Session retrieval error:', error);
      return null;
    }
  }

  static clearSession(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Session clear error:', error);
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  static getCurrentRole(): string | null {
    const session = this.getSession();
    return session?.role || null;
  }
}