/**
 * Wrapper around the Google JIRA Rest API.
 */
import axios, { AxiosInstance } from 'axios';
import { getEnvVar } from '@/functions.js';

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
        const jiraDomain: string = getEnvVar('JIRA_DOMAIN');
        const jiraEmail: string = getEnvVar('JIRA_EMAIL');
        const jiraApiToken: string = getEnvVar('JIRA_API_TOKEN');
        const authToken: string = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');
        this.jira = axios.create({
            method: 'GET',
            baseURL: `https://${jiraDomain}/rest/api/3/`,
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async getJiraTasks(): Promise<any> {
        const result = await this.jira.get('/issue/CACO1901-5301');
        console.log(result.status);
        // console.log(result.data);
    }

}