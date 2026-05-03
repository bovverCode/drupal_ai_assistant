#!/usr/bin/env node
import { Command } from 'commander';
import { readdir } from 'node:fs/promises';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

// Init types.
type FolderPath = { path: string };
type ChatMessage = { message: string };

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
    .command('list')
    .helpCommand('list -p <path>')
    .description('List files in a folder')
    .option('-p, --path <path>', 'Absolute path to the folder', process.cwd())
    .action((options: FolderPath) => listFolder(options.path));

program
    .command('chat')
    .description('Ask a question to Gemini API')
    .option('-m, --message <message>', 'Ask a question', 'Say hello with random language')
    .action((options: ChatMessage) => chat(options.message));

program.parse();

/**
 * List current folder.
 * @param path - Path to folder to list.
 */
async function listFolder(path: string): Promise<void> {
    try {
        const files: string[] = await readdir(path);
        files.forEach(file=> {
            console.log(file);
        })
    } catch (error) {
        console.error(error);
    }
}

/**
 * Get a response from Gemini API.
 * @param message - The message to send to Gemini API.
 */
async function chat(message: string): Promise<void> {
    if (!message) console.log('No message provided');
    console.log(`Sending message: ${message}`);
    try {
        const response = await ai.models.generateContent({
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