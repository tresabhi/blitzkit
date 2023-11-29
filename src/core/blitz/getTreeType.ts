import { TreeTypeEnum } from '../../components/Tanks';
import { tankopedia } from '../blitzkrieg/tankopedia';

export default async function getTreeType(id: number) {
  const entry = (await tankopedia)[id];

  if (entry.tree_type === 'collector') return TreeTypeEnum.Collector;
  if (entry.tree_type === 'premium') return TreeTypeEnum.Premium;

  return TreeTypeEnum.TechTree;
}
