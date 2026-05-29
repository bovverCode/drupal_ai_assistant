/**
 * `branch` command — analyze branch code changes.
 */
import { Command } from 'commander';
import { handleProgramError } from '@/functions.ts';
import { GitClient } from '@/service/GitClient.ts';

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
    const changedFiles: string[] = await GitClient.getBranchChangedFiles(branchCode);
    if (changedFiles.length === 0) {
        throw new Error('No files changed in the branch');
    }
}
