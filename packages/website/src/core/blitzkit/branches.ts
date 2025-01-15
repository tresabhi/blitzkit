import { assertSecret } from '@blitzkit/core';
import { DEFAULT_LOCALE, localizedStrings } from '@blitzkit/i18n';

export function resolveBranchName(locale: string = DEFAULT_LOCALE) {
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
