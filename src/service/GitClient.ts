import { CliCommandsWrapper } from '@/service/CliCommandsWrapper.ts';
import { getLatestBusinessDay } from "@/functions.ts";

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

}
