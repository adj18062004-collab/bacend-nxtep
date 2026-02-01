import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { UserService, SavedCoverLetter } from '../services/user.service';

@Component({
  selector: 'app-cover-letter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-slate-800">AI Cover Letter</h2>
        <div class="flex bg-slate-100 p-1 rounded-lg">
          <button (click)="view.set('generator')" [class.bg-white]="view() === 'generator'" [class.shadow-sm]="view() === 'generator'" class="px-4 py-2 rounded-md text-sm font-medium transition-all">Generator</button>
          <button (click)="view.set('saved')" [class.bg-white]="view() === 'saved'" [class.shadow-sm]="view() === 'saved'" class="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2">
            Saved 
            <span class="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0.5 rounded-full">{{ savedLetters().length }}</span>
          </button>
        </div>
      </div>
      
      @if (view() === 'generator') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <label class="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
              <input [(ngModel)]="jobTitle" class="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white transition-all" placeholder="e.g. Product Designer">
            </div>
            
            <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <label class="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
              <input [(ngModel)]="company" class="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white transition-all" placeholder="e.g. Acme Corp">
            </div>

            <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <label class="block text-sm font-medium text-slate-700 mb-2">Desired Tone</label>
              <div class="space-y-2">
                @for (t of tones; track t.name) {
                  <button (click)="tone = t.name" 
                          [class.bg-teal-50]="tone === t.name" 
                          [class.border-teal-300]="tone === t.name"
                          class="w-full text-left p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <p class="font-semibold text-sm text-slate-800">{{ t.name }}</p>
                    <p class="text-xs text-slate-500">{{ t.description }}</p>
                  </button>
                }
              </div>
            </div>

            <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <label class="block text-sm font-medium text-slate-700 mb-2">Job Description (Key Points)</label>
              <textarea [(ngModel)]="jobDesc" rows="4" class="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white transition-all" placeholder="Paste JD requirements here..."></textarea>
            </div>
            
            <button (click)="generate()" [disabled]="loading() || !jobTitle" 
              class="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold shadow-md shadow-teal-100 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              @if (loading()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Writing...
              } @else {
                Generate Letter
              }
            </button>
          </div>

          <div class="relative bg-white p-8 rounded-lg shadow-lg border border-slate-200 min-h-[600px] flex flex-col">
            @if (letter()) {
              <div class="absolute top-4 right-4 flex gap-2">
                <button (click)="copy()" class="text-slate-400 hover:text-teal-600 transition-colors" title="Copy to Clipboard">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                </button>
                <button (click)="saveLetter()" class="text-slate-400 hover:text-teal-600 transition-colors" title="Save Letter">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
              </div>
              <div class="font-serif text-slate-800 leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto">{{ letter() }}</div>
            } @else {
              <div class="flex-1 flex flex-col items-center justify-center text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <p class="text-sm italic">Fill in the details to generate your cover letter.</p>
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- Saved Letters View -->
        <div class="space-y-4">
           @if (savedLetters().length === 0) {
             <div class="col-span-full py-12 text-center text-slate-400">
               <p>No saved cover letters yet.</p>
             </div>
           }
           @for (saved of savedLetters(); track saved.id) {
             <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative">
                <button (click)="deleteLetter(saved.id)" class="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                <h3 class="font-bold text-slate-800 pr-6">{{ saved.jobTitle }}</h3>
                <p class="text-xs text-slate-400 mt-1">{{ saved.company }} &bull; {{ formatDate(saved.createdAt) }}</p>
                <div class="mt-4 pt-4 border-t border-slate-100 font-serif text-sm text-slate-700 whitespace-pre-wrap">
                  {{ saved.letter }}
                </div>
             </div>
           }
        </div>
      }
    </div>
  `
})
export class CoverLetterComponent {
  gemini = inject(GeminiService);
  userService = inject(UserService);
  
  jobTitle = '';
  company = '';
  jobDesc = '';
  tone = 'Professional';
  loading = signal(false);
  letter = signal('');

  view = signal<'generator' | 'saved'>('generator');
  savedLetters = signal<SavedCoverLetter[]>([]);

  tones = [
    { 
      name: 'Professional', 
      description: 'A formal, respectful, and standard tone for most applications.' 
    },
    { 
      name: 'Enthusiastic', 
      description: 'Showcases genuine excitement and passion for the role.' 
    },
    { 
      name: 'Confident', 
      description: 'Assertive and self-assured, ideal for leadership positions.' 
    },
    {
      name: 'Creative',
      description: 'Original and imaginative, for roles in design or marketing.'
    },
    {
      name: 'Personable',
      description: 'Friendly and approachable, great for sales or support roles.'
    }
  ];

  constructor() {
    effect(() => {
        const user = this.userService.user();
        this.savedLetters.set(user?.savedCoverLetters || []);
    });
  }

  formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  copy() {
    navigator.clipboard.writeText(this.letter());
    alert("Copied to clipboard!");
  }

  saveLetter() {
    if (!this.letter()) return;

    const newLetter: SavedCoverLetter = {
        id: Date.now().toString(),
        jobTitle: this.jobTitle,
        company: this.company,
        createdAt: Date.now(),
        letter: this.letter()
    };

    const currentLetters = this.savedLetters();
    // Prepend to show the newest first
    this.userService.updateSavedCoverLetters([newLetter, ...currentLetters]);
    alert('Cover letter saved!');
  }

  deleteLetter(id: string) {
    const updatedLetters = this.savedLetters().filter(l => l.id !== id);
    this.userService.updateSavedCoverLetters(updatedLetters);
  }

  async generate() {
    this.loading.set(true);
    const user = this.userService.user();
    
    // Create a mini-profile context
    const profile = user?.resumeData ? 
      `Name: ${user.resumeData.fullName}, Skills: ${user.resumeData.skills}, Experience: ${user.resumeData.experience?.[0]?.role} at ${user.resumeData.experience?.[0]?.company}` 
      : "A motivated professional.";

    const prompt = `Write a ${this.tone} cover letter for a ${this.jobTitle} position at ${this.company}.
    
    My Profile: ${profile}
    
    Job Description Key Points:
    ${this.jobDesc}
    
    Ensure the tone is strictly ${this.tone}. Keep it under 300 words. Use [Placeholders] only if necessary info is missing.`;

    try {
      const result = await this.gemini.generateText(prompt);
      this.letter.set(result);
    } catch(e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}