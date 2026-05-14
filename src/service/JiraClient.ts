/**
 * Wrapper around the Google JIRA Rest API.
 */
import axios, { AxiosInstance } from 'axios';
import { getEnvVar } from '@/functions.js';
import {json} from "node:stream/consumers";

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
     * JiraClient constructor.
     */
    constructor() {
        const jiraEmail: string = getEnvVar('JIRA_EMAIL');
        const jiraApiToken: string = getEnvVar('JIRA_API_TOKEN');
        const jiraCloudId: string = getEnvVar('JIRA_CLOUD_ID');
        const authToken: string = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');
        this.jira = axios.create({
            method: 'GET',
            baseURL: `https://api.atlassian.com/ex/jira/${jiraCloudId}/rest/api/3/`,
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    async getTasks(): Promise<any> {}
}