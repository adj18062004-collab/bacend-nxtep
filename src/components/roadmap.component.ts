import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { UserService } from '../services/user.service';
import { Type } from '@google/genai';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-8 max-w-5xl mx-auto min-h-[calc(100vh-4rem)]">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-slate-800">AI Career Roadmap</h2>
        <p class="text-slate-500 mt-2">Generate a personalized learning path to reach your career goals.</p>
      </div>
      
      <!-- Goal Input Section -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 transition-all hover:shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">1. What is your target role?</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-slate-400">🎯</span>
              </div>
              <input [(ngModel)]="goal" (keyup.enter)="generate()" 
                placeholder="e.g. Senior Frontend Engineer at Google" 
                class="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                [disabled]="loading()">
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">2. What is your current skill level?</label>
            <select [(ngModel)]="skillLevel" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all appearance-none" [disabled]="loading()">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">3. Weekly time commitment?</label>
              <select [(ngModel)]="timeAvailability" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all appearance-none" [disabled]="loading()">
                <option>2-5 hours/week</option>
                <option>5-10 hours/week</option>
                <option>10+ hours/week</option>
              </select>
          </div>
          <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">4. Preferred learning style?</label>
              <div class="flex items-center gap-4 pt-2">
                  @for(pref of learningPreferences; track pref.id) {
                      <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox" [checked]="learningPreference().includes(pref.id)" (change)="toggleLearningPreference(pref.id)"
                                class="w-5 h-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer">
                          {{ pref.label }}
                      </label>
                  }
              </div>
          </div>
        </div>
        <div class="mt-6 pt-6 border-t border-slate-200">
          <button (click)="generate()" [disabled]="loading() || !goal || learningPreference().length === 0"
            class="w-full bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-orange-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap">
            @if (loading()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Personalized Path...
            } @else {
              <span>Generate Path</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            }
          </button>
        </div>
      </div>

      @if (roadmap()) {
        <!-- Progress Overview -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 animate-fade-in-down">
          <div class="flex justify-between items-end mb-3">
             <div>
                <h3 class="text-lg font-bold text-slate-800">Your Journey Progress</h3>
                <p class="text-sm text-slate-500 font-medium">{{ completedSteps() }} of {{ totalSteps() }} milestones completed</p>
             </div>
             <div class="flex items-center gap-2">
               <span class="text-3xl font-bold text-orange-600">{{ progress() }}%</span>
             </div>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
             <div class="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000 ease-out relative" [style.width.%]="progress()">
                <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
             </div>
          </div>
        </div>

        <!-- Skill Analysis -->
        @if (roadmap()?.skillAnalysis) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-fade-in-up">
            <!-- Strengths -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-green-100 relative overflow-hidden group hover:shadow-md transition-all">
               <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg class="w-24 h-24 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
               </div>
               <h4 class="font-bold text-green-800 mb-4 flex items-center gap-2">
                 <span class="bg-green-100 p-1.5 rounded-lg"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></span>
                 Your Existing Skills
               </h4>
               <div class="flex flex-wrap gap-2 relative z-10">
                  @if (roadmap().skillAnalysis.currentSkills.length > 0) {
                    @for (skill of roadmap().skillAnalysis.currentSkills; track $index) {
                      <span class="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">{{ skill }}</span>
                    }
                  } @else {
                    <p class="text-sm text-slate-400 italic">No matching skills found yet. Time to start learning!</p>
                  }
               </div>
            </div>

            <!-- Gaps -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-orange-100 relative overflow-hidden group hover:shadow-md transition-all">
               <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg class="w-24 h-24 text-orange-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 011.05-.625l2.056.513a1 1 0 001.298-.975V5.5c0-.552.448-1 1-1s1 .448 1 1v2.462a1 1 0 001.298.975l2.056-.513a1 1 0 011.05.625l2.646-1.323a1 1 0 000-1.84l-7-3zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>
               </div>
               <h4 class="font-bold text-orange-800 mb-4 flex items-center gap-2">
                 <span class="bg-orange-100 p-1.5 rounded-lg"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
                 Skills to Master
               </h4>
               <div class="flex flex-wrap gap-2 relative z-10">
                  @for (skill of roadmap().skillAnalysis.gapSkills; track $index) {
                    <span class="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-semibold">{{ skill }}</span>
                  }
               </div>
            </div>
          </div>
        }

        <!-- Timeline -->
        @if (roadmap()?.steps) {
          <div class="flex justify-between items-center mb-6">
             <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
               Your Learning Path
               <span class="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Step-by-step</span>
             </h3>
             <button (click)="clearRoadmap()" class="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
               <i class="fas fa-trash-alt mr-1"></i> Clear Roadmap
             </button>
          </div>

          <div class="relative pl-6 sm:pl-10 space-y-12 before:content-[''] before:absolute before:left-3 sm:before:left-5 before:top-2 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-orange-200 before:to-slate-100">
            @for (step of roadmap()?.steps; track $index) {
              <div class="relative animate-fade-in-up" [style.animation-delay]="$index * 100 + 'ms'">
                <!-- Timeline dot -->
                <button (click)="toggleStep($index)" 
                     class="absolute -left-[2.1rem] sm:-left-[2.6rem] top-0 w-10 h-10 rounded-full border-4 shadow-sm transition-all duration-300 flex items-center justify-center z-10 group"
                     [class.bg-white]="!step.completed"
                     [class.border-orange-200]="!step.completed"
                     [class.text-orange-300]="!step.completed"
                     [class.bg-green-500]="step.completed"
                     [class.border-green-600]="step.completed"
                     [class.text-white]="step.completed">
                     @if (step.completed) {
                       <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                     } @else {
                       <span class="text-sm font-bold group-hover:text-orange-500">{{ $index + 1 }}</span>
                     }
                </button>
                
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group" 
                     [class.opacity-60]="step.completed"
                     [class.grayscale]="step.completed">
                  
                  <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                     <div>
                       <div class="flex items-center gap-3 mb-1">
                         <span class="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-wider">{{ step.duration }}</span>
                         @if (step.completed) { <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><i class="fas fa-check-circle"></i> Completed</span> }
                       </div>
                       <h3 class="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{{ step.title }}</h3>
                     </div>
                     
                     <label class="flex items-center gap-2 cursor-pointer select-none">
                       <span class="text-sm font-medium text-slate-400 group-hover:text-slate-600">{{ step.completed ? 'Done' : 'Mark Complete' }}</span>
                       <input type="checkbox" [checked]="step.completed" (change)="toggleStep($index)" 
                         class="w-6 h-6 text-orange-600 rounded-md border-slate-300 focus:ring-orange-500 cursor-pointer transition-all">
                     </label>
                  </div>
                  
                  <p class="text-slate-600 leading-relaxed mb-6 whitespace-pre-line">{{ step.description }}</p>
                  
                  <!-- Prerequisites -->
                  @if (step.prerequisites && step.prerequisites.length) {
                      <div class="mb-6">
                          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <i class="fas fa-check-double text-gray-400"></i> Prerequisites
                          </h4>
                          <div class="flex flex-wrap gap-2">
                              @for (prereq of step.prerequisites; track $index) {
                                  <span class="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm">{{ prereq }}</span>
                              }
                          </div>
                      </div>
                  }

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Topics -->
                    @if (step.topics && step.topics.length) {
                       <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <i class="fas fa-book-open text-orange-400"></i> Key Topics
                         </h4>
                         <div class="flex flex-wrap gap-2">
                           @for (topic of step.topics; track $index) {
                             <span class="bg-white text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm">{{ topic }}</span>
                           }
                         </div>
                       </div>
                    }
                    
                    <!-- Project Idea -->
                    @if (step.projectIdea) {
                       <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                         <h4 class="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <i class="fas fa-code-branch"></i> Practical Project
                         </h4>
                         <p class="text-sm text-indigo-800 italic">"{{ step.projectIdea }}"</p>
                       </div>
                    }
                  </div>

                  <!-- Resources -->
                  @if (step.resources && step.resources.length > 0) {
                      <div class="mt-6 pt-4 border-t border-slate-100">
                          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <i class="fas fa-link text-blue-400"></i> Learning Resources
                          </h4>
                          <div class="space-y-2">
                              @for (resource of step.resources; track $index) {
                                  <a [href]="resource.url" target="_blank" rel="noopener noreferrer" class="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-all group/link">
                                      <div class="flex justify-between items-center">
                                          <div>
                                              <p class="font-semibold text-sm text-slate-800 group-hover/link:text-blue-600">{{ resource.title }}</p>
                                              <span class="text-xs font-medium text-white px-2 py-0.5 rounded-full mt-1 inline-block" [class]="getResourceBadgeColor(resource.type)">{{ resource.type }}</span>
                                          </div>
                                          <i class="fas fa-external-link-alt text-slate-400 group-hover/link:text-blue-500 transition-colors text-xs"></i>
                                      </div>
                                  </a>
                              }
                          </div>
                      </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class RoadmapComponent {
  gemini = inject(GeminiService);
  userService = inject(UserService);
  
  goal = '';
  skillLevel = signal<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  timeAvailability = signal<string>('5-10 hours/week');
  learningPreference = signal<string[]>(['Videos']);

  loading = signal(false);
  roadmap = signal<any>(null);

  learningPreferences = [
    { id: 'Videos', label: 'Videos' },
    { id: 'Articles', label: 'Articles' },
    { id: 'Projects', label: 'Projects' }
  ];

  completedSteps = computed(() => this.roadmap()?.steps.filter((s: any) => s.completed).length || 0);
  totalSteps = computed(() => this.roadmap()?.steps.length || 0);
  progress = computed(() => {
    if (this.totalSteps() === 0) return 0;
    return Math.round((this.completedSteps() / this.totalSteps()) * 100);
  });

  constructor() {
    effect(() => {
      const user = this.userService.user();
      if (user) {
        this.roadmap.set(user.roadmap);
      }
    });
  }

  toggleLearningPreference(pref: string) {
    this.learningPreference.update(current => {
      if (current.includes(pref)) {
        return current.filter(p => p !== pref);
      } else {
        return [...current, pref];
      }
    });
  }

  getResourceBadgeColor(type: string): string {
    switch (type?.toLowerCase()) {
      case 'video': return 'bg-red-500';
      case 'article': return 'bg-blue-500';
      case 'course': return 'bg-purple-500';
      case 'documentation': return 'bg-gray-500';
      default: return 'bg-slate-500';
    }
  }

  toggleStep(index: number) {
    const currentMap = this.roadmap();
    if (!currentMap) return;

    const steps = [...currentMap.steps];
    steps[index].completed = !steps[index].completed;
    const newMap = { ...currentMap, steps };
    
    this.userService.updateRoadmap(newMap);
  }

  clearRoadmap() {
    this.userService.updateRoadmap(null);
  }

  async generate() {
    this.loading.set(true);
    
    const user = this.userService.user();
    const userSkills = user?.resumeData?.skills || 'No skills listed';

    const schema = {
      type: Type.OBJECT,
      properties: {
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING, description: "Detailed description of what to learn. Break this down into weekly actionable tasks based on the user's time commitment." },
              topics: { type: Type.ARRAY, items: { type: Type.STRING } },
              projectIdea: { type: Type.STRING, description: "A concrete, small project idea to practice these skills." },
              prerequisites: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of prerequisite skills or concepts for this step." },
              resources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "e.g., 'Video', 'Article', 'Course', 'Documentation'" },
                    title: { type: Type.STRING, description: "Title of the resource." },
                    url: { type: Type.STRING, description: "A real, working URL to the resource. Prioritize high-quality, free resources if possible." }
                  },
                  required: ["type", "title", "url"]
                },
                description: "A list of 2-3 specific learning resources for this step."
              }
            },
            required: ["title", "duration", "description", "topics", "projectIdea", "prerequisites", "resources"]
          }
        },
        skillAnalysis: {
            type: Type.OBJECT,
            properties: {
                currentSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                gapSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["currentSkills", "requiredSkills", "gapSkills"]
        }
      },
      required: ["steps", "skillAnalysis"]
    };
    
    const prompt = `Create a highly personalized, detailed learning roadmap for a user.

      User Profile:
      - Target Role: ${this.goal}
      - Current Skill Level: ${this.skillLevel()}
      - Current Skills (from resume): "${userSkills}"
      - Weekly Time Commitment: ${this.timeAvailability()}
      - Preferred Learning Style: ${this.learningPreference().join(', ')}

      Please return a JSON object with two main keys:
      1. "steps": An array of 4-6 sequential learning steps. Each step must contain:
        - title: The name of the milestone.
        - duration: An estimated duration (e.g., "2 Weeks") based on the user's time commitment.
        - description: A detailed breakdown of what to learn, structured into weekly actionable tasks.
        - topics: An array of key topics to cover.
        - projectIdea: A concrete, small project to apply the learned skills.
        - prerequisites: A list of skills or concepts that should be understood before starting this step.
        - resources: An array of 2-3 specific, high-quality learning resources (like articles, videos, or courses). Each resource must have a 'type', 'title', and a real, working 'url'. Prioritize free resources that match the user's learning style.

      2. "skillAnalysis": An object performing a skill gap analysis, containing three arrays of strings:
        - "currentSkills": The skills the user already has.
        - "requiredSkills": A list of the most important skills for the target role.
        - "gapSkills": The skills from "requiredSkills" that are missing from the user's "currentSkills".`;

    try {
      const result = await this.gemini.generateJson<any>(prompt, schema);
      
      result.steps = result.steps.map((s: any) => ({ ...s, completed: false }));
      
      this.userService.updateRoadmap(result);

    } catch (e) {
      alert("Failed to generate roadmap. Try again.");
    } finally {
      this.loading.set(false);
    }
  }
}