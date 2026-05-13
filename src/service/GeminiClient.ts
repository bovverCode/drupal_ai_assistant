/**
 * Wrapper around the Google Gemini API for content generation.
 */
import { GoogleGenAI, GenerateContentResponse, GenerateContentConfig } from '@google/genai';
import { getEnvVar } from '@/functions.ts';

export class GeminiClient {
    /**
     * GeminiClient instance.
     */
    static readonly instance: GeminiClient = new GeminiClient(
        getEnvVar('GEMINI_API_KEY'),
        getEnvVar('GEMINI_MODEL'),
    );

    /**
     * Google GenAI instance.
     */
    private ai: GoogleGenAI;

    /**
     * GeminiClient constructor.
     * @param apiKey - Gemini API key used to authenticate requests.
     * @param model - Model identifier to use for content generation (e.g. `gemini-2.0-flash`).
     */
    constructor(apiKey: string, private readonly model: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    /**
     * Get a response from Gemini API.
     * @param message - The message to send to Gemini API.
     * @param config - Optional configuration for the request.
     * @returns The response from Gemini API.
     * @throws Error if something goes wrong.
     */
    async sendMessage(message: string, config: GenerateContentConfig = {}): Promise<string> {
        if (!message) {
           throw new Error('Message is required');
        }
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: this.model,
            contents: message,
            config
        });
        if (!response.text) {
            throw new Error('No response from Gemini API');
        }
        return response.text;
    }
}
