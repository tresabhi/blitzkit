import { Locale } from 'discord.js';

export const locales: Locale[] = [Locale.EnglishUS, Locale.SpanishES];

export type TranslationFragmentTree = {
  [key: string]: TranslationFragment;
} & {
  $?: string;
};
export type TranslationFragment = string | TranslationFragmentTree;

export const translations = locales
  .map((locale) => ({
    locale,
    translations: require(`../../lang/${locale}.json`),
  }))
  .reduce(
    (table, { locale, translations }) => ({
      ...table,
      [locale]: translations,
    }),
    {},
  ) as Record<Locale, TranslationFragment>;
