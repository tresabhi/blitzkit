import { DEFAULT_LOCALE, SupportedLocale } from '@blitzkit/core';
import { Locale } from 'discord.js';

const SUPPORTED_LOCALES_DISCORD_MAP: Record<SupportedLocale, Locale> = {
  en: Locale.EnglishUS,
  es: Locale.SpanishES,
  pt: Locale.PortugueseBR,
  ru: Locale.Russian,
  uk: Locale.Ukrainian,
  zh: Locale.ChineseCN,
  fr: Locale.French,
  ja: Locale.Japanese,
};

export const SUPPORTED_LOCALES_DISCORD_MAP_INVERSE = Object.fromEntries(
  Object.entries(SUPPORTED_LOCALES_DISCORD_MAP).map(([k, v]) => [v, k]),
) as Record<Locale, SupportedLocale>;

export const SUPPORTED_LOCALES_DISCORD = Object.values(
  SUPPORTED_LOCALES_DISCORD_MAP,
);

export const DEFAULT_LOCALE_DISCORD =
  SUPPORTED_LOCALES_DISCORD_MAP[DEFAULT_LOCALE];
