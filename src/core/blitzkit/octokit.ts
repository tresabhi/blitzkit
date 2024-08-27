import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';
import { assertSecret } from './secret';

Octokit.plugin(throttling);

export const octokit = new Octokit({
  auth: assertSecret(process.env.GH_TOKEN),
});
