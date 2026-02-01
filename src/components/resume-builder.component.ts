import { Component, inject, signal, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeFormComponent } from './resume-form.component';
import { ResumePreviewComponent } from './resume-preview.component';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'app-resume-builder',
  standalone: true,
  imports: [CommonModule, ResumeFormComponent, ResumePreviewComponent],
  template: `
    <div class="h-screen flex flex-col bg-slate-50">
      <!-- Toolbar -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 no-print z-40 shadow-sm relative">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <i class="fas fa-file-invoice"></i>
            </div>
            <div>
              <h2 class="font-bold text-slate-800 leading-tight">Resume Builder</h2>
              <div class="flex items-center gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                 <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Auto-saving
              </div>
            </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- History Controls -->
          <div class="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
             <button (click)="historyService.triggerUndo()" [disabled]="!historyService.canUndo()" 
                class="w-8 h-8 flex items-center justify-center text-slate-600 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Undo (Ctrl+Z)">
                <i class="fas fa-undo text-xs"></i>
             </button>
             <div class="w-px h-4 bg-slate-300 mx-0.5"></div>
             <button (click)="historyService.triggerRedo()" [disabled]="!historyService.canRedo()" 
                class="w-8 h-8 flex items-center justify-center text-slate-600 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Redo (Ctrl+Y)">
                <i class="fas fa-redo text-xs"></i>
             </button>
          </div>

          <div class="h-6 w-px bg-slate-200 mx-1"></div>
          
          <!-- Template Selector -->
          <div class="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
            <button (click)="template.set('modern')" [class.bg-white]="template() === 'modern'" [class.shadow-sm]="template() === 'modern'" [class.text-indigo-600]="template() === 'modern'" class="px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 transition-all">Modern</button>
            <button (click)="template.set('classic')" [class.bg-white]="template() === 'classic'" [class.shadow-sm]="template() === 'classic'" [class.text-indigo-600]="template() === 'classic'" class="px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 transition-all">Classic</button>
            <button (click)="template.set('minimal')" [class.bg-white]="template() === 'minimal'" [class.shadow-sm]="template() === 'minimal'" [class.text-indigo-600]="template() === 'minimal'" class="px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 transition-all">Minimal</button>
          </div>

          <div class="h-6 w-px bg-slate-200 mx-1"></div>

          <button (click)="print()" class="group bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
            <i class="fas fa-print"></i>
            Export PDF
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Form Panel -->
        <div class="w-1/2 overflow-y-auto no-print bg-slate-50" #formPanel>
          <app-resume-form (formChange)="updateFormData($event)" (exportSection)="exportSection($event)"></app-resume-form>
        </div>

        <!-- Preview Panel -->
        <div class="w-1/2 bg-slate-300 p-8 overflow-auto grid no-print relative">
          <div class="absolute top-4 right-4 z-20 flex items-center gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-lg">
            <button (click)="zoom.set(Math.max(0.5, zoom() - 0.1))" class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors"><i class="fas fa-search-minus text-xs"></i></button>
            <span class="text-xs font-bold w-10 text-center">{{ Math.round(zoom() * 100) }}%</span>
            <button (click)="zoom.set(Math.min(1.5, zoom() + 0.1))" class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors"><i class="fas fa-search-plus text-xs"></i></button>
          </div>

          <div class="w-[210mm] h-[297mm] bg-white shadow-2xl origin-top transition-transform duration-300 overflow-hidden m-auto" 
               #previewContainer 
               [style.transform]="'scale(' + zoom() + ')'">
            @if (!isLoading()) {
              <app-resume-preview [data]="formData()" [template]="template()"></app-resume-preview>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ResumeBuilderComponent {
  historyService = inject(HistoryService);

  @ViewChild('previewContainer') previewContainer!: ElementRef;
  
  formData = signal<any>(null);
  template = signal<'modern' | 'classic' | 'minimal'>('modern');
  zoom = signal<number>(0.7);
  isLoading = signal<boolean>(true);

  Math = Math;

  constructor() {
    setTimeout(() => this.isLoading.set(false), 200);
  }

  updateFormData(data: any) {
    this.formData.set(data);
  }
  
  private doPrint(content: string, title: string) {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.title = title;

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
        console.error("Could not get iframe document.");
        document.body.removeChild(iframe);
        return;
    }

    doc.open();
    doc.write(`
        <html>
            <head>
                <title>${title}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Oswald:wght@300;500&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                <style>
                    body { 
                      margin: 0; 
                      -webkit-print-color-adjust: exact; 
                      print-color-adjust: exact;
                    }
                    @page { size: A4; margin: 0; }
                    #resume-preview {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0;
                        box-shadow: none;
                        border: none;
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `);
    doc.close();

    const performActualPrint = () => {
        const iFrameWindow = iframe.contentWindow;
        if (!iFrameWindow) {
            document.body.removeChild(iframe);
            return;
        }

        const waitForStyles = new Promise<void>(resolve => {
            let attempts = 0;
            const maxAttempts = 50; // 5 second timeout
            const interval = setInterval(() => {
                const stylesLoaded = iFrameWindow.document.querySelector('style[id^="__tw"]');
                if (stylesLoaded || attempts >= maxAttempts) {
                    clearInterval(interval);
                    requestAnimationFrame(() => resolve());
                }
                attempts++;
            }, 100);
        });

        const fontsReady = (iFrameWindow.document as any).fonts?.ready || Promise.resolve();

        Promise.all([waitForStyles, fontsReady]).then(() => {
            iFrameWindow.focus();
            iFrameWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }).catch(err => {
            console.error("Error during printing preparation:", err);
            document.body.removeChild(iframe);
        });
    };

    iframe.onload = () => {
        setTimeout(performActualPrint, 100);
    };
  }

  print() {
    const previewEl = this.previewContainer.nativeElement;
    const originalTransform = previewEl.style.transform;
    previewEl.style.transform = 'scale(1)';

    requestAnimationFrame(() => {
        const printContent = previewEl.innerHTML;
        previewEl.style.transform = originalTransform;
        this.doPrint(printContent, 'Resume');
    });
  }

  private generateSectionHtml(section: { name: string; data: any }): string {
    const escapeHtml = (unsafe: string) => 
        unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");

    const header = `<h2 class="text-2xl font-bold border-b-2 border-black pb-2 mb-4">${escapeHtml(section.name)}</h2>`;
    let content = '';

    switch (section.name) {
        case 'Summary':
            content = `<p>${escapeHtml(section.data.summary)}</p>`;
            break;
        case 'Experience':
            const expHtml = section.data.experience?.map((exp: any) => `
                <div>
                    <div class="flex justify-between items-baseline mb-1">
                      <h4 class="font-bold text-lg">${escapeHtml(exp.company)}</h4>
                      <span class="text-sm italic">${escapeHtml(exp.startDate)} – ${escapeHtml(exp.endDate)}</span>
                    </div>
                    <div class="font-semibold text-slate-700 mb-1">${escapeHtml(exp.role)}</div>
                    <p class="text-slate-800 text-sm leading-relaxed whitespace-pre-line">${escapeHtml(exp.description)}</p>
                </div>
            `).join('') || '';
            content = `<div class="space-y-5">${expHtml}</div>`;
            break;
        case 'Education':
            content = section.data.education?.map((edu: any) => `
                <div class="mb-3">
                  <div class="font-bold">${escapeHtml(edu.school)}</div>
                  <div>${escapeHtml(edu.degree)}</div>
                  <div class="text-sm text-slate-600 italic">${escapeHtml(edu.year)}</div>
                </div>
            `).join('') || '';
            break;
        default:
            return '';
    }

    return `<div class="p-8 font-[Merriweather]">${header}${content}</div>`;
  }

  exportSection(event: { name: string; data: any }) {
    const sectionHtml = this.generateSectionHtml(event);
    if (sectionHtml) {
        this.doPrint(sectionHtml, `${event.name} - Export`);
    } else {
        console.error("Could not generate HTML for section:", event.name);
    }
  }
}
