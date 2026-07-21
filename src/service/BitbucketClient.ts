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
     * Get PR created date by branch code.
     * @param branchCode - Branch code (PROJ-1499).
     * @returns PR created date or null if not found.
     */
    async getPrDateByBranchCode(branchCode: string): Promise<Date | null> {
        const activityResponse: AxiosResponse = await this.bitbucket.get('/', {
            params: {
                q: `title~"${branchCode}:"`,
            }
        });
        let prCreatedDate: Date | null = null;
        if (!activityResponse.data.values) return prCreatedDate;
        for (const pr of activityResponse.data.values) {
            if (!pr.created_on) continue;
            prCreatedDate = new Date(pr.created_on);
            prCreatedDate.setHours(0, 0, 0, 0);
            break;
        }
        return prCreatedDate;
    }

}