import { merge } from 'ts-deepmerge';
import en from '../strings/en.json';
import es from '../strings/es.json';
import fr from '../strings/fr.json';
import ja from '../strings/ja.json';
import pl from '../strings/pl.json';
import pt from '../strings/pt.json';
import ru from '../strings/ru.json';
import uk from '../strings/uk.json';
import zh from '../strings/zh.json';

export type BlitzKitStrings = typeof en;

const stringsRaw = { en, es, fr, ja, pl, pt, ru, uk, zh };

export const SUPPORTED_LOCALES = Object.keys(stringsRaw) as SupportedLocale[];

export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

function redact(string: string) {
  const matches = [...string.matchAll(/%s\d+/g)];
  const characters = string
    .split('')
    .map((char) => (char === ' ' ? ' ' : '█')) as string[];

  matches.forEach((match) => {
    const start = match.index;
    const matchText = match[0];
    for (let i = 0; i < matchText.length; i++) {
      characters[start + i] = matchText[i];
    }
  });

  return characters.join('');
}

function nuke(object: TranslationTree) {
  for (const key in object) {
    const typedKey = key as keyof typeof object;

    if (typeof object[typedKey] === 'string') {
      const value = object[typedKey];
      object[typedKey] = redact(value as string);
    } else nuke(object[typedKey] as TranslationTree);
  }
}

const stringsPartial: Partial<Record<SupportedLocale, TranslationTree>> = {};

for (const locale in stringsRaw) {
  if (locale === DEFAULT_LOCALE) {
    stringsPartial[DEFAULT_LOCALE] = stringsRaw[DEFAULT_LOCALE];
    continue;
  }

  const localeStrings = stringsRaw[locale as SupportedLocale];
  stringsPartial[locale as SupportedLocale] = merge(
    stringsRaw[DEFAULT_LOCALE],
    localeStrings,
  );

  if (import.meta.env.PUBLIC_DEBUG_MISSING_I18N === 'true') {
    nuke(stringsPartial[locale as SupportedLocale]!);
  }
}

export const STRINGS = stringsPartial as Record<
  SupportedLocale,
  BlitzKitStrings
>;

export type SupportedLocale = keyof typeof stringsRaw;

export const SUPPORTED_LOCALE_BLITZ_MAP: Record<SupportedLocale, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  ja: 'ja',
  pt: 'pt',
  ru: 'ru',
  uk: 'uk',
  zh: 'zh-Hans',
  pl: 'pl',
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
  pl: '🇵🇱',
};

export type TranslationTree = { [key: string]: TranslationNode };

export type TranslationNode = string | TranslationTree;
