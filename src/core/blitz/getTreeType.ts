import { TreeType } from '../../components/Tanks';
import { tankopedia } from './tankopedia';

export default async function getTreeType(id: number) {
  const entry = (await tankopedia)[id];

  if (entry?.is_collectible) return TreeType.Collector;
  if (entry?.is_premium) return TreeType.Premium;

  return TreeType.TechTree;
}
