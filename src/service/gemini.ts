/**
 * Module to access Gemini API wrapper.
 */
import { GeminiService } from '@/service/GeminiService.ts';
import { getEnvVar } from '@/functions.ts';

// Init Gemini API.
const apiKey: string = getEnvVar('GEMINI_API_KEY');
const model: string = getEnvVar('GEMINI_MODEL');
export const geminiService: GeminiService = new GeminiService(apiKey, model);