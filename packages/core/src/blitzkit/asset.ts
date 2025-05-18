import { assertSecret } from './assertSecret';

const repo = assertSecret(import.meta.env.PUBLIC_ASSET_REPO);
const branch = assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH);
const fastUser = assertSecret(import.meta.env.PUBLIC_ASSET_FAST_USER);
const fastRepo = assertSecret(import.meta.env.PUBLIC_ASSET_FAST_REPO);

export function asset(path: string) {
  return branch === 'main'
    ? `https://${fastUser}.github.io/${fastRepo}/${path}`
    : `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
}
