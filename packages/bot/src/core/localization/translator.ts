import { STRINGS, unwrapper } from '@blitzkit/i18n';
import { Locale } from 'discord.js';
import {
  DEFAULT_LOCALE_DISCORD,
  SUPPORTED_LOCALES_DISCORD,
  SUPPORTED_LOCALES_DISCORD_MAP_INVERSE,
} from './strings/constants';

export function translator(localeRaw: Locale) {
  const locale =
    localeRaw !== DEFAULT_LOCALE_DISCORD &&
    SUPPORTED_LOCALES_DISCORD.includes(localeRaw)
      ? localeRaw
      : DEFAULT_LOCALE_DISCORD;
  const bkLocale = SUPPORTED_LOCALES_DISCORD_MAP_INVERSE[locale];
  const strings = STRINGS[bkLocale];
  const unwrap = unwrapper(bkLocale);

  return { locale, strings, unwrap, bkLocale };
}
