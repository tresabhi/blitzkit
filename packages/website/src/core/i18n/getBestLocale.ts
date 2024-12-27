import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@blitzkit/core';

export function getBestLocale() {
  const desiredLocale = navigator.language.split('-')[0];
  const isSupported = SUPPORTED_LOCALES.includes(desiredLocale);
  const isDefault = desiredLocale === DEFAULT_LOCALE;

  if (!isSupported || isDefault) return undefined;

  return desiredLocale;
}
