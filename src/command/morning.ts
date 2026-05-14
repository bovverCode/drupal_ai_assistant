/**
 * `morning` command — generate and copy morning Slack update.
 */
import { Command, OptionValues } from 'commander';
import { CliCommandsWrapper } from "@/service/CliCommandsWrapper.js";
import { JiraClient } from '@/service/JiraClient.js';

/**
 * Register the `morning` command.
 * Generates and copies morning Slack update.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('morning')
        .description('Generate and copy morning Slack update')
        .option('-i, --info', 'Additional info to update')
        .action(async (options: OptionValues) => {
            await copyMorningUpdate(options.info);
        });
}

async function copyMorningUpdate(info: string | undefined): Promise<void> {
    const morningUpdate: string = generateMorningUpdate(info);
    await CliCommandsWrapper.copyToClipboard(morningUpdate, true);
}

function generateMorningUpdate(info: string | undefined): string {
    JiraClient.instance.getTasks().then().catch();
    return '';
}
