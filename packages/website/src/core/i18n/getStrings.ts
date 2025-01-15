import { DEFAULT_LOCALE, localizedStrings } from '@blitzkit/i18n';

export function getStrings(locale: string = DEFAULT_LOCALE) {
  return localizedStrings[locale];
}
