import { Component, EventEmitter, Output, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { HistoryService } from '../services/history.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-resume-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 space-y-8 max-w-3xl mx-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Edit Resume</h2>
          <p class="text-sm text-slate-500 mt-1">Fill in your details to generate your resume</p>
        </div>
        <div class="text-xs font-medium px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 rounded-full border border-purple-100 flex items-center gap-2">
          <i class="fas fa-magic text-purple-600"></i> AI Powered
        </div>
      </div>

      <form [formGroup]="form" class="space-y-6">
        
        <!-- Personal Info -->
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h3 class="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
               <i class="fas fa-user-circle text-lg"></i>
            </div>
            Personal Info
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name <span class="text-red-500">*</span></label>
              <input formControlName="fullName" type="text" 
                class="w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                [class.border-red-300]="isFieldInvalid('fullName')"
                [class.focus:border-red-500]="isFieldInvalid('fullName')"
                [class.focus:ring-red-100]="isFieldInvalid('fullName')"
                [class.border-slate-200]="!isFieldInvalid('fullName')"
                [class.focus:border-blue-500]="!isFieldInvalid('fullName')"
                [class.focus:ring-blue-500/10]="!isFieldInvalid('fullName')"
                placeholder="John Doe">
              @if (isFieldInvalid('fullName')) {
                <p class="text-xs text-red-500 mt-1">Full Name is required.</p>
              }
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Job Title <span class="text-red-500">*</span></label>
              <input formControlName="jobTitle" type="text" 
                class="w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                [class.border-red-300]="isFieldInvalid('jobTitle')"
                [class.focus:border-red-500]="isFieldInvalid('jobTitle')"
                [class.focus:ring-red-100]="isFieldInvalid('jobTitle')"
                [class.border-slate-200]="!isFieldInvalid('jobTitle')"
                [class.focus:border-blue-500]="!isFieldInvalid('jobTitle')"
                [class.focus:ring-blue-500/10]="!isFieldInvalid('jobTitle')"
                placeholder="Senior Software Engineer">
               @if (isFieldInvalid('jobTitle')) {
                <p class="text-xs text-red-500 mt-1">Job Title is required.</p>
              }
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email <span class="text-red-500">*</span></label>
              <input formControlName="email" type="email" 
                class="w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                [class.border-red-300]="isFieldInvalid('email')"
                [class.focus:border-red-500]="isFieldInvalid('email')"
                [class.focus:ring-red-100]="isFieldInvalid('email')"
                [class.border-slate-200]="!isFieldInvalid('email')"
                [class.focus:border-blue-500]="!isFieldInvalid('email')"
                [class.focus:ring-blue-500/10]="!isFieldInvalid('email')"
                placeholder="john@example.com">
               @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                 <p class="text-xs text-red-500 mt-1">Email is required.</p>
               } @else if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                 <p class="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
               }
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input formControlName="phone" type="text" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300" placeholder="+1 555 000 0000">
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
              <input formControlName="location" type="text" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300" placeholder="San Francisco, CA">
            </div>
             <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">LinkedIn / Website</label>
              <input formControlName="website" type="text" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300" placeholder="linkedin.com/in/johndoe">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Twitter (Optional)</label>
              <input formControlName="twitter" type="text" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300" placeholder="@username">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">GitHub (Optional)</label>
              <input formControlName="github" type="text" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300" placeholder="github.com/username">
            </div>
          </div>
        </section>

        <!-- Summary -->
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <i class="fas fa-align-left text-lg"></i>
              </div>
              Professional Summary
            </h3>
            <div class="flex items-center gap-2">
               <button type="button" (click)="exportSection.emit({ name: 'Summary', data: form.getRawValue() })" class="text-xs font-medium text-slate-600 bg-white hover:text-blue-600 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-2 shadow-sm group">
                    <i class="fas fa-file-pdf text-red-500 group-hover:scale-110 transition-transform"></i> Export PDF
                </button>
               <button type="button" (click)="generateSummary()" [disabled]="isGeneratingSummary()" class="text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-1.5 rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                @if (isGeneratingSummary()) {
                  <i class="fas fa-spinner fa-spin"></i> Writing...
                } @else {
                  <i class="fas fa-magic"></i> Generate with AI
                }
              </button>
            </div>
          </div>
          <div class="relative group">
            <textarea formControlName="summary" (input)="onUserInputChange('summary')" rows="5" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300 leading-relaxed resize-y min-h-[120px]" placeholder="Experienced professional with..."></textarea>
            <div class="absolute bottom-3 right-3 flex items-center gap-2">
              @if (lastAiAction()?.path === 'summary') {
                <button type="button" (click)="rerunLastAiAction()" class="text-xs font-medium bg-white border border-slate-200 text-slate-500 px-2.5 py-1.5 rounded-lg hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100" [title]="lastAiAction()?.type === 'generate-summary' ? 'Get a new version' : 'Improve again'">
                    <i class="fas fa-sync-alt text-blue-500"></i>
                    {{ lastAiAction()?.type === 'generate-summary' ? 'Regenerate' : 'Improve' }}
                </button>
              }
              <button type="button" (click)="enhanceField('summary')" class="text-xs font-medium bg-white border border-slate-200 text-slate-500 px-2.5 py-1.5 rounded-lg hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100" title="Polish Text">
                <i class="fas fa-wand-magic-sparkles text-purple-500"></i> Polish
              </button>
            </div>
          </div>
        </section>

        <!-- Experience -->
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <i class="fas fa-briefcase text-lg"></i>
              </div>
              Experience
            </h3>
            <button type="button" (click)="exportSection.emit({ name: 'Experience', data: form.getRawValue() })" class="text-xs font-medium text-slate-600 bg-white hover:text-blue-600 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-2 shadow-sm group">
              <i class="fas fa-file-pdf text-red-500 group-hover:scale-110 transition-transform"></i> Export PDF
            </button>
          </div>
          
          <div formArrayName="experience" class="space-y-6">
            @for (exp of experienceControls; track $index) {
              <div [formGroupName]="$index" class="p-5 bg-slate-50/50 rounded-xl border border-slate-200/80 relative group hover:bg-white hover:shadow-sm transition-all">
                <button type="button" (click)="removeExperience($index)" class="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 text-xs">
                  <i class="fas fa-times"></i>
                </button>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input formControlName="company" placeholder="Company Name *" 
                      class="w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                      [class.border-red-300]="exp.get('company')?.invalid && exp.get('company')?.touched"
                      [class.focus:border-red-500]="exp.get('company')?.invalid && exp.get('company')?.touched"
                      [class.focus:ring-red-100]="exp.get('company')?.invalid && exp.get('company')?.touched"
                      [class.border-slate-200]="!(exp.get('company')?.invalid && exp.get('company')?.touched)"
                      [class.focus:border-blue-500]="!(exp.get('company')?.invalid && exp.get('company')?.touched)"
                      [class.focus:ring-blue-500/10]="!(exp.get('company')?.invalid && exp.get('company')?.touched)">
                    @if (exp.get('company')?.invalid && exp.get('company')?.touched) {
                      <p class="text-xs text-red-500 mt-1">Company name is required.</p>
                    }
                  </div>
                  <div>
                    <input formControlName="role" placeholder="Job Role *" 
                       class="w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                      [class.border-red-300]="exp.get('role')?.invalid && exp.get('role')?.touched"
                      [class.focus:border-red-500]="exp.get('role')?.invalid && exp.get('role')?.touched"
                      [class.focus:ring-red-100]="exp.get('role')?.invalid && exp.get('role')?.touched"
                      [class.border-slate-200]="!(exp.get('role')?.invalid && exp.get('role')?.touched)"
                      [class.focus:border-blue-500]="!(exp.get('role')?.invalid && exp.get('role')?.touched)"
                      [class.focus:ring-blue-500/10]="!(exp.get('role')?.invalid && exp.get('role')?.touched)">
                    @if (exp.get('role')?.invalid && exp.get('role')?.touched) {
                      <p class="text-xs text-red-500 mt-1">Job role is required.</p>
                    }
                  </div>
                  <input formControlName="startDate" placeholder="Start Date" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300">
                  <input formControlName="endDate" placeholder="End Date" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300">
                </div>
                
                <div class="relative group/inner">
                  <textarea formControlName="description" (input)="onUserInputChange('experience.' + $index + '.description')" rows="3" placeholder="Describe your responsibilities and achievements..." class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300 leading-relaxed"></textarea>
                   <div class="absolute bottom-3 right-3 flex items-center gap-2">
                      <button type="button" (click)="exportSection.emit({ name: 'Experience', data: form.getRawValue() })" class="text-xs font-medium bg-white border border-slate-200 text-slate-500 px-2.5 py-1.5 rounded-lg hover:text-red-500 hover:border-red-200 hover:shadow-sm transition-all flex items-center gap-1.5 opacity-0 group-hover/inner:opacity-100 focus:opacity-100" title="Export Experience Section">
                        <i class="fas fa-file-pdf"></i>
                      </button>
                      <button type="button" (click)="generatePoints($index)" class="text-xs font-medium bg-white border border-slate-200 text-slate-500 px-2.5 py-1.5 rounded-lg hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all flex items-center gap-1.5 opacity-0 group-hover/inner:opacity-100 focus:opacity-100" title="Generate Bullet Points">
                        <i class="fas fa-magic text-blue-500"></i> AI Write Points
                      </button>
                      <button type="button" (click)="enhanceExperience($index)" class="text-xs font-medium bg-white border border-slate-200 text-slate-500 px-2.5 py-1.5 rounded-lg hover:text-purple-600 hover:border-purple-200 hover:shadow-sm transition-all flex items-center gap-1.5 opacity-0 group-hover/inner:opacity-100 focus:opacity-100" title="Polish Text">
                        <i class="fas fa-wand-magic-sparkles text-purple-500"></i> Polish
                      </button>
                   </div>
                </div>
              </div>
            }
          </div>
          
          <button type="button" (click)="addExperience()" class="mt-5 w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-medium text-sm flex items-center justify-center gap-2 group">
            <div class="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <i class="fas fa-plus text-xs"></i>
            </div>
            Add Experience
          </button>
        </section>

        <!-- Education -->
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                <i class="fas fa-graduation-cap text-lg"></i>
              </div>
              Education
            </h3>
            <button type="button" (click)="exportSection.emit({ name: 'Education', data: form.getRawValue() })" class="text-xs font-medium text-slate-600 bg-white hover:text-blue-600 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-2 shadow-sm group">
              <i class="fas fa-file-pdf text-red-500 group-hover:scale-110 transition-transform"></i> Export PDF
            </button>
          </div>
          
          <div formArrayName="education" class="space-y-4">
             @for (edu of educationControls; track $index) {
              <div [formGroupName]="$index" class="p-5 bg-slate-50/50 rounded-xl border border-slate-200/80 relative group hover:bg-white hover:shadow-sm transition-all">
                <button type="button" (click)="removeEducation($index)" class="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 text-xs">
                  <i class="fas fa-times"></i>
                </button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input formControlName="school" placeholder="School / University *" 
                      class="w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                      [class.border-red-300]="edu.get('school')?.invalid && edu.get('school')?.touched"
                      [class.focus:border-red-500]="edu.get('school')?.invalid && edu.get('school')?.touched"
                      [class.focus:ring-red-100]="edu.get('school')?.invalid && edu.get('school')?.touched"
                      [class.border-slate-200]="!(edu.get('school')?.invalid && edu.get('school')?.touched)"
                      [class.focus:border-blue-500]="!(edu.get('school')?.invalid && edu.get('school')?.touched)"
                      [class.focus:ring-blue-500/10]="!(edu.get('school')?.invalid && edu.get('school')?.touched)">
                    @if (edu.get('school')?.invalid && edu.get('school')?.touched) {
                      <p class="text-xs text-red-500 mt-1">School name is required.</p>
                    }
                  </div>
                  <div>
                    <input formControlName="degree" placeholder="Degree / Certificate *" 
                      class="w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                      [class.border-red-300]="edu.get('degree')?.invalid && edu.get('degree')?.touched"
                      [class.focus:border-red-500]="edu.get('degree')?.invalid && edu.get('degree')?.touched"
                      [class.focus:ring-red-100]="edu.get('degree')?.invalid && edu.get('degree')?.touched"
                      [class.border-slate-200]="!(edu.get('degree')?.invalid && edu.get('degree')?.touched)"
                      [class.focus:border-blue-500]="!(edu.get('degree')?.invalid && edu.get('degree')?.touched)"
                      [class.focus:ring-blue-500/10]="!(edu.get('degree')?.invalid && edu.get('degree')?.touched)">
                    @if (edu.get('degree')?.invalid && edu.get('degree')?.touched) {
                      <p class="text-xs text-red-500 mt-1">Degree is required.</p>
                    }
                  </div>
                  <input formControlName="year" placeholder="Year (e.g. 2018 - 2022)" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none md:col-span-2 text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300">
                </div>
              </div>
            }
          </div>
          
          <button type="button" (click)="addEducation()" class="mt-5 w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-medium text-sm flex items-center justify-center gap-2 group">
            <div class="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <i class="fas fa-plus text-xs"></i>
            </div>
            Add Education
          </button>
        </section>

        <!-- Skills -->
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h3 class="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
              <i class="fas fa-tools text-lg"></i>
            </div>
            Skills
          </h3>
           <textarea formControlName="skills" rows="3" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300 leading-relaxed" placeholder="Comma separated list of skills (e.g. Angular, TypeScript, Tailwind CSS, Leadership)"></textarea>
           <p class="text-xs text-slate-400 mt-2 flex items-center gap-1">
             <i class="fas fa-info-circle"></i> Separate skills with commas
           </p>
        </section>

        <!-- Custom Sections -->
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 mb-12">
            <h3 class="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                    <i class="fas fa-puzzle-piece text-lg"></i>
                </div>
                Custom Sections
            </h3>

            <div formArrayName="customSections" class="space-y-6">
                @for (sec of customSectionsControls; track $index) {
                    <div [formGroupName]="$index" class="p-5 bg-slate-50/50 rounded-xl border border-slate-200/80 relative group hover:bg-white hover:shadow-sm transition-all">
                        <div class="absolute -top-2 -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                           <button type="button" title="Move Up" (click)="moveCustomSection($index, -1)" [disabled]="$index === 0" class="bg-white text-slate-400 hover:text-blue-500 border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                               <i class="fas fa-arrow-up"></i>
                           </button>
                           <button type="button" title="Move Down" (click)="moveCustomSection($index, 1)" [disabled]="$index === customSectionsControls.length - 1" class="bg-white text-slate-400 hover:text-blue-500 border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                               <i class="fas fa-arrow-down"></i>
                           </button>
                           <button type="button" title="Delete Section" (click)="removeCustomSection($index)" class="bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-xs">
                               <i class="fas fa-times"></i>
                           </button>
                        </div>
                        
                        <input formControlName="title" placeholder="Section Title (e.g. Projects)" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300 mb-4 font-semibold">
                        
                        <div class="relative">
                            <textarea formControlName="content" rows="4" placeholder="Enter your section content here..." class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm hover:border-slate-300 leading-relaxed"></textarea>
                        </div>
                    </div>
                }
            </div>

            <button type="button" (click)="addCustomSection()" class="mt-5 w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-medium text-sm flex items-center justify-center gap-2 group">
                <div class="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <i class="fas fa-plus text-xs"></i>
                </div>
                Add Custom Section
            </button>
        </section>

      </form>
    </div>
  `
})
export class ResumeFormComponent {
  private geminiService = inject(GeminiService);
  private historyService = inject(HistoryService);

  @Output() formChange = new EventEmitter<any>();
  @Output() exportSection = new EventEmitter<{ name: string; data: any }>();
  @Input() 
  set initialData(data: any) {
    if (data) {
      // Logic to patch form would go here if we were loading saved data
      // For now we start with default
    }
  }

  isGeneratingSummary = signal(false);
  private isUpdatingFromHistory = false;
  lastAiAction = signal<{ path: string; type: 'generate-summary' | 'polish' | 'generate-points' } | null>(null);

  private fb: FormBuilder;
  form: FormGroup;

  constructor() {
    this.fb = inject(FormBuilder);
    this.form = this.fb.group({
      fullName: ['Alex Morgan', Validators.required],
      jobTitle: ['Senior Product Designer', Validators.required],
      email: ['alex.morgan@example.com', [Validators.required, Validators.email]],
      phone: ['+1 (555) 123-4567'],
      location: ['New York, NY'],
      website: ['linkedin.com/in/alexmorgan'],
      twitter: ['@alexmorgan_design'],
      github: ['github.com/alexmorgan'],
      summary: ['Passionate product designer with 5+ years of experience in building user-centric digital products. Proven track record of improving user engagement and streamlining workflows. Adept at collaborating with cross-functional teams to deliver high-quality solutions.'],
      experience: this.fb.array([
        this.createExperienceGroup('TechFlow Inc.', 'Senior UI/UX Designer', '2021', 'Present', 'Led the redesign of the core product dashboard, resulting in a 20% increase in user engagement. Managed a team of 3 junior designers and established a new design system.'),
        this.createExperienceGroup('Creative Studio', 'UI Designer', '2018', '2021', 'Collaborated with developers to implement responsive web designs. Conducted user research and usability testing to iterate on product features.')
      ]),
      education: this.fb.array([
        this.createEducationGroup('Parsons School of Design', 'BFA in Design and Technology', '2014 - 2018')
      ]),
      skills: ['Figma, Adobe XD, Sketch, HTML/CSS, Prototyping, User Research, Agile Methodology'],
      customSections: this.fb.array([])
    });

    this.loadFromLocalStorage();

    this.form.valueChanges.pipe(
      debounceTime(500) // Avoid saving on every keystroke
    ).subscribe(value => {
      localStorage.setItem('resumeData', JSON.stringify(value));
      this.formChange.emit(value);
      if (!this.isUpdatingFromHistory) {
        this.historyService.addState(value);
      }
    });

    // Emit initial value and set initial history state
    setTimeout(() => {
      const initialValue = this.form.getRawValue();
      this.formChange.emit(initialValue);
      // This will be the very first state in our history
      this.historyService.addState(initialValue);
    }, 0);

    // Subscribe to undo/redo triggers
    this.historyService.undoTrigger.subscribe(() => this.onUndo());
    this.historyService.redoTrigger.subscribe(() => this.onRedo());
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
  
  private onUndo() {
    const prevState = this.historyService.undo();
    if (prevState) {
      this.isUpdatingFromHistory = true;
      this.rebuildFormState(prevState);
      this.isUpdatingFromHistory = false;
    }
  }

  private onRedo() {
    const nextState = this.historyService.redo();
    if (nextState) {
      this.isUpdatingFromHistory = true;
      this.rebuildFormState(nextState);
      this.isUpdatingFromHistory = false;
    }
  }

  private rebuildFormState(data: any) {
    if (!data) return;

    // Clear FormArrays
    (this.form.get('experience') as FormArray).clear();
    (this.form.get('education') as FormArray).clear();
    (this.form.get('customSections') as FormArray).clear();

    // Repopulate FormArrays from data
    if (data.experience && Array.isArray(data.experience)) {
      data.experience.forEach((exp: any) => {
        (this.form.get('experience') as FormArray).push(this.createExperienceGroup(exp.company, exp.role, exp.startDate, exp.endDate, exp.description));
      });
    }
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach((edu: any) => {
        (this.form.get('education') as FormArray).push(this.createEducationGroup(edu.school, edu.degree, edu.year));
      });
    }
    if (data.customSections && Array.isArray(data.customSections)) {
      data.customSections.forEach((sec: any) => {
        (this.form.get('customSections') as FormArray).push(this.createCustomSectionGroup(sec.title, sec.content));
      });
    }

    // Patch the rest of the form's values
    this.form.patchValue(data);
  }

  private loadFromLocalStorage() {
    const savedDataString = localStorage.getItem('resumeData');
    if (!savedDataString) return;

    try {
      const parsedData = JSON.parse(savedDataString);
      if (parsedData) {
        this.rebuildFormState(parsedData);
      }
    } catch (e) {
      console.error("Error parsing resume data from localStorage", e);
    }
  }

  get experienceControls() {
    return (this.form.get('experience') as FormArray).controls as AbstractControl<any, any>[];
  }

  get educationControls() {
    return (this.form.get('education') as FormArray).controls as AbstractControl<any, any>[];
  }
  
  get customSectionsControls() {
    return (this.form.get('customSections') as FormArray).controls as AbstractControl<any, any>[];
  }

  createExperienceGroup(company = '', role = '', start = '', end = '', desc = '') {
    return this.fb.group({
      company: [company, Validators.required],
      role: [role, Validators.required],
      startDate: [start],
      endDate: [end],
      description: [desc]
    });
  }

  createEducationGroup(school = '', degree = '', year = '') {
    return this.fb.group({
      school: [school, Validators.required],
      degree: [degree, Validators.required],
      year: [year]
    });
  }

  createCustomSectionGroup(title = 'Custom Section', content = '') {
    return this.fb.group({
      title: [title],
      content: [content]
    });
  }

  addExperience() {
    (this.form.get('experience') as FormArray).push(this.createExperienceGroup());
  }

  removeExperience(index: number) {
    (this.form.get('experience') as FormArray).removeAt(index);
  }

  addEducation() {
    (this.form.get('education') as FormArray).push(this.createEducationGroup());
  }

  removeEducation(index: number) {
    (this.form.get('education') as FormArray).removeAt(index);
  }

  addCustomSection() {
    (this.form.get('customSections') as FormArray).push(this.createCustomSectionGroup());
  }

  removeCustomSection(index: number) {
    (this.form.get('customSections') as FormArray).removeAt(index);
  }

  moveCustomSection(index: number, direction: number) {
    const sections = this.form.get('customSections') as FormArray;
    const control = sections.at(index);
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= sections.length) {
      return;
    }

    sections.removeAt(index);
    sections.insert(newIndex, control);
  }

  onUserInputChange(controlPath: string) {
    if (this.lastAiAction()?.path === controlPath) {
      this.lastAiAction.set(null);
    }
  }

  rerunLastAiAction() {
    const lastAction = this.lastAiAction();
    if (!lastAction) return;

    if (lastAction.type === 'generate-summary') {
      this.generateSummary();
    } else if (lastAction.type === 'polish') {
      if (lastAction.path.startsWith('experience')) {
        const index = parseInt(lastAction.path.split('.')[1], 10);
        this.enhanceExperience(index);
      } else {
        this.enhanceField(lastAction.path);
      }
    } else if (lastAction.type === 'generate-points') {
      if (lastAction.path.startsWith('experience')) {
         const index = parseInt(lastAction.path.split('.')[1], 10);
         this.generatePoints(index);
      }
    }
  }

  async enhanceField(controlName: string) {
    const control = this.form.get(controlName);
    if (control && control.value) {
      const polished = await this.geminiService.polishText(control.value);
      if (polished) {
        control.setValue(polished);
        this.lastAiAction.set({ path: controlName, type: 'polish' });
      }
    }
  }

  async enhanceExperience(index: number) {
    const experiences = this.form.get('experience') as FormArray;
    const control = experiences.at(index).get('description');
    if (control && control.value) {
      const polished = await this.geminiService.polishText(control.value);
      if (polished) {
        control.setValue(polished);
        this.lastAiAction.set({ path: `experience.${index}.description`, type: 'polish' });
      }
    }
  }

  async generatePoints(index: number) {
    const experiences = this.form.get('experience') as FormArray;
    const group = experiences.at(index);
    const role = group.get('role')?.value;
    const company = group.get('company')?.value;
    const control = group.get('description');

    if (role && company) {
      const points = await this.geminiService.generateExperiencePoints(role, company);
      if (points) {
        // Append or replace? Let's replace if empty, append if not.
        const current = control?.value || '';
        const newValue = current ? current + '\n\n' + points : points;
        control?.setValue(newValue);
        this.lastAiAction.set({ path: `experience.${index}.description`, type: 'generate-points' });
      }
    } else {
      alert('Please fill in Role and Company first.');
    }
  }

  async generateSummary() {
    this.isGeneratingSummary.set(true);
    // Get raw values to ensure we capture all relevant fields including job title and skills
    const formValue = this.form.getRawValue();
    const experience = formValue.experience || [];
    const jobTitle = formValue.jobTitle || '';
    const skills = formValue.skills || '';
    
    // Pass everything to the service
    const summary = await this.geminiService.generateSummary(experience, jobTitle, skills);
    
    if (summary) {
      this.form.get('summary')?.setValue(summary);
      this.lastAiAction.set({ path: 'summary', type: 'generate-summary' });
    }
    this.isGeneratingSummary.set(false);
  }
}