import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';
import { secrets } from './secrets';

Octokit.plugin(throttling);

export const octokit = new Octokit({ auth: secrets.GH_TOKEN });
