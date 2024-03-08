import { Locale } from 'discord.js';

export const SUPPORTED_LOCALES: Locale[] = [Locale.EnglishUS, Locale.SpanishES];

export type TranslationFragmentTree = {
  [key: string]: TranslationFragment;
} & {
  $?: string;
};
export type TranslationFragment = string | TranslationFragmentTree;

export const translations = SUPPORTED_LOCALES.map((locale) => ({
  locale,
  translations: require(`../../lang/${locale}.json`),
})).reduce(
  (table, { locale, translations }) => ({
    ...table,
    [locale]: translations,
  }),
  {},
) as Record<Locale, TranslationFragment>;
