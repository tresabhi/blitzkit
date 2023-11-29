import { TREE_TYPE_NAMES } from '../../components/Tanks';
import resolveTankName from '../blitz/resolveTankName';
import { tankopediaInfo } from '../blitz/tankopediaInfo';
import { StatFilters } from '../statistics/filterStats';
import { TIER_ROMAN_NUMERALS, Tier } from './tankopedia';

export async function filtersToDescription({
  nation,
  tier,
  tankType,
  treeType,
  tank,
}: StatFilters) {
  const awaitedTankopediaInfo = await tankopediaInfo;
  const info: string[] = [];

  if (tank) return await resolveTankName(tank);
  if (nation) info.push(awaitedTankopediaInfo.vehicle_nations[nation]);
  if (tier) info.push(`Tier ${TIER_ROMAN_NUMERALS[tier as Tier]}`);
  if (tankType) info.push(awaitedTankopediaInfo.vehicle_types[tankType]);
  if (treeType) info.push(TREE_TYPE_NAMES[treeType]);

  return info.length === 0 ? 'No filters' : info.join(', ');
}
