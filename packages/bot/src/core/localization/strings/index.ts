import { Locale } from 'discord.js';
import {
  SUPPORTED_LOCALES_DISCORD,
  SUPPORTED_LOCALES_DISCORD_MAP_INVERSE,
} from './constants';

export type TranslationFragmentTree = {
  [key: string]: TranslationFragment;
} & {
  $?: string;
};
export type TranslationFragment = string | TranslationFragmentTree;

export const translations = SUPPORTED_LOCALES_DISCORD.reduce<
  Partial<Record<Locale, TranslationFragment>>
>(
  (table, locale) => ({
    ...table,
    [locale]: require(
      `../../../../../core/lang/${SUPPORTED_LOCALES_DISCORD_MAP_INVERSE[locale]}.json`,
    ),
  }),
  {},
);
