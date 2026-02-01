import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-slate-800">Welcome back, {{ userService.user()?.name }}! 👋</h1>
        <p class="text-slate-600 mt-2">Ready to take the next step in your career with AI?</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Resume Tools -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">AI Resume Maker</h3>
          <p class="text-slate-500 mb-4 text-sm">Create a professional resume with AI writing assistance and export as PDF.</p>
          <a routerLink="/resume-builder" class="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 text-sm">
            Launch Maker <span>&rarr;</span>
          </a>
        </div>

        <!-- Resume Analyzer -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">AI Resume Analyzer</h3>
          <p class="text-slate-500 mb-4 text-sm">Get AI-driven feedback to improve your ATS score and relevance.</p>
          <a routerLink="/resume-analyzer" class="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 text-sm">
            Analyze Now <span>&rarr;</span>
          </a>
        </div>

        <!-- Job Search -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">AI Job Search</h3>
          <p class="text-slate-500 mb-4 text-sm">Find real-time listings with AI filtering and summarization.</p>
          <a routerLink="/job-search" class="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 text-sm">
            Find Jobs <span>&rarr;</span>
          </a>
        </div>

        <!-- Career Coach -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">AI Career Coach</h3>
          <p class="text-slate-500 mb-4 text-sm">Chat with your AI mentor for personalized career advice.</p>
          <a routerLink="/career-coach" class="text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1 text-sm">
            Start Chat <span>&rarr;</span>
          </a>
        </div>

        <!-- Roadmap -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">AI Career Roadmap</h3>
          <p class="text-slate-500 mb-4 text-sm">Generate a step-by-step learning path for your dream role.</p>
          <a routerLink="/roadmap" class="text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 text-sm">
            Generate Path <span>&rarr;</span>
          </a>
        </div>

         <!-- Mock Interview -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">AI Mock Interview</h3>
          <p class="text-slate-500 mb-4 text-sm">Practice interviews with an AI recruiter and get feedback.</p>
          <a routerLink="/mock-interview" class="text-rose-600 font-medium hover:text-rose-700 flex items-center gap-1 text-sm">
            Practice Now <span>&rarr;</span>
          </a>
        </div>

        <!-- Cover Letter -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">AI Cover Letter</h3>
          <p class="text-slate-500 mb-4 text-sm">Instantly generate a tailored cover letter for any job.</p>
          <a routerLink="/cover-letter" class="text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1 text-sm">
            Write Letter <span>&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  userService = inject(UserService);
}