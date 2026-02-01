import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- Layout only shows if user is logged in, else just router-outlet (login page) -->
    @if (userService.user()) {
      <div class="flex h-screen bg-slate-50 overflow-hidden">
        
        <!-- Sidebar -->
        <aside class="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col no-print transition-all duration-300">
          <div class="p-6">
            <h1 class="text-xl font-bold text-white tracking-wide">NextStep Advisor</h1>
            <p class="text-xs text-slate-500 mt-1">Licensed App</p>
          </div>

          <nav class="flex-1 px-4 space-y-2 overflow-y-auto">
            <a routerLink="/dashboard" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              <span>🏠</span> Dashboard
            </a>
            <a routerLink="/resume-builder" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              <span>📄</span> AI Resume Maker
            </a>
             <a routerLink="/resume-analyzer" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              <span>🔍</span> Resume Analyzer
            </a>
            <a routerLink="/job-search" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              <span>💼</span> Job Search
            </a>
            <a routerLink="/career-coach" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              <span>💬</span> Career Coach
            </a>
            <a routerLink="/roadmap" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              <span>🗺️</span> Roadmap
            </a>
            <a routerLink="/mock-interview" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              <span>🎤</span> Mock Interview
            </a>
             <a routerLink="/cover-letter" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              <span>✍️</span> Cover Letter
            </a>
          </nav>

          <div class="p-4 border-t border-slate-800">
             <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                  {{ userService.user()?.name?.charAt(0) }}
                </div>
                <div class="overflow-hidden">
                  <div class="text-sm font-medium text-white truncate">{{ userService.user()?.name }}</div>
                  <div class="text-xs text-slate-500 truncate">{{ userService.user()?.email }}</div>
                </div>
             </div>
             <button (click)="logout()" class="w-full text-left text-sm text-red-400 hover:text-red-300">Sign Out</button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-auto bg-slate-50 relative">
          <router-outlet></router-outlet>
        </main>
      </div>
    } @else {
      <!-- Login View -->
      <router-outlet></router-outlet>
    }
  `
})
export class AppComponent {
  userService = inject(UserService);
  router: Router = inject(Router);

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
