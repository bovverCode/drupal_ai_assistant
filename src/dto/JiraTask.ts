/**
 * Data transfer object for Jira task.
 */

/**
 * Task status.
 */
export enum Status {
    InProgress = 'In Progress',
    Resolved = 'Resolved',
    OnHold = 'OnHold',
}

export class JiraTask {

    /**
     * Jira task constructor.
     * @param name - Task name.
     * @param branchCode - Branch code (like `DEV-1234`).
     * @param link - Task link.
     * @param status - Task status.
     * @param statusChangedDate - Task status changed date.
     * @param comments - Task comments raw string.
     * @param lastCommits - Task last commits raw string.
     */
    constructor(
        readonly name: string,
        readonly branchCode: string,
        readonly link: string,
        readonly status: string,
        readonly statusChangedDate: Date,
        readonly comments: string,
        readonly lastCommits: string,
    ) {}

    /**
     * Convert Jira task to string.
     * @returns String representation of a Jira task.
     */
    toString(): string {
        return `Task name: ${this.name}\n` +
            `Task short code: ${this.branchCode}\n` +
            `Task link: ${this.link}\n` +
            `Current task status: ${this.status}\n` +
            `Task status changed at: ${this.getSimplifiedStatusDate()}\n` +
            `Task comments: ${this.comments}\n` +
            `Latest task commits: ${this.lastCommits}`;
    }

    /**
     * Get simplified task status date.
     * @returns Task status simplified date.
     */
    private getSimplifiedStatusDate(): string {
        const today: Date = new Date();
        today.setHours(0, 0, 0, 0);
        const statusDate: Date = new Date(this.statusChangedDate);
        statusDate.setHours(0, 0, 0, 0);
        return statusDate.getTime() === today.getTime() ? 'today' : 'started few days ago';
    }

}
