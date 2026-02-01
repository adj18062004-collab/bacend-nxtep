import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { UserService } from '../services/user.service';
import { marked } from 'marked';

@Component({
  selector: 'app-job-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-slate-800">AI Job Search</h2>
        
        <!-- Toggle Saved View -->
        <div class="flex bg-slate-100 p-1 rounded-lg">
          <button (click)="view = 'search'" [class.bg-white]="view === 'search'" [class.shadow-sm]="view === 'search'" class="px-4 py-2 rounded-md text-sm font-medium transition-all">Search</button>
          <button (click)="view = 'saved'" [class.bg-white]="view === 'saved'" [class.shadow-sm]="view === 'saved'" class="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2">
            Saved 
            <span class="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full">{{ savedJobs().length }}</span>
          </button>
        </div>
      </div>
      
      @if (view === 'search') {
        <!-- Search Bar -->
        <div class="flex gap-4 mb-6">
          <input [(ngModel)]="query" (keyup.enter)="search()" 
            placeholder="e.g. Frontend Developer" 
            class="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm">
          
          <button (click)="search()" [disabled]="loading()"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-emerald-200">
            @if (loading()) { Searching... } @else { Search Jobs }
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-8">
          <div class="flex items-center justify-between mb-4 cursor-pointer select-none" (click)="toggleFilters()">
             <h3 class="font-semibold text-slate-700 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
               Advanced Filters
             </h3>
             <svg class="w-5 h-5 text-slate-400 transform transition-transform duration-200" [class.rotate-180]="showFilters()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </div>

          @if (showFilters()) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-down">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
                <input [(ngModel)]="filters.company" placeholder="e.g. Google" class="w-full p-2 border rounded-lg text-sm border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Salary Range</label>
                 <input [(ngModel)]="filters.salary" placeholder="e.g. $100k+" class="w-full p-2 border rounded-lg text-sm border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Experience</label>
                 <select [(ngModel)]="filters.experience" class="w-full p-2 border rounded-lg text-sm border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                   <option value="">Any</option>
                   <option value="Internship">Internship</option>
                   <option value="Entry Level">Entry Level</option>
                   <option value="Mid Level">Mid Level</option>
                   <option value="Senior Level">Senior Level</option>
                   <option value="Lead/Manager">Lead/Manager</option>
                 </select>
              </div>
              <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Location Type</label>
                 <select [(ngModel)]="filters.locationType" class="w-full p-2 border rounded-lg text-sm border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                   <option value="">Any</option>
                   <option value="Remote">Remote</option>
                   <option value="On-site">On-site</option>
                   <option value="Hybrid">Hybrid</option>
                 </select>
              </div>
            </div>
          }
        </div>

        <!-- Results Area -->
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p class="text-slate-500 animate-pulse font-medium">Scanning for opportunities...</p>
          </div>
        }

        @if (!loading() && result()) {
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div class="markdown-content text-slate-700 leading-relaxed" [innerHTML]="parsedContent"></div>
             
             @if (chunks().length > 0) {
               <div class="mt-8 pt-6 border-t border-slate-100">
                 <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Available Positions</h4>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   @for (chunk of chunks(); track $index) {
                     <div class="block p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                       <div class="flex justify-between items-start">
                         <div class="flex-1 pr-4">
                           <div class="text-sm font-semibold text-slate-800 truncate">{{ chunk.web.title }}</div>
                           <a [href]="chunk.web.uri" target="_blank" class="text-xs text-emerald-600 hover:underline truncate block mt-1">Apply Now &rarr;</a>
                         </div>
                         <button (click)="saveJob(chunk)" class="text-slate-400 hover:text-emerald-500 transition-colors" title="Save Job">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                         </button>
                       </div>
                     </div>
                   }
                 </div>
               </div>
             }
          </div>
        }
      } @else {
        <!-- Saved Jobs View -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           @if (savedJobs().length === 0) {
             <div class="col-span-full py-12 text-center text-slate-400">
               <p>No saved jobs yet.</p>
             </div>
           }
           @for (job of savedJobs(); track $index) {
             <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative flex flex-col justify-between h-full">
                <div>
                  <button (click)="removeSavedJob($index)" class="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                  </button>
                  <h3 class="font-bold text-slate-800 pr-6 truncate" title="{{ job.web.title }}">{{ job.web.title }}</h3>
                  <p class="text-xs text-slate-500 mt-1 truncate" title="{{ job.web.uri }}">{{ job.web.uri }}</p>
                </div>
                
                <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                   <span class="text-xs text-slate-400 italic">Saved</span>
                   <a [href]="job.web.uri" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1">
                     Apply Now 
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                   </a>
                </div>
             </div>
           }
        </div>
      }
    </div>
  `
})
export class JobSearchComponent {
  gemini = inject(GeminiService);
  userService = inject(UserService);
  
  query = '';
  loading = signal(false);
  result = signal<string>('');
  chunks = signal<any[]>([]);
  parsedContent = '';
  
  showFilters = signal(false);
  view: 'search' | 'saved' = 'search';
  
  // Directly bind to user service state
  savedJobs = signal<any[]>([]);
  
  filters = {
    company: '',
    salary: '',
    experience: '',
    locationType: ''
  };

  constructor() {
    const savedFilters = localStorage.getItem('job_search_filters');
    if (savedFilters) {
      this.filters = JSON.parse(savedFilters);
      // If any filter has a value, expand the filter section by default
      if (this.filters.company || this.filters.salary || this.filters.experience || this.filters.locationType) {
        this.showFilters.set(true);
      }
    }

    // Sync saved jobs from UserService
    effect(() => {
      const user = this.userService.user();
      this.savedJobs.set(user?.savedJobs || []);
    });
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  saveJob(job: any) {
    const currentJobs = this.savedJobs();
    if (currentJobs.some(j => j.web.uri === job.web.uri)) return;
    
    const newJobs = [...currentJobs, job];
    this.userService.updateSavedJobs(newJobs);
    alert("Job saved to your profile!");
  }

  removeSavedJob(index: number) {
    const currentJobs = this.savedJobs();
    const newJobs = currentJobs.filter((_, i) => i !== index);
    this.userService.updateSavedJobs(newJobs);
  }

  async search() {
    if (!this.query.trim()) return;
    
    localStorage.setItem('job_search_filters', JSON.stringify(this.filters));

    this.loading.set(true);
    this.result.set('');
    this.chunks.set([]);

    let detailedQuery = `${this.query}`;
    const criteria = [];
    if (this.filters.company) criteria.push(`at ${this.filters.company}`);
    if (this.filters.salary) criteria.push(`with a salary around ${this.filters.salary}`);
    if (this.filters.experience) criteria.push(`suitable for ${this.filters.experience} level`);
    if (this.filters.locationType) criteria.push(`that are ${this.filters.locationType}`);

    if (criteria.length > 0) {
      detailedQuery += ` ${criteria.join(', ')}`;
    }
    
    const data = await this.gemini.searchJobs(detailedQuery);
    
    this.result.set(data.text);
    this.chunks.set(data.chunks);
    this.parsedContent = await marked.parse(data.text);
    
    this.loading.set(false);
  }
}