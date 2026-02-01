import { Injectable, signal, effect } from '@angular/core';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: {
    role: 'user' | 'model', 
    text: string, 
    displayHtml?: string
  }[];
}

export interface SavedCoverLetter {
  id: string;
  jobTitle: string;
  company: string;
  createdAt: number;
  letter: string;
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  role: string;
  skills: string[];
  resumeData?: any;
  savedJobs?: any[];
  roadmap?: any;
  chatSessions?: ChatSession[];
  savedCoverLetters?: SavedCoverLetter[];
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // The currently active user
  user = signal<UserProfile | null>(null);
  
  private readonly DB_KEY = 'nextstep_users_db';
  private readonly SESSION_KEY = 'nextstep_active_session_email';

  constructor() {
    // Attempt to restore session
    const lastEmail = localStorage.getItem(this.SESSION_KEY);
    if (lastEmail) {
      const db = this.getDatabase();
      const user = db[lastEmail];
      if (user) {
        this.user.set(user);
      }
    }

    // "Real-time" DB Sync Effect
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        // 1. Update the User Record in the DB
        const db = this.getDatabase();
        db[currentUser.email] = currentUser;
        this.saveDatabase(db);

        // 2. Persist Session
        localStorage.setItem(this.SESSION_KEY, currentUser.email);
      } else {
        // Clear session if logged out
        localStorage.removeItem(this.SESSION_KEY);
      }
    });
  }

  // --- Mock Database Operations ---

  private getDatabase(): Record<string, UserProfile> {
    try {
      const raw = localStorage.getItem(this.DB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveDatabase(db: Record<string, UserProfile>) {
    localStorage.setItem(this.DB_KEY, JSON.stringify(db));
  }

  // --- Auth Actions ---

  register(name: string, email: string, password: string): { success: boolean; message?: string } {
    const db = this.getDatabase();
    if (db[email]) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    if (!name || !email || !password) {
      return { success: false, message: 'Name, email, and password are required.' };
    }
    
    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    console.log('Creating new user profile for:', email);
    const newUser: UserProfile = {
      name,
      email,
      password,
      role: 'Job Seeker',
      skills: [],
      createdAt: Date.now(),
      resumeData: {
        fullName: name,
        email: email,
        summary: '',
        experience: [],
        education: [],
        skills: ''
      },
      savedJobs: [],
      roadmap: null,
      chatSessions: [],
      savedCoverLetters: []
    };
    this.user.set(newUser);
    return { success: true };
  }

  login(email: string, password: string): { success: boolean; message?: string } {
    const db = this.getDatabase();
    const existingUser = db[email];

    if (!existingUser) {
      return { success: false, message: "No account found with this email." };
    }

    if (existingUser.password !== password) {
      return { success: false, message: "Incorrect password." };
    }

    console.log('Logging in user:', email);
    this.user.set(existingUser);
    return { success: true };
  }

  logout() {
    this.user.set(null);
  }

  // --- Data Updates (Mongo-like $set operations) ---

  updateResume(data: any) {
    this.user.update(u => u ? { ...u, resumeData: data } : null);
  }

  updateSavedJobs(jobs: any[]) {
    this.user.update(u => u ? { ...u, savedJobs: jobs } : null);
  }
  
  updateChatSessions(sessions: ChatSession[]) {
    this.user.update(u => u ? { ...u, chatSessions: sessions } : null);
  }

  updateRoadmap(map: any) {
    this.user.update(u => u ? { ...u, roadmap: map } : null);
  }

  updateSavedCoverLetters(letters: SavedCoverLetter[]) {
    this.user.update(u => u ? { ...u, savedCoverLetters: letters } : null);
  }
}
