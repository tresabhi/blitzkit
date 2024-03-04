import { Locale } from 'discord.js';

const LOCALES: Locale[number][] = ['en-US', 'es-ES'];

export type TranslationFragmentTree = {
  [key: string]: TranslationFragment;
} & {
  $?: string;
};
export type TranslationFragment = string | TranslationFragmentTree;

export const translations = Promise.all(
  LOCALES.map(async (locale) => ({
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
    ) as Record<Locale[number], TranslationFragment>,
);
