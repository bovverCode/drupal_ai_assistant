/**
 * Wrapper around the Google JIRA Rest API.
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getEnvVar } from '@/functions.ts';
import { JiraTask, Status as JiraStatus } from '@/dto/JiraTask.ts';
import { GitClient } from '@/service/GitClient.ts';

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
                    jql: `assignee = currentUser() AND status in ("${JiraStatus.InProgress}", "${JiraStatus.Resolved}")`,
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
                if (!commits && status === JiraStatus.Resolved) {
                    // Skip old resolved tasks.
                    continue;
                }
                const statusChangedDate: Date = new Date(statusChangedTime);
                const comments: string | undefined = this.getCommentsFromIssueResponse(issue);
                const link: string = this.baseTaskLink + branchCode;
                result.push(
                    new JiraTask(taskName, branchCode, link, status, statusChangedDate, comments, commits)
                );
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
        let result = '```text\n';
        for (const comment of issueResponse.fields.comment.comments) {
            const author: string = comment.author.displayName === myName ? 'Me' : comment.author.displayName;
            result += `Author: ${author}\n`;
            result += this.getCommentItemContent(comment.body.content);
            result += '\n';
        }
        result += '```'
        return result;
    }

    /**
     * Get comment item content.
     * @param contentItems - Array of comment items.
     * @returns - String containing the comment item content.
     * @private
     */
    private getCommentItemContent(contentItems: any): string {
        let result = '';
        for (const contentItem of contentItems) {
            if (contentItem.content) {
                const commentItemContent = this.getCommentItemContent(contentItem.content);
                result += commentItemContent;
                if (contentItem.type === 'paragraph') {
                    result += '\n';
                }
                continue;
            }
            const itemContent = this.getItemContentByType(contentItem);
            if (itemContent.trim() === '') continue;
            result += itemContent;
        }
        return result;
    }

    /**
     * Get item content by type.
     * @param contentItem - Content item object.
     * @returns - String containing the item content.
     * @private
     */
    private getItemContentByType(contentItem: any): string {
        switch (contentItem.type) {
            case 'text':
                return contentItem.text;
            case 'mention':
                return 'Mentioned: ' + contentItem.attrs.text;
            default:
                return '';
        }
    }
}
