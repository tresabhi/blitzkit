import { DEFAULT_LOCALE, localizedStrings } from '@blitzkit/core';

export function getStrings(locale: string = DEFAULT_LOCALE) {
  return localizedStrings[locale];
}
