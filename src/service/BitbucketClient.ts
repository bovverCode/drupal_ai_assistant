/**
 * Wrapper around the Bitbucket API.
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getEnvVar } from '@/functions.ts';

export class BitbucketClient {

    /**
     * BitbucketClient instance.
     */
    static readonly instance: BitbucketClient = new BitbucketClient();

    /**
     * Axios Bitbucket instance.
     */
    private bitbucket: AxiosInstance;

    /**
     * BitbucketClient constructor.
     */
    constructor() {
        const bitbucketEmail = getEnvVar('BITBUCKET_EMAIL');
        const bitbucketApiToken = getEnvVar('BITBUCKET_API_TOKEN');
        const bitbucketWorkspace = getEnvVar('BITBUCKET_WORKSPACE');
        const bitbucketRepoSlug = getEnvVar('BITBUCKET_REPOSITORY_SLUG');
        const authToken: string = Buffer.from(`${bitbucketEmail}:${bitbucketApiToken}`).toString('base64');
        this.bitbucket = axios.create({
           method: 'get',
           baseURL: `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}/${bitbucketRepoSlug}/pullrequests/`,
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Accept': 'application/json'
            }
        });
    }

    /**
     * Check if a user reviewed yesterday.
     * @returns - True if user reviewed yesterday, false otherwise.
     */
    async didUserReviewYesterday(): Promise<boolean> {
        const activityResponse: AxiosResponse = await this.bitbucket.get('/', {
            params: {
              q: ``
            }
        });
        for (const pr of activityResponse.data.values) {
            if (pr.approval) {
                console.log(pr.approval);
            }
        }
        return false;
    }

}