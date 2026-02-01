import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="resume-preview" class="w-full min-h-full bg-white relative">
      
      <!-- MODERN TEMPLATE -->
      @if (template === 'modern') {
        <div class="min-h-full flex flex-col md:flex-row text-slate-800">
          <!-- Sidebar -->
          <div class="w-full md:w-1/3 bg-slate-900 text-white p-8">
            <div class="mb-8">
              <h1 class="text-3xl font-bold uppercase tracking-wider mb-2 leading-tight">{{ data?.fullName }}</h1>
              <p class="text-blue-400 font-medium text-lg">{{ data?.jobTitle }}</p>
            </div>

            <div class="space-y-6 text-sm">
              <div>
                <h3 class="font-bold text-slate-400 uppercase tracking-widest text-xs mb-3 border-b border-slate-700 pb-1">Contact</h3>
                <ul class="space-y-2 text-slate-300">
                  @if (data?.email) { <li class="flex items-center gap-2"><i class="fas fa-envelope text-blue-400 w-4"></i> {{ data?.email }}</li> }
                  @if (data?.phone) { <li class="flex items-center gap-2"><i class="fas fa-phone text-blue-400 w-4"></i> {{ data?.phone }}</li> }
                  @if (data?.location) { <li class="flex items-center gap-2"><i class="fas fa-map-marker-alt text-blue-400 w-4"></i> {{ data?.location }}</li> }
                  @if (data?.website) { <li class="flex items-center gap-2"><i class="fas fa-link text-blue-400 w-4"></i> {{ data?.website }}</li> }
                  @if (data?.twitter) { <li class="flex items-center gap-2"><i class="fab fa-twitter text-blue-400 w-4"></i> {{ data?.twitter }}</li> }
                  @if (data?.github) { <li class="flex items-center gap-2"><i class="fab fa-github text-blue-400 w-4"></i> {{ data?.github }}</li> }
                </ul>
              </div>

              <div>
                <h3 class="font-bold text-slate-400 uppercase tracking-widest text-xs mb-3 border-b border-slate-700 pb-1">Education</h3>
                <div class="space-y-4">
                  @for (edu of data?.education; track $index) {
                    <div>
                      <div class="font-bold text-white">{{ edu.degree }}</div>
                      <div class="text-slate-400">{{ edu.school }}</div>
                      <div class="text-slate-500 text-xs mt-1">{{ edu.year }}</div>
                    </div>
                  }
                </div>
              </div>

              <div>
                <h3 class="font-bold text-slate-400 uppercase tracking-widest text-xs mb-3 border-b border-slate-700 pb-1">Skills</h3>
                <div class="flex flex-wrap gap-2">
                  @for (skill of skillsList(); track $index) {
                    <span class="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">{{ skill }}</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="w-full md:w-2/3 p-8 bg-white">
            <div class="mb-8">
              <h2 class="text-xl font-bold text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-900 pb-2">Profile</h2>
              <p class="text-slate-600 leading-relaxed">{{ data?.summary }}</p>
            </div>

            <div class="mb-8">
              <h2 class="text-xl font-bold text-slate-800 uppercase tracking-widest mb-6 border-b-2 border-slate-900 pb-2">Experience</h2>
              <div class="space-y-6">
                @for (exp of data?.experience; track $index) {
                  <div class="relative pl-4 border-l-2 border-slate-200">
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900"></div>
                    <div class="flex justify-between items-baseline mb-1">
                      <h3 class="text-lg font-bold text-slate-900">{{ exp.role }}</h3>
                      <span class="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ exp.startDate }} - {{ exp.endDate }}</span>
                    </div>
                    <div class="text-slate-500 font-medium mb-2">{{ exp.company }}</div>
                    <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{{ exp.description }}</p>
                  </div>
                }
              </div>
            </div>

             <!-- Custom Sections -->
            @if (data?.customSections && data.customSections.length > 0) {
              <div>
                @for(section of data.customSections; track $index) {
                  @if (section.title && section.content) {
                    <div class="mb-6">
                      <h2 class="text-xl font-bold text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-900 pb-2">{{ section.title }}</h2>
                      <p class="text-slate-600 leading-relaxed whitespace-pre-line">{{ section.content }}</p>
                    </div>
                  }
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- CLASSIC TEMPLATE -->
      @if (template === 'classic') {
        <div class="p-10 font-serif min-h-full text-slate-900">
          <div class="text-center border-b-2 border-black pb-6 mb-8">
            <h1 class="text-4xl font-bold mb-2 font-[Merriweather]">{{ data?.fullName }}</h1>
            <p class="text-lg italic text-slate-600 mb-3">{{ data?.jobTitle }}</p>
            <div class="flex justify-center flex-wrap gap-4 text-sm text-slate-700">
              @if (data?.email) { <span>{{ data?.email }}</span> }
              @if (data?.phone) { <span>| {{ data?.phone }}</span> }
              @if (data?.location) { <span>| {{ data?.location }}</span> }
            </div>
            <div class="flex justify-center flex-wrap gap-4 text-sm text-blue-800 mt-2">
              @if (data?.website) { <span>{{ data?.website }}</span> }
              @if (data?.twitter) { <span>| {{ data?.twitter }}</span> }
              @if (data?.github) { <span>| {{ data?.github }}</span> }
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider">Professional Summary</h3>
            <p class="text-slate-800 leading-relaxed">{{ data?.summary }}</p>
          </div>

          <div class="mb-6">
             <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 tracking-wider">Work Experience</h3>
             <div class="space-y-5">
               @for (exp of data?.experience; track $index) {
                 <div>
                   <div class="flex justify-between items-baseline mb-1">
                     <h4 class="font-bold text-lg">{{ exp.company }}</h4>
                     <span class="text-sm italic">{{ exp.startDate }} – {{ exp.endDate }}</span>
                   </div>
                   <div class="font-semibold text-slate-700 mb-1">{{ exp.role }}</div>
                   <p class="text-slate-800 text-sm leading-relaxed whitespace-pre-line">{{ exp.description }}</p>
                 </div>
               }
             </div>
          </div>
          
          <!-- Custom Sections -->
          @if (data?.customSections && data.customSections.length > 0) {
            @for(section of data.customSections; track $index) {
              @if (section.title && section.content) {
                <div class="mb-6">
                  <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider">{{ section.title }}</h3>
                  <p class="text-slate-800 leading-relaxed whitespace-pre-line">{{ section.content }}</p>
                </div>
              }
            }
          }

          <div class="grid grid-cols-3 gap-8">
             <div class="col-span-2">
                <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 tracking-wider">Education</h3>
                 @for (edu of data?.education; track $index) {
                   <div class="mb-3">
                     <div class="font-bold">{{ edu.school }}</div>
                     <div>{{ edu.degree }}</div>
                     <div class="text-sm text-slate-600 italic">{{ edu.year }}</div>
                   </div>
                 }
             </div>
             <div>
               <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 tracking-wider">Skills</h3>
               <ul class="list-disc list-inside text-sm space-y-1">
                 @for (skill of skillsList(); track $index) {
                   <li>{{ skill }}</li>
                 }
               </ul>
             </div>
          </div>
        </div>
      }

      <!-- MINIMAL TEMPLATE -->
      @if (template === 'minimal') {
        <div class="p-12 font-sans min-h-full text-slate-800 bg-stone-50">
          <header class="flex justify-between items-start mb-12">
            <div>
              <h1 class="text-5xl font-light tracking-tight text-slate-900 mb-2 font-[Oswald]">{{ data?.fullName }}</h1>
              <p class="text-xl text-slate-500 font-light">{{ data?.jobTitle }}</p>
            </div>
            <div class="text-right text-sm text-slate-500 font-light leading-loose">
              <div>{{ data?.email }}</div>
              <div>{{ data?.phone }}</div>
              <div>{{ data?.location }}</div>
              <div class="text-blue-500">{{ data?.website }}</div>
              @if (data?.twitter) { <div class="text-blue-500">{{ data?.twitter }}</div> }
              @if (data?.github) { <div class="text-blue-500">{{ data?.github }}</div> }
            </div>
          </header>

          <div class="grid grid-cols-4 gap-8">
            <aside class="col-span-1 space-y-8">
              <div>
                <h6 class="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Skills</h6>
                <div class="flex flex-col gap-2">
                   @for (skill of skillsList(); track $index) {
                     <span class="text-sm border-b border-slate-200 pb-1">{{ skill }}</span>
                   }
                </div>
              </div>
              
              <div>
                <h6 class="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Education</h6>
                @for (edu of data?.education; track $index) {
                   <div class="mb-4">
                     <div class="font-medium text-slate-800">{{ edu.school }}</div>
                     <div class="text-sm text-slate-600">{{ edu.degree }}</div>
                     <div class="text-xs text-slate-400 mt-1">{{ edu.year }}</div>
                   </div>
                 }
              </div>
            </aside>

            <main class="col-span-3 space-y-10">
              <section>
                 <h6 class="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">About Me</h6>
                 <p class="text-slate-700 leading-relaxed font-light text-lg">{{ data?.summary }}</p>
              </section>

              <section>
                <h6 class="font-bold text-xs uppercase tracking-widest text-slate-400 mb-6">Experience</h6>
                <div class="space-y-8">
                  @for (exp of data?.experience; track $index) {
                    <div class="group">
                      <div class="flex justify-between items-center mb-2">
                         <h3 class="text-xl font-normal text-slate-800">{{ exp.role }}</h3>
                         <span class="text-xs font-mono text-slate-400">{{ exp.startDate }} - {{ exp.endDate }}</span>
                      </div>
                      <div class="text-sm font-semibold text-slate-500 mb-3">{{ exp.company }}</div>
                      <p class="text-slate-600 leading-relaxed font-light whitespace-pre-line">{{ exp.description }}</p>
                    </div>
                  }
                </div>
              </section>

              <!-- Custom Sections -->
              @if (data?.customSections && data.customSections.length > 0) {
                @for(section of data.customSections; track $index) {
                  @if (section.title && section.content) {
                    <section>
                      <h6 class="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">{{ section.title }}</h6>
                      <p class="text-slate-600 leading-relaxed font-light whitespace-pre-line">{{ section.content }}</p>
                    </section>
                  }
                }
              }
            </main>
          </div>
        </div>
      }
    </div>
  `
})
export class ResumePreviewComponent {
  @Input() data: any;
  @Input() template: 'modern' | 'classic' | 'minimal' = 'modern';

  skillsList = computed(() => {
    if (!this.data?.skills) return [];
    return this.data.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  });
}
