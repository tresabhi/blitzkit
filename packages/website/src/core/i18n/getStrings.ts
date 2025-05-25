import { STRINGS, type SupportedLocale } from '@blitzkit/i18n';

export function getStrings(locale: string) {
  if (locale in STRINGS) return STRINGS[locale as SupportedLocale];
  throw new Error(`Unsupported locale: ${locale}`);
}
