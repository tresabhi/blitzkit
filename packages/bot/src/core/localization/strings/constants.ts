import { LOCALE_FILES } from '@blitzkit/core';
import { Locale } from 'discord.js';

export const SUPPORTED_DISCORD_LOCALES = Object.values(
  LOCALE_FILES,
) as Locale[];
