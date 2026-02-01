import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const key = environment.geminiApiKey?.toString().trim();
    if (!key) {
      console.warn('GeminiService: no API key configured (environment.geminiApiKey is empty). Gemini calls will be disabled.');
      this.ai = null;
      return;
    }

    try {
      this.ai = new GoogleGenAI({ apiKey: key });
    } catch (err) {
      console.error('GeminiService initialization failed:', err);
      this.ai = null;
    }
  }

  private ensureConfigured(): boolean {
    if (!this.ai) {
      const msg = 'Gemini API key not configured. Set your key in src/environments/environment.development.ts';
      console.warn(msg);
      return false;
    }
    return true;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.ensureConfigured()) {
      return 'AI not configured';
    }
    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      return response.text || "No response generated.";
    } catch (error) {
      console.error('Gemini Error:', error);
      return "Error generating content. Please try again.";
    }
  }

  async generateJson<T>(prompt: string, schema: any): Promise<T> {
    if (!this.ensureConfigured()) {
      const msg = 'Gemini API key not configured.';
      console.warn(msg);
      throw new Error(msg);
    }
    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });
      return JSON.parse(response.text) as T;
    } catch (error) {
      console.error('Gemini JSON Error:', error);
      throw error;
    }
  }

  async searchJobs(query: string): Promise<{text: string, chunks: any[]}> {
    if (!this.ai) {
      console.warn('GeminiService.searchJobs called but API key is not configured.');
      return { text: 'AI not configured', chunks: [] };
    }
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find real-time job listings for: ${query}. \n        Provide a list of 5-10 jobs. For each job, list the Title, Company, Location, and a brief description.\n        Explicitly mention "Apply Link" if found in the grounding.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      return {
        text: response.text,
        chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error('Job Search Error:', error);
      return { text: "Error searching for jobs.", chunks: [] };
    }
  }

  async getChatResponseStream(history: {role: 'user' | 'model', parts: [{text: string}]}[], message: string) {
    if (!this.ensureConfigured()) {
      // Return a small async iterable that yields a friendly message so callers can iterate safely.
      async function* offlineGenerator() {
        yield { text: 'AI not configured. Please add your API key.' };
      }
      return offlineGenerator();
    }
    const chat = this.ai!.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: "You are NextStep, an expert AI Career Coach. Your persona is exceptionally direct, sharp, and focused on tangible results. Do not use fluff or vague encouragement. Your single most important goal is to give users concrete, actionable steps to advance their career. **Your response format is non-negotiable:** When a user asks for advice, you MUST break it down into a numbered or bulleted list of specific, clear actions they can take immediately. Your tone should be that of a firm but fair mentor who pushes for excellence and tangible outcomes. Avoid generalities at all costs. Every piece of advice must be a concrete step."
      }
    });
    return chat.sendMessageStream({ message });
  }

  async polishText(text: string): Promise<string> {
    return this.generateText(`Rewrite the following text to be more professional, clear, and concise. Fix any grammar or spelling mistakes. Return only the improved text, without any preamble or surrounding quotes.\\n\\nOriginal Text:\\n---\\n${text}\\n---\\n`);
  }

  async generateExperiencePoints(role: string, company: string): Promise<string> {
    return this.generateText(`Write 3-4 professional, achievement-oriented bullet points for a resume experience section.\\nRole: ${role}\\nCompany: ${company}\\n\\nFocus on metrics and impact. Return only the bullet points (starting with •). Do not include any intro or outro.`);
  }

  async generateSummary(experience: any[], jobTitle: string, skills: string): Promise<string> {
    const experienceSummary = experience.map(e => `- ${e.role} at ${e.company}`).join('\\n');
    return this.generateText(`Based on the following career details, write a compelling and professional summary for a resume. It should be a concise paragraph of 2-4 sentences.\\n\\nDetails:\\n- Current/Target Job Title: ${jobTitle}\\n- Key Skills: ${skills}\\n- Experience Highlights:\\n${experienceSummary}\\n\\nReturn ONLY the summary text, without any preamble or surrounding quotes.`);
  }
}
