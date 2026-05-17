/**
 * `morning` command — generate and copy morning Slack update.
 */
import { Command, OptionValues } from 'commander';
import { CliCommandsWrapper } from "@/service/CliCommandsWrapper.ts";
import { JiraClient } from '@/service/JiraClient.ts';
import { JiraTask } from '@/dto/JiraTask.ts';
import {GeminiClient} from "@/service/GeminiClient.js";

/**
 * Register the `morning` command.
 * Generates and copies morning Slack update.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('morning')
        .description('Generate and copy morning Slack update')
        .option('-i, --info', 'Additional info to update', '')
        .action(async (options: OptionValues) => {
            await copyMorningUpdate(options.info);
        });
}

/**
 * Generate and copy morning Slack update.
 * @param info - Additional info to update.
 */
async function copyMorningUpdate(info: string): Promise<void> {
    const morningUpdate: string = await generateMorningUpdate(info);
    await CliCommandsWrapper.copyToClipboard(morningUpdate, true);
}

/**
 * Generate morning Slack update.
 * @param info - Additional info to update.
 * @returns string;
 */
async function generateMorningUpdate(info: string): Promise<string> {
    const tasks: JiraTask[] = await JiraClient.instance.getTasks();
    return '';
}
