#!/usr/bin/env node
import  { Command, OptionValues } from "commander";
import { readdir } from "node:fs/promises";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// Init Gemini API.
const ai: GoogleGenAI = new GoogleGenAI({});

// Init cli app.
const program: Command = new Command();
program.name('druppy');
// List command.
program
    .command('list')
    .action(listFolder);
// AI chat command.
program
    .command('chat')
    .option('-m, --message <message>', 'Ask a question', 'Say hello with random language')
    .action((options: OptionValues) => chat(options.message || ''));
program.parse();

/**
 * List current folder.
 */
async function listFolder(): Promise<void> {
    try {
        const files: string[] = await readdir(process.cwd());
        files.forEach(file => {
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
    if (!message) console.log("No message provided");
    console.log(`Sending message: ${message}`);
    try {
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || '',
            contents: message
        });
        console.log(response.text);
    } catch (error) {
        console.error(error);
    }
}