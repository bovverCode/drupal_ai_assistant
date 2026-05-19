/**
 * Data transfer object for Jira task.
 */

/**
 * Task status.
 */
export enum Status {
    InProgress = 'In Progress',
    Resolved = 'Resolved'
}

export class JiraTask {

    /**
     * Jira task constructor.
     * @param name - Task name.
     * @param branchCode - Branch code (like `DEV-1234`).
     * @param link - Task link.
     * @param status - Task status.
     * @param statusChangedTimestamp - Task status changed timestamp.
     * @param comments - Task comments raw string.
     * @param lastCommits - Task last commits raw string.
     */
    constructor(
        readonly name: string,
        readonly branchCode: string,
        readonly link: string,
        readonly status: string,
        readonly statusChangedTimestamp: Date,
        readonly comments: string,
        readonly lastCommits: string,
    ) {}

    /**
     * Convert Jira task to string.
     * @returns String representation of a Jira task.
     */
    toString(): string {
        return `name: ${this.name}\n` +
            `branchCode: ${this.branchCode}\n` +
            `link: ${this.link}\n` +
            `status: ${this.status}\n` +
            `statusChangedTimestamp: ${this.statusChangedTimestamp}\n` +
            `comments: ${this.comments}\n` +
            `lastCommits: ${this.lastCommits}`;
    }

}