import { TREE_TYPE_NAMES } from '../../components/Tanks';
import { encyclopediaInfo } from '../blitz/encyclopediaInfo';
import resolveTankName from '../blitz/resolveTankName';
import { StatFilters } from '../statistics/filterStats';
import { TIER_ROMAN_NUMERALS, Tier } from './definitions/tanks';

export async function filtersToDescription({
  nation,
  tier,
  tankType,
  treeType,
  tank,
}: StatFilters) {
  const awaitedEncyclopediaInfo = await encyclopediaInfo;
  const info: string[] = [];

  if (tank) return await resolveTankName(tank);
  if (nation) info.push(awaitedEncyclopediaInfo.vehicle_nations[nation]);
  if (tier) info.push(`Tier ${TIER_ROMAN_NUMERALS[tier as Tier]}`);
  if (tankType) info.push(awaitedEncyclopediaInfo.vehicle_types[tankType]);
  if (treeType) info.push(TREE_TYPE_NAMES[treeType]);

  return info.length === 0 ? 'No filters' : info.join(', ');
}
