import {
  fetchTankDefinitions,
  Tier,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import { Locale } from 'discord.js';
import { StatFilters } from '../blitzstars/filterStats';
import { translator } from '../localization/translator';

export async function filtersToDescription(
  { nation, tier, type, class: tankClass, tank }: StatFilters,
  locale: Locale,
) {
  const { translate } = translator(locale);
  const awaitedTankDefinitions = await fetchTankDefinitions();
  const info: string[] = [];

  // TODO: somehow localize tank names?
  if (tank) return awaitedTankDefinitions.tanks[tank].name;
  if (nation) info.push(translate(`common.nations.${nation}`));
  if (tier) {
    info.push(
      translate('bot.common.filters.tier', [TIER_ROMAN_NUMERALS[tier as Tier]]),
    );
  }
  if (tankClass) info.push(translate(`common.tank_class_short.${tankClass}`));
  if (type) info.push(translate(`common.tree_type.${type}`));

  return info.length === 0
    ? translate('bot.common.filters.none')
    : info.join(', ');
}
