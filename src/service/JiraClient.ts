/**
 * Wrapper around the Google JIRA Rest API.
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getEnvVar } from '@/functions.ts';
import { JiraTask, Status as JiraStatus } from '@/dto/JiraTask.ts';
import { GitClient } from '@/service/GitClient.ts';
import { BitbucketClient } from '@/service/BitbucketClient.ts';

export class JiraClient {

    /**
     * JiraClient instance.
     */
    static readonly instance: JiraClient = new JiraClient();

    /**
     * Axios JIRA instance.
     */
    private jira: AxiosInstance;

    /**
     * Base task link.
     */
    private readonly baseTaskLink: string;

    /**
     * JiraClient constructor.
     */
    constructor() {
        this.baseTaskLink = `https://${getEnvVar('JIRA_SUBDOMAIN')}.atlassian.net/browse/`;
        const jiraEmail: string = getEnvVar('JIRA_EMAIL');
        const jiraApiToken: string = getEnvVar('JIRA_API_TOKEN');
        const jiraCloudId: string = getEnvVar('JIRA_CLOUD_ID');
        const authToken: string = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');
        this.jira = axios.create({
            method: 'GET',
            baseURL: `https://api.atlassian.com/ex/jira/${jiraCloudId}/rest/api/3/`,
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Accept': 'application/json'
            }
        });
    }

    /**
     * Get active tasks assigned to the current user.
     * @returns - Array of Jira tasks.
     * @throws Error if something goes wrong.
     */
    async getTasks(): Promise<JiraTask[]> {
        let result: JiraTask[] = [];
        try {
            const response: AxiosResponse = await this.jira.get('search/jql', {
                params: {
                    jql: `assignee = currentUser() AND status in ("${JiraStatus.InProgress}", "${JiraStatus.Resolved}", "${JiraStatus.OnHold}")`,
                    fields: ['summary', 'status', 'comment', 'labels', 'assignee', 'statuscategorychangedate']
                }
            });

            for (const issue of response.data.issues) {
                if (!issue) {
                    continue;
                }
                const taskName: string | undefined = issue.fields.summary;
                const branchCode: string | undefined = issue.key;
                const status: string | undefined = issue.fields.status.name;
                const statusChangedTime: string | undefined = issue.fields.statuscategorychangedate;
                if (!taskName || !branchCode || !status || !statusChangedTime) continue;
                const commits = await GitClient.getBranchLatestCommits(branchCode);
                const statusChangedDate: Date = new Date(statusChangedTime);
                const comments: string | undefined = this.getCommentsFromIssueResponse(issue);
                const link: string = this.baseTaskLink + branchCode;
                let prCreatedDate: Date | null = null;
                if (status !== JiraStatus.InProgress) {
                    prCreatedDate = await BitbucketClient.instance.getPrDateByBranchCode(branchCode);
                }
                const task: JiraTask =  new JiraTask(
                    taskName,
                    branchCode,
                    link,
                    status,
                    statusChangedDate,
                    comments,
                    commits,
                    prCreatedDate
                );
                if (!this.taskIsActual(task)) continue;
                result.push(task);
            }
        } catch (error) {
            const errorMessage: string = error instanceof Error ? error.message : String(error);
            throw new Error('Failed to fetch tasks: ' + errorMessage);
        }
        return result;
    }

    /**
     * Get comments from the issue response.
     * @param issueResponse - Issue response object from the Jira API.
     * @returns - String containing the comments.
     * @private
     */
    private getCommentsFromIssueResponse(issueResponse: any): string {
        const myName: string = issueResponse.fields.assignee.displayName ?? '';
        const yesterdayDate: Date = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        yesterdayDate.setHours(0, 0, 0, 0);
        let result = '';
        for (const comment of issueResponse.fields.comment.comments) {
            const commentDate: Date = new Date(comment.created);
            if (commentDate.getTime() < yesterdayDate.getTime()) {
                // Skip comments added before yesterday.
                continue;
            }
            const author: string = comment.author.displayName === myName ? 'Me' : comment.author.displayName;
            result += `Author: ${author}\n`;
            result += this.getCommentItemContent(comment.body.content, myName);
            result += '\n';
        }
        if (!result) {
            return result;
        }
        return '```text\n' + result + '```';
    }

    /**
     * Get comment item content.
     * @param contentItems - Array of comment items.
     * @param myName - My Jira name.
     * @returns - String containing the comment item content.
     * @private
     */
    private getCommentItemContent(contentItems: any, myName: string): string {
        let result = '';
        for (const contentItem of contentItems) {
            if (contentItem.content) {
                const commentItemContent = this.getCommentItemContent(contentItem.content, myName);
                result += commentItemContent;
                if (contentItem.type === 'paragraph') {
                    result += '\n';
                }
                continue;
            }
            const itemContent = this.getItemContentByType(contentItem, myName);
            if (itemContent.trim() === '') continue;
            result += itemContent;
        }
        return result;
    }

    /**
     * Get item content by type.
     * @param contentItem - Content item object.
     * @param myName - My Jira name.
     * @returns - String containing the item content.
     * @private
     */
    private getItemContentByType(contentItem: any, myName: string): string {
        switch (contentItem.type) {
            case 'text':
                return contentItem.text;
            case 'mention':
                const name = contentItem.attrs.text === `@${myName}` ? 'Me' : contentItem.attrs.text;
                return `Mentioned: ${name} `;
            default:
                return '';
        }
    }

    /**
     * Whether a task should be included in the update.
     * @param task - Jira task object.
     * @returns true in case a task should be included to the update, false otherwise.
     * @private
     */
    private taskIsActual(task: JiraTask): boolean {
        const hasCommits = task.lastCommits.length > 0;
        const hasComments = task.comments.length > 0;
        switch (task.status) {
            case JiraStatus.Resolved:
                return hasCommits || task.doPrCreatedLastWorkingDay();
            case JiraStatus.OnHold:
                return hasCommits || hasComments;
        }
        return true;
    }
}
