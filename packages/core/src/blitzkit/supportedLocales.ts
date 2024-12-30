export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'hr',
  'pt',
  'ru',
  'uk',
  'zh',
] as const;

export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
