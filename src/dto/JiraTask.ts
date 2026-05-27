/**
 * Data transfer object for Jira task.
 */
import { getLatestBusinessDay } from '@/functions.ts';

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
     * @param prCreatedDate - PR created date or null if not created yet.
     */
    constructor(
        readonly name: string,
        readonly branchCode: string,
        readonly link: string,
        readonly status: string,
        readonly statusChangedDate: Date,
        readonly comments: string,
        readonly lastCommits: string,
        readonly prCreatedDate: Date | null,
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
            `Latest task commits: ${this.lastCommits}\n` +
            `PR created date: ${this.getSimplifiedPrCreatedDate()}\n`;
    }

    /**
     * Check if PR was created last working day.
     * @returns True if PR was created last working day, false otherwise.
     */
    doPrCreatedLastWorkingDay(): boolean {
        if (!this.prCreatedDate) return false;
        return this.prCreatedDate.getTime() >= getLatestBusinessDay().getTime();
    }

    /**
     * Get simplified PR created date.
     * @returns Simplified PR created date.
     * @private
     */
    private getSimplifiedPrCreatedDate(): string {
        if (!this.prCreatedDate) return 'not created yet';
        return this.doPrCreatedLastWorkingDay() ? 'last working day' : 'few days ago';
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
        return statusDate.getTime() === today.getTime() ? 'today' : 'changed one or more days ago';
    }

}
