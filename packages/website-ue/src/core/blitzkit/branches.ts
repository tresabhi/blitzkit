import { assertSecret } from 'packages/core/src';

export function resolveBranchName() {
  if (assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH) === 'main') {
    return undefined;
  }

  return import.meta.env.PUBLIC_ASSET_BRANCH;
}
