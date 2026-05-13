/**
 * Shared utility functions used across the CLI.
 */
import { Command } from 'commander';
import path from 'node:path';
import { FileSystemWrapper } from '@/service/FileSystemWrapper.ts';
import { fileURLToPath } from 'node:url';
import { PromptInterface } from '@/type/PromptInterface.ts';
import yamlParser from 'yaml';
import { CommandModule } from '@/type/CommandModule.js';

export const __dirname: string = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get an environment variable.
 * @param name - The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws Error if the environment variable is not defined.
 */
export function getEnvVar(name: string): string {
    const value: string | undefined = process.env[name];
    if (!value) throw new Error(`Environment variable ${name} is not defined`);
    return value;
}

/**
 * Dynamically load and register all command modules from the `command/` directory.
 * Each module must export a `registerCommand(program: Command): void` function.
 * @param program - The Commander instance to register commands on.
 */
export async function registerCommands(program: Command): Promise<void> {
    const basePath: string = path.join(__dirname, 'command');
    const commandsFiles: string[] = await FileSystemWrapper.listFolder(basePath, ['js']);
    for (const filename of commandsFiles) {
       const command = await import(path.join(basePath, filename)) as CommandModule;
       command.registerCommand(program);
    }
}

/**
 * Get the data prompt yml config.
 * @param filePath - Path to the prompt yml file.
 * @returns Prompt configuration object.
 */
export async function getPromptConfig(filePath: string): Promise<PromptInterface> {
    const promptFileContent: string = await FileSystemWrapper.readFile(filePath);
    return yamlParser.parse(promptFileContent);
}
