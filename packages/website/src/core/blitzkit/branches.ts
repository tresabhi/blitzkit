import { assertSecret, DEFAULT_LOCALE, localizedStrings } from '@blitzkit/core';

export function resolveBranchName(locale = DEFAULT_LOCALE) {
  const strings = localizedStrings[locale];
  const secret = assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH);

  if (
    assertSecret(import.meta.env.MODE) === 'development' &&
    secret === 'dev'
  ) {
    return strings.common.branches.local;
  } else {
    return (strings.common.branches as Record<string, string>)[secret] as
      | string
      | undefined;
  }
}
