import { Locale } from 'discord.js';
import enUS from '../../../lang/en-US.json';
import { SUPPORTED_LOCALES } from './constants';

export type TranslationFragmentTree = {
  [key: string]: TranslationFragment;
} & {
  $?: string;
};
export type TranslationFragment = string | TranslationFragmentTree;

export const translations = SUPPORTED_LOCALES.map((locale) => ({
  locale,
  translations: require(`../../../lang/${locale}.json`),
})).reduce(
  (table, { locale, translations }) => ({
    ...table,
    [locale]: translations,
  }),
  {
    [Locale.EnglishUS]: enUS,
  },
) as Partial<Record<Locale, TranslationFragment>>;
