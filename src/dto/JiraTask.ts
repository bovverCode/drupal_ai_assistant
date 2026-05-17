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
     */
    constructor(
        readonly name: string,
        readonly branchCode: string,
        readonly link: string,
        readonly status: string,
        readonly statusChangedTimestamp: Date,
        readonly comments: string,
    ) {

    }

}