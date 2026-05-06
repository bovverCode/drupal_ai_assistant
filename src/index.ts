#!/usr/bin/env node
import {Command, OptionValues} from 'commander';
import { readdir } from 'node:fs/promises';
import {
    GoogleGenAI,
    createUserContent,
    CachedContent,
    GenerateContentResponse,
    Pager
} from '@google/genai';
import * as config from 'dotenv';
import path from 'node:path';

// Configure dotenv.
config.config({
    path: path.resolve(__dirname, '../.env'),
});

// Init Gemini API.
const apiKey: string = getEnvVar('GEMINI_API_KEY');
const model: string = getEnvVar('GEMINI_MODEL');
const ai: GoogleGenAI = new GoogleGenAI({ apiKey });

// Init cli app.
const program: Command = new Command();
program
    .name('druppy')
    .usage('<command> [options]');

program
    .command('chat')
    .description('ask a question to Gemini API')
    .argument('[message]', 'Message to send to Gemini API', 'Say hello with random language')
    .action((message: string) => chat(message));

// Training commands.
program
    .command('list')
    .description('list files in a folder')
    .argument('[path]', 'Absolute path to the folder', process.cwd())
    .action((path: string) => listFolder(path));

program.parse();

/**
 * List current folder.
 * @param path - Path to folder to list.
 */
async function listFolder(path: string): Promise<void> {
    try {
        const files: string[] = await readdir(path);
        files.forEach(file => {
            console.log(file);
        });
    } catch (error) {
        console.error(error);
    }
}

/**
 * Get a response from Gemini API.
 * @param message - The message to send to Gemini API.
 */
async function chat(message: string): Promise<void> {
    if (!message) {
        console.log('No message provided');
        return;
    }
    console.log(`Sending message: ${message}`);
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: message
        });
        console.log(response.text);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Get an environment variable.
 * @param name - The name of the environment variable.
 * @returns The value of the environment variable.
 */
function getEnvVar(name: string): string {
    const value: string | undefined = process.env[name];
    if (!value) throw new Error(`Environment variable ${name} is not defined`);
    return value;
}