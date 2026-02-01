import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { Type } from '@google/genai';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-resume-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-8 max-w-7xl mx-auto">
      <header class="mb-8">
        <h2 class="text-3xl font-bold text-slate-800">AI Resume Analyzer</h2>
        <p class="text-slate-500 mt-1">Get instant feedback to optimize your resume for ATS and recruiters.</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Input Side -->
        <div class="space-y-4 flex flex-col h-full">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
            <!-- PDF Upload -->
            <label class="block text-sm font-bold text-slate-700 mb-2">1. Upload Your Resume</label>
            <div class="mb-4">
              <input type="file" #fileInput (change)="onFileSelected($event)" accept=".pdf" class="hidden">
              <button (click)="fileInput.click()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Choose PDF File
              </button>
              @if (selectedFileName()) {
                <div class="mt-3 text-center text-xs text-slate-500 bg-green-50 border border-green-200 p-2 rounded-md">
                  Selected: <span class="font-medium text-green-700">{{ selectedFileName() }}</span>
                </div>
              }
            </div>

            <div class="flex items-center my-4">
              <div class="flex-grow border-t border-slate-200"></div>
              <span class="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">Or</span>
              <div class="flex-grow border-t border-slate-200"></div>
            </div>

            <label class="block text-sm font-bold text-slate-700 mb-2">2. Paste Resume Text</label>
            <textarea [ngModel]="resumeText()" (ngModelChange)="resumeText.set($event)" rows="10" 
              class="w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-mono mb-4 bg-slate-50 flex-1"
              placeholder="Paste the plain text content of your resume here..."></textarea>

            <label class="block text-sm font-bold text-slate-700 mb-2">3. Target Job Description (Optional)</label>
            <textarea [ngModel]="jobDescription()" (ngModelChange)="jobDescription.set($event)" rows="8"
              class="w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-mono bg-slate-50"
              placeholder="For a detailed match analysis, paste the job description you're applying for."></textarea>
          </div>
          
          <button (click)="analyze()" [disabled]="!resumeText() || loading()"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.414l2.26-2.26A4 4 0 1011 5z" clip-rule="evenodd" />
            </svg>
            {{ loading() ? 'Analyzing...' : 'Analyze My Resume' }}
          </button>
        </div>

        <!-- Result Side -->
        <div class="min-h-[500px]">
          @if (loading()) {
             <div class="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
               <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
               <p class="animate-pulse font-medium">{{ parsingPdf() ? 'Reading PDF...' : 'Running advanced analysis...' }}</p>
               <p class="text-sm mt-1">This might take a moment.</p>
             </div>
          } @else if (result()) {
            <div class="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 space-y-6 animate-fade-in-up">
              <!-- Score -->
              <div class="text-center border-b border-slate-200 pb-6">
                 <div class="relative w-32 h-32 mx-auto mb-4">
                    <svg class="w-full h-full" viewBox="0 0 100 100">
                      <circle class="text-slate-200" stroke-width="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                      <circle 
                        class="text-indigo-600"
                        stroke-width="10" stroke-linecap="round" stroke="currentColor" fill="transparent"
                        r="45" cx="50" cy="50"
                        [style.stroke-dasharray]="circumference"
                        [style.stroke-dashoffset]="strokeDashoffset()"
                        style="transition: stroke-dashoffset 0.8s cubic-bezier(0.65, 0, 0.35, 1);"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-4xl font-extrabold text-slate-800">{{ result().score }}</span>
                      <span class="text-lg font-bold text-slate-500">%</span>
                    </div>
                  </div>
                 <h3 class="text-2xl font-bold text-slate-800">{{ jobDescription() ? 'Resume-Job Match Score' : 'General ATS Score' }}</h3>
                 <p class="text-slate-600 mt-2 text-sm max-w-md mx-auto">{{ result().suggestions }}</p>
              </div>

              <!-- Keyword Analysis -->
              @if (result().keywordAnalysis && (result().keywordAnalysis.matchedKeywords?.length > 0 || result().keywordAnalysis.missingKeywords?.length > 0)) {
                <div class="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 class="font-bold text-slate-700 mb-3">Keyword Analysis</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 class="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                        Matched Keywords
                      </h5>
                      <div class="flex flex-wrap gap-1.5">
                        @for (keyword of result().keywordAnalysis.matchedKeywords; track $index) {
                          <span class="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">{{ keyword }}</span>
                        }
                      </div>
                    </div>
                    <div>
                      <h5 class="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                        Missing Keywords
                      </h5>
                      <div class="flex flex-wrap gap-1.5">
                        @for (keyword of result().keywordAnalysis.missingKeywords; track $index) {
                          <span class="text-[11px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">{{ keyword }}</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
              
              <!-- Skill Gap Analysis -->
              @if (result().skillGapAnalysis && (result().skillGapAnalysis.userSkills?.length > 0 || result().skillGapAnalysis.missingSkills?.length > 0)) {
                <div class="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 class="font-bold text-slate-700 mb-3">Skill Match</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 class="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM12 12a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>
                        Your Skills
                      </h5>
                      <div class="flex flex-wrap gap-1.5">
                        @for (skill of result().skillGapAnalysis.userSkills; track $index) {
                          <span class="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">{{ skill }}</span>
                        }
                      </div>
                    </div>
                    <div>
                      <h5 class="text-xs font-semibold text-yellow-700 mb-2 flex items-center gap-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg>
                        Skills to Develop
                      </h5>
                      <div class="flex flex-wrap gap-1.5">
                        @for (skill of result().skillGapAnalysis.missingSkills; track $index) {
                          <span class="text-[11px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">{{ skill }}</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Strengths & Improvements -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                    Strengths
                  </h4>
                  <ul class="space-y-2 pl-1">
                    @for (str of result().strengths; track $index) { <li class="text-sm text-slate-600 leading-relaxed">{{ str }}</li> }
                  </ul>
                </div>
                <div>
                  <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    Improvements
                  </h4>
                  <ul class="space-y-2 pl-1">
                    @for (weak of result().weaknesses; track $index) { <li class="text-sm text-slate-600 leading-relaxed">{{ weak }}</li> }
                  </ul>
                </div>
              </div>

              <!-- Recommended Courses -->
              @if (result().courseRecommendations && result().courseRecommendations.length > 0) {
                <div class="pt-6 border-t border-slate-200">
                  <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i class="fas fa-graduation-cap text-indigo-500"></i> Recommended Courses
                  </h3>
                  <div class="space-y-3">
                    @for (course of result().courseRecommendations; track $index) {
                      <a [href]="course.url" target="_blank" rel="noopener noreferrer" class="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-all group">
                        <div class="flex justify-between items-center">
                          <div>
                            <p class="font-semibold text-slate-800 group-hover:text-indigo-600">{{ course.courseTitle }}</p>
                            <p class="text-xs font-medium text-slate-500">{{ course.platform }}</p>
                          </div>
                          <i class="fas fa-external-link-alt text-slate-400 group-hover:text-indigo-500 transition-colors"></i>
                        </div>
                      </a>
                    }
                  </div>
                </div>
              }
              
              <!-- In-Depth Analysis Section -->
              @if (result().inDepthAnalysis) {
                <div class="pt-6 border-t border-slate-200">
                  <h3 class="text-2xl font-bold text-slate-800 mb-2">Deep Dive Analysis</h3>
                  <p class="text-slate-600 mb-6 text-sm">A comprehensive look at your career trajectory based on your resume.</p>

                  <!-- Tab Navigation -->
                  <div class="flex border-b border-slate-200 mb-6 -mx-6 sm:-mx-8 px-6 sm:px-8">
                    <button (click)="activeDeepDiveTab.set('roadmap')" 
                            [class.border-indigo-600]="activeDeepDiveTab() === 'roadmap'" 
                            [class.text-indigo-600]="activeDeepDiveTab() === 'roadmap'" 
                            class="px-4 py-3 border-b-2 font-semibold text-sm text-slate-500 hover:bg-slate-50 transition-colors -mb-px">
                      <i class="fas fa-map-signs mr-2"></i> Career Roadmap
                    </button>
                    <button (click)="activeDeepDiveTab.set('gaps')" 
                            [class.border-indigo-600]="activeDeepDiveTab() === 'gaps'" 
                            [class.text-indigo-600]="activeDeepDiveTab() === 'gaps'" 
                            class="px-4 py-3 border-b-2 font-semibold text-sm text-slate-500 hover:bg-slate-50 transition-colors -mb-px">
                      <i class="fas fa-key mr-2"></i> Keywords & Gaps
                    </button>
                    <button (click)="activeDeepDiveTab.set('certs')" 
                            [class.border-indigo-600]="activeDeepDiveTab() === 'certs'" 
                            [class.text-indigo-600]="activeDeepDiveTab() === 'certs'" 
                            class="px-4 py-3 border-b-2 font-semibold text-sm text-slate-500 hover:bg-slate-50 transition-colors -mb-px">
                      <i class="fas fa-certificate mr-2"></i> Certifications
                    </button>
                  </div>

                  <!-- Tab Content -->
                  <div class="animate-fade-in-up">
                    @if (activeDeepDiveTab() === 'roadmap') {
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2"><i class="fas fa-layer-group text-indigo-500"></i> Essential Skills to Acquire</h4>
                              <ul class="list-disc list-inside space-y-2 text-sm text-slate-600">
                                  @for(skill of result().inDepthAnalysis.careerRoadmap.essentialSkills; track $index) {
                                      <li>{{ skill }}</li>
                                  }
                              </ul>
                          </div>
                          <div>
                              <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2"><i class="fas fa-puzzle-piece text-indigo-500"></i> Supplementary Skills</h4>
                              <ul class="list-disc list-inside space-y-2 text-sm text-slate-600">
                                  @for(skill of result().inDepthAnalysis.careerRoadmap.supplementarySkills; track $index) {
                                      <li>{{ skill }}</li>
                                  }
                              </ul>
                          </div>
                      </div>
                      <div class="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                          <h4 class="font-bold text-slate-700 mb-2 flex items-center gap-2"><i class="fas fa-chart-line text-indigo-500"></i> Potential 5-Year Career Progression</h4>
                          <p class="text-sm text-indigo-800">{{ result().inDepthAnalysis.careerRoadmap.careerProgression }}</p>
                      </div>
                    }
                    @if (activeDeepDiveTab() === 'gaps') {
                      <div class="space-y-6">
                          <div>
                              <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2"><i class="fas fa-key text-amber-500"></i> Underrepresented Keywords</h4>
                              <p class="text-sm text-slate-500 mb-3">These keywords are crucial for your target role but are missing or underemphasized in your resume.</p>
                              <div class="flex flex-wrap gap-2">
                                  @for(keyword of result().inDepthAnalysis.keywordOptimization.underrepresentedKeywords; track $index) {
                                      <span class="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">{{ keyword }}</span>
                                  }
                              </div>
                          </div>
                          <div class="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                              <h4 class="font-bold text-slate-700 mb-2 flex items-center gap-2"><i class="fas fa-edit text-amber-500"></i> Experience Reframing Advice</h4>
                              <p class="text-sm text-amber-800 whitespace-pre-line">{{ result().inDepthAnalysis.experienceReframingAdvice }}</p>
                          </div>
                      </div>
                    }
                    @if (activeDeepDiveTab() === 'certs') {
                      <div>
                          <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2"><i class="fas fa-certificate text-sky-500"></i> Recommended Training & Certifications</h4>
                          <div class="space-y-3">
                              @for(cert of result().inDepthAnalysis.recommendedCertifications; track $index) {
                                  <div class="flex items-center gap-3 p-3 bg-sky-50 border border-sky-100 rounded-lg">
                                      <i class="fas fa-graduation-cap text-sky-500"></i>
                                      <span class="text-sm text-sky-800">{{ cert }}</span>
                                  </div>
                              }
                          </div>
                      </div>
                    }
                  </div>
                </div>
              }

            </div>
          } @else {
            <div class="h-full flex items-center justify-center text-slate-400 bg-white rounded-xl border-dashed border-2 border-slate-200 shadow-sm">
              <div class="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p class="font-medium">Your analysis will appear here</p>
                <p class="text-sm">Upload a PDF or paste your resume to start.</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ResumeAnalyzerComponent {
  gemini = inject(GeminiService);
  resumeText = signal('');
  jobDescription = signal('');
  loading = signal(false);
  parsingPdf = signal(false);
  result = signal<any>(null);
  selectedFileName = signal('');
  activeDeepDiveTab = signal<'roadmap' | 'gaps' | 'certs'>('roadmap');

  readonly circumference = 2 * Math.PI * 45;
  strokeDashoffset = computed(() => {
    const score = this.result()?.score || 0;
    return this.circumference - (score / 100) * this.circumference;
  });

  constructor() {
    // Prefer a local worker file (copied from node_modules) to avoid CDN/version issues.
    // If you prefer CDN, you can switch to:
    // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    if (typeof window !== 'undefined') {
      // point to the asset we copied: src/assets/pdf.worker.min.mjs (or .js)
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      return;
    }

    this.selectedFileName.set(file.name);
    this.loading.set(true);
    this.parsingPdf.set(true);
    this.result.set(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      const Y_TOLERANCE = 3; // Vertical tolerance for items on the same line

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        if (!textContent.items || textContent.items.length === 0) {
          continue;
        }
        
        // Sort items by vertical, then horizontal position to reconstruct reading order
        const items = (textContent.items as any[]).sort((a, b) => {
          if (Math.abs(a.transform[5] - b.transform[5]) > Y_TOLERANCE) {
            return b.transform[5] - a.transform[5]; // Sort by Y (top-to-bottom)
          }
          return a.transform[4] - b.transform[4]; // Then by X (left-to-right)
        });

        let pageText = '';
        if (items.length > 0) {
            let lastItem = items[0];
            pageText += lastItem.str;

            for (let j = 1; j < items.length; j++) {
              const currentItem = items[j];
              const yDiff = Math.abs(currentItem.transform[5] - lastItem.transform[5]);
              const itemHeight = lastItem.height || 12; // Use a fallback height

              // A large vertical gap indicates a new paragraph
              if (yDiff > itemHeight * 1.5) {
                  pageText += '\n\n';
              } else if (yDiff > Y_TOLERANCE) { // A smaller gap is a simple new line
                  pageText += '\n';
              } else {
                  // Items are on the same line, check for horizontal gaps to add spaces
                  const gap = currentItem.transform[4] - (lastItem.transform[4] + lastItem.width);
                  const spaceThreshold = itemHeight * 0.25;
                  
                  if (gap > spaceThreshold) {
                    // A very large gap could be a column separator
                    if (gap > itemHeight * 3) {
                      pageText += '   '; 
                    } else {
                      pageText += ' ';
                    }
                  }
              }
              pageText += currentItem.str;
              lastItem = currentItem;
            }
        }
        fullText += pageText + '\n\n'; // Add space between pages
      }

      // Post-processing to clean up the extracted text
      fullText = fullText.replace(/ +/g, ' '); // Consolidate multiple spaces
      fullText = fullText.split('\n').map(line => line.trim()).join('\n'); // Trim each line
      fullText = fullText.replace(/\n{3,}/g, '\n\n'); // Normalize newlines
      
      this.resumeText.set(fullText.trim());
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Could not read text from the PDF. It might be image-based or protected. Please try copying and pasting the text manually.');
      this.selectedFileName.set('');
    } finally {
      this.loading.set(false);
      this.parsingPdf.set(false);
      if (input) {
        input.value = ''; // Clear the file input for re-selection
      }
    }
  }

  async analyze() {
    this.loading.set(true);
    this.parsingPdf.set(false); // Ensure this is false for analysis
    this.result.set(null);
    
    const schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Overall score out of 100." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive aspects of the resume." },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Areas for improvement." },
        suggestions: { type: Type.STRING, description: "A summary of actionable advice." },
        keywordAnalysis: {
            type: Type.OBJECT,
            properties: {
                matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["matchedKeywords", "missingKeywords"],
            description: "Analysis of keywords against the job description. If no job description is provided, return empty arrays for both fields."
        },
        skillGapAnalysis: {
            type: Type.OBJECT,
            properties: {
                userSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["userSkills", "missingSkills"],
            description: "Analysis of skill gaps. 'userSkills' should be extracted from the resume. 'missingSkills' should be skills from the job description not in the resume, or general suggestions if no job description is provided."
        },
        courseRecommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    courseTitle: { type: Type.STRING },
                    platform: { type: Type.STRING, description: "The platform offering the course (e.g., Coursera, edX, Udemy)." },
                    url: { type: Type.STRING, description: "A direct, real URL to the course page." }
                },
                required: ["courseTitle", "platform", "url"]
            },
            description: "List of 2-3 recommended courses with real URLs to address skill gaps or enhance the resume."
        },
        jobRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3-5 alternative job titles the user might be a good fit for based on their resume."
        },
        inDepthAnalysis: {
            type: Type.OBJECT,
            properties: {
                recommendedCertifications: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of 5-6 specific, well-known training courses or certifications relevant to the target role."
                },
                careerRoadmap: {
                    type: Type.OBJECT,
                    properties: {
                        difficulty: { type: Type.STRING, description: "The difficulty level for someone starting this path (e.g., Beginner, Intermediate)." },
                        essentialSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5-6 absolutely essential skills to acquire." },
                        supplementarySkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 supplementary skills to develop." },
                        careerProgression: { type: Type.STRING, description: "A string describing a potential 5-year career progression path, like 'Junior -> Mid-level -> Senior'." },
                    },
                    required: ["difficulty", "essentialSkills", "supplementarySkills", "careerProgression"]
                },
                keywordOptimization: {
                    type: Type.OBJECT,
                    properties: {
                        underrepresentedKeywords: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of 10-15 crucial keywords for the target role that are missing or underrepresented in the resume."
                        }
                    },
                    required: ["underrepresentedKeywords"]
                },
                experienceReframingAdvice: {
                    type: Type.STRING,
                    description: "A detailed paragraph on how the user can reframe their existing experience (especially from projects) to better align with the target role, focusing on analysis, insights, and impact."
                }
            },
            required: ["recommendedCertifications", "careerRoadmap", "keywordOptimization", "experienceReframingAdvice"]
        }
      },
      required: ["score", "strengths", "weaknesses", "suggestions", "keywordAnalysis", "skillGapAnalysis", "courseRecommendations", "jobRecommendations", "inDepthAnalysis"]
    };

    const prompt = `
    Analyze the following resume and provide a detailed review in JSON format.

    Resume Text:
    ---
    ${this.resumeText()}
    ---

    ${this.jobDescription() ? `
    Job Description for Comparison:
    ---
    ${this.jobDescription()}
    ---
    ` : ''}

    Please analyze the resume and return a JSON object with the following structure:
    1.  **score**: ${this.jobDescription() ? 'A "Match Score" out of 100 based on skill and keyword alignment with the job description.' : 'A general "ATS Score" out of 100 based on formatting, clarity, and best practices.'}
    2.  **strengths**: 3-4 bullet points on what the resume does well.
    3.  **weaknesses**: 3-4 bullet points on what needs improvement.
    4.  **suggestions**: A concise, actionable paragraph summarizing the most important changes.
    5.  **keywordAnalysis**: ${this.jobDescription() ? 'Compare resume against the job description. Extract the 5-7 most important matched and missing keywords.' : 'Return empty arrays for matchedKeywords and missingKeywords as no job description was provided.'}
    6.  **skillGapAnalysis**: ${this.jobDescription() ? 'Analyze skills from the resume and job description. Populate "userSkills" with skills found in the resume, and "missingSkills" with important skills from the job description that are not in the resume.' : 'Populate "userSkills" with skills extracted from the resume. For "missingSkills", suggest 3-5 general technical or soft skills that would complement the user\'s profile.'}
    7.  **courseRecommendations**: Based on the analysis, suggest 2-3 specific online courses. For each, provide the course title, the platform (e.g., "Coursera", "edX", "Udemy"), and a real, direct URL to the course page.
    8.  **jobRecommendations**: Based on the skills and experience in the resume, suggest 3-5 alternative job titles the candidate might be qualified for.
    9.  **inDepthAnalysis**: Provide a detailed career-focused analysis.
        - **recommendedCertifications**: List 5-6 popular, real-world certifications.
        - **careerRoadmap**: Create a personalized learning path with essential and supplementary skills, and a potential 5-year career progression.
        - **keywordOptimization**: List 10-15 crucial, underrepresented keywords.
        - **experienceReframingAdvice**: Provide a detailed paragraph explaining how to re-word project descriptions to focus on data analysis, insights, and impact, rather than just development tasks.
    `;

    try {
      const data = await this.gemini.generateJson(prompt, schema);
      this.result.set(data);
    } catch (e) {
      alert("Analysis failed. The resume text might be too long or the format is unreadable. Please try again with a plain text resume.");
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}