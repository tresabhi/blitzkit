import { searchPlayersAcrossRegions } from '@blitzkit/core';
import { Locale } from 'discord.js';
import { UserError } from '../blitzkit/userError';
import { translator } from '../localization/translator';

export async function searchPlayersAcrossRegionsBotWrapper(
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

  return await searchPlayersAcrossRegions(trimmed, limit);
}
