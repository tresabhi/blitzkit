import { Locale } from 'discord.js';
import { translator } from '../localization/translator';
import { StatFilters } from '../statistics/filterStats';
import { TIER_ROMAN_NUMERALS, Tier, tankDefinitions } from './tankDefinitions';

export async function filtersToDescription(
  { nation, tier, tankType, treeType, tank }: StatFilters,
  locale: Locale,
) {
  const { translate } = translator(locale);
  const awaitedTankDefinitions = await tankDefinitions;
  const info: string[] = [];

  // TODO: somehow localize tank names?
  if (tank) return awaitedTankDefinitions[tank].name;
  if (nation) info.push(translate(`common.nations.${nation}`));
  if (tier) {
    info.push(
      translate('bot.common.filters.tier', [TIER_ROMAN_NUMERALS[tier as Tier]]),
    );
  }
  if (tankType) info.push(translate(`common.tank_type_short.${tankType}`));
  if (treeType) info.push(translate(`common.tree_type.${treeType}`));

  return info.length === 0
    ? translate('bot.common.filters.none')
    : info.join(', ');
}
