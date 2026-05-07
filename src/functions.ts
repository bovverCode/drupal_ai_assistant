/**
 * Shared utility functions used across the CLI.
 */
import { readdir } from "node:fs/promises";
import { Dirent } from "node:fs";
import { Command } from "commander";
import path from "node:path";

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
 * List files in a folder, optionally filtered by file extension.
 * @param path - Absolute path to the folder.
 * @param filetypes - File extensions to include (e.g. `['ts', 'js']`). Returns all files when empty.
 * @returns Array of matching file names.
 */
export async function listFolder(path: string, filetypes: string[] = []): Promise<string[]> {
    const result: string[] = [];
    const entries: Dirent[] = await readdir(path, { withFileTypes: true });
    entries.forEach(entry => {
        if (filetypes.length === 0) {
            result.push(entry.name);
            return;
        }
        const fileType: string | undefined = entry.name.split('.').pop();
        if (!fileType) return;
        if (filetypes.includes(fileType)) {
            result.push(entry.name);
        }
    });
    return result;
}

/**
 * Interface for command modules.
 * Each module must export a `registerCommand(program: Command): void` function.
 */
interface CommandModule {
    registerCommand(program: Command): void;
}

/**
 * Dynamically load and register all command modules from the `command/` directory.
 * Each module must export a `registerCommand(program: Command): void` function.
 * @param program - The Commander instance to register commands on.
 */
export async function registerCommands(program: Command): Promise<void> {
    const basePath: string = path.join(__dirname, 'command');
    const commandsFiles: string[] = await listFolder(basePath, ['js']);
    for (const filename of commandsFiles) {
       const command = await import(path.join(basePath, filename)) as CommandModule;
       command.registerCommand(program);
    }
}