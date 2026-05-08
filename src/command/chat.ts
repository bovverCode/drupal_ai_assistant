/**
 * `chat` command — send a free-text message to Gemini API and print the response.
 */
import { Command } from "commander";
import  { geminiService } from "@/service/gemini"

/**
 * Register the `chat` command.
 * Sends a message to Gemini API and prints the response.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('chat')
        .description('ask a question to Gemini API')
        .argument('[message]', 'Message to send to Gemini API', 'Say hello with random language')
        .action((message: string) => {
            geminiService.sendMessage(message)
                .then(response => console.log(response))
                .catch(error => program.error(error instanceof Error ? error.message : String(error)))
        });
}
