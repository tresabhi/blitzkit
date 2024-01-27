import { TreeType } from '../../components/Tanks';
import { tankDefinitions } from '../blitzkrieg/tankDefinitions';

export default async function getTreeType(id: number): Promise<TreeType> {
  const entry = (await tankDefinitions)[id];

  if (entry.tree_type === 'collector') return 'collector';
  if (entry.tree_type === 'premium') return 'premium';

  return 'researchable';
}
