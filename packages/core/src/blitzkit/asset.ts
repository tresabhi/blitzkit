import { assertSecret } from './assertSecret';

export function asset(path: string) {
  return `https://raw.githubusercontent.com/${assertSecret(
    process.env.PUBLIC_ASSET_REPO,
  )}/${assertSecret(process.env.PUBLIC_ASSET_BRANCH)}/${path}`;
}
