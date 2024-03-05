import { Locale } from 'discord.js';

export const locales: Locale[] = [Locale.EnglishUS, Locale.SpanishES];

export type TranslationFragmentTree = {
  [key: string]: TranslationFragment;
} & {
  $?: string;
};
export type TranslationFragment = string | TranslationFragmentTree;

export const translations = Promise.all(
  locales.map(async (locale) => ({
    locale,
    translations: await import(`../../lang/${locale}.json`),
  })),
).then(
  (translations) =>
    translations.reduce(
      (table, { locale, translations }) => ({
        ...table,
        [locale]: translations,
      }),
      {},
    ) as Record<Locale, TranslationFragment>,
);
