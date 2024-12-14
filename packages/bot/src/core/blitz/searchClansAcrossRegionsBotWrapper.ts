import { searchClansAcrossRegions } from '@blitzkit/core';
import { Locale } from 'discord.js';
import { UserError } from '../blitzkit/userError';
import { translator } from '../localization/translator';

export async function searchClansAcrossRegionsBotWrapper(
  search: string,
  locale: Locale,
  limit?: number,
) {
  const { t } = translator(locale);
  const trimmed = search.trim();

  if (trimmed.length < 3) {
    throw new UserError(t`bot.common.errors.query_too_small`);
  }

  if (trimmed.length > 100) {
    throw new UserError(t`bot.common.errors.query_too_long`);
  }

  return await searchClansAcrossRegions(trimmed, limit);
}
