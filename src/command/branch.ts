/**
 * `branch` command — analyze branch code changes.
 */
import { Command } from 'commander';
import { handleProgramError } from '@/functions.ts';
import { GitClient } from '@/service/GitClient.ts';
import { ChangedFile } from "@/type/ChangedFile.ts";
import { FileSystemWrapper } from '@/service/FileSystemWrapper.ts';

/**
 * Register the `branch` command.
 * Analyzes branch code changes.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('branch')
        .description('Analyze branch code changes')
        .argument('[branch_code]', 'Branch code (PROJ-991)', null)
        .action((branchCode: string | null) => {
            analyzeBranchCode(branchCode)
                .catch((error) => handleProgramError(program, error));
        });
}

/**
 * Analyze branch code changes and output the result.
 * @param branchCode - Branch code (PROJ-991) or null.
 */
async function analyzeBranchCode(branchCode: string | null): Promise<void> {
    if (!branchCode) {
        branchCode = await GitClient.getCurrentBranchName();
    }
    const files: ChangedFile[] = await getFileObjects(branchCode);
}

/**
 * Get file objects for the given branch code.
 * @param branchCode - Branch code (PROJ-991).
 * @returns Array of file objects.
 */
async function getFileObjects(branchCode: string): Promise<ChangedFile[]> {
    const changedFiles: string[] = await GitClient.getBranchChangedFiles(branchCode);
    if (changedFiles.length === 0) {
        throw new Error('No files changed in the branch.');
    }
    return Promise.all(changedFiles.map(async (changedFilePath) => {
        return {
            absolutePath: changedFilePath,
            allCode: await FileSystemWrapper.readFile(changedFilePath),
            diff: await GitClient.getFileDiff(changedFilePath, branchCode)
        }
    }));
}
