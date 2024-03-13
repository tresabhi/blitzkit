import { Locale } from 'discord.js';
import { SUPPORTED_LOCALES } from './constants';

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
