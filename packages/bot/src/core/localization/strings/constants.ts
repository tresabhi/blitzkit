import { SupportedLocale } from '@blitzkit/core';
import { Locale } from 'discord.js';

const DISCORD_SUPPORTED_LOCALES: Record<SupportedLocale, Locale> = {
  en: Locale.EnglishUS,
  es: Locale.SpanishES,
  hr: Locale.Croatian,
  pt: Locale.PortugueseBR,
  ru: Locale.Russian,
  uk: Locale.Ukrainian,
  zh: Locale.ChineseCN,
};

export const SUPPORTED_DISCORD_LOCALES = Object.values(
  DISCORD_SUPPORTED_LOCALES,
);
