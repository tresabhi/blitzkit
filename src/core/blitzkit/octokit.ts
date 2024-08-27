import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';
import { assertSecrete } from './secrete';

Octokit.plugin(throttling);

export const octokit = new Octokit({
  auth: assertSecrete(process.env.GH_TOKEN),
});
