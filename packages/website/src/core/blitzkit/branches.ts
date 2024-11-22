import { assertSecret } from '@blitzkit/core';

const BRANCH_NAMES: Record<string, string> = {
  dev: 'beta',
  opentest: 'opentest',
  preview: 'preview',
};

export function resolveBranchName() {
  const secret = assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH);
  if (
    assertSecret(import.meta.env.MODE) === 'development' &&
    secret === 'dev'
  ) {
    return 'dev';
  } else {
    return BRANCH_NAMES[secret] as string | undefined;
  }
}
