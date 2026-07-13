/**
 * gemini.service.ts
 *
 * Wraps Google Gemini Flash API calls for:
 *   1. AI Pre-Consultation Triage  (POST /api/triage)
 *   2. Symptom → Specialisation matching  (POST /api/doctors/match)
 *
 * TRD reference: sections 4.4 and 4.6
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: implement triage prompt + JSON parsing
// TODO: implement specialisation matching prompt
// TODO: add 8-second timeout + fallback to raw text / 'General Physician'

export const geminiService = {
  /**
   * Generate a structured triage summary from patient symptom input.
   * Always returns English output regardless of input language.
   */
  generateTriageSummary: async (_input: Record<string, unknown>): Promise<Record<string, unknown>> => {
    throw new Error('geminiService.generateTriageSummary — not yet implemented');
  },

  /**
   * Recommend a medical specialisation based on patient-described symptoms.
   * Falls back to 'General Physician' if Gemini response fails JSON parse.
   */
  recommendSpecialisation: async (_symptoms: string): Promise<{ specialisation: string; reason: string }> => {
    throw new Error('geminiService.recommendSpecialisation — not yet implemented');
  },
};

export type GeminiService = typeof geminiService;
