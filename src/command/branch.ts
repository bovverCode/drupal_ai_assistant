/**
 * `branch` command — analyze branch code changes.
 */
import { Command } from 'commander';
import { handleProgramError } from '@/functions.ts';

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
        .action((branchCode: string | null) => {console.log(branchCode);});
}
