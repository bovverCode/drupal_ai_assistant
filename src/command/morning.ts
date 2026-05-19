/**
 * `morning` command — generate and copy morning Slack update.
 */
import { Command } from 'commander';
import { CliCommandsWrapper } from '@/service/CliCommandsWrapper.ts';
import { JiraClient } from '@/service/JiraClient.ts';
import { JiraTask } from '@/dto/JiraTask.ts';
import { input, confirm } from '@inquirer/prompts';
import { GeminiClient } from '@/service/GeminiClient.ts';
import { Prompt } from '../type/Prompt.ts';
import { getPromptConfig, __dirname } from '@/functions.ts';
import path from 'node:path';
import { ClipboardContent } from '@/type/ClipboardContent.ts';

/**
 * Morning prompt folder path.
 */
const promptFolderPath: string = path.join(__dirname, 'prompt/morning');

/**
 * Register the `morning` command.
 * Generates and copies morning Slack update.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('morning')
        .description('Generate and copy morning Slack update')
        .action(() => {
            copyMorningUpdate()
                .catch(error => program.error(error instanceof Error ? error.message : String(error)));
        });
}

/**
 * Generate and copy morning Slack update.
 */
async function copyMorningUpdate(): Promise<void> {
    // @todo
    // - do not repeat the old info about tasks
    // - check activity in onHold tasks as well
    const morningUpdate: ClipboardContent = await generateMorningUpdate();
    await CliCommandsWrapper.copyToClipboard(morningUpdate, true);
}

/**
 * Generate morning Slack update.
 * @returns string;
 */
async function generateMorningUpdate(): Promise<ClipboardContent> {
    const additionalInfo: string = await input({ message: 'Please, enter additional info (optional):'});
    const tasks: JiraTask[] = await JiraClient.instance.getTasks();
    const htmlPromptConfig: Prompt = await getPromptConfig(path.join(promptFolderPath, 'morning_html.yml'));
    const htmlGeminiMessage: string = getHtmlPromptMessage(tasks, additionalInfo, htmlPromptConfig);
    let htmlResponse: string = await GeminiClient.instance.sendMessage(htmlGeminiMessage, { systemInstruction: htmlPromptConfig.instruction });
    console.log(htmlResponse);
    while (!await confirm({ message: 'Is this morning update correct?'})) {
        const retryMessage: string = htmlPromptConfig.retry.replace('${user_input}', htmlResponse);
        console.log('💫 Taking another shot...');
        htmlResponse = await GeminiClient.instance.sendMessage(
            htmlGeminiMessage + retryMessage,
            { systemInstruction: htmlPromptConfig.instruction }
        );
        console.log(htmlResponse);
    }

    const plainPromptConfig: Prompt = await getPromptConfig(path.join(promptFolderPath, 'morning_plain.yml'));
    const plainGeminiMessage: string = getPlainPromptMessage(htmlResponse, plainPromptConfig);
    const plainResponse: string = await GeminiClient.instance.sendMessage(plainGeminiMessage, { systemInstruction: plainPromptConfig.instruction });

    return {
      html: htmlResponse,
      plain: plainResponse
    };
}

/**
 * Get HTML prompt message.
 * @param tasks - Jira tasks.
 * @param additionalInfo - Additional info.
 * @param htmlPromptConfig - HTML prompt config.
 * @throws Error if not enough data to generate morning update.
 */
function getHtmlPromptMessage(tasks: JiraTask[], additionalInfo: string, htmlPromptConfig: Prompt): string {
    let tasksMessage: string = '';
    let additionalInfoMessage: string = '';
    if (additionalInfo) {
        additionalInfoMessage = `Additional: ${additionalInfo}`;
    }
    for (const task of tasks) {
        tasksMessage += task.toString() + '\n';
    }
    if (!tasksMessage && !additionalInfo) {
        throw new Error('Not enough data to generate morning update.');
    }

    return htmlPromptConfig.message.replace('${user_input}', `${tasksMessage} \n ${additionalInfoMessage}`);
}

/**
 * Get plain prompt message.
 * @param html - update HTML.
 * @param plainPromptConfig - Plain prompt config.
 */
function getPlainPromptMessage(html: string, plainPromptConfig: Prompt): string {
    return plainPromptConfig.message.replace('${user_input}', html);
}
