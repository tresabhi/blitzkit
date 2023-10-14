import { TreeTypeEnum } from '../../components/Tanks';
import { tankopedia } from '../../LEGACY_core/blitz/tankopedia';

export default async function getTreeType(id: number) {
  const entry = (await tankopedia)[id];

  if (entry?.is_collectible) return TreeTypeEnum.Collector;
  if (entry?.is_premium) return TreeTypeEnum.Premium;

  return TreeTypeEnum.TechTree;
}
