import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { UserService, ChatSession } from '../services/user.service';
import { marked } from 'marked';

@Component({
  selector: 'app-career-coach',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-2rem)] flex p-4 gap-4">
      <!-- Session Sidebar -->
      <div class="w-72 bg-white rounded-2xl shadow-xl flex-shrink-0 flex flex-col p-4 border border-slate-200">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Conversations</h3>
        <button (click)="startNewChat()" class="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg mb-4 text-sm hover:bg-purple-700 transition-colors shadow-sm">
          + New Chat
        </button>
        <div class="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2">
          @for (session of allSessions(); track session.id) {
            <button (click)="selectSession(session.id)" 
                    [class.bg-purple-50]="session.id === activeSessionId()"
                    [class.border-purple-200]="session.id === activeSessionId()"
                    class="w-full text-left p-3 rounded-lg border border-transparent hover:bg-slate-50 transition-colors group">
              <p class="text-sm font-medium text-slate-700 truncate">{{ session.title }}</p>
              <div class="flex justify-between items-center mt-1">
                <span class="text-xs text-slate-400">{{ formatDate(session.createdAt) }}</span>
                <span (click)="$event.stopPropagation(); deleteSession(session.id)" 
                      class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Main Chat -->
      <div class="flex-1 flex flex-col">
        <div class="bg-white rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-200">
          <!-- Header -->
          <div class="bg-purple-600 p-4 text-white flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
              <h2 class="font-bold">AI Career Coach</h2>
              <p class="text-xs text-purple-100">{{ activeSessionTitle() }}</p>
            </div>
          </div>

          <!-- Chat Area -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" #chatContainer>
            @for (msg of activeConversation(); track $index) {
              <div [class.justify-end]="msg.role === 'user'" class="flex">
                <div [class.bg-purple-600]="msg.role === 'user'" 
                    [class.text-white]="msg.role === 'user'"
                    [class.bg-white]="msg.role === 'model'"
                    [class.text-slate-800]="msg.role === 'model'"
                    [class.rounded-br-none]="msg.role === 'user'"
                    [class.rounded-bl-none]="msg.role === 'model'"
                    class="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed border border-transparent"
                    [class.border-slate-200]="msg.role === 'model'">
                  <div [innerHTML]="msg.displayHtml"></div>
                </div>
              </div>
            }
            @if (loading()) {
              <div class="flex justify-start">
                <div class="bg-white text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-slate-200">
                  <div class="flex gap-1">
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            }
          </div>
          
          <!-- Suggestions Chips -->
          @if (!activeSessionId()) {
            <div class="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-100">
              @for (prompt of suggestedPrompts; track $index) {
                <button (click)="setInput(prompt)" 
                  class="whitespace-nowrap px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors">
                  {{ prompt }}
                </button>
              }
            </div>
          }

          <!-- Input -->
          <div class="p-4 bg-white border-t border-slate-100">
            <form (ngSubmit)="sendMessage()" class="flex gap-3">
              <input [(ngModel)]="input" name="message" 
                placeholder="Ask for career advice..." 
                class="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autocomplete="off">
              <button type="submit" [disabled]="!input || loading()" 
                class="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CareerCoachComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  gemini = inject(GeminiService);
  userService = inject(UserService);

  allSessions = signal<ChatSession[]>([]);
  activeSessionId = signal<string | null>(null);

  activeSessionTitle = computed(() => {
    const activeId = this.activeSessionId();
    if (!activeId) {
      return 'Always here to help';
    }
    const session = this.allSessions().find(s => s.id === activeId);
    return session ? `Reviewing: ${session.title}` : 'Always here to help';
  });

  initialMessage = {
    role: 'model' as const, 
    text: 'Hello! I am your AI Career Coach. How can I assist you today?', 
    displayHtml: 'Hello! I am your AI Career Coach. How can I assist you today?'
  };

  activeConversation = computed(() => {
    const activeId = this.activeSessionId();
    if (!activeId) return [this.initialMessage];
    
    const session = this.allSessions().find(s => s.id === activeId);
    return session ? session.messages : [this.initialMessage];
  });
  
  input = '';
  loading = signal(false);

  suggestedPrompts = [
    "How do I negotiate my salary?",
    "Review my elevator pitch",
    "What are common interview questions for...",
    "How to switch careers to tech?",
    "Tips for remote work productivity"
  ];

  constructor() {
    effect(() => {
      const user = this.userService.user();
      if (user && user.chatSessions) {
        // Sort by most recent
        const sorted = [...user.chatSessions].sort((a, b) => b.createdAt - a.createdAt);
        this.allSessions.set(sorted);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
  
  formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  setInput(text: string) {
    this.input = text;
  }
  
  startNewChat() {
    this.activeSessionId.set(null);
  }

  selectSession(id: string) {
    this.activeSessionId.set(id);
  }
  
  deleteSession(id: string) {
    const updatedSessions = this.allSessions().filter(s => s.id !== id);
    this.userService.updateChatSessions(updatedSessions);
    if (this.activeSessionId() === id) {
      this.startNewChat();
    }
  }

  async createNewSession(firstMessage: {role: 'user', text: string, displayHtml?: string}) {
    const titlePrompt = `Summarize this user's question into a short title (5 words or less): "${firstMessage.text}"`;
    let title = 'New Chat';
    try {
      const aiTitle = await this.gemini.generateText(titlePrompt);
      if (aiTitle && aiTitle.toString().trim().length > 0) {
        title = aiTitle.toString().replace(/"/g, '').trim();
      }
    } catch (err) {
      console.warn('Could not generate session title from Gemini:', err);
      // fallback title remains
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title,
      createdAt: Date.now(),
      messages: [this.initialMessage, firstMessage]
    };
    
    const updatedSessions = [newSession, ...this.allSessions()];
    this.userService.updateChatSessions(updatedSessions);
    this.activeSessionId.set(newSession.id);
    
    return newSession;
  }

  async sendMessage() {
    if (!this.input.trim() || this.loading()) return;

    const userMsgText = this.input;
    this.input = '';
    const userMsg = {role: 'user' as const, text: userMsgText, displayHtml: userMsgText};
    
    let currentSession: ChatSession | undefined;
    
    // Determine if it's a new or existing chat
    if (!this.activeSessionId()) {
      this.loading.set(true); // Show loading while title is generated
      currentSession = await this.createNewSession(userMsg);
    } else {
      currentSession = this.allSessions().find(s => s.id === this.activeSessionId());
      if (currentSession) {
        currentSession.messages.push(userMsg);
      }
    }
    
    if (!currentSession) return;
    this.loading.set(true);

    try {
      const history: any = currentSession.messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const streamResult = await this.gemini.getChatResponseStream(history, userMsgText);
      
      let fullText = '';
      currentSession.messages.push({role: 'model', text: '', displayHtml: ''});
      
      for await (const chunk of streamResult) {
        // FIX: The Gemini API response object has a `text` property, not a `text()` method.
        const text = chunk.text;
        fullText += text;
        const html = await marked.parse(fullText);
        currentSession.messages[currentSession.messages.length - 1] = {role: 'model', text: fullText, displayHtml: html};

        // Update state to trigger UI changes
        const updatedSessions = this.allSessions().map(s => s.id === currentSession?.id ? {...currentSession} : s);
        this.allSessions.set(updatedSessions);
      }
      
      // Persist final state
      const finalSessions = this.allSessions().map(s => s.id === currentSession?.id ? {...currentSession} : s);
      this.userService.updateChatSessions(finalSessions);

    } catch (e) {
      console.error(e);
      const errorMsg = {role: 'model' as const, text: "I'm having trouble connecting. Please try again.", displayHtml: "I'm having trouble connecting. Please try again."};
      currentSession.messages.push(errorMsg);
    } finally {
      this.loading.set(false);
    }
  }
}
