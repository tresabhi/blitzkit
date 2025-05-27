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

export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
  pt: 'Português',
  ru: 'Русский',
  uk: 'Українська',
  zh: '中文',
  pl: 'Polski',
};
