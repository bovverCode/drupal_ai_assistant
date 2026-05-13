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
    // Get current JIRA in progress/resolved tasks., create object [branch_number => shortInfo: string, status: string, diff: string]
    // Find commits related to the task, add the diff to object.
    // Prepare request message, add addition info if needed.
    // Send request to Gemini API.
    // Return the response.
    JiraClient.instance.getJiraTasks().then((data) => console.log(data)).catch((error) => console.error(error));

    return '';
}
