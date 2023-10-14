import { Octokit } from '@octokit/rest';
import { secrets } from './secrets';

export const octokit = new Octokit({ auth: secrets.GH_TOKEN });
