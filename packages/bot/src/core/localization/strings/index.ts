import { Locale } from 'discord.js';
import { SUPPORTED_LOCALES } from './constants';

export type TranslationFragmentTree = {
  [key: string]: TranslationFragment;
} & {
  $?: string;
};
export type TranslationFragment = string | TranslationFragmentTree;

export const translations = SUPPORTED_LOCALES.reduce<
  Partial<Record<Locale, TranslationFragment>>
>(
  (table, locale) => ({
    ...table,
    [locale]: require(`@blitzkit/core/lang/${locale}.json`),
  }),
  {},
);
