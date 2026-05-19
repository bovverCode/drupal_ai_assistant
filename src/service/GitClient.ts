import { CliCommandsWrapper } from '@/service/CliCommandsWrapper.ts';

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
        const today = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            timeZone: 'Europe/Kyiv'
        });
        let dayScope: string;
        switch (today) {
            case 'Monday':
                dayScope = '3 days ago';
                break;
            default:
                dayScope = '1 day ago';
        }
        const command = `git --no-pager log --since="${dayScope}" --patch origin/${branch}`;
        try {
            return await CliCommandsWrapper.runExternalCommand(command);
        } catch (error) {
            console.warn(`Branch ${branch} not found since ${dayScope}.`);
            return '';
        }

    }

}
