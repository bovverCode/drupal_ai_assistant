/**
 * `list` command — print the contents of a given directory.
 */
import { Command } from 'commander';
import { FileSystemWrapper } from '@/service/FileSystemWrapper.ts';
import { handleProgramError } from '@/functions.ts';
import {BitbucketClient} from "@/service/BitbucketClient.js";

/**
 * Register the `list` command.
 * Prints all file and directory names in the given folder.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('list')
        .description('list files in a folder')
        .argument('[path]', 'Absolute path to the folder', process.cwd())
        .action((path: string) => {
            list(path)
                .catch((error) => handleProgramError(program, error))
        });
}

/**
 * List current folder.
 * @param path - Path to folder to list.
 */
async function list(path: string): Promise<void> {
    BitbucketClient.instance.didUserReviewYesterday();
    const files: string[] = await FileSystemWrapper.listFolder(path);
    files.forEach(file => {
        console.log(file);
    });
}
