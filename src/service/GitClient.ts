import { CliCommandsWrapper } from '@/service/CliCommandsWrapper.ts';
import { getEnvVar, getLatestBusinessDay } from '@/functions.ts';

/**
 * Wrapper around the Git CLI.
 */
export class GitClient {

    /**
     * Get the latest commits from a branch.
     * @param branch - Branch name.
     * @returns Latest commits diff.
     */
    static async getBranchLatestCommits(branch: string): Promise<string> {
        const latestBusinessDayString: string = getLatestBusinessDay().toISOString();
        const command = `git --no-pager log --since="${latestBusinessDayString}" origin/${branch} --format="%s"`;
        try {
            return await CliCommandsWrapper.runExternalCommand(command);
        } catch (error) {
            console.warn(`Branch ${branch} commits not found since ${latestBusinessDayString}.`);
            return '';
        }

    }

    /**
     * Get the current branch name.
     * @returns Current branch name.
     */
    static async getCurrentBranchName(): Promise<string> {
        return (await CliCommandsWrapper.runExternalCommand('git branch --show-current')).trim();
    }

    /**
     * Get the list of files changed in a branch.
     * @param branch - Branch name.
     * @returns List of files changed in the branch.
     */
    static async getBranchChangedFiles(branch: string): Promise<string[]> {
        const prodBranch: string = getEnvVar('PRODUCTION_BRANCH');
        const rootPath: string = (await CliCommandsWrapper.runExternalCommand('git rev-parse --show-toplevel')).trim();
        const diffResult: string = (await CliCommandsWrapper.runExternalCommand(`git diff --name-only origin/${branch} origin/${prodBranch}`)).trim();
        if (!diffResult) return [];
        const relativeFilePaths: string[] = diffResult.split('\n')
        return relativeFilePaths.map(relativePath => `${rootPath}/${relativePath}`);
    }

    /**
     * Get the diff of a file.
     * @param filePath - File path.
     * @param branch - Branch code (PROJ-991).
     * @returns Diff of the file.
     */
    static async getFileDiff(filePath: string, branch: string): Promise<string> {
        const prodBranch: string = getEnvVar('PRODUCTION_BRANCH');
        return (await CliCommandsWrapper.runExternalCommand(`git diff origin/${prodBranch} origin/${branch} -- "${filePath}"`)).trim();
    }

}
