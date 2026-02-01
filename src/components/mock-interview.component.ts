import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { Type } from '@google/genai';

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 h-[calc(100vh-6rem)] flex flex-col">
       <div class="flex justify-between items-center mb-4">
         <h2 class="text-2xl font-bold text-slate-800">AI Mock Interview</h2>
         @if (started() && !feedback()) {
            <button (click)="endInterview()" [disabled]="loading()" class="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
              {{ loading() ? 'Generating Report...' : 'End & Get Feedback' }}
            </button>
         } @else if (feedback()) {
            <button (click)="reset()" class="text-sm text-slate-500 hover:text-indigo-600">Start New Interview</button>
         }
       </div>

       <div class="bg-white rounded-xl shadow-lg border border-slate-200 flex-1 flex flex-col overflow-hidden">
          
          @if (!feedback()) {
             <!-- Interview Chat -->
             <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                @for (msg of conversation(); track $index) {
                   <div [class.text-right]="msg.role === 'user'">
                     <div [class.bg-rose-600]="msg.role === 'user'" 
                          [class.text-white]="msg.role === 'user'"
                          [class.bg-white]="msg.role === 'interviewer'"
                          [class.text-slate-800]="msg.role === 'interviewer'"
                          class="inline-block max-w-[80%] rounded-2xl px-5 py-3 shadow-sm text-sm border border-transparent"
                          [class.border-slate-200]="msg.role === 'interviewer'">
                        <p>{{ msg.text }}</p>
                     </div>
                   </div>
                }
                 @if (loading()) {
                    <div class="flex justify-start">
                       <div class="text-slate-400 text-xs italic animate-pulse">Interviewer is thinking...</div>
                    </div>
                 }
             </div>

             <!-- Input Controls -->
             <div class="p-4 bg-white border-t border-slate-100">
                @if (!started()) {
                  <div class="text-center p-4">
                    <p class="mb-4 text-slate-600">Enter the role you want to be interviewed for:</p>
                    <form (ngSubmit)="start(customRole)" class="flex justify-center gap-3">
                        <input [(ngModel)]="customRole" name="customRole" placeholder="e.g., Senior Python Developer" 
                            class="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 w-full max-w-sm transition-colors">
                        <button type="submit" [disabled]="!customRole.trim()" 
                            class="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 transition-colors">
                            Start Interview
                        </button>
                    </form>
                  </div>
                } @else {
                  <form (ngSubmit)="reply()" class="flex gap-3">
                    <input [(ngModel)]="userReply" name="reply" placeholder="Type your answer..." 
                      class="flex-1 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500">
                    <button type="submit" [disabled]="!userReply || loading()" class="bg-rose-600 hover:bg-rose-700 text-white px-6 rounded-lg font-bold disabled:opacity-50">Send</button>
                  </form>
                }
             </div>
          } @else {
             <!-- Feedback Report -->
             <div class="flex-1 overflow-y-auto p-8 animate-fade-in-up">
                <div class="text-center mb-8">
                   <div class="inline-block p-4 rounded-full bg-slate-100 mb-4">
                     <span class="text-4xl">📊</span>
                   </div>
                   <h3 class="text-2xl font-bold text-slate-800">Interview Performance Report</h3>
                   <p class="text-slate-500">Here is how you did in your {{ currentRole }} interview.</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-8">
                   <div class="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                      <div class="text-3xl font-bold text-blue-600">{{ feedback().technicalScore }}/10</div>
                      <div class="text-xs font-bold text-blue-400 uppercase tracking-wider">Technical Accuracy</div>
                   </div>
                   <div class="p-4 bg-purple-50 rounded-xl text-center border border-purple-100">
                      <div class="text-3xl font-bold text-purple-600">{{ feedback().communicationScore }}/10</div>
                      <div class="text-xs font-bold text-purple-400 uppercase tracking-wider">Communication</div>
                   </div>
                </div>

                <div class="space-y-6">
                   <div class="bg-green-50 p-6 rounded-xl border border-green-100">
                      <h4 class="font-bold text-green-800 mb-2">✅ What went well</h4>
                      <p class="text-green-700 text-sm leading-relaxed">{{ feedback().strengths }}</p>
                   </div>
                   <div class="bg-orange-50 p-6 rounded-xl border border-orange-100">
                      <h4 class="font-bold text-orange-800 mb-2">🚧 Improvements Needed</h4>
                      <p class="text-orange-700 text-sm leading-relaxed">{{ feedback().improvements }}</p>
                   </div>
                </div>
             </div>
          }
       </div>
    </div>
  `
})
export class MockInterviewComponent {
  gemini = inject(GeminiService);
  conversation = signal<{role: 'user' | 'interviewer', text: string}[]>([]);
  userReply = '';
  loading = signal(false);
  started = signal(false);
  currentRole = '';
  customRole = '';
  
  feedback = signal<any>(null);

  async start(role: string) {
    if (!role.trim()) return;
    this.started.set(true);
    this.currentRole = role;
    this.loading.set(true);
    
    // Initial prompt
    const prompt = `Act as a strict but fair technical interviewer for a ${role} position. Start by introducing yourself and asking the first question. Keep your responses concise (under 3 sentences) and ask one question at a time.`;
    const intro = await this.gemini.generateText(prompt);
    
    this.conversation.update(c => [...c, {role: 'interviewer', text: intro}]);
    this.loading.set(false);
  }

  async reply() {
    if (!this.userReply.trim()) return;
    
    const reply = this.userReply;
    this.userReply = '';
    this.conversation.update(c => [...c, {role: 'user', text: reply}]);
    this.loading.set(true);

    const history = this.conversation().map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.text}`).join('\n');
    const prompt = `You are conducting an interview for a ${this.currentRole}. 
    History:
    ${history}
    
    Respond as the interviewer. Evaluate the candidate's last answer implicitly, maybe give a tiny hint of feedback, then ask the next relevant question. Keep it short.`;

    const nextQ = await this.gemini.generateText(prompt);
    this.conversation.update(c => [...c, {role: 'interviewer', text: nextQ}]);
    this.loading.set(false);
  }

  async endInterview() {
    this.loading.set(true);
    
    const history = this.conversation().map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.text}`).join('\n');
    // FIX: Added 'required' field to the schema to make the API response more reliable.
    const schema = {
        type: Type.OBJECT,
        properties: {
            technicalScore: { type: Type.INTEGER },
            communicationScore: { type: Type.INTEGER },
            strengths: { type: Type.STRING },
            improvements: { type: Type.STRING }
        },
        required: ["technicalScore", "communicationScore", "strengths", "improvements"]
    };

    try {
        const result = await this.gemini.generateJson<any>(
            `Analyze this interview transcript for a ${this.currentRole} role. Provide scores out of 10 and detailed feedback.
             Transcript: ${history}`,
            schema
        );
        this.feedback.set(result);
    } catch(e) {
        alert("Failed to generate report.");
    } finally {
        this.loading.set(false);
    }
  }

  reset() {
    this.started.set(false);
    this.conversation.set([]);
    this.feedback.set(null);
    this.customRole = '';
  }
}