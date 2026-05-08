/**
 * `service` command — generate a Drupal service scaffold inside a module folder.
 */
import { Command, OptionValues } from 'commander';
import { FileSystemService } from '@/service/FileSystemService';
import path from 'node:path';
import { geminiService } from '@/service/gemini';
import yamlParser from 'yaml';
import { PromptInterface } from '@/prompt/PromptInterface';
import { readFile } from 'node:fs/promises';

/**
 * The maximum depth of the Drupal module info file directory lookup.
 */
const maxDepth: number = 7;

/**
 * Register the `service` command.
 * Generates a Drupal service scaffold inside the given module folder.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('service')
        .description('generate a Drupal service scaffold')
        .argument('[service_info]', 'Information to create service')
        .option('-p, --path <path>', 'Relative path to the module folder', '')
        .action((serviceInfo: string, options: OptionValues) => {
            createService(serviceInfo, options.path)
                .then(() => console.log('Service created successfully'))
                .catch(error => program.error(error instanceof Error ? error.message : String(error)))
        });
}

/**
 * Generate a Drupal service scaffold based on the provided description.
 * @param serviceInfo - Human-readable description of the service to generate.
 * @param lookupPath - Relative path to the Drupal module directory.
 */
async function createService(serviceInfo: string, lookupPath: string): Promise<void> {
    lookupPath = path.join(process.cwd(), lookupPath);
    const modulePath: string = await getModulePath(lookupPath, maxDepth);

    const promptConfig: PromptInterface = await getPromptConfig();
    const message = promptConfig.message.replace('${user_input}', serviceInfo);
    const response: string = await geminiService.sendMessage(message, {
        systemInstruction: promptConfig.instruction,
        temperature: 0,
        stopSequences: ["\n"]
    });
    console.log(response);
}

/**
 * Recursively search for the Drupal module directory.
 * @param lookupPath - Initial path to search from.
 * @param retry - Number of times to retry the search.
 * @returns Absolute path to the Drupal module directory.
 */
async function getModulePath(lookupPath: string, retry: number): Promise<string> {
    try {
        // Try to find the module info file.
        await FileSystemService.getFileAbsolutePath(lookupPath, '.+\\.info\\.yml$')
        return lookupPath;
    } catch (error) {
        if (retry > 0) {
            return getModulePath(path.join(lookupPath, '..'), retry - 1);
        }
        throw new Error('Could not find Drupal module directory');
    }
}

/**
 * Get the command prompt configuration.
 * @returns Prompt configuration object.
 */
async function getPromptConfig(): Promise<PromptInterface> {
    const promptFileContent: string = await readFile(path.join(__dirname, '../prompt/service.yml'), 'utf-8');
    return yamlParser.parse(promptFileContent);
}
