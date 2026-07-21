/**
 * `branch` command — analyze branch code changes.
 */
import { Command } from 'commander';
import { __dirname, getPromptConfig, handleProgramError } from '@/functions.ts';
import { GitClient } from '@/service/GitClient.ts';
import { ChangedFile } from "@/type/ChangedFile.ts";
import { FileSystemWrapper } from '@/service/FileSystemWrapper.ts';
import { JiraClient } from "@/service/JiraClient.ts";
import { GeminiClient } from "@/service/GeminiClient.js";
import path from 'node:path';


/**
 * Branch prompt folder path.
 */
const promptFolderPath: string = path.join(__dirname, '../prompt/branch');

/**
 * Register the `branch` command.
 * Analyzes branch code changes.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('branch')
        .description('Analyze branch code changes')
        .action(() => {
            analyzeBranchCode()
                .catch((error) => handleProgramError(program, error));
        });
}

/**
 * Analyze branch code changes and output the result.
 */
async function analyzeBranchCode(): Promise<void> {
    const branchCode: string = await GitClient.getCurrentBranchName();
    const files: ChangedFile[] = await getFileObjects(branchCode);
    const taskDescription: string = await JiraClient.instance.getTaskDescription(branchCode);
    const changedFilesMessage: string = getChangedFilesRawMessage(files);
    console.log(await getGeminiAnalysis(changedFilesMessage, taskDescription));
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
    // @todo let's take diff from the task commits.
    return Promise.all(changedFiles.map(async (changedFilePath) => {
        return {
            absolutePath: changedFilePath,
            allCode: await FileSystemWrapper.readFile(changedFilePath),
            diff: await GitClient.getFileDiff(changedFilePath, branchCode)
        }
    }));
}

/**
 * Get Gemini analysis based on the provided files and task description.
 * @param files - Changed files in the branch.
 * @param taskDescription - Task description for the branch.
 * @returns Gemini analysis result.
 */
async function getGeminiAnalysis(files: string, taskDescription: string): Promise<string> {
    const promptConfig = await getPromptConfig(path.join(promptFolderPath, 'branch.yml'));
    promptConfig.message = promptConfig.message.replace('${task_description}', taskDescription);
    promptConfig.message = promptConfig.message.replace('${changed_files}', files);
    return await GeminiClient.instance.sendMessage(promptConfig.message, { systemInstruction: promptConfig.instruction });
}

/**
 * Get raw string from changed files objects.
 * @param files - Changed files in the branch.
 * @returns Raw string of changed files.
 */
function getChangedFilesRawMessage(files: ChangedFile[]): string {
    return files.map(file => {
        return `File: ${file.absolutePath}\nDiff: ${file.diff} \nAll code: ${file.allCode}`;
    }).join('\n');
}