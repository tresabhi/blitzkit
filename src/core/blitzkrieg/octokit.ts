import { Octokit } from '@octokit/rest';
import { secrets } from '../../LEGACY_core/node/secrets';

export const octokit = new Octokit({ auth: secrets.GH_TOKEN });
