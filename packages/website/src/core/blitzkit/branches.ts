import { assertSecret } from '@blitzkit/core';

const BRANCH_NAMES: Record<string, string> = {
  dev: 'beta',
  opentest: 'opentest',
};

export function resolveBranchName() {
  if (assertSecret(import.meta.env.MODE) === 'development') {
    return 'dev';
  } else {
    return BRANCH_NAMES[assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH)] as
      | string
      | undefined;
  }
}
