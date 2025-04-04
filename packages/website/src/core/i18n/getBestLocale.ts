import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@blitzkit/i18n';

export function getBestLocale() {
  const desiredLocale =
    localStorage.getItem('preferred-locale') ??
    navigator.language.split('-')[0];
  const isSupported = (SUPPORTED_LOCALES as unknown as string[]).includes(
    desiredLocale,
  );
  const isDefault = desiredLocale === DEFAULT_LOCALE;

  if (!isSupported || isDefault) return undefined;

  return desiredLocale;
}
