import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HttpService } from './http.service';

export interface ChatSession {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  text: string;
  role: 'user' | 'model';
  displayHtml?: string;
  createdAt: string;
}

export interface SavedCoverLetter {
  id: number;
  userId: number;
  jobTitle: string;
  company: string;
  letter: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: number;
  userId: number;
  title: string;
  data: any;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  skills: string[];
  phone?: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  googleId?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  resumes?: Resume[];
  chatSessions?: ChatSession[];
  coverLetters?: SavedCoverLetter[];
  savedJobs?: any[];
  roadmaps?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // The currently active user
  user = signal<UserProfile | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private readonly SESSION_KEY = 'nextstep_active_session_email';

  constructor(private httpService: HttpService, private http: HttpClient) {
    this.restoreSession();
  }

  // Restore session from token
  private restoreSession(): void {
    const token = this.httpService.getToken();
    if (token) {
      this.fetchProfile();
    }
  }

  // --- Auth Actions ---

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const response: any = await firstValueFrom(
        this.httpService.post('/auth/register', { name, email, password })
      );

      if (response.token) {
        this.httpService.setToken(response.token);
        this.user.set(response.user);
        localStorage.setItem(this.SESSION_KEY, email);
      }

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      this.error.set(message);
      return { success: false, message };
    } finally {
      this.isLoading.set(false);
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const response: any = await firstValueFrom(
        this.httpService.post('/auth/login', { email, password })
      );

      if (response.token) {
        this.httpService.setToken(response.token);
        this.user.set(response.user);
        localStorage.setItem(this.SESSION_KEY, email);
      }

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Login failed';
      this.error.set(message);
      return { success: false, message };
    } finally {
      this.isLoading.set(false);
    }
  }

  async googleAuth(
    googleId: string,
    email: string,
    name: string,
    profilePicture?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const response: any = await firstValueFrom(
        this.httpService.post('/auth/google-callback', {
          googleId,
          email,
          name,
          profilePicture
        })
      );

      if (response.token) {
        this.httpService.setToken(response.token);
        this.user.set(response.user);
        localStorage.setItem(this.SESSION_KEY, email);
      }

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Google authentication failed';
      this.error.set(message);
      return { success: false, message };
    } finally {
      this.isLoading.set(false);
    }
  }

  logout(): void {
    this.user.set(null);
    this.httpService.clearToken();
    localStorage.removeItem(this.SESSION_KEY);
  }

  // --- Profile Management ---

  async fetchProfile(): Promise<void> {
    try {
      this.isLoading.set(true);
      const profile: any = await firstValueFrom(this.httpService.get('/users/profile'));
      this.user.set(profile);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; message?: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const response: any = await firstValueFrom(
        this.httpService.put('/users/profile', updates)
      );

      this.user.set(response.user);
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Failed to update profile';
      this.error.set(message);
      return { success: false, message };
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteAccount(): Promise<{ success: boolean; message?: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      await firstValueFrom(this.httpService.delete('/users/account'));

      this.user.set(null);
      this.httpService.clearToken();
      localStorage.removeItem(this.SESSION_KEY);

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Failed to delete account';
      this.error.set(message);
      return { success: false, message };
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- Data Updates ---

  updateResume(data: any): void {
    const current = this.user();
    if (current) {
      this.user.set({ ...current, resumeData: data });
    }
  }

  updateSavedJobs(jobs: any[]): void {
    const current = this.user();
    if (current) {
      this.user.set({ ...current, savedJobs: jobs });
    }
  }

  updateChatSessions(sessions: ChatSession[]): void {
    const current = this.user();
    if (current) {
      this.user.set({ ...current, chatSessions: sessions });
    }
  }

  updateRoadmap(roadmap: any): void {
    const current = this.user();
    if (current) {
      this.user.set({ ...current, roadmaps: [roadmap] });
    }
  }

  updateSavedCoverLetters(letters: SavedCoverLetter[]): void {
    const current = this.user();
    if (current) {
      this.user.set({ ...current, coverLetters: letters });
    }
  }
}
