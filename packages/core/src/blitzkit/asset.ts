import { assertSecret } from './assertSecret';

export function asset(path: string) {
  return assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH) === 'main'
    ? `https://${assertSecret(
        import.meta.env.PUBLIC_ASSET_FAST_USER,
      )}.github.io/${assertSecret(
        import.meta.env.PUBLIC_ASSET_FAST_REPO,
      )}/${path}`
    : `https://raw.githubusercontent.com/${assertSecret(
        import.meta.env.PUBLIC_ASSET_REPO,
      )}/${assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH)}/${path}`;
}
