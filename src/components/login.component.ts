import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white flex flex-col md:flex-row">
      
      <!-- Left Side: Marketing / Hero -->
      <div class="w-full md:w-1/2 lg:w-7/12 bg-slate-900 relative overflow-hidden flex flex-col justify-between p-8 md:p-12 lg:p-16 text-white">
        
        <!-- Background Decoration -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>
        
        <!-- Header -->
        <div class="relative z-10 flex items-center gap-3 mb-12">
           <div class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
             <i class="fas fa-rocket text-white text-lg"></i>
           </div>
           <span class="text-2xl font-bold tracking-tight">NextStep Advisor</span>
        </div>

        <!-- Main Content -->
        <div class="relative z-10 max-w-lg">
          <h1 class="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Master your career journey with <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI Intelligence</span>
          </h1>
          <p class="text-slate-400 text-lg mb-8 leading-relaxed">
            Stop guessing. Start growing. Build ATS-friendly resumes, practice interviews, and get personalized career coaching—all in one platform.
          </p>
          
          <!-- Features Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            @for (feature of features; track feature.title) {
              <div class="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
                <div [class]="'w-8 h-8 rounded-lg flex items-center justify-center text-sm ' + feature.color">
                  <i [class]="feature.icon"></i>
                </div>
                <div>
                  <h3 class="font-bold text-sm">{{ feature.title }}</h3>
                  <p class="text-xs text-slate-400 mt-0.5">{{ feature.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Social Proof / Footer -->
        <div class="relative z-10 mt-auto pt-8 border-t border-white/10">
           <div class="flex items-center gap-4">
             <div class="flex -space-x-2">
               <div class="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 overflow-hidden"><img src="https://picsum.photos/seed/u1/100/100" class="w-full h-full object-cover"></div>
               <div class="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 overflow-hidden"><img src="https://picsum.photos/seed/u2/100/100" class="w-full h-full object-cover"></div>
               <div class="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 overflow-hidden"><img src="https://picsum.photos/seed/u3/100/100" class="w-full h-full object-cover"></div>
             </div>
             <div>
               <div class="flex text-yellow-400 text-xs mb-1">
                 <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
               </div>
               <p class="text-xs text-slate-400"><span class="font-bold text-white">10,000+</span> careers advanced.</p>
             </div>
           </div>
        </div>
      </div>

      <!-- Right Side: Login Form -->
      <div class="w-full md:w-1/2 lg:w-5/12 bg-slate-50 flex items-center justify-center p-6 sm:p-12 relative">
         <!-- Abstract Pattern -->
         <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#4f46e5 1px, transparent 1px); background-size: 24px 24px;"></div>

         <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 relative z-10 animate-fade-in-up">
            <div class="text-center mb-8">
              @if (view() === 'login') {
                <h2 class="text-2xl font-bold text-slate-900">Welcome Back</h2>
                <p class="text-slate-500 text-sm mt-2">Enter your credentials to access your workspace.</p>
              } @else {
                <h2 class="text-2xl font-bold text-slate-900">Create Your Account</h2>
                <p class="text-slate-500 text-sm mt-2">Get started with your AI career assistant.</p>
              }
            </div>

            <form (ngSubmit)="onSubmit()" class="space-y-5">
              
              @if (view() === 'register') {
                <!-- Name Input -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <i class="fas fa-user"></i>
                    </div>
                    <input type="text" [(ngModel)]="name" name="name" required
                      class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                      placeholder="e.g. Alex Morgan">
                  </div>
                </div>
              }
              
              <!-- Email Input -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <input type="email" [(ngModel)]="email" name="email" required
                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                    placeholder="alex@example.com">
                </div>
              </div>

              <!-- Password Input -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <i class="fas fa-lock"></i>
                  </div>
                  <input type="password" [(ngModel)]="password" name="password" required [minlength]="view() === 'register' ? 6 : null"
                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                    placeholder="••••••••">
                </div>
                @if (view() === 'register') {
                    <p class="text-xs text-slate-400 mt-1 pl-1">Must be at least 6 characters long.</p>
                }
              </div>

              <!-- Error Message -->
              @if (errorMessage()) {
                <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-center gap-2">
                  <i class="fas fa-exclamation-circle"></i>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Action Button -->
              <button type="submit" [disabled]="!email || !password || (view() === 'register' && !name)"
                class="w-full group bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                @if (view() === 'login') {
                  <span>Login to Your Account</span>
                } @else {
                  <span>Create Account</span>
                }
                <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
              
              <div class="text-center text-sm pt-2">
                 @if (view() === 'login') {
                    <p class="text-slate-500">Don't have an account? 
                      <button type="button" (click)="toggleView('register')" class="font-semibold text-indigo-600 hover:underline focus:outline-none">Register here</button>
                    </p>
                 } @else {
                    <p class="text-slate-500">Already have an account?
                      <button type="button" (click)="toggleView('login')" class="font-semibold text-indigo-600 hover:underline focus:outline-none">Login here</button>
                    </p>
                 }
              </div>

            </form>
         </div>

         <p class="absolute bottom-6 text-center text-xs text-slate-400">
            &copy; 2024 NextStep Advisor. All rights reserved.
         </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
  `]
})
export class LoginComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  view = signal<'login' | 'register'>('login');
  errorMessage = signal<string | null>(null);

  userService = inject(UserService);
  router: Router = inject(Router);

  features = [
    { title: 'AI Resume Builder', desc: 'Create ATS-ready resumes.', icon: 'fas fa-file-alt', color: 'bg-blue-500/20 text-blue-300' },
    { title: 'Career Roadmap', desc: 'Step-by-step skill paths.', icon: 'fas fa-map-signs', color: 'bg-orange-500/20 text-orange-300' },
    { title: 'Mock Interviews', desc: 'Practice with AI voice.', icon: 'fas fa-microphone-alt', color: 'bg-rose-500/20 text-rose-300' },
    { title: 'Job Search', desc: 'Find relevant listings.', icon: 'fas fa-briefcase', color: 'bg-emerald-500/20 text-emerald-300' }
  ];

  ngOnInit() {
    if (this.userService.user()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleView(newView: 'login' | 'register') {
    this.view.set(newView);
    this.errorMessage.set(null);
    this.name = '';
    this.email = '';
    this.password = '';
  }

  onSubmit() {
    if (this.view() === 'login') {
      this.onLogin();
    } else {
      this.onRegister();
    }
  }

  private onLogin() {
    this.errorMessage.set(null);
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }
    
    const result = this.userService.login(this.email, this.password);
    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.message || 'Login failed. Please check your credentials.');
    }
  }
  
  private onRegister() {
    this.errorMessage.set(null);
    if (!this.name || !this.email || !this.password) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }
    
    if (this.password.length < 6) {
        this.errorMessage.set('Password must be at least 6 characters long.');
        return;
    }

    const result = this.userService.register(this.name, this.email, this.password);
    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.message || 'An unknown error occurred during registration.');
    }
  }
}
