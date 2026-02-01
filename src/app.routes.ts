import { Routes, Router, CanActivateFn } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { DashboardComponent } from './components/dashboard.component';
import { ResumeBuilderComponent } from './components/resume-builder.component';
import { ResumeAnalyzerComponent } from './components/resume-analyzer.component';
import { JobSearchComponent } from './components/job-search.component';
import { CareerCoachComponent } from './components/career-coach.component';
import { RoadmapComponent } from './components/roadmap.component';
import { MockInterviewComponent } from './components/mock-interview.component';
import { CoverLetterComponent } from './components/cover-letter.component';
import { UserService } from './services/user.service';
import { inject } from '@angular/core';

// A guard to protect routes that require an authenticated user.
const authGuard: CanActivateFn = (route, state) => {
  const user = inject(UserService).user();
  // FIX: Explicitly type `router` as `Router` because type inference was failing.
  const router: Router = inject(Router);
  
  if (user) {
    return true;
  } else {
    return router.createUrlTree(['/login']);
  }
};

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'resume-builder', 
    component: ResumeBuilderComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'resume-analyzer', 
    component: ResumeAnalyzerComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'job-search', 
    component: JobSearchComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'career-coach', 
    component: CareerCoachComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'roadmap', 
    component: RoadmapComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'mock-interview', 
    component: MockInterviewComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'cover-letter', 
    component: CoverLetterComponent, 
    canActivate: [authGuard] 
  }
];
