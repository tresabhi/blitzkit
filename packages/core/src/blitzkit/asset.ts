import { assertSecret } from './assertSecret';

export function asset(path: string) {
  return `https://raw.githubusercontent.com/${assertSecret(
    import.meta.env.PUBLIC_ASSET_REPO,
  )}/${assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH)}/${path}`;
}
