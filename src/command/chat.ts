/**
 * `chat` command — send a free-text message to Gemini API and print the response.
 */
import { Command } from 'commander';
import { GeminiClient } from '@/service/GeminiClient.ts';

/**
 * Register the `chat` command.
 * Sends a message to Gemini API and prints the response.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('chat')
        .description('ask a question to Gemini API')
        .argument('[message]', 'Message to send to Gemini API', 'Say something cute and wish good day. Make it short')
        .action((message: string) => {
            GeminiClient.instance.sendMessage(message)
                .then((response: string) => console.log(response))
                .catch((error: Error) => program.error(error instanceof Error ? error.message : String(error)))
        });
}
