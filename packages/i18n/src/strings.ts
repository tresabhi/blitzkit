import type en from '../strings/en.json';

export type BlitzKitStrings = typeof en;

export const SUPPORTED_LOCALE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  ja: '🇯🇵',
  pt: '🇵🇹',
  ru: '🇷🇺',
  uk: '🇺🇦',
  zh: '🇨🇳',
  pl: '🇵🇱',
};
