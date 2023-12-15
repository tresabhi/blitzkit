import { TreeTypeEnum } from '../../components/Tanks';
import { tankDefinitions } from '../blitzkrieg/tankDefinitions';

export default async function getTreeType(id: number) {
  const entry = (await tankDefinitions)[id];

  if (entry.tree_type === 'collector') return TreeTypeEnum.Collector;
  if (entry.tree_type === 'premium') return TreeTypeEnum.Premium;

  return TreeTypeEnum.TechTree;
}
