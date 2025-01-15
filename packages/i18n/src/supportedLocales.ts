export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'fr',
  'ja',
  'pt',
  'ru',
  'uk',
  'zh',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

export const SUPPORTED_LOCALE_BLITZ_MAP: Record<SupportedLocale, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  ja: 'ja',
  pt: 'pt',
  ru: 'ru',
  uk: 'uk',
  zh: 'zh-Hans',
};

export const SUPPORTED_LOCALE_FLAGS: Record<SupportedLocale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  ja: '🇯🇵',
  pt: '🇵🇹',
  ru: '🇷🇺',
  uk: '🇺🇦',
  zh: '🇨🇳',
};
